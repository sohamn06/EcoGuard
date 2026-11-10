from fastapi import APIRouter, HTTPException, Query
from ..models.schemas import EcologicalGraphResponse
from ..services.ecological_graph import ecological_graph_service

router = APIRouter()

@router.get("/graph", response_model=EcologicalGraphResponse)
def get_graph(region_id: str = Query("aravalli_ridge", description="Target region identifier")):
    try:
        return ecological_graph_service.get_graph_for_region(region_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

