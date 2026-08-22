import psutil
import requests
import json
import time
import platform
import uuid
import sys
import os
from datetime import datetime
from typing import Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HardwareMetrics:
    """Collect real hardware metrics from the laptop"""
    
    @staticmethod
    def get_cpu_percent() -> float:
        """Get CPU utilization percentage (0-100)"""
        try:
            return psutil.cpu_percent(interval=0.1)
        except Exception as e:
            logger.error(f"Error getting CPU percent: {e}")
            return 0.0
    
    @staticmethod
    def get_ram_info() -> tuple[float, float, float]:
        """Get RAM usage (percent, used_gb, available_gb)"""
        try:
            memory = psutil.virtual_memory()
            return (
                memory.percent,
                memory.used / (1024 ** 3),  # Convert to GB
                memory.available / (1024 ** 3)  # Convert to GB
            )
        except Exception as e:
            logger.error(f"Error getting RAM info: {e}")
            return (0.0, 0.0, 0.0)
    
    @staticmethod
    def get_gpu_percent() -> Optional[float]:
        """Get GPU utilization percentage (0-100), None if unavailable"""
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                return gpus[0].load * 100
            return None
        except Exception:
            # GPU monitoring not available
            return None
    
    @staticmethod
    def get_battery_info() -> Optional[Dict[str, Any]]:
        """Get battery info (percent, is_charging)"""
        try:
            battery = psutil.sensors_battery()
            if battery:
                return {
                    'percent': battery.percent,
                    'is_charging': battery.power_plugged
                }
            return None
        except Exception:
            return None
    
    @staticmethod
    def get_system_info() -> Dict[str, str]:
        """Get system hardware information"""
        try:
            cpu_freq = psutil.cpu_freq()
            
            return {
                'os_name': platform.system(),
                'os_version': platform.release(),
                'cpu_model': platform.processor() or 'Unknown CPU',
                'cpu_count': str(psutil.cpu_count()),
                'total_ram_gb': str(psutil.virtual_memory().total / (1024 ** 3))
            }
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {
                'os_name': 'Unknown',
                'os_version': 'Unknown',
                'cpu_model': 'Unknown',
                'cpu_count': '0',
                'total_ram_gb': '0'
            }


