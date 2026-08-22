"""
Extended API routes for GreenPulse

Add these routes to the main.py file in the routes section
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from auth import get_current_user
from models import User, Device, Telemetry, Prediction, Recommendation, Alert
from schemas import (
    SchedulerRequest, SchedulerResponse, SimulatorRequest, SimulatorResponse
)
from scheduler import WorkloadScheduler, WhatIfSimulator
from carbon_engine import PowerEstimator, CarbonCalculator
from ml_engine import RecommendationEngine
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# =====================
# Carbon Scheduler Routes
# =====================

@router.post("/scheduler/analyze", response_model=SchedulerResponse)
def analyze_schedule(
    request: SchedulerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze best time to run a workload based on carbon intensity"""
    
    result = WorkloadScheduler.find_optimal_window(
        duration_minutes=request.duration,
        deadline=request.deadline,
        earliest_start=request.earliest_start_time,
        estimated_power_w=request.estimated_power,
        carbon_intensity_pattern='balanced'
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No feasible schedule found before deadline"
        )
    
    return SchedulerResponse(
        recommended_start_time=result['recommended_start_time'],
        recommended_end_time=result['recommended_end_time'],
        estimated_co2e_g=result['estimated_co2e_g'],
        current_execution_co2e_g=result['current_execution_co2e_g'],
        potential_reduction_g=result['potential_reduction_g'],
        potential_reduction_percent=result['potential_reduction_percent']
    )

# =====================
# What-If Simulator Routes
# =====================

@router.post("/simulator/calculate", response_model=SimulatorResponse)
def simulate_scenario(
    request: SimulatorRequest,
    current_user: User = Depends(get_current_user)
):
    """Simulate energy/emissions for different scenarios"""
    
    # Estimate current power
    current_power = PowerEstimator.estimate(
        cpu_percent=request.cpu_usage_percent,
        ram_percent=request.ram_usage_percent,
        gpu_percent=request.gpu_usage_percent,
        has_display=True
    )
    
    # Simulate optimized scenario (30% reduction)
    optimized_power = current_power * 0.7
    
    duration_hours = request.duration_minutes / 60
    
    # Current scenario
    current_energy = CarbonCalculator.calculate_energy_kwh(current_power, duration_hours * 3600)
    current_co2e = CarbonCalculator.calculate_co2e_grams(current_energy, request.carbon_intensity)
    
    # Optimized scenario
    optimized_energy = CarbonCalculator.calculate_energy_kwh(optimized_power, duration_hours * 3600)
    optimized_co2e = CarbonCalculator.calculate_co2e_grams(optimized_energy, request.carbon_intensity)
    
    # Calculate savings
    saving_kwh = current_energy - optimized_energy
    saving_co2e = current_co2e - optimized_co2e
    saving_percent = (saving_co2e / current_co2e * 100) if current_co2e > 0 else 0
    
    return SimulatorResponse(
        current_energy_kwh=round(current_energy, 4),
        current_co2e_g=round(current_co2e, 2),
        optimized_energy_kwh=round(optimized_energy, 4),
        optimized_co2e_g=round(optimized_co2e, 2),
        potential_saving_kwh=round(saving_kwh, 4),
        potential_saving_co2e_g=round(saving_co2e, 2),
        potential_reduction_percent=round(saving_percent, 1)
    )

# =====================
# Advanced Analytics Routes
# =====================

