from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# =====================
# Authentication Schemas
# =====================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Device Schemas
# =====================

class DeviceCreate(BaseModel):
    device_name: str
    device_id: str
    os_name: str
    os_version: str
    cpu_model: str
    gpu_model: Optional[str]
    total_ram_gb: float

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None

class DeviceResponse(BaseModel):
    id: int
    user_id: int
    device_name: str
    device_id: str
    os_name: str
    os_version: str
    cpu_model: str
    gpu_model: Optional[str]
    total_ram_gb: float
    is_active: bool
    last_seen: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Telemetry Schemas
# =====================

class TelemetryCreate(BaseModel):
    cpu_usage_percent: float
    gpu_usage_percent: Optional[float]
    ram_usage_percent: float
    ram_used_gb: float
    ram_available_gb: float
    battery_percent: Optional[float]
    is_charging: Optional[bool]
    estimated_power_w: float
    estimated_co2e_g: float

class TelemetryResponse(BaseModel):
    id: int
    timestamp: datetime
    cpu_usage_percent: float
    gpu_usage_percent: Optional[float]
    ram_usage_percent: float
    ram_used_gb: float
    ram_available_gb: float
    battery_percent: Optional[float]
    is_charging: Optional[bool]
    estimated_power_w: float
    estimated_co2e_g: float
    
    class Config:
        from_attributes = True

# =====================
# Monitoring Agent Schemas
# =====================

class MonitoringAgentMetrics(BaseModel):
    device_id: str
    timestamp: datetime
    cpu_usage_percent: float
    gpu_usage_percent: Optional[float]
    ram_usage_percent: float
    ram_used_gb: float
    ram_available_gb: float
    battery_percent: Optional[float]
    is_charging: Optional[bool]

class PairingCodeRequest(BaseModel):
    pass

class PairingCodeResponse(BaseModel):
    code: str
    expires_at: datetime

class PairingRequest(BaseModel):
    pairing_code: str
    device_name: str
    device_id: str
    os_name: str
    os_version: str
    cpu_model: str
    gpu_model: Optional[str]
    total_ram_gb: float

class PairingResponse(BaseModel):
    success: bool
    message: str
    device_id: Optional[int]
    access_token: Optional[str]

# =====================
# Prediction Schemas
# =====================

class PredictionResponse(BaseModel):
    id: int
    prediction_type: str
    predicted_value: float
    confidence_percent: float
    time_window_minutes: int
    model_type: str
    mae: Optional[float]
    rmse: Optional[float]
    r2_score: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Anomaly Schemas
# =====================

class AnomalyResponse(BaseModel):
    id: int
    anomaly_type: str
    severity: str
    description: str
    value: float
    baseline: float
    deviation_percent: float
    is_resolved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Recommendation Schemas
# =====================

class RecommendationResponse(BaseModel):
    id: int
    category: str
    title: str
    description: str
    reason: str
    action: str
    estimated_saving_percent: Optional[float]
    estimated_saving_g_co2e: Optional[float]
    is_dismissed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Alert Schemas
# =====================

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    description: str
    recommended_action: Optional[str]
    is_resolved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================
# Analytics Schemas
# =====================

class CarbonAnalytics(BaseModel):
    timestamp: datetime
    energy_kwh: float
    carbon_intensity: float
    co2e_g: float

class DailyAnalytics(BaseModel):
    date: str
    total_energy_kwh: float
    total_co2e_g: float
    average_power_w: float
    peak_power_w: float
    average_carbon_intensity: float

# =====================
# Scheduler Schemas
# =====================

class SchedulerRequest(BaseModel):
    task_name: str
    duration_minutes: int
    estimated_power_w: float
    earliest_start_time: datetime
    deadline: datetime
    priority: str  # "low", "medium", "high", "critical"

class SchedulerResponse(BaseModel):
    recommended_start_time: datetime
    recommended_end_time: datetime
    estimated_co2e_g: float
    current_execution_co2e_g: float
    potential_reduction_g: float
    potential_reduction_percent: float

# =====================
# Simulator Schemas
# =====================

class SimulatorRequest(BaseModel):
    duration_minutes: int
    cpu_usage_percent: float
    gpu_usage_percent: Optional[float]
    ram_usage_percent: float
    carbon_intensity: float

class SimulatorResponse(BaseModel):
    current_energy_kwh: float
    current_co2e_g: float
    optimized_energy_kwh: float
    optimized_co2e_g: float
    potential_saving_kwh: float
    potential_saving_co2e_g: float
    potential_reduction_percent: float
