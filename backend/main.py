from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import string
import asyncio
import math

from config import settings
from database import get_db, init_db, SessionLocal
from models import User, Device, Telemetry, PairingCode, Anomaly, Recommendation, Alert
from auth import (
    hash_password, authenticate_user, create_access_token,
    verify_password, verify_token, get_current_user
)
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    DeviceCreate, DeviceResponse, DeviceUpdate,
    TelemetryCreate, TelemetryResponse,
    PairingCodeResponse, PairingRequest, PairingResponse,
    PredictionResponse, AnomalyResponse, RecommendationResponse, AlertResponse,
    SchedulerRequest, SchedulerResponse, SimulatorRequest, SimulatorResponse,
    MonitoringAgentMetrics
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="GreenPulse: AI-Powered Carbon-Aware Computing Assistant"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["*"],  # Allow all for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_mock_telemetry_for_device(db: Session, device: Device):
    """Generate a single realistic telemetry record for a device"""
    cpu = round(random.uniform(15.0, 55.0), 1)
    ram_pct = round(random.uniform(35.0, 65.0), 1)
    gpu_pct = round(random.uniform(5.0, 30.0), 1)
    battery = round(random.uniform(70.0, 100.0), 1)
    
    base_power = 12.0
    cpu_power = (cpu / 100.0) * 35.0
    ram_power = (ram_pct / 100.0) * 6.0
    gpu_power = (gpu_pct / 100.0) * 45.0
    display_power = 15.0
    
    estimated_power_w = round(base_power + cpu_power + ram_power + gpu_power + display_power, 1)
    carbon_intensity = settings.DEFAULT_CARBON_INTENSITY
    energy_kwh = (estimated_power_w / 1000.0) * (1 / 60.0)
    estimated_co2e_g = round(energy_kwh * carbon_intensity * 1000.0, 2)
    
    now = datetime.utcnow()
    telemetry = Telemetry(
        user_id=device.user_id,
        device_id=device.id,
        timestamp=now,
        cpu_usage_percent=cpu,
        gpu_usage_percent=gpu_pct,
        ram_usage_percent=ram_pct,
        ram_used_gb=round((ram_pct / 100.0) * (device.total_ram_gb or 16.0), 1),
        ram_available_gb=round(((100.0 - ram_pct) / 100.0) * (device.total_ram_gb or 16.0), 1),
        battery_percent=battery,
        is_charging=True,
        estimated_power_w=estimated_power_w,
        estimated_co2e_g=estimated_co2e_g
    )
    db.add(telemetry)
    device.last_seen = now
    db.commit()

def pre_populate_history_if_empty(db: Session, device: Device):
    """Pre-populate 24 hours of history for a new device so charts are rich instantly"""
    existing_count = db.query(Telemetry).filter(Telemetry.device_id == device.id).count()
    if existing_count > 0:
        return
    
    now = datetime.utcnow()
    records = []
    # 24 hours = 96 points (every 15 min)
    for i in range(96, 0, -1):
        ts = now - timedelta(minutes=i * 15)
        hour = ts.hour
        wave = math.sin(hour / 24.0 * 2 * math.pi)
        
        cpu = round(max(10.0, min(95.0, 30.0 + wave * 20.0 + random.uniform(-10, 10))), 1)
        ram_pct = round(max(20.0, min(90.0, 50.0 + wave * 10.0 + random.uniform(-5, 5))), 1)
        gpu_pct = round(max(0.0, min(80.0, 15.0 + wave * 15.0 + random.uniform(-5, 5))), 1)
        
        base_power = 12.0
        cpu_power = (cpu / 100.0) * 35.0
        ram_power = (ram_pct / 100.0) * 6.0
        gpu_power = (gpu_pct / 100.0) * 45.0
        display_power = 15.0
        
        estimated_power_w = round(base_power + cpu_power + ram_power + gpu_power + display_power, 1)
        carbon_intensity = settings.DEFAULT_CARBON_INTENSITY
        energy_kwh = (estimated_power_w / 1000.0) * (15 / 60.0)
        estimated_co2e_g = round(energy_kwh * carbon_intensity * 1000.0, 2)
        
        records.append(Telemetry(
            user_id=device.user_id,
            device_id=device.id,
            timestamp=ts,
            cpu_usage_percent=cpu,
            gpu_usage_percent=gpu_pct,
            ram_usage_percent=ram_pct,
            ram_used_gb=round((ram_pct / 100.0) * (device.total_ram_gb or 16.0), 1),
            ram_available_gb=round(((100.0 - ram_pct) / 100.0) * (device.total_ram_gb or 16.0), 1),
            battery_percent=85.0,
            is_charging=True,
            estimated_power_w=estimated_power_w,
            estimated_co2e_g=estimated_co2e_g
        ))
    db.bulk_save_objects(records)
    db.commit()

