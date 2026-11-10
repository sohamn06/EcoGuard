import React, { useState, useEffect } from 'react';
import { X, Bell, ExternalLink, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ecoguardApi } from '../../api/ecoguardApi';
import { RiskBadge } from '../common/Common';
import { useNavigate } from 'react-router-dom';

export const AlertDrawer = () => {
  const { isAlertDrawerOpen, setIsAlertDrawerOpen, setActiveAlertsCount } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await ecoguardApi.getAlerts();
      setAlerts(data);
      setActiveAlertsCount(data.filter(a => a.status === 'Active').length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAlertDrawerOpen) {
      loadAlerts();
    }
  }, [isAlertDrawerOpen]);

  const handleAcknowledge = async (alertId) => {
    try {
      await ecoguardApi.updateAlertStatus(alertId, 'Acknowledged');
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAlertDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Environmental Alert Stream</h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {alerts.filter(a => a.status === 'Active').length} Active
            </span>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">No active alerts recorded.</div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                  alt.severity === 'Critical'
                    ? 'border-rose-300 bg-rose-50/50'
                    : alt.severity === 'High'
                    ? 'border-orange-300 bg-orange-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RiskBadge level={alt.severity} score={alt.risk_score} size="sm" />
                  <span className="font-mono text-[10px] text-slate-400">{alt.id}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{alt.region_name}</h4>
                  <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{alt.message}</p>
                </div>
                <div className="p-2 bg-white/80 rounded border border-slate-100 text-[11px] text-slate-700">
                  <strong className="text-emerald-800">Action:</strong> {alt.recommended_action}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-mono">Status: {alt.status}</span>
                  {alt.status === 'Active' && (
                    <button
                      onClick={() => handleAcknowledge(alt.id)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-medium text-slate-700 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setIsAlertDrawerOpen(false);
              navigate('/alerts');
            }}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
          >
            <span>View Full Alerts & Reports Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

