import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..config import settings

class SatelliteService:
    def __init__(self):
        self.regions_file = settings.DATA_DIR / "sample_regions.json"
        self.observations_file = settings.DATA_DIR / "sample_observations.json"
        self._load_data()

    def _load_data(self):
        with open(self.regions_file, "r", encoding="utf-8") as f:
            self.regions = json.load(f)
        with open(self.observations_file, "r", encoding="utf-8") as f:
            self.observations = json.load(f)

    def get_all_regions(self) -> List[Dict[str, Any]]:
        return self.regions

    def get_region_by_id(self, region_id: str) -> Optional[Dict[str, Any]]:
        for r in self.regions:
            if r["id"] == region_id:
                return r
        return None

    def get_observation(self, region_id: str, observation_slot: str = "t2") -> Optional[Dict[str, Any]]:
        """
        Returns observation for slot 't1' (baseline) or 't2' (current).
        """
        if region_id not in self.observations:
            return None
        obs_slot = self.observations[region_id].get(observation_slot)
        if not obs_slot:
            return None
        
        region = self.get_region_by_id(region_id)
        return {
            "region_id": region_id,
            "region_name": region["name"] if region else region_id,
            "slot": observation_slot,
            "date": obs_slot["date"],
            "satellite": obs_slot["satellite"],
            "cloud_cover_percent": obs_slot["cloud_cover_percent"],
            "rainfall_anomaly_pct": obs_slot["rainfall_anomaly_pct"],
            "temp_anomaly_c": obs_slot["temp_anomaly_c"],
            "built_up_expansion_pct": obs_slot["built_up_expansion_pct"],
            "infrastructure_pressure": obs_slot["infrastructure_pressure"],
            "historical_change": obs_slot["historical_change"],
            "nir_band": obs_slot["nir"],
            "red_band": obs_slot["red"],
            "source_type": "Calibrated Sentinel-2 MSI L2A Scene",
            "attribution": "ESA Copernicus Open Access Hub / EcoGuard Ground-Station Model"
        }

    def get_available_dates(self, region_id: str) -> List[Dict[str, str]]:
        if region_id not in self.observations:
            return []
        data = self.observations[region_id]
        return [
            {"slot": "t1", "date": data["t1"]["date"], "label": f"Baseline Period ({data['t1']['date']})"},
            {"slot": "t2", "date": data["t2"]["date"], "label": f"Current Period ({data['t2']['date']})"}
        ]

satellite_service = SatelliteService()

