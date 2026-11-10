from fastapi import APIRouter
from datetime import datetime
from ..config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "engine_mode": "operational",
        "satellite_pipeline": "calibrated_sentinel_l2a"
    }

