from typing import List, Dict, Any
from ..models.schemas import (
    SimulationRequest,
    SimulationResponse,
    YearProjection,
    InterventionInput
)
from .risk_engine import risk_engine
from .satellite_service import satellite_service
from .explanation_service import explanation_service

class InterventionEngine:
    def simulate(self, request: SimulationRequest) -> SimulationResponse:
        region_id = request.region_id
        timeframe = max(1, min(10, request.timeframe_years))

        # 1. Get baseline assessment
        baseline_res = risk_engine.analyze_region(region_id)
        baseline_score = baseline_res.overall_risk_score
        baseline_factors = {f.factor_key: f.normalized_score for f in baseline_res.factors}

        # Copy factors for simulated adjustments
        sim_factors = dict(baseline_factors)

        active_interventions: List[InterventionInput] = [
            inv for inv in request.interventions if inv.active and inv.intensity > 0 and inv.coverage_pct > 0
        ]

        active_names = []
        benefits = []
        mitigated_factors_count = {}

        for inv in active_interventions:
            active_names.append(inv.name)
            factor_scale = (inv.intensity / 100.0) * (inv.coverage_pct / 100.0)

            if inv.id == "afforestation":
                # Mitigates vegetation disturbance and historical change
                reduction_veg = 0.55 * factor_scale * sim_factors["vegetation_disturbance"]
                sim_factors["vegetation_disturbance"] = max(0.05, sim_factors["vegetation_disturbance"] - reduction_veg)
                reduction_hist = 0.20 * factor_scale * sim_factors["historical_change"]
                sim_factors["historical_change"] = max(0.05, sim_factors["historical_change"] - reduction_hist)
                benefits.append(f"Native afforestation estimated to re-establish canopy over {inv.coverage_pct:.0f}% of buffer.")
                mitigated_factors_count["Vegetation Canopy Disturbance"] = mitigated_factors_count.get("Vegetation Canopy Disturbance", 0) + reduction_veg

            elif inv.id == "construction_restriction":
                # Drastically cuts infrastructure pressure and halts built-up expansion
                reduction_infra = 0.80 * factor_scale * sim_factors["infrastructure_pressure"]
                sim_factors["infrastructure_pressure"] = max(0.05, sim_factors["infrastructure_pressure"] - reduction_infra)
                reduction_land = 0.65 * factor_scale * sim_factors["land_use_change"]
                sim_factors["land_use_change"] = max(0.05, sim_factors["land_use_change"] - reduction_land)
                benefits.append(f"Enforced construction moratorium arrests new earthmoving across {inv.coverage_pct:.0f}% zone.")
                mitigated_factors_count["Infrastructure & Mining Proximity"] = mitigated_factors_count.get("Infrastructure & Mining Proximity", 0) + reduction_infra

            elif inv.id == "water_conservation":
                # Counters rainfall deficit and improves soil hydrology
                reduction_rain = 0.60 * factor_scale * sim_factors["rainfall_anomaly"]
                sim_factors["rainfall_anomaly"] = max(0.05, sim_factors["rainfall_anomaly"] - reduction_rain)
                benefits.append(f"Percolation weirs and rainwater retention restore water table infiltration.")
                mitigated_factors_count["Meteorological & Drought Stress"] = mitigated_factors_count.get("Meteorological & Drought Stress", 0) + reduction_rain

            elif inv.id == "soil_restoration":
                # Restores soil organic carbon, reducing erosion and boosting vegetation resilience
                reduction_veg = 0.25 * factor_scale * sim_factors["vegetation_disturbance"]
                sim_factors["vegetation_disturbance"] = max(0.05, sim_factors["vegetation_disturbance"] - reduction_veg)
                reduction_hist = 0.35 * factor_scale * sim_factors["historical_change"]
                sim_factors["historical_change"] = max(0.05, sim_factors["historical_change"] - reduction_hist)
                benefits.append("Contour bunds & bio-fencing reduce topsoil sediment loss by up to 60%.")
                mitigated_factors_count["Soil Degradation & Runoff"] = mitigated_factors_count.get("Soil Degradation & Runoff", 0) + 0.3

            elif inv.id == "habitat_restoration":
                # Connects corridors, reducing infrastructure friction and land degradation
                reduction_infra = 0.30 * factor_scale * sim_factors["infrastructure_pressure"]
                sim_factors["infrastructure_pressure"] = max(0.05, sim_factors["infrastructure_pressure"] - reduction_infra)
                reduction_hist = 0.40 * factor_scale * sim_factors["historical_change"]
                sim_factors["historical_change"] = max(0.05, sim_factors["historical_change"] - reduction_hist)
                benefits.append("Eco-corridors reconnect fragmented wildlife passages and reduce edge mortality.")
                mitigated_factors_count["Wildlife Corridor Fragmentation"] = mitigated_factors_count.get("Wildlife Corridor Fragmentation", 0) + 0.35

        # Recalculate simulated overall score using standard weights
        w = {f.factor_key: f.weight for f in baseline_res.factors}
        simulated_score = sum(sim_factors[k] * w.get(k, 0.20) * 100.0 for k in sim_factors)
        simulated_score = min(100.0, max(5.0, round(simulated_score, 1)))

        risk_reduction_pct = max(0.0, round(((baseline_score - simulated_score) / max(baseline_score, 1e-3)) * 100.0, 1))

        # Generate multi-year projection curve (Year 0 to timeframe)
        trajectory: List[YearProjection] = []
        base_ndvi = 0.45 if baseline_score > 50 else 0.60
        target_ndvi = min(0.78, base_ndvi + (0.25 * (risk_reduction_pct / 100.0)))

        for yr in range(timeframe + 1):
            progress = yr / float(timeframe)
            # S-curve / asymptotic progress
            curve_factor = (progress ** 1.3)
            curr_sim_risk = round(baseline_score - (baseline_score - simulated_score) * curve_factor, 1)
            # Baseline without intervention drifts slightly worse or flat
            curr_base_risk = round(min(100.0, baseline_score + (yr * 1.5)), 1)
            
            curr_sim_ndvi = round(base_ndvi + (target_ndvi - base_ndvi) * curve_factor, 3)
            curr_base_ndvi = round(max(0.15, base_ndvi - (yr * 0.015)), 3)

            trajectory.append(YearProjection(
                year=yr,
                baseline_risk=curr_base_risk,
                simulated_risk=curr_sim_risk,
                baseline_ndvi=curr_base_ndvi,
                simulated_ndvi=curr_sim_ndvi
            ))

        top_driver = max(mitigated_factors_count.items(), key=lambda x: x[1])[0] if mitigated_factors_count else "vegetation disturbance"
        explanation = explanation_service.generate_intervention_explanation(
            baseline_score=baseline_score,
            simulated_score=simulated_score,
            active_interventions=active_names,
            top_mitigated_factor=top_driver
        )

        assumptions = [
            "Projections assume 85% compliance rate for regulatory and buffer zoning policies.",
            "Canopy growth curves follow a 3-year establishment lag for endemic broadleaf species.",
            "Precipitation patterns are assumed within +/- 15% of historical regional 10-year mean.",
            "Results are simulated scenario estimates designed for decision evaluation, not measured field outcomes."
        ]

        return SimulationResponse(
            region_id=region_id,
            baseline_risk_score=baseline_score,
            simulated_risk_score=simulated_score,
            risk_reduction_pct=risk_reduction_pct,
            baseline_factors={k: round(v, 3) for k, v in baseline_factors.items()},
            simulated_factors={k: round(v, 3) for k, v in sim_factors.items()},
            trajectory=trajectory,
            ecological_benefits=benefits if benefits else ["No active interventions selected. Baseline trajectory maintained."],
            recommended_pathway=explanation,
            assumptions=assumptions
        )

intervention_engine = InterventionEngine()

