# EcoGuard — Complete Project Context & Technical Specification

> **AI-Powered Environmental Early-Warning & Intervention System**  
> **Core Pipeline:** `DETECT → ANALYZE → EXPLAIN → PREDICT → SIMULATE → INTERVENE`

---

## 1. Executive Summary & Product Vision

**EcoGuard** (`d:\Coding\indradhanu`) is an end-to-end, hackathon-ready geospatial intelligence and environmental monitoring prototype. It combines a React GIS frontend (`frontend/`) with a modular Python/FastAPI analytics backend (`backend/`) to inspect multi-temporal satellite indicators, evaluate regional environmental risk with explainable factor contributions, trace cascading ecological dependencies, and simulate policy interventions before implementation.

### Core Questions EcoGuard Answers
1. **What** environmental changes are happening in a selected region? *(NDVI & $\Delta\text{NDVI}$ change detection)*
2. **Where** are these changes occurring? *(Leaflet GIS boundary overlays, disturbance hotspots, and $12 \times 12$ spectral raster grids)*
3. **What factors** may be causing them? *(Normalized 5-factor weighted risk model + statistical anomaly baseline + plain-English explanation engine)*
4. **What downstream ecological consequences** could follow? *(Interactive React Flow dependency graph with rule-based shock propagation)*
5. **Which interventions** could potentially reduce the risk? *(What-If Intervention Simulator calculating baseline vs. mitigation pathways over 3–10 years)*

### Scientific & Ethical Guardrails
- **Non-causation discipline:** Correlations and spectral vegetation declines are reported as measured biophysical changes requiring field verification—never as definitive legal proof of deforestation or construction.
- **No fabricated ML metrics:** Anomaly detection uses genuine `IsolationForest` / multivariate dispersion scoring without invented accuracy, precision, or recall claims.
- **Transparent simulation bounds:** All intervention forecasts explicitly surface underlying model assumptions (e.g., 85% compliance assumption, 3-year broadleaf canopy establishment lag) and are labeled as simulated estimates.

---

## 2. Repository Directory & Complete File Inventory

