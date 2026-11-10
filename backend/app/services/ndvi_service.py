import numpy as np
from typing import Dict, Any, List, Tuple
from ..models.schemas import NDVIResponse, NDVIStats
from .satellite_service import satellite_service

class NDVIService:
    @staticmethod
    def calculate_ndvi_matrix(nir: List[List[float]], red: List[List[float]]) -> Tuple[np.ndarray, NDVIStats]:
        nir_arr = np.array(nir, dtype=np.float64)
        red_arr = np.array(red, dtype=np.float64)

        denom = nir_arr + red_arr
        # Mask division by zero or near-zero
        valid_mask = denom > 1e-6
        ndvi_arr = np.zeros_like(nir_arr)
        ndvi_arr[valid_mask] = (nir_arr[valid_mask] - red_arr[valid_mask]) / denom[valid_mask]
        ndvi_arr = np.clip(ndvi_arr, -1.0, 1.0)

        total_pixels = ndvi_arr.size
        dense_canopy = np.sum(ndvi_arr >= 0.6)
        moderate_veg = np.sum((ndvi_arr >= 0.4) & (ndvi_arr < 0.6))
        sparse_degraded = np.sum((ndvi_arr >= 0.2) & (ndvi_arr < 0.4))
        bare_built = np.sum((ndvi_arr >= 0.0) & (ndvi_arr < 0.2))
        water = np.sum(ndvi_arr < 0.0)

        stats = NDVIStats(
            mean_ndvi=float(np.round(np.mean(ndvi_arr), 4)),
            min_ndvi=float(np.round(np.min(ndvi_arr), 4)),
            max_ndvi=float(np.round(np.max(ndvi_arr), 4)),
            std_ndvi=float(np.round(np.std(ndvi_arr), 4)),
            dense_canopy_pct=float(np.round((dense_canopy / total_pixels) * 100, 2)),
            moderate_veg_pct=float(np.round((moderate_veg / total_pixels) * 100, 2)),
            sparse_degraded_pct=float(np.round((sparse_degraded / total_pixels) * 100, 2)),
            bare_built_pct=float(np.round((bare_built / total_pixels) * 100, 2)),
            water_pct=float(np.round((water / total_pixels) * 100, 2))
        )

        return ndvi_arr, stats

    def get_ndvi_for_observation(self, region_id: str, observation_slot: str = "t2") -> NDVIResponse:
        obs = satellite_service.get_observation(region_id, observation_slot)
        if not obs:
            raise ValueError(f"No observation found for region '{region_id}' and slot '{observation_slot}'")

        ndvi_arr, stats = self.calculate_ndvi_matrix(obs["nir_band"], obs["red_band"])
        rows, cols = ndvi_arr.shape

        return NDVIResponse(
            region_id=region_id,
            observation_date=obs["date"],
            grid_dim=[rows, cols],
            ndvi_matrix=np.round(ndvi_arr, 4).tolist(),
            stats=stats,
            data_source=f"{obs['satellite']} ({obs['source_type']})",
            is_sample_data=True
        )

ndvi_service = NDVIService()

