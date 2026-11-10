import unittest
import numpy as np
from backend.app.services.satellite_service import satellite_service
from backend.app.services.ndvi_service import ndvi_service
from backend.app.services.change_detection import change_detection_service
from backend.app.services.risk_engine import risk_engine
from backend.app.services.ecological_graph import ecological_graph_service
from backend.app.services.intervention_engine import intervention_engine
from backend.app.services.alert_service import alert_service
from backend.app.models.schemas import SimulationRequest, InterventionInput

class TestEcoGuardBackend(unittest.TestCase):
    def setUp(self):
        self.regions = satellite_service.get_all_regions()
        self.region_ids = [r["id"] for r in self.regions]

    def test_regions_catalog(self):
        self.assertGreaterEqual(len(self.regions), 4)
        for r in self.regions:
            self.assertIn("id", r)
            self.assertIn("name", r)
            self.assertIn("lat", r)
            self.assertIn("lng", r)
            self.assertIn("geojson", r)

    def test_ndvi_calculation_accuracy(self):
        # Physical boundary tests
        nir_pure_veg = [[0.8, 0.7], [0.75, 0.85]]
        red_pure_veg = [[0.1, 0.08], [0.09, 0.07]]
        arr, stats = ndvi_service.calculate_ndvi_matrix(nir_pure_veg, red_pure_veg)

        # NDVI should be high (> 0.7) for dense vegetation
        self.assertGreater(stats.mean_ndvi, 0.7)
        self.assertEqual(stats.dense_canopy_pct, 100.0)

        # Zero denominator handling
        nir_zero = [[0.0, 0.0], [0.0, 0.0]]
        red_zero = [[0.0, 0.0], [0.0, 0.0]]
        arr_z, stats_z = ndvi_service.calculate_ndvi_matrix(nir_zero, red_zero)
        self.assertFalse(np.isnan(stats_z.mean_ndvi))
        self.assertEqual(stats_z.mean_ndvi, 0.0)

    def test_all_regions_ndvi(self):
        for rid in self.region_ids:
            res_t1 = ndvi_service.get_ndvi_for_observation(rid, "t1")
            res_t2 = ndvi_service.get_ndvi_for_observation(rid, "t2")
            self.assertEqual(res_t1.region_id, rid)
            self.assertEqual(res_t2.region_id, rid)
            self.assertGreater(len(res_t1.ndvi_matrix), 0)
            self.assertGreater(len(res_t2.ndvi_matrix), 0)

    def test_change_detection(self):
        # Aravalli has heavy decline
        aravalli_change = change_detection_service.detect_changes("aravalli_ridge")
        self.assertGreater(aravalli_change.severe_decline_pct, 15.0)
        self.assertLess(aravalli_change.net_vegetation_shift_ha, 0)

        # Kaziranga has regrowth
        kaziranga_change = change_detection_service.detect_changes("kaziranga_corridor")
        self.assertGreater(kaziranga_change.significant_regrowth_pct + kaziranga_change.moderate_recovery_pct, 50.0)
        self.assertGreater(kaziranga_change.net_vegetation_shift_ha, 0)

    def test_risk_engine_classification(self):
        # Aravalli should be High or Critical risk
        risk_aravalli = risk_engine.analyze_region("aravalli_ridge")
        self.assertIn(risk_aravalli.risk_level, ["High", "Critical"])
        self.assertGreaterEqual(risk_aravalli.overall_risk_score, 70.0)
        self.assertGreater(len(risk_aravalli.factors), 0)
        self.assertGreater(len(risk_aravalli.recommended_actions), 0)

        # Kaziranga should be Low risk
        risk_kaziranga = risk_engine.analyze_region("kaziranga_corridor")
        self.assertEqual(risk_kaziranga.risk_level, "Low")
        self.assertLess(risk_kaziranga.overall_risk_score, 30.0)

    def test_ecological_dependency_graph(self):
        for rid in self.region_ids:
            graph = ecological_graph_service.get_graph_for_region(rid)
            self.assertEqual(len(graph.nodes), 7)
            self.assertGreaterEqual(len(graph.edges), 8)
            # Verify nodes have valid severities
            for node in graph.nodes:
                self.assertGreaterEqual(node.severity, 0.0)
                self.assertLessEqual(node.severity, 1.0)
                self.assertIn(node.status, ["stable", "moderate", "high", "critical"])

    def test_what_if_simulator(self):
        req = SimulationRequest(
            region_id="aravalli_ridge",
            interventions=[
                InterventionInput(id="construction_restriction", name="Bans", active=True, intensity=80, coverage_pct=70),
                InterventionInput(id="afforestation", name="Afforestation", active=True, intensity=75, coverage_pct=60)
            ],
            timeframe_years=5
        )
        sim = intervention_engine.simulate(req)
        self.assertLess(sim.simulated_risk_score, sim.baseline_risk_score)
        self.assertGreater(sim.risk_reduction_pct, 15.0)
        self.assertEqual(len(sim.trajectory), 6) # year 0 to 5

    def test_alert_service(self):
        alerts = alert_service.get_alerts()
        self.assertGreater(len(alerts), 0)
        first_alert = alerts[0]
        self.assertIn(first_alert.severity, ["Critical", "High", "Moderate", "Low"])
        self.assertIn(first_alert.status, ["Active", "Acknowledged", "Resolved"])

        # Test status update
        updated = alert_service.update_alert_status(first_alert.id, "Acknowledged")
        self.assertEqual(updated.status, "Acknowledged")

if __name__ == "__main__":
    unittest.main()