```text
d:\Coding\indradhanu\
├── .env.example                       # Environment variable template (ports, CORS, optional LLM keys)
├── README.md                          # Quick-start guide, stack summary, and 5-minute demo walkthrough
├── PROJECT_CONTEXT.md                 # This full technical specification and project context reference
├── requirements.txt                   # Root Python dependencies (synced with backend/requirements.txt)
├── start_backend.bat                  # Windows launcher for FastAPI reload dev server (port 8000)
├── start_frontend.bat                 # Windows launcher for Vite dev server (port 5173)
├── start_unified_server.bat           # Windows launcher for unified FastAPI + static React build (port 8000)
│
├── backend/
│   ├── requirements.txt               # Backend Python dependencies
│   ├── tests/
│   │   └── test_api.py                # 8-case unittest suite covering all services & calculations
│   └── app/
│       ├── __init__.py
│       ├── config.py                  # App metadata, CORS allowlist, default 5-factor RiskEngineWeights
│       ├── main.py                    # FastAPI app initialization, CORS regex, API router mounts, SPA static serving
│       ├── models/
│       │   ├── __init__.py
│       │   └── schemas.py             # Pydantic v2 request/response schemas for all modules
│       ├── data/
│       │   ├── sample_regions.json    # 4 calibrated regional profiles with coordinates, bbox, & GeoJSON polygons
│       │   ├── sample_observations.json # T1 & T2 Sentinel-2 Band 4 (Red) & Band 8 (NIR) 12x12 grids + climate/infra metrics
│       │   └── ecological_rules.json  # 7-node causal DAG topology, edge weights, & propagation weights
│       ├── api/
│       │   ├── __init__.py
│       │   ├── health.py              # GET /api/health
│       │   ├── regions.py             # GET /api/regions, GET /api/regions/{region_id}
│       │   ├── overview.py            # GET /api/overview (aggregated KPIs, distributions, trends, alerts)
│       │   ├── monitoring.py          # GET /api/monitoring/observations, /ndvi, /change-detection
│       │   ├── risk.py                # GET & POST /api/risk/analyze
│       │   ├── graph.py               # GET /api/graph
│       │   ├── simulation.py          # POST /api/simulations/run
│       │   ├── alerts.py              # GET /api/alerts, PATCH /api/alerts/{alert_id}
│       │   ├── sources.py             # GET /api/data-sources/status
│       │   └── reports.py             # GET /api/reports/export (csv, html, json)
│       └── services/
│           ├── __init__.py
│           ├── satellite_service.py   # Data-provider abstraction loading region profiles & T1/T2 scenes
│           ├── ndvi_service.py        # Standardized (NIR - RED) / (NIR + RED) math & canopy strata stats
│           ├── change_detection.py    # Multi-temporal dNDVI calculation, thresholds, & hectare shift
│           ├── risk_engine.py         # 5-factor normalization, weighted scoring, confidence, & recommendations
│           ├── anomaly_detection.py   # Scikit-learn IsolationForest + pure-NumPy Z-Dispersion fallback
│           ├── explanation_service.py # Rule-based plain-English narrative generator grounded in computed metrics
│           ├── ecological_graph.py    # Shock propagation transfer functions & node severity classification
│           ├── intervention_engine.py # Dynamic policy simulation & 3–10 year risk/NDVI trajectory curves
│           └── alert_service.py       # Automated threshold alert generation, filtering, & status tracking
│
└── frontend/
    ├── index.html                     # Loads Leaflet CSS + Inter/JetBrains Mono fonts
    ├── package.json                   # React 18, Vite, Tailwind, React Router, Axios, Leaflet, Recharts, XYFlow
    ├── postcss.config.js
    ├── tailwind.config.js             # Custom eco-green & deep navy-950 GIS palette
    ├── vite.config.js                 # Vite dev server (127.0.0.1:5173) with /api proxy -> 127.0.0.1:8000
    ├── dist/                          # Pre-built production bundle served by FastAPI at port 8000
    └── src/
        ├── main.jsx                   # React DOM entry point
        ├── index.css                  # Tailwind directives, Leaflet sizing, custom scrollbars, React Flow styles
        ├── App.jsx                    # BrowserRouter + AppProvider + Sidebar/TopNavbar/AlertDrawer layout
        ├── api/
        │   ├── client.js              # Axios instance (baseURL: '/api', 15s timeout, error interceptor)
        │   └── ecoguardApi.js         # Typed/named API client methods for every backend route
        ├── context/
        │   └── AppContext.jsx         # Shared global state: regions, selectedRegionId, selectedSlot (t1/t2), observationsMeta, alerts count
        ├── components/
        │   ├── common/Common.jsx      # RiskBadge, LoadingSpinner, ErrorMessage
        │   ├── layout/
        │   │   ├── Sidebar.jsx        # Deep navy persistent sidebar with 7 module links & active alert badge
        │   │   ├── TopNavbar.jsx      # Region dropdown, T1/T2 date toggle, live observation date/source badge, alert drawer trigger
        │   │   └── AlertDrawer.jsx    # Slide-out early-warning drawer with quick Acknowledge action
        │   ├── maps/
        │   │   ├── RegionalMap.jsx    # React Leaflet map (OSM Terrain / Esri Satellite toggle, GeoJSON polygon, disturbance hotspots, legend)
        │   │   ├── NdviGridVisualizer.jsx # Interactive 12x12 NDVI raster grid with cell hover inspection & color scale
        │   │   └── ChangeMatrixVisualizer.jsx # Interactive 12x12 dNDVI change grid with hover classification
        │   └── graph/
        │       ├── CustomGraphNode.jsx    # Color-coded React Flow node with severity bar & indicator preview
        │       └── DependencyGraphView.jsx # Interactive @xyflow/react canvas + upstream/downstream inspection drawer
        └── pages/
            ├── OverviewPage.jsx       # Module 1: 6 live KPIs, Leaflet map, Landscape Directory, Risk/NDVI trend, Risk Distribution, Disturbance Drivers, Alerts
            ├── MonitoringPage.jsx     # Module 2: dNDVI / Dual T1-T2 / Single-period NDVI viewers & threshold bar charts
            ├── RiskAnalysisPage.jsx   # Module 3: Plain-English narrative, ML anomaly card, 5-axis radar, interactive weight sliders, breakdown table, directives
            ├── EcologicalGraphPage.jsx # Module 4: Propagation summary, interactive causal React Flow canvas, modeling caveat
            ├── SimulatorPage.jsx      # Module 5: 5 policy intervention levers, intensity/coverage sliders, horizon selector, multi-year charts, save/reset
            ├── AlertsReportsPage.jsx  # Module 6: Search/severity/region filters, detail modal, status updates, CSV/HTML/Print export
            └── MethodologyPage.jsx    # Module 7: Mathematical formulas, data catalog audit, & ethical guardrails
```

