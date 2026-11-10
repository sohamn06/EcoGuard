import React, { useEffect, useState } from 'react';
import { GitBranch, Activity, ShieldAlert, Sparkles, Layers, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ecoguardApi } from '../api/ecoguardApi';
import { DependencyGraphView } from '../components/graph/DependencyGraphView';
import { LoadingSpinner, ErrorMessage } from '../components/common/Common';

export const EcologicalGraphPage = () => {
  const { currentRegion } = useApp();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGraph = async () => {
    if (!currentRegion) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ecoguardApi.getEcologicalGraph(currentRegion.id);
      setGraphData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to compute ecological dependency relationships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [currentRegion]);

  if (loading && !graphData) {
    return <LoadingSpinner message="Simulating ecological shock propagation vectors..." />;
  }

  if (error && !graphData) {
    return <ErrorMessage message={error} onRetry={loadGraph} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ecological Dependency Graph</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
              CAUSAL PROPAGATION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Interactive system dynamics mapping how direct environmental disturbances cascade into downstream ecological outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Nodes: {graphData?.nodes?.length || 0} &bull; Active Disturbances: {graphData?.active_disturbances?.length || 0}</span>
        </div>
      </div>

      {/* Propagation Summary Callout */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">Cascading Propagation Inference</h4>
          <p className="text-slate-700 leading-relaxed">
            {graphData?.propagation_summary}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {graphData?.active_disturbances?.map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold border border-rose-300">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Component */}
      <div className="w-full">
        <DependencyGraphView graphData={graphData} />
      </div>

      {/* Scientific Methodology Disclaimer */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1.5 shadow-xs">
        <div className="flex items-center space-x-2 font-semibold text-slate-800">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Ecological Modeling Caveat & Model Assumptions</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          This dependency graph demonstrates prototype causal impact propagation based on established landscape ecology literature
          (Forman & Godron, 1986; Tilman et al., 1994). Transfer functions represent assumed empirical linear-damping relationships
          calibrated for decision evaluation rather than laboratory-validated bio-physical ecosystem equilibrium models.
        </p>
      </div>
    </div>
  );
};

