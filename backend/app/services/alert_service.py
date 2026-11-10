from typing import List, Dict, Any, Optional
from ..models.schemas import AlertItem
from .satellite_service import satellite_service
from .risk_engine import risk_engine
from .change_detection import change_detection_service

class AlertService:
    def __init__(self):
        self._alerts_cache: Dict[str, AlertItem] = {}
        self._initialized = False

    def _ensure_alerts(self):
        if self._initialized:
            return
        
        regions = satellite_service.get_all_regions()
        for r in regions:
            rid = r["id"]
            assessment = risk_engine.analyze_region(rid)
            changes = change_detection_service.detect_changes(rid)

            # Generate alerts if condition warrants
            if assessment.overall_risk_score >= 50 or changes.severe_decline_pct >= 8.0:
                alert_id = f"ALT-{rid.upper()[:4]}-001"
                self._alerts_cache[alert_id] = AlertItem(
                    id=alert_id,
                    region_id=rid,
                    region_name=r["name"],
                    timestamp=assessment.timestamp,
                    severity=assessment.risk_level,
                    category="Canopy Disturbance & Pressure",
                    detected_indicator=f"dNDVI decline in {changes.severe_decline_pct}% of cells",
                    risk_score=assessment.overall_risk_score,
                    message=f"Critical ecological alert: {assessment.primary_drivers[0]} in {r['name']}.",
                    recommended_action=assessment.recommended_actions[0] if assessment.recommended_actions else "Deploy field inspection.",
                    status="Active"
                )

            # Secondary alerts for moderate conditions or anomalies
            if assessment.anomaly_detected and assessment.risk_level in ["High", "Critical", "Moderate"]:
                alt_anomaly_id = f"ALT-{rid.upper()[:4]}-002"
                self._alerts_cache[alt_anomaly_id] = AlertItem(
                    id=alt_anomaly_id,
                    region_id=rid,
                    region_name=r["name"],
                    timestamp=assessment.timestamp,
                    severity="High" if assessment.risk_level == "Critical" else "Moderate",
                    category="Statistical Multivariate Anomaly",
                    detected_indicator=f"Dispersion metric {assessment.anomaly_score:.2f} breaches seasonal threshold",
                    risk_score=assessment.overall_risk_score,
                    message=f"Multivariate deviation flagged by {assessment.anomaly_method}.",
                    recommended_action="Correlate with local rain-gauge records and ground telemetry.",
                    status="Active"
                )

        self._initialized = True

    def get_alerts(self, severity: Optional[str] = None, region_id: Optional[str] = None) -> List[AlertItem]:
        self._ensure_alerts()
        results = list(self._alerts_cache.values())

        if severity and severity.lower() != "all":
            results = [a for a in results if a.severity.lower() == severity.lower()]

        if region_id and region_id.lower() != "all":
            results = [a for a in results if a.region_id.lower() == region_id.lower()]

        # Sort by risk score descending
        results.sort(key=lambda a: a.risk_score, reverse=True)
        return results

    def update_alert_status(self, alert_id: str, new_status: str) -> Optional[AlertItem]:
        self._ensure_alerts()
        if alert_id in self._alerts_cache:
            self._alerts_cache[alert_id].status = new_status
            return self._alerts_cache[alert_id]
        return None

alert_service = AlertService()

