from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict
from ..models.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from ..services.risk_engine import risk_engine

router = APIRouter(prefix="/risk")

@router.post("/analyze", response_model=RiskAssessmentResponse)
def analyze_risk(request: RiskAssessmentRequest):
    try:
        return risk_engine.analyze_region(request.region_id, request.weights)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/analyze", response_model=RiskAssessmentResponse)
def get_risk_analysis(region_id: str = Query(..., description="Target region identifier")):
    try:
        return risk_engine.analyze_region(region_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

