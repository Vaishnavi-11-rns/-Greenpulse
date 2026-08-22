from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, ForeignKey,
    Text, Enum, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    devices = relationship("Device", back_populates="owner")
    telemetry = relationship("Telemetry", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    anomalies = relationship("Anomaly", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    
    __table_args__ = (
        Index("idx_user_email", "email"),
    )


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_name = Column(String, default="My Laptop")
    device_id = Column(String, unique=True, index=True)  # Hardware identifier
    os_name = Column(String)  # Windows, Linux, Darwin
    os_version = Column(String)
    cpu_model = Column(String)
    gpu_model = Column(String, nullable=True)
    total_ram_gb = Column(Float)
    is_active = Column(Boolean, default=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="devices")
    telemetry = relationship("Telemetry", back_populates="device")
    
    __table_args__ = (
        Index("idx_device_user_id", "user_id"),
        Index("idx_device_device_id", "device_id"),
    )


class Telemetry(Base):
    __tablename__ = "telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # CPU
    cpu_usage_percent = Column(Float)  # 0-100
    
    # GPU
    gpu_usage_percent = Column(Float, nullable=True)  # 0-100 or NULL if unavailable
    
    # RAM
    ram_usage_percent = Column(Float)  # 0-100
    ram_used_gb = Column(Float)
    ram_available_gb = Column(Float)
    
    # Battery
    battery_percent = Column(Float, nullable=True)  # 0-100 or NULL
    is_charging = Column(Boolean, nullable=True)
    
    # Power (Estimated)
    estimated_power_w = Column(Float)  # Watts
    
    # CO2e (Calculated)
    estimated_co2e_g = Column(Float)  # Grams CO2e
    
    device = relationship("Device", back_populates="telemetry")
    user = relationship("User", back_populates="telemetry")
    
    __table_args__ = (
        Index("idx_telemetry_user_id", "user_id"),
        Index("idx_telemetry_device_id", "device_id"),
        Index("idx_telemetry_timestamp", "timestamp"),
        Index("idx_telemetry_user_timestamp", "user_id", "timestamp"),
    )


class CarbonIntensity(Base):
    __tablename__ = "carbon_intensity"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    value_kg_co2e_per_kwh = Column(Float)
    region = Column(String, nullable=True)
    source = Column(String)  # "manual", "api", "default"
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_ci_user_id", "user_id"),
    )


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    prediction_type = Column(String)  # "energy", "co2e"
    predicted_value = Column(Float)
    confidence_percent = Column(Float)  # 0-100
    time_window_minutes = Column(Integer)
    model_type = Column(String)  # "linear_regression", "random_forest", etc
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")


class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    
    anomaly_type = Column(String)  # "cpu", "gpu", "ram", "power"
    severity = Column(String)  # "low", "medium", "high"
    description = Column(String)
    value = Column(Float)
    baseline = Column(Float)
    deviation_percent = Column(Float)
    
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="anomalies")


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    category = Column(String)  # "cpu", "gpu", "ram", "power", "scheduling"
    title = Column(String)
    description = Column(String)
    reason = Column(String)
    action = Column(String)
    
    estimated_saving_percent = Column(Float, nullable=True)
    estimated_saving_g_co2e = Column(Float, nullable=True)
    
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    
    alert_type = Column(String)  # "high_cpu", "high_gpu", "high_power", "anomaly"
    severity = Column(String)  # "info", "warning", "critical"
    title = Column(String)
    description = Column(String)
    recommended_action = Column(String, nullable=True)
    
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="alerts")


class PairingCode(Base):
    __tablename__ = "pairing_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    code = Column(String, unique=True, index=True)
    is_used = Column(Boolean, default=False)
    paired_device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index("idx_pairing_code_user_id", "user_id"),
        Index("idx_pairing_code_expires_at", "expires_at"),
    )