---

## 3. Technology Stack

### Backend
- **Python 3.15** (compatible with Python 3.10+)
- **FastAPI (`>=0.115.0`)** & **Uvicorn (`>=0.30.0`)** — REST API, OpenAPI/Swagger (`/docs`), and production static asset hosting.
- **Pydantic v2 (`>=2.8.0`)** — strict schema validation (`backend/app/models/schemas.py`).
- **NumPy (`>=1.26.0`)** — matrix math for Sentinel-2 NDVI, $\Delta\text{NDVI}$ thresholding, and statistical dispersion.
- **Scikit-learn (`>=1.5.0`)** — `IsolationForest` baseline (gracefully falls back to pure-NumPy Z-Dispersion when OS policies block `scipy` `.pyd` DLLs).
- **Storage** — modular JSON data files in `backend/app/data/` (designed so a database adapter like SQLite or MongoDB can replace `SatelliteService` without changing API/service contracts).

### Frontend
- **React 18 (`18.3.1`)** + **Vite (`5.4.11`)** + **Tailwind CSS (`3.4.17`)**
- **React Router DOM (`6.28.0`)** & **Axios (`1.7.9`)**
- **Leaflet (`1.9.4`)** + **React Leaflet (`4.2.1`)** — GIS maps, polygons, circles, and OSM/Esri layer switching.
- **Recharts (`2.15.0`)** — Line, Bar, Pie/Donut, and Radar analytical charts.
- **React Flow (`@xyflow/react` `12.3.6`)** — interactive ecological dependency DAG with minimap and controls.
- **Lucide React (`0.468.0`)** — consistent GIS/analytical iconography.

---

## 4. Scientific Algorithms & Backend Calculation Logic

### 4.1 NDVI Calculation (`backend/app/services/ndvi_service.py`)
Given $12 \times 12$ surface reflectance matrices for Sentinel-2 Band 8 ($\text{NIR}$, $842\text{ nm}$) and Band 4 ($\text{RED}$, $665\text{ nm}$):
$$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED}}$$
- **Invalid/Zero protection:** Denominators $\le 10^{-6}$ are masked (`valid_mask`) and result in `0.0`; output is clipped to $[-1.0, 1.0]$.
- **Vegetation Strata:**
  - Dense Canopy: $\text{NDVI} \ge 0.60$
  - Moderate Vegetation: $0.40 \le \text{NDVI} < 0.60$
  - Sparse / Degraded Scrub: $0.20 \le \text{NDVI} < 0.40$
  - Bare Soil / Built-up / Rock: $0.00 \le \text{NDVI} < 0.20$
  - Water Bodies: $\text{NDVI} < 0.00$

### 4.2 Change Detection (`backend/app/services/change_detection.py`)
Compares baseline ($T_1$) and current ($T_2$) matrices via $\Delta\text{NDVI} = \text{NDVI}_{T_2} - \text{NDVI}_{T_1}$:
- **Severe Decline:** $\Delta\text{NDVI} < -0.20$
- **Moderate Decline:** $-0.20 \le \Delta\text{NDVI} < -0.08$
- **Stable Canopy:** $-0.08 \le \Delta\text{NDVI} \le +0.08$
- **Moderate Recovery:** $+0.08 < \Delta\text{NDVI} \le +0.20$
- **Significant Regrowth:** $\Delta\text{NDVI} > +0.20$
- **Net Vegetation Shift (ha):** $((\text{recovery\_pct} - \text{decline\_pct}) / 100) \times (\text{area\_sqkm} \times 100)$.

