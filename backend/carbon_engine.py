"""
Carbon and Power Calculation Engine

Provides utilities for:
- Power estimation from hardware metrics
- Carbon emissions calculation
- Green score calculation
"""

from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import math

class PowerEstimator:
    """Estimate system power consumption from hardware metrics"""
    
    # Configuration (Watts)
    BASE_POWER = 10.0  # CPU idle, chipset, etc.
    CPU_MAX_POWER = 30.0  # Max per core
    RAM_POWER = 5.0  # Total RAM contribution
    GPU_MAX_POWER = 50.0  # NVIDIA GPU typical
    DISPLAY_POWER = 15.0  # Screen power
    
    @staticmethod
    def estimate(
        cpu_percent: float,
        ram_percent: float,
        gpu_percent: Optional[float] = None,
        has_display: bool = True
    ) -> float:
        """
        Estimate total power consumption in Watts.
        
        Args:
            cpu_percent: CPU utilization (0-100)
            ram_percent: RAM utilization (0-100)
            gpu_percent: GPU utilization (0-100), None if unavailable
            has_display: Whether display is powered
        
        Returns:
            Estimated power in Watts
        """
        power = PowerEstimator.BASE_POWER
        
        # CPU contribution (scales with utilization)
        cpu_power = (cpu_percent / 100.0) * PowerEstimator.CPU_MAX_POWER
        power += cpu_power
        
        # RAM contribution (fixed + minimal scaling)
        ram_power = (ram_percent / 100.0) * (PowerEstimator.RAM_POWER * 0.3)
        power += ram_power
        
        # GPU contribution (if available)
        if gpu_percent is not None and gpu_percent > 0:
            gpu_power = (gpu_percent / 100.0) * PowerEstimator.GPU_MAX_POWER
            power += gpu_power
        
        # Display power
        if has_display:
            power += PowerEstimator.DISPLAY_POWER
        
        return round(power, 1)
    
    @staticmethod
    def estimate_range(
        cpu_percent: float,
        ram_percent: float,
        gpu_percent: Optional[float] = None
    ) -> Tuple[float, float]:
        """
        Estimate power range (min, max) for given metrics.
        
        Returns:
            Tuple of (min_power, max_power)
        """
        min_power = PowerEstimator.estimate(
            cpu_percent, ram_percent, gpu_percent, has_display=False
        )
        max_power = PowerEstimator.estimate(
            cpu_percent, ram_percent, gpu_percent, has_display=True
        )
        return (min_power, max_power)


class CarbonCalculator:
    """Calculate carbon emissions from power and carbon intensity"""
    
    @staticmethod
    def calculate_energy_kwh(power_w: float, duration_seconds: float) -> float:
        """
        Calculate energy from power and duration.
        
        Args:
            power_w: Power in Watts
            duration_seconds: Duration in seconds
        
        Returns:
            Energy in kWh
        """
        hours = duration_seconds / 3600
        kwh = (power_w / 1000) * hours
        return kwh
    
    @staticmethod
    def calculate_co2e_grams(
        energy_kwh: float,
        carbon_intensity: float = 0.3  # kg CO2e/kWh
    ) -> float:
        """
        Calculate CO2e emissions from energy.
        
        Args:
            energy_kwh: Energy in kWh
            carbon_intensity: Carbon intensity in kg CO2e/kWh
        
        Returns:
            CO2e in grams
        """
        kg_co2e = energy_kwh * carbon_intensity
        grams_co2e = kg_co2e * 1000
        return grams_co2e
    
    @staticmethod
    def calculate_daily_totals(
        telemetry_records: list,
        carbon_intensity: float = 0.3
    ) -> Dict[str, float]:
        """
        Calculate daily totals from telemetry records.
        
        Args:
            telemetry_records: List of telemetry dicts
            carbon_intensity: Carbon intensity in kg CO2e/kWh
        
        Returns:
            Dict with energy_kwh, co2e_g, average_power_w, peak_power_w
        """
        if not telemetry_records:
            return {
                'energy_kwh': 0.0,
                'co2e_g': 0.0,
                'average_power_w': 0.0,
                'peak_power_w': 0.0
            }
        
        total_energy = 0.0
        power_readings = []
        
        for record in telemetry_records:
            power_w = record.get('estimated_power_w', 0)
            power_readings.append(power_w)
            
            # Assume 1-minute interval for each reading
            energy_kwh = CarbonCalculator.calculate_energy_kwh(power_w, 60)
            total_energy += energy_kwh
        
        co2e_grams = CarbonCalculator.calculate_co2e_grams(total_energy, carbon_intensity)
        avg_power = sum(power_readings) / len(power_readings) if power_readings else 0
        peak_power = max(power_readings) if power_readings else 0
        
        return {
            'energy_kwh': round(total_energy, 4),
            'co2e_g': round(co2e_grams, 2),
            'average_power_w': round(avg_power, 1),
            'peak_power_w': round(peak_power, 1)
        }


