import datetime
import numpy as np
from typing import Dict, Any, List, Optional
from ..config import settings, RiskEngineWeights
from ..models.schemas import RiskAssessmentResponse, RiskFactorDetail
from .satellite_service import satellite_service
from .change_detection import change_detection_service
from .anomaly_detection import anomaly_detector
from .explanation_service import explanation_service

class RiskEngine:
    def __init__(self):
        self.default_weights = settings.DEFAULT_WEIGHTS

    def analyze_region(self, region_id: str, custom_weights: Optional[Dict[str, float]] = None) -> RiskAssessmentResponse:
        region = satellite_service.get_region_by_id(region_id)
        if not region:
            raise ValueError(f"Region '{region_id}' not found.")

        obs_t2 = satellite_service.get_observation(region_id, "t2")
        if not obs_t2:
            raise ValueError(f"Observation T2 for region '{region_id}' not found.")

        # 1. Run change detection between T1 and T2 to get quantitative vegetation disturbance
        changes = change_detection_service.detect_changes(region_id)

        # 2. Compute normalized scores (0.0 to 1.0)
        # Factor A: Vegetation Disturbance (Severe decline weighted full, moderate decline half)
        # severe_decline_pct (0..100) -> 0..1
        veg_disturb_norm = min(1.0, max(0.0, (changes.severe_decline_pct * 1.0 + changes.moderate_decline_pct * 0.45) / 35.0))

        # Factor B: Land-Use / Land-Cover Change (Built-up expansion & bare ground intrusion)
        built_up_val = obs_t2["built_up_expansion_pct"]
        land_use_norm = min(1.0, max(0.0, built_up_val / 20.0))

        # Factor C: Rainfall Anomaly (Drought deficit: negative anomaly -> higher stress)
        rain_anomaly = obs_t2["rainfall_anomaly_pct"]
        if rain_anomaly < 0:
            rain_norm = min(1.0, abs(rain_anomaly) / 40.0)
        else:
            # Positive rain may reduce drought stress, but excessive rain can cause flood/landslide risk
            rain_norm = min(0.3, rain_anomaly / 50.0)

        # Factor D: Infrastructure & Construction Pressure
        infra_pressure_norm = float(obs_t2["infrastructure_pressure"])

        # Factor E: Historical Vulnerability / Change
        hist_change_norm = float(obs_t2["historical_change"])

        # 3. Weights configuration
        weights = {
            "vegetation_disturbance": self.default_weights.vegetation_disturbance,
            "land_use_change": self.default_weights.land_use_change,
            "rainfall_anomaly": self.default_weights.rainfall_anomaly,
            "infrastructure_pressure": self.default_weights.infrastructure_pressure,
            "historical_change": self.default_weights.historical_change,
        }
        if custom_weights:
            # Normalize user-supplied weights to sum to 1.0
            total_w = sum(custom_weights.values())
            if total_w > 0:
                weights = {k: v / total_w for k, v in custom_weights.items()}

        # 4. Construct factor details
        factors_meta = [
            {
                "key": "vegetation_disturbance",
                "name": "Vegetation Canopy Disturbance",
                "raw": changes.severe_decline_pct,
                "norm": veg_disturb_norm,
                "unit": "% severe decline cells",
                "interp": "Severe canopy thinning detected via multi-temporal dNDVI" if veg_disturb_norm > 0.4 else "Stable canopy density"
            },
            {
                "key": "land_use_change",
                "name": "Land-Use & Built-up Encroachment",
                "raw": built_up_val,
                "norm": land_use_norm,
                "unit": "% converted area",
                "interp": "Intense land clearing and artificial surface expansion" if land_use_norm > 0.4 else "Minimal artificial land conversion"
            },
            {
                "key": "rainfall_anomaly",
                "name": "Meteorological & Drought Stress",
                "raw": rain_anomaly,
                "norm": rain_norm,
                "unit": "% deviation from normal",
                "interp": "Acute precipitation deficit inducing vegetation water stress" if rain_anomaly < -15 else "Adequate precipitation envelope"
            },
            {
                "key": "infrastructure_pressure",
                "name": "Infrastructure & Mining Proximity",
                "raw": infra_pressure_norm * 100.0,
                "norm": infra_pressure_norm,
                "unit": "Pressure index (0-100)",
                "interp": "High quarrying, road construction, or earth excavation activity" if infra_pressure_norm > 0.5 else "Low infrastructure friction"
            },
            {
                "key": "historical_change",
                "name": "Historical Ecosystem Vulnerability",
                "raw": hist_change_norm * 100.0,
                "norm": hist_change_norm,
                "unit": "Vulnerability index (0-100)",
                "interp": "Compounded degradation history over preceding 5 years" if hist_change_norm > 0.5 else "Historically resilient ecosystem"
            }
        ]

        factor_details: List[RiskFactorDetail] = []
        overall_score = 0.0

        for f in factors_meta:
            w = weights.get(f["key"], 0.20)
            contrib = f["norm"] * w * 100.0
            overall_score += contrib
            factor_details.append(RiskFactorDetail(
                factor_key=f["key"],
                name=f["name"],
                raw_value=round(f["raw"], 2),
                normalized_score=round(f["norm"], 3),
                weight=round(w, 2),
                weighted_contribution=round(contrib, 2),
                unit=f["unit"],
                interpretation=f["interp"]
            ))

        overall_score = min(100.0, max(0.0, round(overall_score, 1)))

        # 5. Risk Classification
        if overall_score < 30:
            risk_level = "Low"
        elif overall_score < 50:
            risk_level = "Moderate"
        elif overall_score < 75:
            risk_level = "High"
        else:
            risk_level = "Critical"

        # 6. Confidence Score
        # Decreased by cloud cover and missing slots
        cloud_pct = obs_t2.get("cloud_cover_percent", 0.0)
        confidence = max(0.65, min(0.98, round(1.0 - (cloud_pct * 0.03), 2)))

        # 7. Identify Primary Drivers
        sorted_factors = sorted(factor_details, key=lambda x: x.weighted_contribution, reverse=True)
        primary_drivers = [f"{f.name} ({f.weighted_contribution:.1f} pts)" for f in sorted_factors[:2]]

        # 8. Anomaly Detection
        feature_vec = [
            float(np.mean(changes.change_matrix)),
            float(np.std(changes.change_matrix)),
            float(rain_anomaly),
            float(built_up_val),
            float(infra_pressure_norm),
            float(hist_change_norm)
        ]
        is_anomaly, anomaly_score, method_name = anomaly_detector.evaluate_observation(feature_vec)

        # 9. Plain English Summary
        summary = explanation_service.generate_risk_explanation(
            region_name=region["name"],
            overall_score=overall_score,
            risk_level=risk_level,
            factors=[f.model_dump() for f in factor_details],
            anomaly_detected=is_anomaly,
            anomaly_score=anomaly_score,
            cloud_cover=cloud_pct
        )

        # 10. Recommended Actions
        actions = self._generate_recommendations(risk_level, sorted_factors[0].factor_key, region["ecosystem_type"])

        return RiskAssessmentResponse(
            region_id=region_id,
            region_name=region["name"],
            timestamp=obs_t2["date"],
            overall_risk_score=overall_score,
            risk_level=risk_level,
            confidence_score=confidence,
            factors=factor_details,
            primary_drivers=primary_drivers,
            anomaly_detected=is_anomaly,
            anomaly_score=anomaly_score,
            anomaly_method=method_name,
            plain_english_summary=summary,
            recommended_actions=actions
        )

    def _generate_recommendations(self, risk_level: str, top_factor_key: str, ecosystem_type: str) -> List[str]:
        actions = []
        if risk_level in ["Critical", "High"]:
            actions.append("Issue immediate administrative alert to state environmental task force.")
            if top_factor_key == "vegetation_disturbance":
                actions.append("Deploy ground-patrol drones to verify illegal felling/clearance coordinates.")
                actions.append("Initiate native pioneer species hydroseeding and fencing on disturbed slopes.")
            elif top_factor_key == "infrastructure_pressure":
                actions.append("Impose interim stay on unpermitted heavy earthmoving and quarry blasting.")
                actions.append("Mandate 1km buffer cordon around contiguous forest parcel boundaries.")
            elif top_factor_key == "rainfall_anomaly":
                actions.append("Activate drought mitigation contingency: desilt recharge shafts and percolation basins.")
                actions.append("Establish emergency artificial watering holes for displaced wildlife.")
            else:
                actions.append("Enact strict zoning freeze on commercial land-use conversions in the buffer.")
        elif risk_level == "Moderate":
            actions.append("Increase satellite monitoring cadence to weekly Sentinel-2 overpasses.")
            actions.append("Perform field soil-moisture and canopy gap sampling at disturbance margins.")
            actions.append("Engage local community eco-development committees in assisted natural regeneration.")
        else:
            actions.append("Maintain routine bi-monthly satellite observation baseline.")
            actions.append("Document positive canopy recovery indicators for conservation credit certification.")

        return actions

risk_engine = RiskEngine()