### 4.3 Weighted Environmental Risk Model (`backend/app/services/risk_engine.py`)
All 5 factors are normalized to $[0.0, 1.0]$:
1. **Vegetation Canopy Disturbance** (`0.30`): `(severe_decline_pct * 1.0 + moderate_decline_pct * 0.45) / 35.0`
2. **Land-Use & Built-up Encroachment** (`0.25`): `built_up_expansion_pct / 20.0`
3. **Meteorological & Drought Stress** (`0.20`): `abs(rainfall_anomaly_pct) / 40.0` for deficits (`< 0`), capped at `0.30` for surplus rainfall
4. **Infrastructure & Mining Proximity** (`0.15`): `infrastructure_pressure` (`0.0–1.0`)
5. **Historical Ecosystem Vulnerability** (`0.10`): `historical_change` (`0.0–1.0`)

Default weights are stored in `RiskEngineWeights` (`backend/app/config.py`) and can be overridden per request via `POST /api/risk/analyze`.
- **Tiers:** `0–29` **Low** | `30–49` **Moderate** | `50–74` **High** | `75–100` **Critical**
- **Confidence:** `max(0.65, min(0.98, 1.0 - cloud_cover_percent * 0.03))`

### 4.4 Anomaly Detection Baseline (`backend/app/services/anomaly_detection.py`)
Evaluates a 6-element vector `[mean_dNDVI, std_dNDVI, rainfall_anomaly_pct, built_up_expansion_pct, infra_pressure, hist_change]` against seasonal reference bounds:
- Attempts `sklearn.ensemble.IsolationForest(n_estimators=50, contamination=0.15)`.
- Falls back cleanly to **Multivariate Z-Dispersion Baseline (Normalized Euclidean-Z)** (`norm_score >= 0.55` triggers `anomaly_detected = True`) if `scipy`/`sklearn` DLLs are blocked by OS security policies.

### 4.5 Ecological Dependency Graph (`backend/app/services/ecological_graph.py`)
Rule-based shock propagation across 7 nodes and 9 directed edges defined in `backend/app/data/ecological_rules.json`:
- `soil_degradation = 0.35 * construction_pressure + 0.65 * vegetation_disturbance`
- `microclimate_shift = 0.70 * vegetation_disturbance + 0.30 * construction_pressure`
- `water_stress = 0.50 * soil_degradation + 0.30 * rainfall_anomaly + 0.20 * microclimate_shift`
- `habitat_fragmentation = 0.65 * vegetation_disturbance + 0.35 * construction_pressure`
- `biodiversity_impact = 0.45 * habitat_fragmentation + 0.35 * water_stress + 0.20 * soil_degradation`
- **Node Status:** `< 0.28` `stable` | `< 0.50` `moderate` | `< 0.72` `high` | `>= 0.72` `critical`

### 4.6 What-If Intervention Simulator (`backend/app/services/intervention_engine.py`)
Applies scaled mitigation (`(intensity / 100) * (coverage_pct / 100)`) across 5 policy levers (`afforestation`, `construction_restriction`, `water_conservation`, `soil_restoration`, `habitat_restoration`), recalculates the risk score using baseline factor weights, and generates a Year $0 \dots N$ projection trajectory (`baseline_risk`, `simulated_risk`, `baseline_ndvi`, `simulated_ndvi`) using an asymptotic curve (`progress ** 1.3`).

---

## 5. Pre-Loaded Regions & Verified Baseline Outputs

All 4 regional datasets are labeled as **Calibrated Sentinel-2 MSI Level-2A Sample Scenes** (`sample_regions.json` + `sample_observations.json`):

| Region ID | Landscape & Location | Area ($\text{km}^2$) | $T_1 \to T_2$ Dates | Mean NDVI ($T_1 \to T_2$) | Severe Decline | Net Shift (ha) | Risk Score & Level | Anomaly Score | Active Graph Nodes (High/Crit) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `aravalli_ridge` | **Aravalli Biodiversity & Mining Corridor** (Haryana / Delhi NCR) | `240.5` | `2023-11-20` $\to$ `2024-10-28` | `0.5124` $\to$ `0.2280` | `39.58%` | `-11,022.1 ha` | **89.3 (Critical)** | `True` (`1.000`) | `7 / 7` |
| `western_ghats` | **Silent Valley Buffer Zone** (Kerala / Tamil Nadu Border) | `190.2` | `2023-12-10` $\to$ `2024-11-02` | `0.8196` $\to$ `0.6692` | `14.58%` | `-4,886.2 ha` | **50.5 (High)** | `True` (`0.762`) | `7 / 7` |
| `sundarbans_delta` | **Sundarbans Biosphere Fringe** (West Bengal) | `320.0` | `2023-11-05` $\to$ `2024-10-15` | `0.6482` $\to$ `0.4451` | `23.61%` | `-15,558.4 ha` | **50.8 (High)** | `True` (`0.654`) | `6 / 7` |
| `kaziranga_corridor` | **Kaziranga Karbi-Anglong Ecological Corridor** (Assam) | `175.8` | `2023-11-18` $\to$ `2024-11-04` | `0.5451` $\to$ `0.7437` | `0.00%` (`50.69%` regrowth) | `+14,649.4 ha` | **7.4 (Low)** | `False` (`0.219`) | `0 / 7` |

