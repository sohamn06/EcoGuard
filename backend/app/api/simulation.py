from fastapi import APIRouter, HTTPException
from ..models.schemas import SimulationRequest, SimulationResponse
from ..services.intervention_engine import intervention_engine

router = APIRouter(prefix="/simulations")

@router.post("/run", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest):
    try:
        return intervention_engine.simulate(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

