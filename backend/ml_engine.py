"""
Machine Learning Engine for GreenPulse

Provides:
- Energy consumption predictions
- Anomaly detection in hardware metrics
- Personalized recommendations
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

try:
    from sklearn.ensemble import IsolationForest, RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not available - ML features disabled")


class EnergyPredictor:
    """Predict future energy consumption using machine learning"""
    
    def __init__(self, min_samples: int = 20):
        """
        Initialize energy predictor.
        
        Args:
            min_samples: Minimum telemetry records needed to train
        """
        self.min_samples = min_samples
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.metrics = {
            'mae': None,
            'rmse': None,
            'r2': None
        }
    
    def _prepare_features(self, telemetry_records: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features from telemetry records.
        
        Features: CPU%, RAM%, GPU%, Hour of day, Day of week
        Target: Estimated power (W)
        """
        X = []
        y = []
        
        for record in telemetry_records:
            timestamp = datetime.fromisoformat(record['timestamp'].replace('Z', '+00:00'))
            
            features = [
                record.get('cpu_usage_percent', 0),
                record.get('ram_usage_percent', 0),
                record.get('gpu_usage_percent', 0) or 0,
                timestamp.hour,  # Hour of day (0-23)
                timestamp.weekday(),  # Day of week (0-6)
            ]
            
            X.append(features)
            y.append(record.get('estimated_power_w', 0))
        
        return np.array(X), np.array(y)
    
    def train(self, telemetry_records: List[Dict]) -> bool:
        """
        Train energy prediction model.
        
        Args:
            telemetry_records: List of telemetry records
        
        Returns:
            True if training successful, False otherwise
        """
        if not SKLEARN_AVAILABLE:
            logger.warning("scikit-learn not available for training")
            return False
        
        if len(telemetry_records) < self.min_samples:
            logger.info(f"Not enough data to train ({len(telemetry_records)}/{self.min_samples})")
            return False
        
        try:
            X, y = self._prepare_features(telemetry_records)
            
            # Scale features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Train Random Forest model
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self.model.fit(X_scaled, y)
            
            # Calculate metrics
            y_pred = self.model.predict(X_scaled)
            self.metrics['mae'] = mean_absolute_error(y, y_pred)
            self.metrics['rmse'] = np.sqrt(mean_squared_error(y, y_pred))
            self.metrics['r2'] = r2_score(y, y_pred)
            
            self.is_trained = True
            logger.info(f"Model trained - MAE: {self.metrics['mae']:.2f}W, R²: {self.metrics['r2']:.3f}")
            return True
        
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def predict(self, cpu_percent: float, ram_percent: float, gpu_percent: float = 0) -> Optional[Dict]:
        """
        Predict power consumption for given metrics.
        
        Args:
            cpu_percent: CPU utilization
            ram_percent: RAM utilization
            gpu_percent: GPU utilization
        
        Returns:
            Dict with prediction and confidence, or None if not trained
        """
        if not self.is_trained or self.model is None:
            return None
        
        try:
            now = datetime.now()
            features = np.array([[
                cpu_percent,
                ram_percent,
                gpu_percent,
                now.hour,
                now.weekday()
            ]])
            
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)[0]
            
            # Confidence based on R² score
            confidence = max(0, min(100, self.metrics['r2'] * 100))
            
            return {
                'predicted_power_w': round(float(prediction), 1),
                'confidence_percent': round(confidence, 1),
                'mae': self.metrics['mae'],
                'model_type': 'random_forest'
            }
        
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return None


