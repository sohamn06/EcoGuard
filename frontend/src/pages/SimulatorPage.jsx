import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Save,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  TreePine,
  ShieldCheck,
  Droplets,
  Layers,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { RiskBadge, LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const SimulatorPage = () => {
  const { currentRegion } = useApp();
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [timeframe, setTimeframe] = useState(5);

  // Intervention controls
  const [interventions, setInterventions] = useState([
    {
      id: 'construction_restriction',
      name: 'Buffer Zone Construction Bans & Moratorium',
      active: true,
      intensity: 80,
      coverage_pct: 75,
      description: 'Halt earthmoving and quarrying permits in 5km contiguous buffer.'
    },
    {
      id: 'afforestation',
      name: 'Endemic Pioneer Species Afforestation',
      active: true,
      intensity: 70,
      coverage_pct: 60,
      description: 'Hydroseeding and native broadleaf tree planting in canopy gaps.'
    },
    {
      id: 'water_conservation',
      name: 'Catchment Check-Dams & Recharge Pits',
      active: false,
      intensity: 60,
      coverage_pct: 40,
      description: 'Runoff retention weirs to replenish water table infiltration.'
    },
    {
      id: 'soil_restoration',
      name: 'Contour Bunding & Vetiver Bio-Fencing',
      active: false,
      intensity: 50,
      coverage_pct: 50,
      description: 'Mechanical sediment traps on cleared hillsides to prevent erosion.'
    },
    {
      id: 'habitat_restoration',
      name: 'Wildlife Eco-Corridor Reconnection',
      active: false,
      intensity: 65,
      coverage_pct: 45,
      description: 'Vegetated overpasses across highways to restore genetic flow.'
    }
  ]);

  const runSim = async (currentInvs = interventions, years = timeframe) => {
    if (!currentRegion) return;
    try {
      setLoading(true);
      setError(null);
      const res = await ecoguardApi.runSimulation(currentRegion.id, currentInvs, years);
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
      setError('Simulation engine failed to compute scenario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, [currentRegion]);

  const toggleIntervention = (id) => {
    const updated = interventions.map(inv =>
      inv.id === id ? { ...inv, active: !inv.active } : inv
    );
    setInterventions(updated);
  };

  const updateParam = (id, field, val) => {
    const updated = interventions.map(inv =>
      inv.id === id ? { ...inv, [field]: parseFloat(val) } : inv
    );
    setInterventions(updated);
  };

  const handleReset = () => {
    const def = interventions.map((inv, idx) => ({
      ...inv,
      active: idx < 2,
      intensity: 60,
      coverage_pct: 50
    }));
    setInterventions(def);
    setTimeframe(5);
    runSim(def, 5);
  };

  const handleSaveScenario = () => {
    if (!simulationResult) return;
    const newSaved = {
      id: Date.now(),
      name: `Scenario ${savedScenarios.length + 1} (${currentRegion?.name})`,
      risk_reduction: simulationResult.risk_reduction_pct,
      sim_score: simulationResult.simulated_risk_score,
      timeframe,
      active_interventions: interventions.filter(i => i.active).map(i => i.name)
    };
    setSavedScenarios([newSaved, ...savedScenarios]);
  };

  // Comparative factor breakdown for chart
  const factorComparison = simulationResult ? Object.keys(simulationResult.baseline_factors).map(k => {
    const formatName = (key) => {
      switch (key) {
        case 'vegetation_disturbance': return 'Canopy Loss';
        case 'land_use_change': return 'Land Conversion';
        case 'rainfall_anomaly': return 'Drought Deficit';
        case 'infrastructure_pressure': return 'Infrastructure';
        case 'historical_change': return 'Hist. Vulnerability';
        default: return key;
      }
    };
    return {
      name: formatName(k),
      baseline: Math.round(simulationResult.baseline_factors[k] * 100),
      simulated: Math.round(simulationResult.simulated_factors[k] * 100)
    };
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">What-If Intervention Simulator</h1>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-semibold">
              PREDICTIVE SCENARIO ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate combinations of policy, regulatory, and ecological interventions to evaluate risk mitigation pathways.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveScenario}
            disabled={!simulationResult}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Scenario</span>
          </button>
          <button
            onClick={() => runSim()}
            disabled={loading}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => runSim()} />}

      {/* Simulator Control & Metric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intervention Sliders & Toggles */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Intervention Levers & Configuration
                </h3>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Horizon:</span>
                <select
                  value={timeframe}
                  onChange={(e) => {
                    const y = parseInt(e.target.value);
                    setTimeframe(y);
                    runSim(interventions, y);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded text-xs px-2 py-0.5 font-bold text-slate-700"
                >
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                </select>
              </div>
            </div>

            {/* List of Interventions */}
            <div className="space-y-4">
              {interventions.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    inv.active
                      ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 opacity-75'
                  }`}
                >
                  {/* Toggle Header */}
                  <div className="flex items-start justify-between">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inv.active}
                        onChange={() => toggleIntervention(inv.id)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{inv.name}</h4>
                        <p className="text-[11px] text-slate-500">{inv.description}</p>
                      </div>
                    </label>
                  </div>

                  {/* Sliders when active */}
                  {inv.active && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-4">
                      {/* Intensity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-600">Enforcement Intensity</span>
                          <span className="font-bold text-emerald-800">{inv.intensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={inv.intensity}
                          onChange={(e) => updateParam(inv.id, 'intensity', e.target.value)}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Coverage */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-600">Buffer Coverage</span>
                          <span className="font-bold text-emerald-800">{inv.coverage_pct}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={inv.coverage_pct}
                          onChange={(e) => updateParam(inv.id, 'coverage_pct', e.target.value)}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Outcomes & Charts */}
        <div className="lg:col-span-6 space-y-4">
          {/* Baseline vs Scenario Meter Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Projected Risk Impact Assessment
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Baseline */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Current Baseline</span>
                <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {simulationResult?.baseline_risk_score?.toFixed(1) || '--'}
                </div>
                <span className="text-[10px] text-slate-500">Unmitigated Risk</span>
              </div>

              {/* Simulated */}
              <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-300">
                <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold">Simulated Outcome</span>
                <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                  {simulationResult?.simulated_risk_score?.toFixed(1) || '--'}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Intervention Adjusted</span>
              </div>

              {/* Delta */}
              <div className="p-3 bg-emerald-100/60 rounded-lg border border-emerald-300">
                <span className="text-[10px] font-mono uppercase text-emerald-900 font-semibold">Risk Reduction</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  -{simulationResult?.risk_reduction_pct?.toFixed(1) || 0}%
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold">Projected Efficacy</span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-emerald-800">Recommendation Synthesis: </span>
              {simulationResult?.recommended_pathway}
            </div>

            {/* Ecological Benefits List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase">Projected Ecological Yields:</span>
              {simulationResult?.ecological_benefits?.map((b, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Year Trajectory Line Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Multi-Year Trajectory (Baseline vs Intervention)
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Risk Score Projection</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationResult?.trajectory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} tick={{ fontSize: 11 }} />
                  <YAxis domain={[10, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [`${val}/100`, name]}
                    labelFormatter={(y) => `Projection Horizon: Year ${y}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="baseline_risk" name="Unmitigated Drift" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="simulated_risk" name="Intervention Pathway" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor Mitigation Comparative Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Factor-Level Stress Reduction (Baseline vs Simulated)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={factorComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [`${val}/100`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="baseline" name="Baseline Stress" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="simulated" name="Simulated Stress" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions Footer */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-700">Model Assumptions & Calibration Scope:</div>
        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
          {simulationResult?.assumptions?.map((asm, i) => (
            <li key={i}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