async def background_mock_telemetry_loop():
    """Background task running every 5 seconds to supply live telemetry for active devices"""
    while True:
        try:
            db = SessionLocal()
            devices = db.query(Device).filter(Device.is_active == True).all()
            for device in devices:
                generate_mock_telemetry_for_device(db, device)
            db.close()
        except Exception as e:
            logger.error(f"Error in background telemetry generator: {e}")
        await asyncio.sleep(5)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("Database initialized")
    asyncio.create_task(background_mock_telemetry_loop())
    logger.info("Background automatic telemetry generator started")

# =====================
# Root Route
# =====================

@app.get("/")
def root():
    return {
        "name": "GreenPulse API",
        "version": settings.API_VERSION,
        "description": "AI-Powered Carbon-Aware Computing Assistant",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "auth": "/auth/login",
            "devices": "/devices",
            "telemetry": "/monitor/telemetry"
        }
    }

# =====================
# Health Check
# =====================

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# =====================
# Authentication Routes
# =====================

@app.post("/auth/register", response_model=UserResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"User registered: {user.email}")
    return user

@app.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    logger.info(f"User logged in: {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(
    credentials: dict = Depends(get_current_user)
):
    """Get current authenticated user info"""
    return credentials

@app.post("/auth/logout")
def logout():
    """Logout (client-side token deletion)"""
    return {"message": "Logged out successfully"}

# =====================
# Device Management Routes
# =====================

@app.get("/devices", response_model=list[DeviceResponse])
def get_devices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all devices for current user (auto-creates default device if none exist)"""
    devices = db.query(Device).filter(Device.user_id == current_user.id).all()
    if not devices:
        default_device = Device(
            user_id=current_user.id,
            device_id=f"auto-device-{current_user.id}",
            device_name="My Eco Laptop",
            os_name="Windows",
            os_version="11",
            cpu_model="Intel Core i7 / Apple M-Series",
            gpu_model="NVIDIA RTX / Integrated",
            total_ram_gb=16.0,
            is_active=True,
            last_seen=datetime.utcnow()
        )
        db.add(default_device)
        db.commit()
        db.refresh(default_device)
        pre_populate_history_if_empty(db, default_device)
        devices = [default_device]
    else:
        for d in devices:
            pre_populate_history_if_empty(db, d)
            
    return devices

@app.post("/devices", response_model=DeviceResponse)
def create_device(
    device: DeviceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new device"""
    # Check if device_id already exists
    existing_device = db.query(Device).filter(Device.device_id == device.device_id).first()
    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device ID already registered"
        )
    
    new_device = Device(
        user_id=current_user.id,
        device_id=device.device_id,
        device_name=device.device_name,
        os_name=device.os_name,
        os_version=device.os_version,
        cpu_model=device.cpu_model,
        gpu_model=device.gpu_model,
        total_ram_gb=device.total_ram_gb,
        last_seen=datetime.utcnow()
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    
    logger.info(f"Device created for user {current_user.email}: {new_device.device_id}")
    return new_device

@app.put("/devices/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    device_update: DeviceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update device details"""
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    if device_update.device_name:
        device.device_name = device_update.device_name
    
    device.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(device)
    return device

@app.delete("/devices/{device_id}")
def delete_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete/disconnect a device"""
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    device.is_active = False
    device.updated_at = datetime.utcnow()
    db.commit()
    
    logger.info(f"Device disconnected: {device.device_id}")
    return {"message": "Device disconnected"}

# =====================
# Device Pairing Routes
# =====================

@app.post("/pairing/request-code", response_model=PairingCodeResponse)
def request_pairing_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a pairing code for device connection"""
    # Generate random alphanumeric code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Invalidate old codes for this user
    old_codes = db.query(PairingCode).filter(
        PairingCode.user_id == current_user.id,
        PairingCode.is_used == False
    ).all()
    for old_code in old_codes:
        old_code.is_used = True
    
    # Create new pairing code
    pairing_code = PairingCode(
        user_id=current_user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.PAIRING_CODE_EXPIRY_MINUTES)
    )
    db.add(pairing_code)
    db.commit()
    db.refresh(pairing_code)
    
    logger.info(f"Pairing code generated for user {current_user.email}: {code}")
    
    return PairingCodeResponse(
        code=code,
        expires_at=pairing_code.expires_at
    )

@app.post("/pairing/confirm", response_model=PairingResponse)
def confirm_pairing(
    request: PairingRequest,
    db: Session = Depends(get_db)
):
    """Confirm device pairing using pairing code"""
    # Find pairing code
    pairing_code = db.query(PairingCode).filter(
        PairingCode.code == request.pairing_code,
        PairingCode.is_used == False
    ).first()
    
    if not pairing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired pairing code"
        )
    
    if pairing_code.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pairing code expired"
        )
    
    # Get user
    user = db.query(User).filter(User.id == pairing_code.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Check if device already exists
    existing_device = db.query(Device).filter(Device.device_id == request.device_id).first()
    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device already registered"
        )
    
    # Create device
    device = Device(
        user_id=user.id,
        device_id=request.device_id,
        device_name=request.device_name,
        os_name=request.os_name,
        os_version=request.os_version,
        cpu_model=request.cpu_model,
        gpu_model=request.gpu_model,
        total_ram_gb=request.total_ram_gb,
        last_seen=datetime.utcnow()
    )
    db.add(device)
    
    # Mark pairing code as used
    pairing_code.is_used = True
    pairing_code.paired_device_id = device.id
    
    db.commit()
    db.refresh(device)
    
    # Create access token for device
    device_token = create_access_token(
        data={"sub": str(user.id), "device_id": str(device.id)},
        expires_delta=timedelta(days=30)
    )
    
    logger.info(f"Device paired successfully: {device.device_id}")
    
    return PairingResponse(
        success=True,
        message="Device paired successfully",
        device_id=device.id,
        access_token=device_token
    )

