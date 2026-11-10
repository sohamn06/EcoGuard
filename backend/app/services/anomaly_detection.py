import numpy as np
from typing import Dict, Any, Tuple

class AnomalyDetectionService:
    def __init__(self):
        self.sklearn_available = False
        self._check_sklearn()

    def _check_sklearn(self):
        try:
            from sklearn.ensemble import IsolationForest
            self.sklearn_available = True
        except Exception:
            self.sklearn_available = False

    def evaluate_observation(self, feature_vector: list[float]) -> Tuple[bool, float, str]:
        """
        Evaluates a multivariate observation vector:
        [mean_ndvi, ndvi_std, rainfall_anomaly_pct, built_up_pct, infra_pressure, hist_change]
        Returns:
            (anomaly_detected: bool, anomaly_score: float [0..1], method_name: str)
        """
        # Baseline reference envelope derived from typical multi-year seasonal bounds
        # Reference mean and std for the 6 features
        ref_mean = np.array([0.52, 0.11, 0.0, 3.0, 0.25, 0.30])
        ref_std = np.array([0.15, 0.05, 15.0, 5.0, 0.20, 0.15])

        vec = np.array(feature_vector, dtype=np.float64)

        if self.sklearn_available:
            try:
                from sklearn.ensemble import IsolationForest
                # Fit on synthetic reference distribution representing normal seasonal variance
                np.random.seed(42)
                X_ref = np.random.normal(ref_mean, ref_std, size=(100, 6))
                clf = IsolationForest(n_estimators=50, contamination=0.15, random_state=42)
                clf.fit(X_ref)

                # predict returns -1 for outlier, 1 for inlier
                pred = clf.predict([vec])[0]
                # score_samples returns negative anomaly score (lower is more anomalous)
                raw_score = clf.score_samples([vec])[0]
                # Normalize raw score roughly to 0..1 where > 0.6 is anomalous
                norm_score = float(np.clip(1.0 - (raw_score + 0.5), 0.0, 1.0))
                is_anomaly = bool(pred == -1 or norm_score >= 0.65)

                return is_anomaly, round(norm_score, 3), "Scikit-Learn IsolationForest (Contamination=0.15)"
            except Exception:
                pass

        # Transparent Pure-Python/NumPy Multivariate Z-Dispersion Baseline
        z_scores = np.abs((vec - ref_mean) / np.maximum(ref_std, 1e-5))
        # Weighted dispersion
        dispersion = float(np.mean(z_scores))
        norm_score = float(np.clip(dispersion / 3.0, 0.0, 1.0))
        is_anomaly = norm_score >= 0.55

        return is_anomaly, round(norm_score, 3), "Multivariate Z-Dispersion Baseline (Normalized Euclidean-Z)"

anomaly_detector = AnomalyDetectionService()

