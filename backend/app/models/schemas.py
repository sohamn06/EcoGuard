from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Region(BaseModel):
    id: str
    name: str
    country: str
    state: str
    lat: float
    lng: float
    zoom: int
    bbox: List[float] # [min_lng, min_lat, max_lng, max_lat]
    ecosystem_type: str
    area_sqkm: float
    primary_threats: List[str]
    description: str
    geojson: Optional[Dict[str, Any]] = None

class ObservationMeta(BaseModel):
    id: str
    region_id: str
    date: str
    satellite: str = "Sentinel-2 MSI Level-2A"
    cloud_cover_percent: float
    resolution_meters: int = 10
    source_type: str = "Sample (Calibrated Sentinel-2 Scene)"
    attribution: str = "Copernicus Sentinel Data (ESA) / EcoGuard Baseline"

class NDVIStats(BaseModel):
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
    std_ndvi: float
    dense_canopy_pct: float
    moderate_veg_pct: float
    sparse_degraded_pct: float
    bare_built_pct: float
    water_pct: float

class NDVIResponse(BaseModel):
    region_id: str
    observation_date: str
    grid_dim: List[int] # [rows, cols]
    ndvi_matrix: List[List[float]]
    stats: NDVIStats
    data_source: str
    is_sample_data: bool = True

class ChangeDetectionResponse(BaseModel):
    region_id: str
    baseline_date: str
    comparison_date: str
    grid_dim: List[int]
    change_matrix: List[List[float]]
    severe_decline_pct: float
    moderate_decline_pct: float
    stable_pct: float
    moderate_recovery_pct: float
    significant_regrowth_pct: float
    net_vegetation_shift_ha: float
    summary: str

class RiskFactorDetail(BaseModel):
    factor_key: str
    name: str
    raw_value: float
    normalized_score: float # 0.0 - 1.0
    weight: float
    weighted_contribution: float
    unit: str
    interpretation: str

class RiskAssessmentRequest(BaseModel):
    region_id: str
    weights: Optional[Dict[str, float]] = None

class RiskAssessmentResponse(BaseModel):
    region_id: str
    region_name: str
    timestamp: str
    overall_risk_score: float # 0 - 100
    risk_level: str # Low, Moderate, High, Critical
    confidence_score: float # 0 - 1
    factors: List[RiskFactorDetail]
    primary_drivers: List[str]
    anomaly_detected: bool
    anomaly_score: float
    anomaly_method: str
    plain_english_summary: str
    recommended_actions: List[str]

class GraphNode(BaseModel):
    id: str
    label: str
    category: str # stressor, biological, abiotic, outcome
    status: str # stable, moderate, high, critical
    severity: float # 0.0 - 1.0
    description: str
    metric: str
    mitigation_lever: str
    position: Dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    strength: float
    relationship_type: str

class EcologicalGraphResponse(BaseModel):
    region_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    propagation_summary: str
    active_disturbances: List[str]

class InterventionInput(BaseModel):
    id: str # afforestation, construction_restriction, water_conservation, soil_restoration, habitat_restoration
    name: str
    active: bool = False
    intensity: float = 50.0 # 0 - 100
    coverage_pct: float = 30.0 # 0 - 100

class SimulationRequest(BaseModel):
    region_id: str
    interventions: List[InterventionInput]
    timeframe_years: int = 5

class YearProjection(BaseModel):
    year: int
    baseline_risk: float
    simulated_risk: float
    baseline_ndvi: float
    simulated_ndvi: float

class SimulationResponse(BaseModel):
    region_id: str
    baseline_risk_score: float
    simulated_risk_score: float
    risk_reduction_pct: float
    baseline_factors: Dict[str, float]
    simulated_factors: Dict[str, float]
    trajectory: List[YearProjection]
    ecological_benefits: List[str]
    recommended_pathway: str
    assumptions: List[str]

class AlertItem(BaseModel):
    id: str
    region_id: str
    region_name: str
    timestamp: str
    severity: str # Low, Moderate, High, Critical
    category: str
    detected_indicator: str
    risk_score: float
    message: str
    recommended_action: str
    status: str = "Active"

class DataSourceStatus(BaseModel):
    name: str
    category: str
    source: str
    cadence: str
    status: str
    last_sync: str
    data_type: str
    license_or_citation: str

