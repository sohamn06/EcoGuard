import numpy as np
from typing import Dict, Any, List
from ..models.schemas import ChangeDetectionResponse
from .satellite_service import satellite_service
from .ndvi_service import ndvi_service

class ChangeDetectionService:
    def detect_changes(self, region_id: str) -> ChangeDetectionResponse:
        obs_t1 = satellite_service.get_observation(region_id, "t1")
        obs_t2 = satellite_service.get_observation(region_id, "t2")
        region = satellite_service.get_region_by_id(region_id)

        if not obs_t1 or not obs_t2:
            raise ValueError(f"Both baseline (T1) and current (T2) observations required for region '{region_id}'")

        ndvi_t1, _ = ndvi_service.calculate_ndvi_matrix(obs_t1["nir_band"], obs_t1["red_band"])
        ndvi_t2, _ = ndvi_service.calculate_ndvi_matrix(obs_t2["nir_band"], obs_t2["red_band"])

        d_ndvi = ndvi_t2 - ndvi_t1
        total_pixels = d_ndvi.size

        # Classification thresholds
        severe_decline_mask = d_ndvi < -0.20
        mod_decline_mask = (d_ndvi >= -0.20) & (d_ndvi < -0.08)
        stable_mask = (d_ndvi >= -0.08) & (d_ndvi <= 0.08)
        mod_recovery_mask = (d_ndvi > 0.08) & (d_ndvi <= 0.20)
        significant_regrowth_mask = d_ndvi > 0.20

        severe_pct = float(np.round((np.sum(severe_decline_mask) / total_pixels) * 100, 2))
        mod_decline_pct = float(np.round((np.sum(mod_decline_mask) / total_pixels) * 100, 2))
        stable_pct = float(np.round((np.sum(stable_mask) / total_pixels) * 100, 2))
        mod_recovery_pct = float(np.round((np.sum(mod_recovery_mask) / total_pixels) * 100, 2))
        significant_regrowth_pct = float(np.round((np.sum(significant_regrowth_mask) / total_pixels) * 100, 2))

        # Convert to hectares based on region area (1 sq km = 100 ha)
        total_area_ha = (region["area_sqkm"] * 100) if region else 20000.0
        net_decline_fraction = ((severe_pct + mod_decline_pct) - (mod_recovery_pct + significant_regrowth_pct)) / 100.0
        net_shift_ha = float(np.round(-1.0 * net_decline_fraction * total_area_ha, 1))

        # Generate contextual scientific summary
        if severe_pct > 10.0:
            summary = (
                f"High-priority alert: {severe_pct}% of surveyed cells exhibit severe canopy loss "
                f"(dNDVI < -0.20), accompanied by {mod_decline_pct}% moderate vegetation thinning between "
                f"{obs_t1['date']} and {obs_t2['date']}. Spatial clustering indicates acute localized disturbance."
            )
        elif (severe_pct + mod_decline_pct) > 15.0:
            summary = (
                f"Moderate concern: Detected {severe_pct + mod_decline_pct}% combined vegetation thinning "
                f"between {obs_t1['date']} and {obs_t2['date']}. Contiguous stable canopy remains at {stable_pct}%."
            )
        elif (mod_recovery_pct + significant_regrowth_pct) > 10.0:
            summary = (
                f"Positive recovery trajectory: Detected {mod_recovery_pct + significant_regrowth_pct}% net "
                f"vegetation regrowth across observation periods, with {stable_pct}% stable forest cover."
            )
        else:
            summary = (
                f"Stable baseline: {stable_pct}% of the landscape maintained steady canopy density "
                f"between {obs_t1['date']} and {obs_t2['date']} with negligible adverse anomalies."
            )

        rows, cols = d_ndvi.shape
        return ChangeDetectionResponse(
            region_id=region_id,
            baseline_date=obs_t1["date"],
            comparison_date=obs_t2["date"],
            grid_dim=[rows, cols],
            change_matrix=np.round(d_ndvi, 4).tolist(),
            severe_decline_pct=severe_pct,
            moderate_decline_pct=mod_decline_pct,
            stable_pct=stable_pct,
            moderate_recovery_pct=mod_recovery_pct,
            significant_regrowth_pct=significant_regrowth_pct,
            net_vegetation_shift_ha=net_shift_ha,
            summary=summary
        )

change_detection_service = ChangeDetectionService()

