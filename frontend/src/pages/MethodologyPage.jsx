import React, { useEffect, useState } from 'react';
import {
  BookOpenText,
  Database,
  Satellite,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { ecoguardApi } from '../api/ecoguardApi';
import { LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const MethodologyPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const data = await ecoguardApi.getDataSources();
        setSources(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data source audit catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Sources, Algorithms & Methodology</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
              METHODOLOGICAL AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete transparency into satellite sensor bands, mathematical formulations, calibration baselines, and prototype bounds.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>5 Cataloged Data Streams</span>
        </div>
      </div>

      {/* Algorithmic Formulations Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Formula 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>1. Normalized Difference Vegetation Index (NDVI)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-emerald-900 text-center font-bold">
            NDVI = (NIR - RED) / (NIR + RED)
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Computed on Sentinel-2 Band 8 (NIR, 842nm) and Band 4 (Red, 665nm). Zero-division and atmospheric cloud masking are applied to guarantee numeric stability in [-1.0, 1.0].
          </p>
        </div>

        {/* Formula 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>2. Temporal Canopy Shift (dNDVI)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-emerald-900 text-center font-bold">
            dNDVI = NDVI(T2) - NDVI(T1)
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Multi-temporal change detection thresholded into: Severe Decline (&lt; -0.20), Moderate Decline (-0.20 to -0.08), Stable (-0.08 to +0.08), and Regrowth (&gt; +0.08).
          </p>
        </div>

        {/* Formula 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>3. Weighted Environmental Risk Index</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-emerald-900 text-center font-bold">
            Score = &Sigma; (Weight_i &times; NormFactor_i) &times; 100
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Linear synthesis incorporating vegetation disturbance (30%), land-use shift (25%), rainfall anomaly (20%), infrastructure (15%), and historical degradation (10%).
          </p>
        </div>
      </div>

      {/* Data Source Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Verified Ingestion Pipeline & Data Catalog
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Live Status & Cadence</span>
        </div>

        {loading && <LoadingSpinner message="Auditing telemetry streams..." />}
        {error && <ErrorMessage message={error} />}

        {!loading && (
          <div className="divide-y divide-slate-100">
            {sources.map((src, i) => (
              <div key={i} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2 text-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">{src.name}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                      {src.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {src.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600 text-[11px] pt-1">
                  <div>
                    <span className="font-semibold text-slate-700">Provider:</span> {src.source}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Ingestion Cadence:</span> {src.cadence}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Data Type:</span> {src.data_type}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Citation: {src.license_or_citation}</span>
                  <span>Sync: {src.last_sync}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Scope & Ethical Guardrails */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 space-y-3 text-xs leading-relaxed">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Scientific Guardrails & Ethical Geospatial AI Principles</span>
        </div>
        <p>
          <strong>Non-Fabrication Policy:</strong> EcoGuard strictly separates measured observational telemetry from predictive estimates.
          Vegetation decline detected via satellite dNDVI is presented as physical canopy loss requiring verification, not as an unquestionable legal determination of unauthorized deforestation.
        </p>
        <p>
          <strong>Simulation Scope:</strong> Scenario projections generated by the What-If Intervention Simulator represent policy evaluation estimates calculated from transparent assumptions (e.g. 85% buffer compliance, 3-year broadleaf establishment lag). They do not constitute guaranteed future environmental states.
        </p>
        <p className="text-[11px] text-slate-400 font-mono">
          System Version: EcoGuard 1.0.0 &bull; Architecture: React 18 + Vite + Tailwind CSS &bull; Backend: FastAPI + NumPy + Scikit-Learn
        </p>
      </div>
    </div>
  );
};