# =====================
# Telemetry Routes
# =====================

@app.post("/monitor/telemetry")
def submit_telemetry(
    metrics: MonitoringAgentMetrics,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit telemetry from monitoring agent"""
    # Find device
    device = db.query(Device).filter(
        Device.device_id == metrics.device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Estimate power (simple model)
    base_power = 10
    cpu_power = (metrics.cpu_usage_percent / 100) * 30
    ram_power = (metrics.ram_usage_percent / 100) * 5
    gpu_power = (metrics.gpu_usage_percent / 100 * 50) if metrics.gpu_usage_percent else 0
    display_power = 15
    
    estimated_power_w = base_power + cpu_power + ram_power + gpu_power + display_power
    
    # Get current carbon intensity (default fallback)
    carbon_intensity = settings.DEFAULT_CARBON_INTENSITY  # kg CO2e/kWh
    
    # Calculate CO2e for this reading (1 minute interval)
    energy_kwh = (estimated_power_w / 1000) * (1 / 60)  # 1 minute
    estimated_co2e_g = energy_kwh * carbon_intensity * 1000  # convert to grams
    
    # Create telemetry record
    telemetry = Telemetry(
        user_id=current_user.id,
        device_id=device.id,
        timestamp=metrics.timestamp,
        cpu_usage_percent=metrics.cpu_usage_percent,
        gpu_usage_percent=metrics.gpu_usage_percent,
        ram_usage_percent=metrics.ram_usage_percent,
        ram_used_gb=metrics.ram_used_gb,
        ram_available_gb=metrics.ram_available_gb,
        battery_percent=metrics.battery_percent,
        is_charging=metrics.is_charging,
        estimated_power_w=estimated_power_w,
        estimated_co2e_g=estimated_co2e_g
    )
    
    db.add(telemetry)
    device.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(telemetry)
    
    return {
        "success": True,
        "telemetry_id": telemetry.id,
        "estimated_power_w": estimated_power_w,
        "estimated_co2e_g": estimated_co2e_g
    }

@app.get("/monitor/current")
def get_current_telemetry(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current telemetry for user's devices"""
    devices = db.query(Device).filter(Device.user_id == current_user.id).all()
    
    if not devices:
        return {"devices": []}
    
    device_telemetry = []
    for device in devices:
        latest_telemetry = db.query(Telemetry).filter(
            Telemetry.device_id == device.id
        ).order_by(Telemetry.timestamp.desc()).first()
        
        if latest_telemetry:
            device_telemetry.append({
                "device_id": device.id,
                "device_name": device.device_name,
                "is_active": device.is_active,
                "last_seen": device.last_seen,
                "telemetry": {
                    "cpu_usage_percent": latest_telemetry.cpu_usage_percent,
                    "gpu_usage_percent": latest_telemetry.gpu_usage_percent,
                    "ram_usage_percent": latest_telemetry.ram_usage_percent,
                    "ram_used_gb": latest_telemetry.ram_used_gb,
                    "ram_available_gb": latest_telemetry.ram_available_gb,
                    "battery_percent": latest_telemetry.battery_percent,
                    "is_charging": latest_telemetry.is_charging,
                    "estimated_power_w": latest_telemetry.estimated_power_w,
                    "estimated_co2e_g": latest_telemetry.estimated_co2e_g,
                    "timestamp": latest_telemetry.timestamp
                }
            })
    
    return {"devices": device_telemetry}

@app.get("/monitor/history")
def get_telemetry_history(
    device_id: int,
    hours: int = 24,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get telemetry history for a device"""
    # Verify device belongs to user
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Get history
    since = datetime.utcnow() - timedelta(hours=hours)
    telemetry_records = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).order_by(Telemetry.timestamp.asc()).all()
    
    return {
        "device_id": device_id,
        "device_name": device.device_name,
        "hours": hours,
        "records": [
            {
                "timestamp": t.timestamp,
                "cpu_usage_percent": t.cpu_usage_percent,
                "gpu_usage_percent": t.gpu_usage_percent,
                "ram_usage_percent": t.ram_usage_percent,
                "ram_used_gb": t.ram_used_gb,
                "estimated_power_w": t.estimated_power_w,
                "estimated_co2e_g": t.estimated_co2e_g
            }
            for t in telemetry_records
        ]
    }

# =====================
# Carbon Analytics Routes
# =====================

@app.get("/analytics/daily")
def get_daily_analytics(
    device_id: int,
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily carbon analytics"""
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    since = datetime.utcnow() - timedelta(days=days)
    telemetry_records = db.query(Telemetry).filter(
        Telemetry.device_id == device_id,
        Telemetry.timestamp >= since
    ).all()
    
    # Group by day
    from collections import defaultdict
    daily_data = defaultdict(lambda: {"energy_kwh": 0, "co2e_g": 0, "power_readings": []})
    
    for t in telemetry_records:
        date_key = t.timestamp.date()
        energy_kwh = (t.estimated_power_w / 1000) * (1 / 60)  # 1 minute interval
        daily_data[date_key]["energy_kwh"] += energy_kwh
        daily_data[date_key]["co2e_g"] += t.estimated_co2e_g
        daily_data[date_key]["power_readings"].append(t.estimated_power_w)
    
    # Format response
    analytics = []
    for date_key in sorted(daily_data.keys()):
        data = daily_data[date_key]
        power_readings = data["power_readings"]
        analytics.append({
            "date": str(date_key),
            "energy_kwh": round(data["energy_kwh"], 4),
            "co2e_g": round(data["co2e_g"], 2),
            "average_power_w": round(sum(power_readings) / len(power_readings), 1) if power_readings else 0,
            "peak_power_w": round(max(power_readings), 1) if power_readings else 0
        })
    
    return {
        "device_id": device_id,
        "days": days,
        "analytics": analytics
    }

# =====================
# Predictions Routes
# =====================

@app.get("/predictions")
def get_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI predictions for current user"""
    # For now, return placeholder
    return {
        "predictions": [],
        "message": "Collecting more data for personalized prediction"
    }

# =====================
# Anomalies Routes
# =====================

@app.get("/anomalies")
def get_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detected anomalies"""
    anomalies = db.query(Anomaly).filter(
        Anomaly.user_id == current_user.id,
        Anomaly.is_resolved == False
    ).order_by(Anomaly.created_at.desc()).all()
    
    return {
        "count": len(anomalies),
        "anomalies": anomalies
    }

# =====================
# Recommendations Routes
# =====================

@app.get("/recommendations")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized recommendations"""
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.is_dismissed == False
    ).order_by(Recommendation.created_at.desc()).all()
    
    return {
        "count": len(recommendations),
        "recommendations": recommendations
    }

# =====================
# Alerts Routes
# =====================

@app.get("/alerts")
def get_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get alerts for user"""
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_resolved == False
    ).order_by(Alert.created_at.desc()).all()
    
    return {
        "count": len(alerts),
        "alerts": alerts
    }

@app.put("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resolve an alert"""
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Alert resolved"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
