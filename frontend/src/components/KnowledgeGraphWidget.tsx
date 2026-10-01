import React, { useState } from 'react';
import type { KnowledgeGraphData, KnowledgeGraphNode } from '../types';
import { Network, AlertTriangle, ShieldCheck, Info, Sparkles } from 'lucide-react';

interface KnowledgeGraphWidgetProps {
  kgData: KnowledgeGraphData | null;
  loading: boolean;
  ticker: string;
}

export const KnowledgeGraphWidget: React.FC<KnowledgeGraphWidgetProps> = ({
  kgData,
  loading,
  ticker
}) => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg text-center animate-pulse">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
          <Network className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs text-slate-400">Extracting entity relations and constructing Financial News Knowledge Graph for {ticker}...</p>
      </div>
    );
  }

  if (!kgData || kgData.nodes.length === 0) {
    return null;
  }

  const { nodes, edges, summary, hasHighRiskEdge, companyName } = kgData;

  // Layout calculations: Place central node in center, distribute other nodes in an elliptical orbit
  const width = 640;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = 220;
  const radiusY = 100;

  const otherNodes = nodes.filter(n => n.id !== 'target_company');
  const totalOther = otherNodes.length;

  const nodePositions: Record<string, { x: number; y: number }> = {
    target_company: { x: centerX, y: centerY }
  };

  otherNodes.forEach((node, idx) => {
    const angle = (2 * Math.PI * idx) / totalOther - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle)
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Financial News Knowledge Graph</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                news_KG Entity Extraction
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounding qualitative news headlines for <span className="text-indigo-300 font-medium">{companyName || ticker}</span> into verified entity-relation triples
            </p>
          </div>
        </div>

        {/* Risk / Sentiment Flag */}
        <div>
          {hasHighRiskEdge ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/40 rounded-full text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Direct Accounting/Headline Scrutiny Flagged</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Constructive Entity Alignment</span>
            </span>
          )}
        </div>
      </div>

      {/* Narrative Summary Strip */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-4 text-xs text-slate-300 flex items-center gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>{summary}</span>
      </div>

      {/* SVG Interactive Graph Canvas & Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* SVG Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800/80 p-2 relative overflow-hidden flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 select-none">
            {/* Defs for arrow markers */}
            <defs>
              <marker id="arrow-pos" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-neg" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker id="arrow-neu" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Relationship Edges */}
            {edges.map((edge, idx) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;

              const isNeg = edge.polarity === 'negative';
              const isPos = edge.polarity === 'positive';
              const strokeColor = isNeg ? '#f43f5e' : (isPos ? '#10b981' : '#6366f1');
              const markerId = isNeg ? 'arrow-neg' : (isPos ? 'arrow-pos' : 'arrow-neu');

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={isNeg ? 2 : 1.5}
                    strokeDasharray={isNeg ? "4 3" : undefined}
                    strokeOpacity={0.7}
                    markerEnd={`url(#${markerId})`}
                  />
                  {/* Relation Label Pill */}
                  <rect
                    x={midX - 45}
                    y={midY - 8}
                    width={90}
                    height={16}
                    rx={4}
                    fill="#090d16"
                    stroke={strokeColor}
                    strokeWidth={0.8}
                    opacity={0.9}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={strokeColor}
                    fontSize={8}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Entity Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const isSelected = selectedNode?.id === node.id;
              const isCore = node.id === 'target_company';

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer glow ring for selected or core */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isCore ? 30 : 20}
                    fill={node.color}
                    fillOpacity={isSelected ? 0.35 : (isCore ? 0.2 : 0.1)}
                    stroke={node.color}
                    strokeWidth={isSelected ? 2 : (isCore ? 1.5 : 1)}
                    className="transition-all"
                  />

                  {/* Inner solid node dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isCore ? 14 : 9}
                    fill={node.color}
                  />

                  {/* Node Label Text */}
                  <text
                    x={pos.x}
                    y={pos.y + (isCore ? 28 : 22)}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={isCore ? 11 : 9}
                    fontWeight={isCore ? "bold" : "normal"}
                    fontFamily="sans-serif"
                    className="pointer-events-none"
                  >
                    {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Inspector Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-col justify-between h-64">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Entity Inspector (Click any node)</span>
            </div>

            {selectedNode ? (
              <div className="space-y-2 animate-fade-in">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedNode.color }}></span>
                  <span>{selectedNode.label}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Category:</strong> {selectedNode.category.toUpperCase()} ({selectedNode.type})
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  {selectedNode.details || "No further details available for this entity."}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-6 text-center">
                <p>Click on any node in the Knowledge Graph to inspect its verified context, news headline source, and relationship edges.</p>
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Company</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Risk Factor</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Macro / Fed</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Tech Catalyst</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>Graph Nodes: {nodes.length} | Edges: {edges.length}</span>
            <span className="text-indigo-400">news_KG Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
