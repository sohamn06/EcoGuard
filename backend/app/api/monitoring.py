from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from ..services.satellite_service import satellite_service
from ..services.ndvi_service import ndvi_service
from ..services.change_detection import change_detection_service
from ..models.schemas import NDVIResponse, ChangeDetectionResponse

router = APIRouter(prefix="/monitoring")

@router.get("/observations")
def get_observations(region_id: str = Query(..., description="Target region identifier")):
    region = satellite_service.get_region_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
    
    dates = satellite_service.get_available_dates(region_id)
    obs_t1 = satellite_service.get_observation(region_id, "t1")
    obs_t2 = satellite_service.get_observation(region_id, "t2")

    return {
        "region_id": region_id,
        "region_name": region["name"],
        "available_periods": dates,
        "observations": {
            "t1": {k: v for k, v in obs_t1.items() if k not in ["nir_band", "red_band"]} if obs_t1 else None,
            "t2": {k: v for k, v in obs_t2.items() if k not in ["nir_band", "red_band"]} if obs_t2 else None,
        }
    }

@router.get("/ndvi", response_model=NDVIResponse)
def get_ndvi(
    region_id: str = Query(..., description="Target region identifier"),
    slot: str = Query("t2", description="Observation slot ('t1' baseline or 't2' current)")
):
    try:
        return ndvi_service.get_ndvi_for_observation(region_id, slot)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/change-detection", response_model=ChangeDetectionResponse)
def get_change_detection(region_id: str = Query(..., description="Target region identifier")):
    try:
        return change_detection_service.detect_changes(region_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