class GreenPulseAgent:
    """Main monitoring agent"""
    
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url.rstrip('/')
        self.access_token: Optional[str] = None
        self.device_id: Optional[str] = None
        self.pairing_code: Optional[str] = None
        self.device_name: Optional[str] = None
        self.is_paired = False
        self.monitoring_interval = 5  # seconds
        
        # Generate unique device ID
        self.device_id = str(uuid.getnode())
        self.device_name = f"{platform.node()}"
    
    def request_pairing_code(self) -> bool:
        """Request a pairing code from the backend"""
        try:
            # First we need to authenticate
            logger.info("Please visit your GreenPulse dashboard to generate a pairing code.")
            self.pairing_code = input("\nEnter pairing code: ").strip()
            
            if not self.pairing_code:
                logger.error("No pairing code provided")
                return False
            
            return True
        except KeyboardInterrupt:
            logger.info("Pairing cancelled")
            return False
    
    def pair_device(self) -> bool:
        """Pair device using pairing code"""
        if not self.pairing_code:
            logger.error("No pairing code set")
            return False
        
        try:
            system_info = HardwareMetrics.get_system_info()
            
            pairing_request = {
                'pairing_code': self.pairing_code,
                'device_name': self.device_name,
                'device_id': self.device_id,
                'os_name': system_info['os_name'],
                'os_version': system_info['os_version'],
                'cpu_model': system_info['cpu_model'],
                'gpu_model': 'NVIDIA' if self._has_nvidia_gpu() else None,
                'total_ram_gb': float(system_info['total_ram_gb'])
            }
            
            response = requests.post(
                f"{self.api_url}/pairing/confirm",
                json=pairing_request,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.access_token = data.get('access_token')
                    self.is_paired = True
                    logger.info("✓ Device paired successfully!")
                    logger.info(f"Device ID: {data.get('device_id')}")
                    return True
                else:
                    logger.error(f"Pairing failed: {data.get('message')}")
                    return False
            else:
                logger.error(f"Pairing failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error during pairing: {e}")
            return False
    
    def _has_nvidia_gpu(self) -> bool:
        """Check if NVIDIA GPU is available"""
        try:
            import GPUtil
            return len(GPUtil.getGPUs()) > 0
        except:
            return False
    
    def submit_telemetry(self) -> bool:
        """Submit current telemetry to backend"""
        if not self.is_paired or not self.access_token:
            logger.error("Device not paired")
            return False
        
        try:
            cpu_percent = HardwareMetrics.get_cpu_percent()
            ram_percent, ram_used, ram_available = HardwareMetrics.get_ram_info()
            gpu_percent = HardwareMetrics.get_gpu_percent()
            battery_info = HardwareMetrics.get_battery_info()
            
            metrics = {
                'device_id': self.device_id,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'cpu_usage_percent': cpu_percent,
                'gpu_usage_percent': gpu_percent,
                'ram_usage_percent': ram_percent,
                'ram_used_gb': round(ram_used, 2),
                'ram_available_gb': round(ram_available, 2),
                'battery_percent': battery_info['percent'] if battery_info else None,
                'is_charging': battery_info['is_charging'] if battery_info else None,
            }
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.api_url}/monitor/telemetry",
                json=metrics,
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    logger.debug(f"Telemetry submitted - Power: {data.get('estimated_power_w'):.1f}W, CO₂: {data.get('estimated_co2e_g'):.2f}g")
                    return True
                else:
                    logger.error(f"Failed to submit telemetry: {data}")
                    return False
            elif response.status_code == 401:
                logger.error("Authentication failed - device not paired")
                self.is_paired = False
                return False
            else:
                logger.error(f"Error submitting telemetry: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            logger.error("Connection error - backend may be offline")
            return False
        except Exception as e:
            logger.error(f"Error submitting telemetry: {e}")
            return False
    
    def load_config(self) -> bool:
        """Load saved pairing configuration if available"""
        config_path = os.path.join(os.path.dirname(__file__), 'agent_config.json')
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    self.access_token = config.get('access_token')
                    self.device_id = config.get('device_id', self.device_id)
                    self.device_name = config.get('device_name', self.device_name)
                    self.is_paired = True
                    logger.info(f"✓ Loaded saved pairing for {self.device_name}")
                    return True
            except Exception as e:
                logger.warning(f"Could not load saved config: {e}")
        return False

    def save_config(self):
        """Save pairing configuration locally"""
        config_path = os.path.join(os.path.dirname(__file__), 'agent_config.json')
        try:
            with open(config_path, 'w') as f:
                json.dump({
                    'access_token': self.access_token,
                    'device_id': self.device_id,
                    'device_name': self.device_name
                }, f, indent=2)
            logger.info("✓ Saved device credentials to agent_config.json")
        except Exception as e:
            logger.warning(f"Could not save config: {e}")

    def run(self):
        """Main monitoring loop"""
        logger.info("=" * 60)
        logger.info("GreenPulse Monitoring Agent")
        logger.info("=" * 60)
        
        if not self.load_config():
            if not self.request_pairing_code():
                logger.error("Failed to request pairing code")
                return
            
            if not self.pair_device():
                logger.error("Failed to pair device")
                return
            self.save_config()
        
        logger.info(f"\n✓ Monitoring {self.device_name}")
        logger.info(f"  Collecting real metrics every {self.monitoring_interval} seconds")
        logger.info("\nPress Ctrl+C to stop\n")
        
        consecutive_errors = 0
        max_consecutive_errors = 5
        
        try:
            while True:
                if self.submit_telemetry():
                    consecutive_errors = 0
                else:
                    consecutive_errors += 1
                    if consecutive_errors >= max_consecutive_errors:
                        logger.error("Too many consecutive errors, attempting to re-pair...")
                        if not self.pair_device():
                            logger.error("Failed to re-pair, stopping agent")
                            break
                        consecutive_errors = 0
                
                time.sleep(self.monitoring_interval)
        
        except KeyboardInterrupt:
            logger.info("\n\nMonitoring stopped")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            sys.exit(1)


def main():
    api_url = os.getenv('GREENPULSE_API_URL', 'http://localhost:8000')
    agent = GreenPulseAgent(api_url=api_url)
    agent.run()


if __name__ == '__main__':
    main()
