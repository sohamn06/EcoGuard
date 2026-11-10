import React from 'react';
import {
  MapPin,
  Calendar,
  Bell,
  RefreshCw,
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopNavbar = () => {
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedSlot,
    setSelectedSlot,
    currentRegion,
    activeAlertsCount,
    setIsAlertDrawerOpen
  } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between z-20 shadow-xs">
      {/* Left: Region & Temporal Selectors */}
      <div className="flex items-center space-x-4">
        {/* Region Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Region:</span>
          </div>
          <div className="relative">
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.state})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Ecosystem Pill */}
        {currentRegion && (
          <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium truncate max-w-xs">{currentRegion.ecosystem_type}</span>
          </div>
        )}

        {/* Observation Period Toggle */}
        <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setSelectedSlot('t1')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSlot === 't1'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            T1 (Baseline)
          </button>
          <button
            onClick={() => setSelectedSlot('t2')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedSlot === 't2'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            T2 (Current)
          </button>
        </div>
      </div>

      {/* Right: Data Freshness, Alerts, Status */}
      <div className="flex items-center space-x-3">
        {/* Data Freshness Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px]">Telemetry Freshness: 98.4%</span>
        </div>

        {/* Alerts Bell Button */}
        <button
          onClick={() => setIsAlertDrawerOpen(prev => !prev)}
          className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200/70"
          title="Active Alerts Drawer"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full animate-bounce">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User / Org Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
            EG
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800">Gov. Field Command</div>
            <div className="text-[10px] text-slate-400 font-mono">Geospatial Unit</div>
          </div>
        </div>
      </div>
    </header>
  );
};

