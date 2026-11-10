from typing import List, Dict, Any

class ExplanationService:
    @staticmethod
    def generate_risk_explanation(
        region_name: str,
        overall_score: float,
        risk_level: str,
        factors: List[Dict[str, Any]],
        anomaly_detected: bool,
        anomaly_score: float,
        cloud_cover: float
    ) -> str:
        # Sort factors by weighted contribution
        sorted_factors = sorted(factors, key=lambda f: f["weighted_contribution"], reverse=True)
        top_factor = sorted_factors[0]
        second_factor = sorted_factors[1] if len(sorted_factors) > 1 else None

        parts = []
        parts.append(
            f"In {region_name}, the overall environmental risk is assessed at {overall_score:.1f}/100, "
            f"placing the landscape in the {risk_level.upper()} RISK category."
        )

        parts.append(
            f"{top_factor['name']} is the dominant driver, contributing {top_factor['weighted_contribution']:.1f} points "
            f"({top_factor['interpretation'].lower()})."
        )

        if second_factor and second_factor['weighted_contribution'] > 5.0:
            parts.append(
                f"This stress is compounded by {second_factor['name'].lower()}, adding an additional "
                f"{second_factor['weighted_contribution']:.1f} points to the regional vulnerability score."
            )

        if anomaly_detected:
            parts.append(
                f"Statistical anomaly analysis flagged this observation (dispersion score {anomaly_score:.2f}), "
                f"indicating significant divergence from historical seasonal envelopes."
            )

        if cloud_cover > 5.0:
            parts.append(f"Note: Observed cloud cover was {cloud_cover:.1f}%, slightly lowering atmospheric confidence.")

        return " ".join(parts)

    @staticmethod
    def generate_intervention_explanation(
        baseline_score: float,
        simulated_score: float,
        active_interventions: List[str],
        top_mitigated_factor: str
    ) -> str:
        reduction_pct = ((baseline_score - simulated_score) / max(baseline_score, 1e-3)) * 100.0
        active_str = ", ".join(active_interventions) if active_interventions else "baseline conditions"

        summary = (
            f"Simulating implementation of {active_str} projects an estimated risk reduction of "
            f"{reduction_pct:.1f}% (from {baseline_score:.1f} down to {simulated_score:.1f}/100). "
            f"The primary driver of risk mitigation under current assumptions is the alleviation of {top_mitigated_factor}."
        )
        return summary

explanation_service = ExplanationService()

