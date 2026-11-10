from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.satellite_service import satellite_service
from ..models.schemas import Region

router = APIRouter()

@router.get("/regions", response_model=List[Region])
def get_regions():
    return satellite_service.get_all_regions()

@router.get("/regions/{region_id}", response_model=Region)
def get_region_detail(region_id: str):
    region = satellite_service.get_region_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
    return region