@router.get("/analytics/weekly")
def get_weekly_analytics(
    device_id: int,
    weeks: int = 4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly aggregated analytics"""
    
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    since = datetime.utcnow() - timedelta(weeks=weeks)
    telemetry_records = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).all()
    
    # Group by week
    from collections import defaultdict
    weekly_data = defaultdict(lambda: {"energy_kwh": 0, "co2e_g": 0, "power_readings": []})
    
    for t in telemetry_records:
        week_key = t.timestamp.isocalendar()[1]  # Week number
        energy_kwh = (t.estimated_power_w / 1000) * (1 / 60)
        weekly_data[week_key]["energy_kwh"] += energy_kwh
        weekly_data[week_key]["co2e_g"] += t.estimated_co2e_g
        weekly_data[week_key]["power_readings"].append(t.estimated_power_w)
    
    analytics = []
    for week_key in sorted(weekly_data.keys()):
        data = weekly_data[week_key]
        power_readings = data["power_readings"]
        analytics.append({
            "week": week_key,
            "energy_kwh": round(data["energy_kwh"], 4),
            "co2e_g": round(data["co2e_g"], 2),
            "average_power_w": round(sum(power_readings) / len(power_readings), 1) if power_readings else 0,
            "peak_power_w": round(max(power_readings), 1) if power_readings else 0
        })
    
    return {
        "device_id": device_id,
        "weeks": weeks,
        "analytics": analytics
    }

@router.get("/analytics/monthly")
def get_monthly_analytics(
    device_id: int,
    months: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly aggregated analytics"""
    
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    since = datetime.utcnow() - timedelta(days=30*months)
    telemetry_records = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).all()
    
    # Group by month
    from collections import defaultdict
    monthly_data = defaultdict(lambda: {"energy_kwh": 0, "co2e_g": 0, "power_readings": []})
    
    for t in telemetry_records:
        month_key = f"{t.timestamp.year}-{t.timestamp.month:02d}"
        energy_kwh = (t.estimated_power_w / 1000) * (1 / 60)
        monthly_data[month_key]["energy_kwh"] += energy_kwh
        monthly_data[month_key]["co2e_g"] += t.estimated_co2e_g
        monthly_data[month_key]["power_readings"].append(t.estimated_power_w)
    
    analytics = []
    for month_key in sorted(monthly_data.keys()):
        data = monthly_data[month_key]
        power_readings = data["power_readings"]
        analytics.append({
            "month": month_key,
            "energy_kwh": round(data["energy_kwh"], 2),
            "co2e_g": round(data["co2e_g"], 2),
            "average_power_w": round(sum(power_readings) / len(power_readings), 1) if power_readings else 0,
            "peak_power_w": round(max(power_readings), 1) if power_readings else 0
        })
    
    return {
        "device_id": device_id,
        "months": months,
        "analytics": analytics
    }

# =====================
# Green Score Route
# =====================

@router.get("/analytics/green-score")
def get_green_score(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's green score"""
    
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Get recent telemetry
    since = datetime.utcnow() - timedelta(days=7)
    recent_telemetry = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).all()
    
    if not recent_telemetry:
        return {
            "score": 50,
            "factors": {},
            "explanation": "Not enough data - please use your laptop for 7 days"
        }
    
    # Calculate metrics
    power_readings = [t.estimated_power_w for t in recent_telemetry]
    current_metrics = {
        "average_power_w": sum(power_readings) / len(power_readings),
        "peak_power_w": max(power_readings),
        "min_power_w": min(power_readings)
    }
    
    # Get historical data for comparison
    historical = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= datetime.utcnow() - timedelta(days=30)
    ).all()
    
    from carbon_engine import GreenScoreCalculator
    score, factors = GreenScoreCalculator.calculate_score(current_metrics, historical)
    explanation = GreenScoreCalculator.get_score_explanation(score, factors)
    
    return {
        "score": score,
        "factors": factors,
        "explanation": explanation,
        "device_id": device_id
    }

# =====================
# Recommendations Route
# =====================

@router.get("/recommendations")
def get_personalized_recommendations(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations"""
    
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Get recent telemetry
    since = datetime.utcnow() - timedelta(days=7)
    recent_telemetry = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).order_by(Telemetry.timestamp.desc()).limit(100).all()
    
    if not recent_telemetry:
        return {"recommendations": []}
    
    # Calculate current metrics
    power_readings = [t.estimated_power_w for t in recent_telemetry]
    current_metrics = {
        "average_power_w": sum(power_readings) / len(power_readings),
        "peak_power_w": max(power_readings),
        "min_power_w": min(power_readings)
    }
    
    # Convert telemetry to dicts
    telemetry_dicts = [
        {
            "cpu_usage_percent": t.cpu_usage_percent,
            "ram_usage_percent": t.ram_usage_percent,
            "gpu_usage_percent": t.gpu_usage_percent,
            "estimated_power_w": t.estimated_power_w,
            "timestamp": t.timestamp.isoformat()
        }
        for t in recent_telemetry
    ]
    
    recommendations = RecommendationEngine.generate_recommendations(
        current_metrics=current_metrics,
        historical_data=telemetry_dicts,
        anomalies=[]
    )
    
    return {
        "count": len(recommendations),
        "recommendations": recommendations,
        "device_id": device_id
    }

# Add to main app:
# app.include_router(router)
