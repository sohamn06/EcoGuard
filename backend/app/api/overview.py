from fastapi import APIRouter
from typing import Dict, Any, List
from ..services.satellite_service import satellite_service
from ..services.risk_engine import risk_engine
from ..services.change_detection import change_detection_service
from ..services.alert_service import alert_service

router = APIRouter()

@router.get("/overview")
def get_overview_dashboard():
    regions = satellite_service.get_all_regions()
    region_summaries = []
    
    total_risk = 0.0
    critical_zones = 0
    high_zones = 0
    risk_distribution = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}

    for r in regions:
        rid = r["id"]
        assessment = risk_engine.analyze_region(rid)
        changes = change_detection_service.detect_changes(rid)
        
        total_risk += assessment.overall_risk_score
        risk_distribution[assessment.risk_level] = risk_distribution.get(assessment.risk_level, 0) + 1
        
        if assessment.risk_level == "Critical":
            critical_zones += 1
        elif assessment.risk_level == "High":
            high_zones += 1

        region_summaries.append({
            "id": rid,
            "name": r["name"],
            "state": r["state"],
            "ecosystem_type": r["ecosystem_type"],
            "lat": r["lat"],
            "lng": r["lng"],
            "risk_score": assessment.overall_risk_score,
            "risk_level": assessment.risk_level,
            "primary_driver": assessment.primary_drivers[0] if assessment.primary_drivers else "N/A",
            "severe_decline_pct": changes.severe_decline_pct,
            "net_shift_ha": changes.net_vegetation_shift_ha,
            "last_observation": assessment.timestamp,
            "confidence": assessment.confidence_score
        })

    avg_risk = round(total_risk / max(len(regions), 1), 1)
    alerts = alert_service.get_alerts()
    active_alerts = [a for a in alerts if a.status == "Active"]

    # Historical 6-month aggregate risk trend
    risk_trend = [
        {"month": "Jun 2024", "avg_risk": 44.2, "canopy_index": 0.62},
        {"month": "Jul 2024", "avg_risk": 46.5, "canopy_index": 0.61},
        {"month": "Aug 2024", "avg_risk": 49.0, "canopy_index": 0.59},
        {"month": "Sep 2024", "avg_risk": 53.8, "canopy_index": 0.56},
        {"month": "Oct 2024", "avg_risk": 58.4, "canopy_index": 0.53},
        {"month": "Nov 2024", "avg_risk": avg_risk, "canopy_index": 0.51}
    ]

    disturbance_categories = [
        {"name": "Infrastructure & Mining", "value": 38, "color": "#ef4444"},
        {"name": "Canopy Clearance / Logging", "value": 27, "color": "#f97316"},
        {"name": "Drought & Hydrological Stress", "value": 21, "color": "#f59e0b"},
        {"name": "Salinity & Erosion", "value": 14, "color": "#06b6d4"}
    ]

    return {
        "kpis": {
            "overall_avg_risk_score": avg_risk,
            "critical_disturbance_zones": critical_zones + high_zones,
            "active_alerts_count": len(active_alerts),
            "total_monitored_area_sqkm": sum(r["area_sqkm"] for r in regions),
            "vegetation_health_status": "Declining in 2 Sectors",
            "last_pipeline_update": "2024-11-04T18:00:00Z"
        },
        "risk_distribution": [
            {"name": k, "count": v} for k, v in risk_distribution.items()
        ],
        "risk_trend": risk_trend,
        "disturbance_categories": disturbance_categories,
        "region_summaries": region_summaries,
        "recent_alerts": [a.model_dump() for a in alerts[:4]]
    }

