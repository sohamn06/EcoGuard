import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  TreePine,
  Activity,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { RegionalMap } from '../components/maps/RegionalMap';
import { RiskBadge, LoadingSpinner, ErrorMessage } from '../components/common/Common';
import { useNavigate } from 'react-router-dom';

export const OverviewPage = () => {
  const { currentRegion, setSelectedRegionId } = useApp();
  const [overviewData, setOverviewData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overview, risk] = await Promise.all([
        ecoguardApi.getOverview(currentRegion?.id),
        currentRegion ? ecoguardApi.analyzeRisk(currentRegion.id) : null
      ]);
      setOverviewData(overview);
      setRiskData(risk);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch operational environmental overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRegion]);

  if (loading && !overviewData) {
    return <LoadingSpinner message="Assembling geospatial early-warning feeds..." />;
  }

  if (error && !overviewData) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  const kpis = overviewData?.kpis || {};
  const focusRegion = overviewData?.focus_region;
  const riskTrend = overviewData?.risk_trend || [];
  const riskDistribution = overviewData?.risk_distribution || [];
  const disturbanceCategories = overviewData?.disturbance_categories || [];
  const recentAlerts = overviewData?.recent_alerts || [];
  const regionSummaries = overviewData?.region_summaries || [];

  const DISTURBANCE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#0284c7'];
  const RISK_LEVEL_COLORS = {
    Low: '#10b981',
    Moderate: '#f59e0b',
    High: '#f97316',
    Critical: '#ef4444'
  };

  const regionShiftHa = focusRegion?.net_shift_ha ?? kpis.net_vegetation_change_ha ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental Intelligence Overview</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
              {kpis.data_mode || 'CALIBRATED SAMPLE L2A'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Integrated satellite telemetry, canopy indices, and automated early-warning risk scores across {kpis.total_monitored_area_sqkm} km².
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Latest Observation: {kpis.last_pipeline_update || '--'}</span>
        </div>
      </div>

      {/* KPI Cards Row (All 6 values dynamically sourced from backend) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Overall Risk Score */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Overall Risk Score</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {kpis.overall_avg_risk_score}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
            <div className="text-[10px] text-rose-600 font-semibold">
              Critical in {kpis.critical_only_zones || 0} sector(s)
            </div>
          </div>

          {/* KPI 2: Vegetation Health */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold uppercase">Vegetation Health</span>
              <TreePine className="w-4 h-4 text-emerald-600" />
            </div>
              <div className="text-2xl font-bold font-mono text-emerald-800">
                {focusRegion?.mean_ndvi?.toFixed(3) ?? kpis.mean_ndvi?.toFixed(3) ?? '--'}
                <span className="text-xs font-normal text-slate-400"> NDVI</span>
              </div>
              <div className="text-[10px] text-amber-700 font-medium truncate">
                {kpis.vegetation_health_status}
              </div>
              </div>

              {/* KPI 3: Vegetation Change */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold uppercase">Vegetation Change</span>
                  {regionShiftHa < 0 ? (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className={`text-xl font-bold font-mono ${regionShiftHa < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {regionShiftHa > 0 ? `+${regionShiftHa}` : regionShiftHa} <span className="text-xs font-normal">ha</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {focusRegion ? `${focusRegion.severe_decline_pct}% severe decline` : 'Net multi-biome shift'}
                </div>
              </div>

              {/* KPI 4: Critical Disturbance Zones */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold uppercase">Disturbance Zones</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {kpis.critical_disturbance_zones}
                </div>
                <div className="text-[10px] text-slate-500">
                  High / Critical sectors
                </div>
              </div>

              {/* KPI 5: Active Environmental Alerts */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold uppercase">Active Alerts</span>
                  <Activity className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-600">
                  {kpis.active_alerts_count}
                </div>
                <div className="text-[10px] text-rose-700 font-semibold">
                  Threshold triggers active
                </div>
              </div>

              {/* KPI 6: Last Data Update */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold uppercase">Last Data Update</span>
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                  <div className="text-sm font-bold font-mono text-slate-900 pt-1">
                    {focusRegion?.last_observation || kpis.last_pipeline_update || '--'}
                  </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {currentRegion?.name || 'All Regions'}
                    </div>
                  </div>
                </div>

                {/* Main Map & Region Table Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Map */}
                  <div className="lg:col-span-8 flex flex-col space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Geospatial Disturbance Viewer</h3>
                        <p className="text-xs text-slate-500">
                          Observing {currentRegion?.name} ({currentRegion?.state}) with boundary and disturbance zones
                        </p>
                      </div>
                      {riskData && (
                        <RiskBadge level={riskData.risk_level} score={riskData.overall_risk_score} size="md" />
                      )}
                    </div>
                    <div className="h-[430px] w-full">
                      <RegionalMap region={currentRegion} riskData={riskData} />
                    </div>
                  </div>

                  {/* Right: Region Summaries Table */}
                  <div className="lg:col-span-4 flex flex-col space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Landscape Directory</h3>
                      <span className="text-xs font-mono text-slate-400">{regionSummaries.length} Biomes</span>
                    </div>
                    <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[430px] pr-1">
                      {regionSummaries.map((reg) => (
                        <div
                          key={reg.id}
                          onClick={() => setSelectedRegionId(reg.id)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${reg.id === currentRegion?.id
                              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-900 truncate max-w-[180px]">{reg.name}</h4>
                            <RiskBadge level={reg.risk_level} score={reg.risk_score} size="sm" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mb-1.5">{reg.ecosystem_type}</div>
                          <div className="flex items-center justify-between text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-slate-100 font-mono">
                            <span>Net Shift:</span>
                            <span className={reg.net_shift_ha < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                              {reg.net_shift_ha > 0 ? `+${reg.net_shift_ha}` : reg.net_shift_ha} ha
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analytics Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Risk & NDVI Trend Chart */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 lg:col-span-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Risk & NDVI Trend (6 Months)
                            </h4>
                            <p className="text-[11px] text-slate-500">Average risk index vs. canopy NDVI (&times;100)</p>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-mono">
                            <span className="flex items-center space-x-1">
                              <span className="w-2.5 h-2.5 rounded-xs bg-rose-600"></span>
                              <span>Risk</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                              <span>NDVI</span>
                            </span>
                          </div>
                        </div>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={riskTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[20, 80]} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                              />
                              <Line type="monotone" dataKey="avg_risk" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Risk Score" />
                              <Line
                                type="monotone"
                                dataKey={(d) => Math.round(d.canopy_index * 100)}
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{ r: 2 }}
                                name="NDVI (x100)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Distribution of Risk Levels */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 lg:col-span-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Risk Level Distribution
                          </h4>
                          <p className="text-[11px] text-slate-500">Regions by risk tier</p>
                        </div>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                              <Tooltip
                                formatter={(val) => [`${val} region(s)`, 'Count']}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                              />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {riskDistribution.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={RISK_LEVEL_COLORS[entry.name] || '#64748b'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Disturbance Categories Breakdown */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 lg:col-span-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Disturbance Drivers
                            </h4>
                            <p className="text-[11px] text-slate-500">Weighted factor share across regions</p>
                          </div>
                            <div className="h-36 w-full flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={disturbanceCategories}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={32}
                                    outerRadius={56}
                                    paddingAngle={3}
                                  >
                                    {disturbanceCategories.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color || DISTURBANCE_COLORS[index % DISTURBANCE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(val) => [`${val}%`, 'Share']}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#fff', fontSize: '11px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                                <div className="space-y-1 text-[11px]">
                                  {disturbanceCategories.map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between text-slate-600">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="truncate max-w-[140px]">{cat.name}</span>
                                      </div>
                                      <span className="font-mono font-bold text-slate-800">{cat.value}%</span>
                                    </div>
                                  ))}
                                </div>
        </div>
                          </div>

                          {/* Operational Alerts Feed */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">Recent Environmental Early Warnings</h3>
                                <p className="text-xs text-slate-500">Automated threshold triggers requiring field attention</p>
                              </div>
                              <button
                                onClick={() => navigate('/alerts')}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                              >
                                <span>View All Alerts Hub</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {recentAlerts.map((alt) => (
                                <div
                                  key={alt.id}
                                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${alt.severity === 'Critical'
                                      ? 'border-rose-200 bg-rose-50/40'
                                      : 'border-orange-200 bg-orange-50/30'
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <RiskBadge level={alt.severity} score={alt.risk_score} size="sm" />
                                      <span className="font-bold text-slate-900">{alt.region_name}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{alt.timestamp}</span>
                                  </div>
                                  <p className="text-slate-700 text-[11px] leading-relaxed">{alt.message}</p>
                                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                    <span className="text-emerald-800 font-medium">Recommended: {alt.recommended_action}</span>
                                    <span className="text-slate-400 font-mono">{alt.id}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        );
};