class GreenScoreCalculator:
    """
    Calculate a user's GreenScore (0-100) based on their usage patterns.
    
    Factors:
    - Energy efficiency (lower is better)
    - Resource utilization patterns
    - Workload distribution
    - Improvement trend
    """
    
    @staticmethod
    def calculate_score(
        current_metrics: Dict,
        historical_metrics: Optional[list] = None
    ) -> Tuple[int, Dict[str, any]]:
        """
        Calculate green score and breakdown.
        
        Returns:
            (score_0_100, factors_dict)
        """
        factors = {
            'energy_efficiency': 0,
            'peak_management': 0,
            'idle_time': 0,
            'improvement_trend': 0
        }
        
        # Energy efficiency (max 25 points)
        # Lower average power = higher score
        avg_power = current_metrics.get('average_power_w', 50)
        if avg_power < 20:
            factors['energy_efficiency'] = 25
        elif avg_power < 40:
            factors['energy_efficiency'] = 20
        elif avg_power < 60:
            factors['energy_efficiency'] = 15
        elif avg_power < 80:
            factors['energy_efficiency'] = 10
        else:
            factors['energy_efficiency'] = 5
        
        # Peak management (max 25 points)
        # Lower peak power = higher score
        peak_power = current_metrics.get('peak_power_w', 100)
        if peak_power < 50:
            factors['peak_management'] = 25
        elif peak_power < 75:
            factors['peak_management'] = 20
        elif peak_power < 100:
            factors['peak_management'] = 15
        elif peak_power < 150:
            factors['peak_management'] = 10
        else:
            factors['peak_management'] = 5
        
        # Idle efficiency (max 25 points)
        # Check if system has idle periods
        min_power = current_metrics.get('min_power_w', 15)
        if min_power < 15:
            factors['idle_time'] = 25
        elif min_power < 20:
            factors['idle_time'] = 20
        elif min_power < 30:
            factors['idle_time'] = 15
        else:
            factors['idle_time'] = 10
        
        # Improvement trend (max 25 points)
        if historical_metrics and len(historical_metrics) > 1:
            # Compare last 7 days if available
            recent_avg = historical_metrics[-1].get('average_power_w', 50) if historical_metrics else 50
            older_avg = historical_metrics[0].get('average_power_w', 50) if historical_metrics else 50
            
            improvement = ((older_avg - recent_avg) / older_avg * 100) if older_avg > 0 else 0
            
            if improvement > 10:
                factors['improvement_trend'] = 25
            elif improvement > 5:
                factors['improvement_trend'] = 20
            elif improvement > 0:
                factors['improvement_trend'] = 15
            elif improvement > -5:
                factors['improvement_trend'] = 10
            else:
                factors['improvement_trend'] = 5
        else:
            factors['improvement_trend'] = 15  # Default for new users
        
        total_score = sum(factors.values())
        
        return (total_score, factors)
    
    @staticmethod
    def get_score_explanation(score: int, factors: Dict[str, int]) -> str:
        """Get human-readable explanation for the score"""
        explanations = []
        
        if factors['energy_efficiency'] > 15:
            explanations.append("Excellent energy efficiency in average power usage")
        elif factors['energy_efficiency'] > 10:
            explanations.append("Good energy efficiency overall")
        else:
            explanations.append("Energy efficiency could be improved - consider reducing background tasks")
        
        if factors['peak_management'] > 15:
            explanations.append("Well-managed peak power spikes")
        elif factors['peak_management'] > 10:
            explanations.append("Good peak management")
        else:
            explanations.append("Consider reducing simultaneous heavy workloads")
        
        if factors['improvement_trend'] > 15:
            explanations.append("Positive improvement trend")
        elif factors['improvement_trend'] >= 10:
            explanations.append("Stable usage patterns")
        else:
            explanations.append("Usage patterns need optimization")
        
        return " | ".join(explanations)


class CarbonIntensityProvider:
    """
    Provide regional carbon intensity data.
    
    Default values by region (kg CO2e/kWh):
    - USA Average: 0.38
    - Europe Average: 0.25
    - Coal Heavy: 0.85
    - Renewable Heavy: 0.05
    """
    
    REGIONAL_INTENSITIES = {
        'US': 0.38,
        'EU': 0.25,
        'UK': 0.20,
        'France': 0.05,  # Nuclear heavy
        'Germany': 0.40,  # Coal + renewables
        'China': 0.60,  # Coal heavy
        'India': 0.65,  # Coal heavy
        'Brazil': 0.08,  # Hydro heavy
        'Iceland': 0.01,  # Geothermal + hydro
        'Default': 0.3
    }
    
    @staticmethod
    def get_intensity(region: Optional[str] = None) -> float:
        """
        Get carbon intensity for region.
        
        Args:
            region: ISO country code or region name
        
        Returns:
            Carbon intensity in kg CO2e/kWh
        """
        if not region:
            return CarbonIntensityProvider.REGIONAL_INTENSITIES['Default']
        
        region_upper = region.upper()
        return CarbonIntensityProvider.REGIONAL_INTENSITIES.get(
            region_upper,
            CarbonIntensityProvider.REGIONAL_INTENSITIES['Default']
        )
    
    @staticmethod
    def get_all_regions() -> Dict[str, float]:
        """Get all regional intensities"""
        return CarbonIntensityProvider.REGIONAL_INTENSITIES.copy()
