import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomGraphNode } from './CustomGraphNode';
import { GitBranch, ArrowRight, ArrowLeft, ShieldAlert, Sparkles, X, Info } from 'lucide-react';
import { RiskBadge } from '../common/Common';

const nodeTypes = {
  custom: CustomGraphNode,
};

export const DependencyGraphView = ({ graphData }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const initialNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    return graphData.nodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position || { x: 100, y: 100 },
      data: {
        label: n.label,
        category: n.category,
        status: n.status,
        severity: n.severity,
        description: n.description,
        metric: n.metric,
        mitigation_lever: n.mitigation_lever
      }
    }));
  }, [graphData]);

  const initialEdges = useMemo(() => {
    if (!graphData?.edges) return [];
    return graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.strength > 0.7,
      style: { stroke: e.strength > 0.75 ? '#dc2626' : '#64748b', strokeWidth: Math.max(1.5, e.strength * 3) },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.strength > 0.75 ? '#dc2626' : '#64748b'
      }
    }));
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when graphData updates
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !graphData?.nodes) return null;
    return graphData.nodes.find(n => n.id === selectedNodeId);
  }, [selectedNodeId, graphData]);

  // Compute upstream causes and downstream consequences for selected node
  const upstreamCauses = useMemo(() => {
    if (!selectedNodeId || !graphData?.edges) return [];
    const incomingEdges = graphData.edges.filter(e => e.target === selectedNodeId);
    return incomingEdges.map(e => {
      const srcNode = graphData.nodes.find(n => n.id === e.source);
      return { node: srcNode, edge: e };
    });
  }, [selectedNodeId, graphData]);

  const downstreamConsequences = useMemo(() => {
    if (!selectedNodeId || !graphData?.edges) return [];
    const outgoingEdges = graphData.edges.filter(e => e.source === selectedNodeId);
    return outgoingEdges.map(e => {
      const tgtNode = graphData.nodes.find(n => n.id === e.target);
      return { node: tgtNode, edge: e };
    });
  }, [selectedNodeId, graphData]);

  return (
    <div className="relative w-full h-[650px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
      {/* Top Banner */}
      <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-700 text-xs shadow-lg max-w-md">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
          <GitBranch className="w-4 h-4" />
          <span>Interactive Ecological Dependency Graph</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Click any node to trace upstream disturbance drivers and downstream cascading impacts.
        </p>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background color="#334155" gap={18} size={1} />
        <Controls className="!bg-slate-800 !border-slate-700 !text-white" />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.status === 'critical') return '#ef4444';
            if (n.data?.status === 'high') return '#f97316';
            if (n.data?.status === 'moderate') return '#f59e0b';
            return '#10b981';
          }}
          className="!bg-slate-900 !border-slate-700 rounded-lg"
        />
      </ReactFlow>

      {/* Side Inspection Drawer when node clicked */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-20 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs flex flex-col max-h-[600px] animate-in fade-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">{selectedNode.category}</span>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Status & Severity */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-600 font-medium">Stress Classification:</span>
              <RiskBadge level={selectedNode.status} score={selectedNode.severity} size="sm" />
            </div>

            {/* Scientific Description */}
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">Ecological Role</h5>
              <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                {selectedNode.description}
              </p>
            </div>

            {/* Upstream Root Causes */}
            <div>
              <div className="flex items-center space-x-1.5 text-slate-800 font-semibold mb-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
                <span>Upstream Direct Drivers ({upstreamCauses.length})</span>
              </div>
              {upstreamCauses.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded">
                  Root stressor (no upstream dependencies within model boundaries).
                </div>
              ) : (
                <div className="space-y-1.5">
                  {upstreamCauses.map(({ node, edge }) => (
                    <div key={edge.id} className="p-2 rounded bg-amber-50/60 border border-amber-200 text-[11px]">
                      <div className="font-semibold text-amber-900">{node?.label || edge.source}</div>
                      <div className="text-amber-700 text-[10px]">{edge.label} (weight {edge.strength})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Cascading Consequences */}
            <div>
              <div className="flex items-center space-x-1.5 text-slate-800 font-semibold mb-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Downstream Cascading Impacts ({downstreamConsequences.length})</span>
              </div>
              {downstreamConsequences.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded">
                  Terminal ecosystem impact node.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {downstreamConsequences.map(({ node, edge }) => (
                    <div key={edge.id} className="p-2 rounded bg-rose-50/60 border border-rose-200 text-[11px]">
                      <div className="font-semibold text-rose-900">{node?.label || edge.target}</div>
                      <div className="text-rose-700 text-[10px]">{edge.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Targeted Mitigation Lever */}
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px]">
              <div className="flex items-center space-x-1 font-semibold text-emerald-900 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Recommended Mitigation Lever:</span>
              </div>
              <p className="text-emerald-800">{selectedNode.mitigation_lever}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

