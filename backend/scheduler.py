"""
Carbon-Aware Workload Scheduler

Allows scheduling tasks for periods of lower carbon intensity,
reducing emissions while meeting deadlines.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import logging

logger = logging.getLogger(__name__)


class CarbonIntensityForecast:
    """Forecast carbon intensity over time (simplified model)"""
    
    # Typical daily patterns (kg CO2e/kWh)
    # These are example patterns - real data would come from grid operators
    HOURLY_PATTERNS = {
        'high_coal': [
            0.85, 0.82, 0.80, 0.78, 0.80, 0.85, 0.90, 0.95, 0.92, 0.88,
            0.85, 0.82, 0.80, 0.78, 0.75, 0.78, 0.80, 0.82, 0.85, 0.90,
            0.95, 0.92, 0.90, 0.88
        ],
        'balanced': [
            0.35, 0.33, 0.32, 0.30, 0.32, 0.38, 0.42, 0.45, 0.42, 0.38,
            0.35, 0.32, 0.30, 0.28, 0.27, 0.30, 0.33, 0.35, 0.38, 0.42,
            0.45, 0.42, 0.40, 0.38
        ],
        'renewable_heavy': [
            0.15, 0.12, 0.10, 0.08, 0.10, 0.15, 0.20, 0.18, 0.15, 0.12,
            0.10, 0.08, 0.06, 0.05, 0.06, 0.10, 0.15, 0.18, 0.20, 0.25,
            0.22, 0.18, 0.15, 0.12
        ]
    }
    
    @staticmethod
    def get_intensity_at_time(
        timestamp: datetime,
        pattern: str = 'balanced'
    ) -> float:
        """
        Get forecast carbon intensity for a specific time.
        
        Args:
            timestamp: Time to forecast
            pattern: One of 'high_coal', 'balanced', 'renewable_heavy'
        
        Returns:
            Carbon intensity in kg CO2e/kWh
        """
        if pattern not in CarbonIntensityForecast.HOURLY_PATTERNS:
            pattern = 'balanced'
        
        hour = timestamp.hour
        patterns = CarbonIntensityForecast.HOURLY_PATTERNS[pattern]
        
        return patterns[hour % 24]
    
    @staticmethod
    def get_24h_forecast(
        start_time: datetime,
        pattern: str = 'balanced'
    ) -> List[Tuple[datetime, float]]:
        """
        Get 24-hour carbon intensity forecast.
        
        Returns:
            List of (timestamp, intensity) tuples
        """
        forecast = []
        current = start_time.replace(minute=0, second=0, microsecond=0)
        
        for hour in range(24):
            intensity = CarbonIntensityForecast.get_intensity_at_time(current, pattern)
            forecast.append((current, intensity))
            current += timedelta(hours=1)
        
        return forecast


class WorkloadScheduler:
    """Schedule workloads for optimal carbon footprint"""
    
    @staticmethod
    def find_optimal_window(
        duration_minutes: int,
        deadline: datetime,
        earliest_start: datetime,
        estimated_power_w: float = 50,
        carbon_intensity_pattern: str = 'balanced'
    ) -> Optional[Dict]:
        """
        Find optimal time window for workload execution.
        
        Optimizes for:
        1. Meeting deadline (critical)
        2. Lowest carbon intensity
        3. Earliest possible time (if multiple equally good options)
        
        Args:
            duration_minutes: How long the task takes
            deadline: Must complete by this time
            earliest_start: Cannot start before this time
            estimated_power_w: Estimated power draw
            carbon_intensity_pattern: Grid pattern
        
        Returns:
            Dict with recommended_start_time, estimated_co2e, etc.
        """
        if deadline <= earliest_start:
            logger.warning("Deadline is before earliest start time")
            return None
        
        duration_hours = duration_minutes / 60
        
        # Generate hourly windows
        windows = []
        current = earliest_start.replace(minute=0, second=0, microsecond=0)
        
        while current < deadline:
            end_time = current + timedelta(hours=duration_hours)
            
            if end_time <= deadline:
                # Calculate carbon for this window
                intensities = []
                check_time = current
                
                while check_time < end_time:
                    intensity = CarbonIntensityForecast.get_intensity_at_time(
                        check_time, carbon_intensity_pattern
                    )
                    intensities.append(intensity)
                    check_time += timedelta(hours=1)
                
                avg_intensity = np.mean(intensities) if intensities else 0.3
                
                # Calculate CO2e
                energy_kwh = (estimated_power_w / 1000) * duration_hours
                co2e_grams = energy_kwh * avg_intensity * 1000
                
                windows.append({
                    'start_time': current,
                    'end_time': end_time,
                    'avg_intensity': avg_intensity,
                    'estimated_co2e_g': co2e_grams,
                    'hours_until_start': (current - earliest_start).total_seconds() / 3600
                })
            
            current += timedelta(hours=1)
        
        if not windows:
            return None
        
        # Find best window (lowest intensity)
        best_window = min(windows, key=lambda w: w['estimated_co2e_g'])
        
        # Calculate current execution CO2e
        current_time = datetime.now()
        current_intensities = []
        check_time = current_time
        end_time = current_time + timedelta(hours=duration_hours)
        
        while check_time < end_time:
            intensity = CarbonIntensityForecast.get_intensity_at_time(
                check_time, carbon_intensity_pattern
            )
            current_intensities.append(intensity)
            check_time += timedelta(hours=1)
        
        current_avg_intensity = np.mean(current_intensities) if current_intensities else 0.3
        current_energy_kwh = (estimated_power_w / 1000) * duration_hours
        current_co2e = current_energy_kwh * current_avg_intensity * 1000
        
        # Calculate savings
        potential_reduction = current_co2e - best_window['estimated_co2e_g']
        reduction_percent = (potential_reduction / current_co2e * 100) if current_co2e > 0 else 0
        
        return {
            'recommended_start_time': best_window['start_time'],
            'recommended_end_time': best_window['end_time'],
            'estimated_co2e_g': round(best_window['estimated_co2e_g'], 2),
            'current_execution_co2e_g': round(current_co2e, 2),
            'potential_reduction_g': round(potential_reduction, 2),
            'potential_reduction_percent': round(reduction_percent, 1),
            'avg_carbon_intensity': round(best_window['avg_intensity'], 3),
            'hours_until_start': round(best_window['hours_until_start'], 1),
            'feasible_windows_count': len(windows),
            'message': f"Run task between {best_window['start_time'].strftime('%H:%M')} and {best_window['end_time'].strftime('%H:%M')} for lowest emissions"
        }
    
    @staticmethod
    def simulate_alternatives(
        task_duration_minutes: int,
        estimated_power_w: float = 50,
        carbon_intensity_pattern: str = 'balanced'
    ) -> Dict:
        """
        Simulate different execution times and their carbon impact.
        
        Returns:
            Dict with all alternative schedules and their impact
        """
        scenarios = []
        
        # Test different hours of the day
        now = datetime.now()
        duration_hours = task_duration_minutes / 60
        
        for hour in range(24):
            start_time = now.replace(hour=hour, minute=0, second=0, microsecond=0)
            
            if start_time < now:
                start_time += timedelta(days=1)
            
            end_time = start_time + timedelta(hours=duration_hours)
            
            # Calculate average intensity for this window
            intensities = []
            check_time = start_time
            
            while check_time < end_time:
                intensity = CarbonIntensityForecast.get_intensity_at_time(
                    check_time, carbon_intensity_pattern
                )
                intensities.append(intensity)
                check_time += timedelta(hours=1)
            
            avg_intensity = np.mean(intensities) if intensities else 0.3
            
            energy_kwh = (estimated_power_w / 1000) * duration_hours
            co2e_grams = energy_kwh * avg_intensity * 1000
            
            scenarios.append({
                'start_hour': hour,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'avg_intensity': round(avg_intensity, 3),
                'estimated_co2e_g': round(co2e_grams, 2),
                'carbon_level': (
                    'Very Low' if avg_intensity < 0.1 else
                    'Low' if avg_intensity < 0.3 else
                    'Medium' if avg_intensity < 0.6 else
                    'High'
                )
            })
        
        # Sort by CO2e
        scenarios_sorted = sorted(scenarios, key=lambda x: x['estimated_co2e_g'])
        
        best = scenarios_sorted[0]
        worst = scenarios_sorted[-1]
        
        return {
            'task_duration_minutes': task_duration_minutes,
            'estimated_power_w': estimated_power_w,
            'all_scenarios': scenarios_sorted,
            'best_time': {
                'start_hour': best['start_hour'],
                'co2e_g': best['estimated_co2e_g']
            },
            'worst_time': {
                'start_hour': worst['start_hour'],
                'co2e_g': worst['estimated_co2e_g']
            },
            'potential_savings': round(worst['estimated_co2e_g'] - best['estimated_co2e_g'], 2),
            'savings_percent': round((worst['estimated_co2e_g'] - best['estimated_co2e_g']) / worst['estimated_co2e_g'] * 100, 1)
        }


class WhatIfSimulator:
    """Simulate scenarios to understand impact of different behaviors"""
    
    @staticmethod
    def simulate_behavior_change(
        current_power_w: float,
        duration_minutes: int,
        optimization: str = 'reduce_brightness',  # reduce_brightness, disable_gpu, power_save, all_optimizations
        carbon_intensity: float = 0.3
    ) -> Dict:
        """
        Simulate impact of behavior changes on energy and emissions.
        
        Args:
            current_power_w: Current power draw
            duration_minutes: Duration of usage
            optimization: Type of optimization
            carbon_intensity: Carbon intensity in kg CO2e/kWh
        
        Returns:
            Dict with current vs optimized scenarios
        """
        # Define optimization impacts
        optimizations = {
            'reduce_brightness': {'factor': 0.95, 'description': 'Reduce brightness by 50%'},
            'disable_gpu': {'factor': 0.80, 'description': 'Disable GPU for non-GPU tasks'},
            'power_save': {'factor': 0.85, 'description': 'Enable power saving mode'},
            'close_apps': {'factor': 0.90, 'description': 'Close unnecessary applications'},
            'all_optimizations': {'factor': 0.70, 'description': 'All optimizations combined'}
        }
        
        if optimization not in optimizations:
            optimization = 'reduce_brightness'
        
        opt_factor = optimizations[optimization]['factor']
        optimized_power_w = current_power_w * opt_factor
        
        # Current scenario
        duration_hours = duration_minutes / 60
        current_energy_kwh = (current_power_w / 1000) * duration_hours
        current_co2e_g = current_energy_kwh * carbon_intensity * 1000
        
        # Optimized scenario
        optimized_energy_kwh = (optimized_power_w / 1000) * duration_hours
        optimized_co2e_g = optimized_energy_kwh * carbon_intensity * 1000
        
        # Savings
        energy_savings = current_energy_kwh - optimized_energy_kwh
        co2_savings = current_co2e_g - optimized_co2e_g
        savings_percent = (co2_savings / current_co2e_g * 100) if current_co2e_g > 0 else 0
        
        return {
            'current': {
                'power_w': round(current_power_w, 1),
                'energy_kwh': round(current_energy_kwh, 4),
                'co2e_g': round(current_co2e_g, 2)
            },
            'optimized': {
                'power_w': round(optimized_power_w, 1),
                'energy_kwh': round(optimized_energy_kwh, 4),
                'co2e_g': round(optimized_co2e_g, 2)
            },
            'optimization': optimization,
            'optimization_description': optimizations[optimization]['description'],
            'savings': {
                'energy_kwh': round(energy_savings, 4),
                'co2e_g': round(co2_savings, 2),
                'percent': round(savings_percent, 1)
            },
            'duration_minutes': duration_minutes
        }
