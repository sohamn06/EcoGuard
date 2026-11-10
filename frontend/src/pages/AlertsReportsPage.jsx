import React, { useEffect, useState } from 'react';
import {
  BellRing,
  Filter,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  ShieldAlert,
  Printer,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { RiskBadge, LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const AlertsReportsPage = () => {
  const { regions, currentRegion, setActiveAlertsCount } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalAlert, setActiveModalAlert] = useState(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ecoguardApi.getAlerts(selectedSeverity, selectedRegionFilter);
      setAlerts(data);
      setActiveAlertsCount(data.filter(a => a.status === 'Active').length);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch environmental early-warning alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, selectedRegionFilter]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await ecoguardApi.updateAlertStatus(alertId, newStatus);
      loadAlerts();
      if (activeModalAlert && activeModalAlert.id === alertId) {
        setActiveModalAlert({ ...activeModalAlert, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = (regionId = currentRegion?.id || 'aravalli_ridge') => {
    const url = ecoguardApi.exportReportUrl(regionId, 'csv');
    window.open(url, '_blank');
  };

  const handleOpenExecutiveBrief = (regionId = currentRegion?.id || 'aravalli_ridge') => {
    const url = ecoguardApi.exportReportUrl(regionId, 'html');
    window.open(url, '_blank');
  };

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.id.toLowerCase().includes(q) ||
      a.region_name.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.detected_indicator.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental Alerts & Intelligence Reports</h1>
            <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-semibold">
              FIELD ACTION FEED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time threshold incident dispatch, audit trails, and compliance export reports.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenExecutiveBrief()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Executive Brief (HTML/PDF)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={() => handleExportCsv(currentRegion?.id || 'aravalli_ridge')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert ID or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-semibold">Landscape:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 cursor-pointer"
            >
              <option value="all">All Landscapes</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="font-mono text-slate-500 text-xs">
          Showing {filteredAlerts.length} Incident Records
        </div>
      </div>

      {loading && <LoadingSpinner message="Querying active incident warnings..." />}
      {error && <ErrorMessage message={error} onRetry={loadAlerts} />}

      {/* Alerts Table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Landscape Sector</th>
                  <th className="py-3 px-4">Detected Disturbance Metric</th>
                  <th className="py-3 px-4">Recommended Intervention</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No matching environmental alerts found.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alt) => (
                    <tr key={alt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{alt.id}</td>
                      <td className="py-3 px-4">
                        <RiskBadge level={alt.severity} score={alt.risk_score} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{alt.region_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{alt.timestamp}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{alt.detected_indicator}</div>
                        <div className="text-[11px] text-slate-500 truncate">{alt.message}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-emerald-800 font-medium truncate">
                        {alt.recommended_action}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alt.status === 'Active'
                            ? 'bg-rose-100 text-rose-800'
                            : alt.status === 'Acknowledged'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setActiveModalAlert(alt)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                          >
                            Details
                          </button>
                          {alt.status === 'Active' && (
                            <button
                              onClick={() => handleUpdateStatus(alt.id, 'Acknowledged')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-medium"
                            >
                              Acknowledge
                            </button>
                          )}
                          {alt.status !== 'Resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(alt.id, 'Resolved')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-medium"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-slate-500 font-semibold">{activeModalAlert.id}</span>
                <h3 className="font-bold text-slate-900 text-base">{activeModalAlert.region_name}</h3>
              </div>
              <RiskBadge level={activeModalAlert.severity} score={activeModalAlert.risk_score} size="md" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-600">Indicator Triggered:</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-slate-800 mt-1">
                  {activeModalAlert.detected_indicator}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-600">Incident Narrative:</span>
                <p className="text-slate-700 leading-relaxed mt-1">
                  {activeModalAlert.message}
                </p>
              </div>

              <div>
                <span className="font-semibold text-emerald-800">Operational Directive:</span>
                <p className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 font-medium mt-1">
                  {activeModalAlert.recommended_action}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-500">
                <span>Timestamp: {activeModalAlert.timestamp}</span>
                <span>Current Status: {activeModalAlert.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              {activeModalAlert.status !== 'Resolved' && (
                <button
                  onClick={() => handleUpdateStatus(activeModalAlert.id, 'Resolved')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setActiveModalAlert(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

