from fastapi import APIRouter
from typing import List
from ..models.schemas import DataSourceStatus

router = APIRouter(prefix="/data-sources")

@router.get("/status", response_model=List[DataSourceStatus])
def get_data_sources():
    return [
        DataSourceStatus(
            name="Sentinel-2 MultiSpectral Instrument (MSI)",
            category="Satellite Earth Observation",
            source="European Space Agency (ESA) Copernicus Programme",
            cadence="5-day revisit cycle",
            status="Operational (Calibrated L2A Surface Reflectance)",
            last_sync="2024-11-04T06:30:00Z",
            data_type="Spectral Bands (B04-Red 665nm, B08-NIR 842nm at 10m Ground Resolution)",
            license_or_citation="Copernicus Open Access / Legal Notice on the use of Copernicus Sentinel Data"
        ),
        DataSourceStatus(
            name="Normalized Difference Vegetation Index (NDVI) Engine",
            category="Biophysical Index",
            source="EcoGuard Algorithmic Core",
            cadence="On-demand per scene ingestion",
            status="Operational (Standardized Math)",
            last_sync="Real-time execution",
            data_type="Continuously valued index (-1.0 to +1.0) with divide-by-zero suppression",
            license_or_citation="Rouse et al. (1974) NASA ERTS-1 Monitoring Formulation"
        ),
        DataSourceStatus(
            name="Indian Meteorological & Rainfall Grid",
            category="Meteorological Data",
            source="IMD / ERA5 Reanalysis Ensemble",
            cadence="Daily cumulative anomalies",
            status="Operational (Sample Regional Ensemble)",
            last_sync="2024-11-01T00:00:00Z",
            data_type="Precipitation deviation (%) and Surface Temperature anomaly (°C)",
            license_or_citation="ECMWF Copernicus Climate Change Service (C3S) / IMD Gridded Rainfall"
        ),
        DataSourceStatus(
            name="Forest Survey & Land-Use Disturbance Atlas",
            category="Land Cover & Infrastructure",
            source="FSI / OpenStreetMap Geospatial Contributors",
            cadence="Quarterly revision",
            status="Operational (Integrated Reference Boundaries)",
            last_sync="2024-10-15T12:00:00Z",
            data_type="Linear infrastructure vector proximity & quarrying footprint layers",
            license_or_citation="OpenStreetMap Foundation (ODbL) / Global Land Analysis and Discovery (GLAD)"
        ),
        DataSourceStatus(
            name="Ecological Causal Transfer Engine",
            category="Ecological Modeling",
            source="EcoGuard Dependency Knowledgebase",
            cadence="Static model assumptions",
            status="Operational (Prototype Ruleset)",
            last_sync="2024-11-05T00:00:00Z",
            data_type="Directed acyclic graph with shock propagation transfer weights",
            license_or_citation="EcoGuard Research Prototype Model (Assumed Empirical Relationships)"
        )
    ]

