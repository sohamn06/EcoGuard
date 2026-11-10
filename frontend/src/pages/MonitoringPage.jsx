import React, { useEffect, useState } from 'react';
import {
  Satellite,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Info,
  Maximize2,
  TreePine,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { NdviGridVisualizer } from '../components/maps/NdviGridVisualizer';
import { ChangeMatrixVisualizer } from '../components/maps/ChangeMatrixVisualizer';
import { LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const MonitoringPage = () => {
  const { currentRegion, selectedSlot, setSelectedSlot } = useApp();
  const [obsMeta, setObsMeta] = useState(null);
  const [ndviT1, setNdviT1] = useState(null);
  const [ndviT2, setNdviT2] = useState(null);
  const [changeData, setChangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('change'); // 'change', 't2', 't1', 'dual'

  const loadData = async () => {
    if (!currentRegion) return;
    try {
      setLoading(true);
      setError(null);
      const [obs, t1, t2, changes] = await Promise.all([
        ecoguardApi.getObservations(currentRegion.id),
        ecoguardApi.getNdvi(currentRegion.id, 't1'),
        ecoguardApi.getNdvi(currentRegion.id, 't2'),
        ecoguardApi.getChangeDetection(currentRegion.id)
      ]);
      setObsMeta(obs);
      setNdviT1(t1);
      setNdviT2(t2);
      setChangeData(changes);
    } catch (err) {
      console.error(err);
      setError('Failed to load satellite observations and NDVI rasters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRegion]);

  if (loading) {
    return <LoadingSpinner message="Calculating Sentinel-2 NDVI surface reflectance arrays..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  const activeNdvi = selectedSlot === 't1' ? ndviT1 : ndviT2;
  const stats = activeNdvi?.stats || {};

  // Health distribution chart data
  const healthDistribution = [
    { name: 'Dense Canopy', pct: stats.dense_canopy_pct || 0, color: '#15803d' },
    { name: 'Moderate Veg.', pct: stats.moderate_veg_pct || 0, color: '#22c55e' },
    { name: 'Sparse/Scrub', pct: stats.sparse_degraded_pct || 0, color: '#fde047' },
    { name: 'Bare/Built', pct: stats.bare_built_pct || 0, color: '#94a3b8' },
    { name: 'Water Body', pct: stats.water_pct || 0, color: '#2563eb' }
  ];

  // Change detection breakdown data
  const changeDistribution = changeData ? [
    { name: 'Severe Decline (<-0.20)', pct: changeData.severe_decline_pct, color: '#b91c1c' },
    { name: 'Moderate Decline', pct: changeData.moderate_decline_pct, color: '#f97316' },
    { name: 'Stable Canopy', pct: changeData.stable_pct, color: '#94a3b8' },
    { name: 'Moderate Regrowth', pct: changeData.moderate_recovery_pct, color: '#4ade80' },
    { name: 'Significant Regrowth', pct: changeData.significant_regrowth_pct, color: '#15803d' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental Monitoring & Satellite Telemetry</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
              SENTINEL-2 MSI LEVEL-2A
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized NDVI computation from Band 8 (NIR) and Band 4 (Red) with multi-temporal change detection.
          </p>
        </div>

        {/* Observation Metadata Badge */}
        <div className="flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono">
          <Satellite className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-slate-500">Source: </span>
            <span className="font-semibold text-slate-800">{activeNdvi?.data_source}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">GSD: 10m Ground Sample</span>
        </div>
      </div>

      {/* Observation Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Mean Landscape NDVI</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">
            {stats.mean_ndvi?.toFixed(3)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Range: [{stats.min_ndvi?.toFixed(2)} to {stats.max_ndvi?.toFixed(2)}]
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dense Canopy Cover</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.dense_canopy_pct?.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            NDVI &ge; 0.60 threshold
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Disturbed / Bare Cells</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-0.5">
            {((stats.bare_built_pct || 0) + (stats.sparse_degraded_pct || 0)).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            NDVI &lt; 0.40 degraded footprint
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Net Vegetation Shift</span>
          <div className={`text-2xl font-bold font-mono mt-0.5 ${changeData?.net_vegetation_shift_ha < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {changeData?.net_vegetation_shift_ha > 0 ? `+${changeData?.net_vegetation_shift_ha}` : changeData?.net_vegetation_shift_ha} ha
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            T1 ({changeData?.baseline_date}) &rarr; T2 ({changeData?.comparison_date})
          </p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('change')}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 'change'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Multi-Temporal Change Detection (dNDVI)
        </button>
        <button
          onClick={() => { setActiveTab('dual'); }}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 'dual'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Side-by-Side Dual Period Comparison (T1 vs T2)
        </button>
        <button
          onClick={() => { setActiveTab('t2'); setSelectedSlot('t2'); }}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 't2'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Current Observation (T2)
        </button>
        <button
          onClick={() => { setActiveTab('t1'); setSelectedSlot('t1'); }}
          className={`pb-2 px-3 border-b-2 transition-colors ${
            activeTab === 't1'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Baseline Observation (T1)
        </button>
      </div>

      {/* Visualizer Panels */}
      {activeTab === 'change' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ChangeMatrixVisualizer
              changeMatrix={changeData?.change_matrix}
              baselineDate={changeData?.baseline_date}
              comparisonDate={changeData?.comparison_date}
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Scientific Explanation Summary Box */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Detection Synthesis & Investigation Guidance</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {changeData?.summary}
              </p>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 italic">
                Note: In accordance with scientific reporting standards, vegetation decline reflects measured biophysical
                spectral changes. Ground-truthing is required before definitively attributing to illegal logging or construction.
              </div>
            </div>

            {/* Threshold Classification Chart */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Threshold Classification Breakdown (% of landscape cells)
              </h4>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={changeDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val) => [`${val}% of surveyed cells`, 'Coverage']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                      {changeDistribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NdviGridVisualizer
            ndviMatrix={ndviT1?.ndvi_matrix}
            title={`Baseline Period (T1)`}
            observationDate={ndviT1?.observation_date}
          />
          <NdviGridVisualizer
            ndviMatrix={ndviT2?.ndvi_matrix}
            title={`Current Period (T2)`}
            observationDate={ndviT2?.observation_date}
          />
        </div>
      )}

      {(activeTab === 't1' || activeTab === 't2') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <NdviGridVisualizer
              ndviMatrix={activeNdvi?.ndvi_matrix}
              title={`NDVI Surface Grid (${activeTab.toUpperCase()})`}
              observationDate={activeNdvi?.observation_date}
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Health Categorization Chart */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vegetation Canopy Strata Breakdown ({activeNdvi?.observation_date})
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      formatter={(val) => [`${val}%`, 'Coverage']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {healthDistribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mathematical Formula Card */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Algorithmic Formulation</span>
              <div className="p-3 bg-white rounded border border-slate-200 font-mono text-center text-xs text-emerald-900 font-semibold">
                NDVI = (Band 8 NIR - Band 4 Red) / (Band 8 NIR + Band 4 Red)
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sentinel-2 MSI Level-2A surface reflectances. Invalid or negative denominator pixels are masked with NaN suppression.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