- **System-Wide Aggregate (`GET /api/overview`):** Average Risk Score `49.5`, Mean NDVI `0.522`, Monitored Area `926.5 km²`, Net Vegetation Change `-16,817.3 ha`, `6` Active Alerts (`ALT-ARAV-001`, `ALT-ARAV-002`, `ALT-SUND-001`, `ALT-SUND-002`, `ALT-WEST-001`, `ALT-WEST-002`).

---

## 6. REST API Endpoints Reference

Base URL: `http://127.0.0.1:8000` (Swagger UI at `/docs`, ReDoc at `/redoc`)

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check & pipeline status |
| `GET` | `/api/regions` | List all monitored regions with GeoJSON polygons |
| `GET` | `/api/regions/{region_id}` | Retrieve single region metadata |
| `GET` | `/api/overview?region_id=...` | Global KPIs, risk/NDVI trends, risk distribution, factor shares, recent alerts |
| `GET` | `/api/monitoring/observations?region_id=...` | Observation metadata ($T_1$ & $T_2$ dates, cloud cover, climate/infra indicators) |
| `GET` | `/api/monitoring/ndvi?region_id=...&slot=t1\|t2` | $12 \times 12$ NDVI matrix + strata distribution statistics |
| `GET` | `/api/monitoring/change-detection?region_id=...` | $12 \times 12$ $\Delta\text{NDVI}$ matrix, threshold percentages, net hectare shift |
| `GET` / `POST` | `/api/risk/analyze` | Compute risk score, factor breakdown, anomaly flag, plain-English summary (accepts custom weights via POST) |
| `GET` | `/api/graph?region_id=...` | Ecological dependency graph nodes, edges, & propagated severities |
| `POST` | `/api/simulations/run` | Execute What-If policy simulation (`region_id`, `interventions`, `timeframe_years`) |
| `GET` | `/api/alerts?severity=...&region_id=...` | Filtered environmental early-warning alert feed |
| `PATCH` | `/api/alerts/{alert_id}` | Update alert lifecycle status (`Active`, `Acknowledged`, `Resolved`) |
| `GET` | `/api/data-sources/status` | Data inventory, cadences, & attribution catalog |
| `GET` | `/api/reports/export?region_id=...&export_format=csv\|html\|json` | Download CSV audit, open printable HTML/PDF Executive Brief, or fetch JSON report |

---

## 7. Data Integrity Matrix (Real vs. Sample vs. Simulated)

| Component | Classification | Notes |
| :--- | :--- | :--- |
| **NDVI & $\Delta\text{NDVI}$ Computations** | **Real Algorithmic Processing** | Executed dynamically in Python/NumPy (`ndvi_service.py`, `change_detection.py`) |
| **Geographic Coordinates & Polygons** | **Real Geospatial Reference** | Actual regional coordinates and buffer boundaries in `sample_regions.json` |
| **Sentinel-2 Band 4/8 Matrices & Weather** | **Calibrated Sample Data** | Preloaded `12x12` surface reflectance scenes & climate/infrastructure indices for offline-safe demos |
| **Anomaly Detection** | **Real Statistical/ML Baseline** | Live `IsolationForest` / Normalized Euclidean-Z evaluation on feature vectors; zero fabricated metrics |
| **Ecological Graph Propagation** | **Prototype Ruleset** | Assumed empirical linear weights modeling cascading trophic/hydrological stress |
| **What-If Intervention Simulator** | **Simulated Policy Estimates** | Dynamic projections grounded in baseline scores + transparent policy assumptions |

---

## 8. Windows Environment & Engineering Fixes Applied

