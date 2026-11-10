import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';

export const CustomGraphNode = memo(({ data, selected }) => {
  const { label, category, status, severity, metric, mitigation_lever } = data;

  const statusStyles = {
    stable: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50/90',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      bar: 'bg-emerald-500',
      icon: CheckCircle
    },
    moderate: {
      border: 'border-amber-400',
      bg: 'bg-amber-50/90',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      bar: 'bg-amber-500',
      icon: Activity
    },
    high: {
      border: 'border-orange-500',
      bg: 'bg-orange-50/90',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      bar: 'bg-orange-500',
      icon: AlertCircle
    },
    critical: {
      border: 'border-rose-600',
      bg: 'bg-rose-50/95',
      badge: 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-500/20',
      bar: 'bg-rose-600',
      icon: AlertCircle
    }
  };

  const style = statusStyles[status?.toLowerCase()] || statusStyles.moderate;
  const Icon = style.icon;

  return (
    <div
      className={`w-64 rounded-xl border-2 shadow-md transition-all ${style.border} ${style.bg} ${
        selected ? 'ring-4 ring-emerald-500/40 shadow-xl scale-105' : 'hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-slate-700 !border-2 !border-white"
      />

      <div className="p-3.5 space-y-2">
        {/* Top: Category & Status */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 tracking-wider">
            {category}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
            {status}
          </span>
        </div>

        {/* Node Label */}
        <div className="flex items-start space-x-2">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.bar.replace('bg-', 'text-')}`} />
          <h4 className="text-xs font-bold text-slate-900 leading-tight">{label}</h4>
        </div>

        {/* Severity Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Disturbance Severity</span>
            <span className="font-bold text-slate-800">{(severity * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${Math.min(100, Math.max(5, severity * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric preview */}
        <div className="text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200/70 truncate">
          <span className="font-semibold text-slate-700">Indicator:</span> {metric}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-600 !border-2 !border-white"
      />
    </div>
  );
});

