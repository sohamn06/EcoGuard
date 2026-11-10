import React from 'react';

export const RiskBadge = ({ level, score = null, size = 'md' }) => {
  const normLevel = (level || 'Low').toLowerCase();

  const styles = {
    low: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/20',
    moderate: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/20',
    high: 'bg-orange-50 text-orange-800 border-orange-300 ring-orange-500/20',
    critical: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20'
  };

  const dots = {
    low: 'bg-emerald-500',
    moderate: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-rose-600 animate-pulse'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium'
  };

  const activeStyle = styles[normLevel] || styles.low;
  const activeDot = dots[normLevel] || dots.low;

  return (
    <span className={`inline-flex items-center rounded-full border shadow-xs font-semibold uppercase tracking-wider ${sizeClasses[size] || sizeClasses.md} ${activeStyle}`}>
      <span className={`w-2 h-2 rounded-full ${activeDot}`} />
      <span>{level}</span>
      {score !== null && (
        <span className="font-mono text-xs opacity-80 border-l border-current pl-1.5">
          {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
      )}
    </span>
  );
};

export const LoadingSpinner = ({ message = 'Processing geospatial telemetry...' }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
      <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
    </div>
    <p className="text-sm text-slate-500 font-medium tracking-wide animate-pulse">{message}</p>
  </div>
);

export const ErrorMessage = ({ message = 'Failed to load data', onRetry }) => (
  <div className="rounded-lg bg-rose-50 border border-rose-200 p-6 my-4 text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-700 mb-3">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h4 className="text-sm font-semibold text-rose-900 mb-1">Operational Exception</h4>
    <p className="text-xs text-rose-700 max-w-md mx-auto mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium shadow-sm transition-colors"
      >
        Retry Operation
      </button>
    )}
  </div>
);

