import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  Activity,
  AlertOctagon,
  Sparkles,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { RiskBadge, LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const RiskAnalysisPage = () => {
  const { currentRegion } = useApp();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable risk weights state
  const [weights, setWeights] = useState({
    vegetation_disturbance: 0.30,
    land_use_change: 0.25,
    rainfall_anomaly: 0.20,
    infrastructure_pressure: 0.15,
    historical_change: 0.10,
  });
  const [isCustomWeights, setIsCustomWeights] = useState(false);

  const loadAssessment = async (customW = null) => {
    if (!currentRegion) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ecoguardApi.analyzeRisk(currentRegion.id, customW);
      setAssessment(data);
    } catch (err) {
      console.error(err);
      setError('Failed to compute environmental risk matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
    setIsCustomWeights(false);
    setWeights({
      vegetation_disturbance: 0.30,
      land_use_change: 0.25,
      rainfall_anomaly: 0.20,
      infrastructure_pressure: 0.15,
      historical_change: 0.10,
    });
  }, [currentRegion]);

  const handleWeightChange = (key, val) => {
    const newWeights = { ...weights, [key]: parseFloat(val) };
    setWeights(newWeights);
    setIsCustomWeights(true);
  };

  const handleApplyWeights = () => {
    loadAssessment(weights);
  };

  const handleResetWeights = () => {
    const def = {
      vegetation_disturbance: 0.30,
      land_use_change: 0.25,
      rainfall_anomaly: 0.20,
      infrastructure_pressure: 0.15,
      historical_change: 0.10,
    };
    setWeights(def);
    setIsCustomWeights(false);
    loadAssessment(null);
  };

  if (loading && !assessment) {
    return <LoadingSpinner message="Running multi-factor risk inference engine..." />;
  }

  if (error && !assessment) {
    return <ErrorMessage message={error} onRetry={() => loadAssessment()} />;
  }

  // Format factors for Radar Chart
  const radarData = assessment?.factors?.map(f => ({
    subject: f.name.replace('Vegetation Canopy Disturbance', 'Canopy Loss')
      .replace('Land-Use & Built-up Encroachment', 'Land Conversion')
      .replace('Meteorological & Drought Stress', 'Drought Stress')
      .replace('Infrastructure & Mining Proximity', 'Infrastructure')
      .replace('Historical Ecosystem Vulnerability', 'Hist. Vulnerability'),
    score: Math.round(f.normalized_score * 100),
    contribution: Math.round(f.weighted_contribution)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI-Assisted Environmental Risk Engine</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
              EXPLAINABLE RISK MODEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normalized 5-factor transparent vulnerability indexing with machine learning anomaly detection.
          </p>
        </div>

        {assessment && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-mono">Assessed Classification</div>
              <RiskBadge level={assessment.risk_level} score={assessment.overall_risk_score} size="lg" />
            </div>
          </div>
        )}
      </div>

      {/* Primary Narrative & Anomaly Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Plain English Synthesis */}
        <div className="lg:col-span-8 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">Grounded Environmental Finding</h3>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Confidence: {(assessment?.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-slate-800 text-xs leading-relaxed">
            {assessment?.plain_english_summary}
          </p>

          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-semibold text-slate-600">Dominant Stress Drivers:</span>
            {assessment?.primary_drivers?.map((driver, idx) => (
              <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono font-semibold">
                {driver}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Anomaly Detection Status Card */}
        <div className={`lg:col-span-4 p-5 rounded-xl border space-y-2.5 ${
          assessment?.anomaly_detected
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-emerald-50/50 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">
              Statistical ML Baseline
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              assessment?.anomaly_detected
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {assessment?.anomaly_detected ? 'Anomaly Detected' : 'Nominal Envelope'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900">
            {assessment?.anomaly_method}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {assessment?.anomaly_detected
              ? `Multivariate observation diverges from seasonal baseline (score: ${assessment?.anomaly_score.toFixed(2)}/1.00). Unprecedented disturbance rate.`
              : `Observation aligns within typical multi-year seasonal distribution envelope (score: ${assessment?.anomaly_score.toFixed(2)}/1.00).`}
          </p>

          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-current/10">
            Note: Anomaly baseline runs Isolation Forest / Multivariate Z dispersion. No fabricated accuracy metrics.
          </div>
        </div>
      </div>

      {/* Factor Radar & Interactive Weights Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Factor Radar Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Multivariate Stress Profile
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Normalized Scale (0-100)</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Normalized Stress" dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.35} />
                <Tooltip
                  formatter={(val) => [`${val}/100`, 'Intensity']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Weights Controller */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Configurable Weighting Assumptions
              </h4>
              <p className="text-[11px] text-slate-500">
                Adjust factor weights to calibrate regional environmental sensitivities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isCustomWeights && (
                <button
                  onClick={handleResetWeights}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                >
                  Reset Defaults
                </button>
              )}
              <button
                onClick={handleApplyWeights}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Recalculate Score</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {assessment?.factors?.map((f) => {
              const currentWeight = weights[f.factor_key] || f.weight;
              return (
                <div key={f.factor_key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{f.name}</span>
                    <span className="font-mono text-slate-600 font-bold">
                      Weight: {(currentWeight * 100).toFixed(0)}% &bull; Contrib: {f.weighted_contribution.toFixed(1)} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.60"
                    step="0.05"
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(f.factor_key, e.target.value)}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-400 italic">{f.interpretation}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Factor Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quantitative Indicator Ledger & Breakdown
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Environmental Factor</th>
                <th className="py-2.5 px-4">Observed Metric</th>
                <th className="py-2.5 px-4">Normalized (0-1)</th>
                <th className="py-2.5 px-4">Configured Weight</th>
                <th className="py-2.5 px-4">Risk Contribution</th>
                <th className="py-2.5 px-4">Physical Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {assessment?.factors?.map((f) => (
                <tr key={f.factor_key} className="hover:bg-slate-50/70 font-sans">
                  <td className="py-3 px-4 font-semibold text-slate-900">{f.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {f.raw_value} <span className="text-[10px] text-slate-500 font-sans">{f.unit}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{f.normalized_score.toFixed(3)}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{(f.weight * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {f.weighted_contribution.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">pts</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] font-sans">{f.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Interventions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Decision-Maker Action Directives
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assessment?.recommended_actions?.map((act, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-800 leading-relaxed font-medium">{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

