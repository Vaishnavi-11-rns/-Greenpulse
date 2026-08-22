import os
from pydantic_settings import BaseSettings
from datetime import timedelta

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./greenpulse.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-in-production-do-not-use-in-prod"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # API
    API_TITLE: str = "GreenPulse API"
    API_VERSION: str = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Device Pairing
    PAIRING_CODE_EXPIRY_MINUTES: int = 10
    PAIRING_CODE_LENGTH: int = 6
    
    # Carbon Intensity (fallback)
    DEFAULT_CARBON_INTENSITY: float = 0.3  # kg CO2e/kWh
    
    class Config:
        env_file = ".env"

settings = Settings()
