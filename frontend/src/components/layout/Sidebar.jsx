import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Satellite,
  ShieldAlert,
  GitBranch,
  SlidersHorizontal,
  BellRing,
  BookOpenText,
  Layers,
  Leaf
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const { activeAlertsCount } = useApp();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Environmental Monitoring', icon: Satellite },
    { to: '/risk-analysis', label: 'Risk Analysis', icon: ShieldAlert },
    { to: '/dependency-graph', label: 'Ecological Dependency Graph', icon: GitBranch },
    { to: '/simulator', label: 'Intervention Simulator', icon: SlidersHorizontal },
    { to: '/alerts', label: 'Alerts & Reports', icon: BellRing, badge: activeAlertsCount },
    { to: '/methodology', label: 'Data Sources & Methodology', icon: BookOpenText },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-navy-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-eco-600/20 border border-eco-500/40 flex items-center justify-center text-eco-400 shadow-inner">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">EcoGuard</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded">
                GEO-AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Environmental Early-Warning</p>
          </div>
        </div>
      </div>

      {/* Monitored System Status Pill */}
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">PIPELINE ACTIVE</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">SENTINEL-2 L2A</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Intelligence Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-600/40 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-400" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Operational Workflow Summary */}
      <div className="p-3 mx-3 mb-4 rounded-md border border-slate-800 bg-slate-900/50">
        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center space-x-1">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>Core Workflow</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-1">
          <span className="text-emerald-400">DETECT</span> &rarr;
          <span className="text-emerald-400">ANALYZE</span> &rarr;
          <span className="text-emerald-400">EXPLAIN</span> &rarr;
          <span className="text-amber-400">SIMULATE</span> &rarr;
          <span className="text-emerald-300">INTERVENE</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>EcoGuard v1.0.0</span>
        <span className="text-emerald-500 font-medium">Hackathon Ready</span>
      </div>
    </aside>
  );
};

