from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from ..models.schemas import AlertItem
from ..services.alert_service import alert_service

router = APIRouter(prefix="/alerts")

class AlertStatusUpdate(BaseModel):
    status: str

@router.get("", response_model=List[AlertItem])
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity ('all', 'critical', 'high', 'moderate', 'low')"),
    region_id: Optional[str] = Query(None, description="Filter by region identifier")
):
    return alert_service.get_alerts(severity, region_id)

@router.patch("/{alert_id}", response_model=AlertItem)
def update_alert(alert_id: str, payload: AlertStatusUpdate):
    updated = alert_service.update_alert_status(alert_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    return updated

