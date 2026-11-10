import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

class RiskEngineWeights(BaseModel):
    vegetation_disturbance: float = 0.30
    land_use_change: float = 0.25
    rainfall_anomaly: float = 0.20
    infrastructure_pressure: float = 0.15
    historical_change: float = 0.10

class Settings:
    PROJECT_NAME: str = "EcoGuard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DESCRIPTION: str = "AI-Powered Environmental Early-Warning & Intervention System"
    DATA_DIR: Path = DATA_DIR
    DEFAULT_WEIGHTS: RiskEngineWeights = RiskEngineWeights()
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()