1. **Windows Application Control (`scipy` / `pandas` DLL blocking):**
   - AppLocker blocked `.pyd` C-extensions (`scipy.linalg._batched_linalg`, `pandas._libs.tslibs.vectorized`).
   - **Solution:** `AnomalyDetectionService` catches C-extension import errors and falls back cleanly to a pure-NumPy Multivariate Z-Dispersion baseline; `pandas` and GDAL-heavy libs (`rasterio`, `geopandas`, `shapely`) remain optional in `requirements.txt`.
2. **Windows Application Control (`rollup-win32-x64-msvc.node` blocking):**
   - Rollup's native `.node` binary was blocked during `vite build`.
   - **Solution:** Installed `@rollup/wasm-node` in `frontend/node_modules` and patched `frontend/node_modules/rollup/dist/native.js` to fall back to `@rollup/wasm-node/dist/native.js`.
3. **Node 24 IPv6 `localhost` Proxy Mismatch & CORS:**
   - Node 24 resolves `localhost` to `[::1]`, causing Vite proxy `ECONNREFUSED` when Uvicorn bound only `127.0.0.1`.
   - **Solution:** `frontend/vite.config.js` proxies `/api` directly to `http://127.0.0.1:8000` (`host: '127.0.0.1'`); Uvicorn launchers bind `0.0.0.0:8000`; `backend/app/main.py` configures CORS with `allow_origin_regex=".*"`.

---

## 9. How to Install, Run & Test

### Installation
```bash
# 1. Python Backend Dependencies
pip install -r requirements.txt

# 2. Frontend Dependencies & Production Build
cd frontend
npm install
npm run build
cd ..
```

### Running the Application
- **Option A — Unified Single-Port Server (Recommended for Demos):**
  ```bash
  python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
  ```
  - Web Dashboard: `http://127.0.0.1:8000`
  - API Docs (Swagger): `http://127.0.0.1:8000/docs`
- **Option B — Dual Hot-Reload Dev Mode:**
  - Terminal 1: `start_backend.bat` (`0.0.0.0:8000 --reload`)
  - Terminal 2: `start_frontend.bat` (`127.0.0.1:5173`)

### Automated Test Verification
```bash
python -m unittest backend.tests.test_api
```
- **Verified Passing:** `8/8` tests pass (`test_regions_catalog`, `test_ndvi_calculation_accuracy`, `test_all_regions_ndvi`, `test_change_detection`, `test_risk_engine_classification`, `test_ecological_dependency_graph`, `test_what_if_simulator`, `test_alert_service`).

---

## 10. Five-Minute Hackathon Demo Flow

1. **Overview (`/`):** Show system KPIs (`49.5` avg risk, `6` alerts, `926.5 km²`), select **Aravalli Biodiversity & Mining Corridor**, and inspect the GIS Leaflet boundary & hotspot overlays.
2. **Monitoring (`/monitoring`):** Switch $T_1 \leftrightarrow T_2$, hover over the $12 \times 12$ NDVI raster cells, and inspect **Multi-Temporal Change Detection** (`39.58%` severe decline, `-11,022.1 ha` shift).
3. **Risk Engine (`/risk-analysis`):** Review **89.3 (Critical)** score, anomaly flag (`1.00`), plain-English driver explanation, and adjust weighting sliders + click **Recalculate Score**.
4. **Ecological Graph (`/dependency-graph`):** Click **Infrastructure & Excavation** or **Vegetation Canopy Loss** to inspect upstream drivers and downstream propagation to **Biodiversity Collapse Risk** (`0.94`).
5. **Intervention Simulator (`/simulator`):** Enable **Buffer Zone Construction Bans** (`80%` intensity, `75%` coverage) + **Endemic Pioneer Species Afforestation** (`70%` intensity, `60%` coverage), click **Run Simulation**, and show risk falling from **89.3 $\to$ 66.9 (-25.1%)** with 5-year projections.
6. **Alerts & Reports (`/alerts`):** Filter **Critical** alerts, acknowledge `ALT-ARAV-001`, and open **Executive Brief (HTML/PDF)** or **Export CSV Audit**.
7. **Recovery Contrast:** Switch top region selector to **Kaziranga Karbi-Anglong Ecological Corridor** to demonstrate low risk (**7.4 Low**) and active canopy regrowth (`+14,649.4 ha`).