class AnomalyDetector:
    """Detect anomalies in hardware metrics"""
    
    def __init__(self, contamination: float = 0.1):
        """
        Initialize anomaly detector.
        
        Args:
            contamination: Expected proportion of anomalies (0-1)
        """
        self.contamination = contamination
        self.model = None
        self.is_fitted = False
        self.baselines = {}
    
    def _calculate_statistics(self, values: List[float]) -> Dict[str, float]:
        """Calculate statistics for a metric"""
        arr = np.array(values)
        return {
            'mean': float(np.mean(arr)),
            'std': float(np.std(arr)),
            'median': float(np.median(arr)),
            'p75': float(np.percentile(arr, 75)),
            'p95': float(np.percentile(arr, 95))
        }
    
    def fit(self, telemetry_records: List[Dict]) -> bool:
        """
        Fit anomaly detector using historical data.
        
        Args:
            telemetry_records: List of historical telemetry records
        
        Returns:
            True if fitting successful
        """
        if not SKLEARN_AVAILABLE or len(telemetry_records) < 10:
            # Use statistical approach
            cpu_values = [r.get('cpu_usage_percent', 0) for r in telemetry_records]
            ram_values = [r.get('ram_usage_percent', 0) for r in telemetry_records]
            power_values = [r.get('estimated_power_w', 0) for r in telemetry_records]
            
            self.baselines['cpu'] = self._calculate_statistics(cpu_values)
            self.baselines['ram'] = self._calculate_statistics(ram_values)
            self.baselines['power'] = self._calculate_statistics(power_values)
            self.is_fitted = True
            return True
        
        try:
            X = []
            for record in telemetry_records:
                features = [
                    record.get('cpu_usage_percent', 0),
                    record.get('ram_usage_percent', 0),
                    record.get('gpu_usage_percent', 0) or 0,
                    record.get('estimated_power_w', 0)
                ]
                X.append(features)
            
            X = np.array(X)
            self.model = IsolationForest(contamination=self.contamination, random_state=42)
            self.model.fit(X)
            self.is_fitted = True
            return True
        
        except Exception as e:
            logger.error(f"Error fitting anomaly detector: {e}")
            return False
    
    def detect(self, cpu_percent: float, ram_percent: float, gpu_percent: float, power_w: float) -> List[Dict]:
        """
        Detect anomalies in current metrics.
        
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        if not self.is_fitted:
            return anomalies
        
        # Check CPU
        if 'cpu' in self.baselines:
            cpu_stats = self.baselines['cpu']
            z_score = abs((cpu_percent - cpu_stats['mean']) / (cpu_stats['std'] + 1e-5))
            if z_score > 3 and cpu_percent > cpu_stats['p95']:
                anomalies.append({
                    'type': 'cpu',
                    'severity': 'high' if z_score > 4 else 'medium',
                    'value': cpu_percent,
                    'baseline': cpu_stats['mean'],
                    'deviation_percent': ((cpu_percent - cpu_stats['mean']) / (cpu_stats['mean'] + 1e-5)) * 100
                })
        
        # Check RAM
        if 'ram' in self.baselines:
            ram_stats = self.baselines['ram']
            z_score = abs((ram_percent - ram_stats['mean']) / (ram_stats['std'] + 1e-5))
            if z_score > 3 and ram_percent > ram_stats['p95']:
                anomalies.append({
                    'type': 'ram',
                    'severity': 'high' if z_score > 4 else 'medium',
                    'value': ram_percent,
                    'baseline': ram_stats['mean'],
                    'deviation_percent': ((ram_percent - ram_stats['mean']) / (ram_stats['mean'] + 1e-5)) * 100
                })
        
        # Check Power
        if 'power' in self.baselines:
            power_stats = self.baselines['power']
            z_score = abs((power_w - power_stats['mean']) / (power_stats['std'] + 1e-5))
            if z_score > 3 and power_w > power_stats['p95']:
                anomalies.append({
                    'type': 'power',
                    'severity': 'high' if z_score > 4 else 'medium',
                    'value': power_w,
                    'baseline': power_stats['mean'],
                    'deviation_percent': ((power_w - power_stats['mean']) / (power_stats['mean'] + 1e-5)) * 100
                })
        
        return anomalies


class RecommendationEngine:
    """Generate personalized recommendations based on usage patterns"""
    
    @staticmethod
    def generate_recommendations(
        current_metrics: Dict,
        historical_data: List[Dict],
        anomalies: List[Dict]
    ) -> List[Dict]:
        """
        Generate recommendations based on metrics and patterns.
        
        Args:
            current_metrics: Current telemetry metrics
            historical_data: Historical telemetry records
            anomalies: Detected anomalies
        
        Returns:
            List of recommendation dicts
        """
        recommendations = []
        
        if not historical_data:
            return recommendations
        
        avg_power = current_metrics.get('average_power_w', 50)
        peak_power = current_metrics.get('peak_power_w', 100)
        avg_cpu = np.mean([r.get('cpu_usage_percent', 0) for r in historical_data])
        
        # CPU recommendation
        if avg_cpu > 70:
            recommendations.append({
                'category': 'cpu',
                'title': 'Optimize Background Processes',
                'description': 'Your CPU is frequently above 70% utilization',
                'reason': f'High CPU usage (avg {avg_cpu:.1f}%) increases power consumption and emissions',
                'action': 'Close unnecessary applications and browser tabs',
                'estimated_saving_percent': 10
            })
        
        # Power-saving recommendation
        if avg_power > 60:
            recommendations.append({
                'category': 'power',
                'title': 'Enable Power Saving Mode',
                'description': 'Your laptop is consuming above average power',
                'reason': f'Average power draw is {avg_power:.1f}W - enabling power saving can reduce this by 15-20%',
                'action': 'Enable operating system power saving mode',
                'estimated_saving_percent': 15
            })
        
        # Peak management
        if peak_power > 100:
            recommendations.append({
                'category': 'power',
                'title': 'Avoid Simultaneous Heavy Tasks',
                'description': 'Peak power spikes detected',
                'reason': f'Peak power reaches {peak_power:.1f}W - this suggests simultaneous heavy workloads',
                'action': 'Schedule heavy tasks (video encoding, large downloads) sequentially',
                'estimated_saving_percent': 20
            })
        
        # Anomaly-based recommendations
        for anomaly in anomalies:
            if anomaly['type'] == 'cpu' and anomaly['severity'] == 'high':
                recommendations.append({
                    'category': 'cpu',
                    'title': 'Investigate High CPU Usage',
                    'description': f"CPU spike detected ({anomaly['value']:.1f}%)",
                    'reason': 'Unexpected CPU usage could indicate runaway processes or malware',
                    'action': 'Check Task Manager/Activity Monitor for resource-heavy processes',
                    'estimated_saving_percent': 5
                })
        
        # Display brightness (if battery)
        if 'battery_percent' in current_metrics:
            recommendations.append({
                'category': 'display',
                'title': 'Reduce Display Brightness',
                'description': 'Display is a significant power consumer',
                'reason': 'Reducing brightness by 50% can save 5-10W of power',
                'action': 'Reduce screen brightness to comfortable level',
                'estimated_saving_percent': 8
            })
        
        # GPU optimization
        if current_metrics.get('gpu_usage_percent', 0) > 80:
            recommendations.append({
                'category': 'gpu',
                'title': 'Optimize GPU Usage',
                'description': 'High GPU utilization detected',
                'reason': f"GPU at {current_metrics['gpu_usage_percent']:.1f}% - close unnecessary applications",
                'action': 'Close browser tabs and applications using GPU (gaming, video editing)',
                'estimated_saving_percent': 25
            })
        
        return recommendations
