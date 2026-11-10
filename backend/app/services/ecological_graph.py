import json
from pathlib import Path
from typing import Dict, Any, List
from ..config import settings
from ..models.schemas import EcologicalGraphResponse, GraphNode, GraphEdge
from .satellite_service import satellite_service
from .risk_engine import risk_engine

class EcologicalGraphService:
    def __init__(self):
        self.rules_file = settings.DATA_DIR / "ecological_rules.json"
        self._load_rules()

    def _load_rules(self):
        with open(self.rules_file, "r", encoding="utf-8") as f:
            self.graph_data = json.load(f)

    def get_graph_for_region(self, region_id: str) -> EcologicalGraphResponse:
        assessment = risk_engine.analyze_region(region_id)
        factors_map = {f.factor_key: f.normalized_score for f in assessment.factors}

        # Root Stressor inputs from risk factors
        const_pressure = factors_map.get("infrastructure_pressure", 0.3)
        veg_disturb = factors_map.get("vegetation_disturbance", 0.3)
        rain_stress = factors_map.get("rainfall_anomaly", 0.2)

        # Rule-based shock / impact propagation through transfer functions
        # 1. Soil Degradation
        soil_degradation = min(1.0, max(0.0, 0.35 * const_pressure + 0.65 * veg_disturb))

        # 2. Microclimate shift
        microclimate_shift = min(1.0, max(0.0, 0.70 * veg_disturb + 0.30 * const_pressure))

        # 3. Water Stress (Groundwater & Hydrological)
        water_stress = min(1.0, max(0.0, 0.50 * soil_degradation + 0.30 * rain_stress + 0.20 * microclimate_shift))

        # 4. Habitat Fragmentation
        habitat_frag = min(1.0, max(0.0, 0.65 * veg_disturb + 0.35 * const_pressure))

        # 5. Biodiversity Collapse Risk (Terminal node)
        biodiversity_impact = min(1.0, max(0.0, 0.45 * habitat_frag + 0.35 * water_stress + 0.20 * soil_degradation))

        severities = {
            "construction_pressure": const_pressure,
            "vegetation_disturbance": veg_disturb,
            "soil_degradation": soil_degradation,
            "water_stress": water_stress,
            "microclimate_shift": microclimate_shift,
            "habitat_fragmentation": habitat_frag,
            "biodiversity_impact": biodiversity_impact,
        }

        def get_status(score: float) -> str:
            if score < 0.28:
                return "stable"
            elif score < 0.50:
                return "moderate"
            elif score < 0.72:
                return "high"
            else:
                return "critical"

        nodes: List[GraphNode] = []
        for n in self.graph_data["nodes"]:
            nid = n["id"]
            sev = severities.get(nid, 0.3)
            status = get_status(sev)
            nodes.append(GraphNode(
                id=nid,
                label=n["label"],
                category=n["category"],
                status=status,
                severity=round(sev, 3),
                description=n["description"],
                metric=n["metric"],
                mitigation_lever=n["mitigation_lever"],
                position=n["position"]
            ))

        edges: List[GraphEdge] = []
        for e in self.graph_data["edges"]:
            edges.append(GraphEdge(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                label=e["label"],
                strength=e["strength"],
                relationship_type=e["relationship_type"]
            ))

        # Active disturbances identification
        active_disturbances = [
            f"{n.label}: {n.status.upper()} (severity {n.severity:.2f})"
            for n in nodes if n.status in ["high", "critical"]
        ]

        propagation_summary = (
            f"Under current regional pressure, disturbance in '{assessment.primary_drivers[0]}' "
            f"propagates downstream along hydrological and ecological corridors. "
            f"Model predicts elevated stress cascading into '{nodes[-1].label}' (severity {biodiversity_impact:.2f}/1.00)."
        )

        return EcologicalGraphResponse(
            region_id=region_id,
            nodes=nodes,
            edges=edges,
            propagation_summary=propagation_summary,
            active_disturbances=active_disturbances
        )

ecological_graph_service = EcologicalGraphService()

