import React, { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  MarkerType, 
  Handle, 
  Position,
  type Node, 
  type Edge, 
  type NodeProps 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { SupplyChainResponse, SupplyChainItem } from '../types';
import { FactCheckCitationDrawer } from './FactCheckCitationDrawer';
import { 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Building2, 
  DollarSign, 
  Compass, 
  Search,
  Info 
} from 'lucide-react';

// Custom Node for the Target Company (Centerpiece)
const TargetCompanyNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="relative px-6 py-4 rounded-xl bg-slate-900 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] min-w-[210px] text-center select-none">
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-emerald-400 border border-slate-900" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-emerald-400 border border-slate-900" />
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-purple-400 border border-slate-900" id="top" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-purple-400 border border-slate-900" id="bottom" />

      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-0.5 flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Target Enterprise</span>
      </div>
      <div className="font-bold text-white text-base tracking-tight truncate">
        {String(data.label || '')}
      </div>
      <div className="text-xs font-mono text-emerald-400/90 font-semibold mt-0.5">
        {String(data.ticker || '')}
      </div>
    </div>
  );
};

// Custom Node for Supply Chain Counterparties
const EntityNode: React.FC<NodeProps> = ({ data }) => {
  const d = data as unknown as SupplyChainItem & { isMatched?: boolean };
  const isSupplier = d.relationship_type === 'Supplier';
  const isCustomer = d.relationship_type === 'Customer';
  const isPartner = d.relationship_type === 'Partner';
  const isSingleSource = d.concentration_risk === 'Critical Single-Source';
  const isMatched = Boolean(d.isMatched);

  let borderColor = 'border-slate-800';
  let badgeBg = 'bg-slate-800 text-slate-300';
  let icon = <Compass className="w-3.5 h-3.5 text-purple-400" />;

  if (isSupplier) {
    borderColor = isSingleSource ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-amber-500/60';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    icon = <Building2 className="w-3.5 h-3.5 text-amber-400" />;
  } else if (isCustomer) {
    borderColor = 'border-blue-500/60';
    badgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    icon = <DollarSign className="w-3.5 h-3.5 text-blue-400" />;
  } else if (isPartner) {
    borderColor = 'border-purple-500/60';
    badgeBg = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  }

  return (
    <div className={`relative px-3.5 py-2.5 rounded-xl bg-slate-900 border ${borderColor} ${
      isMatched ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105' : ''
    } hover:border-white transition-all duration-200 cursor-pointer min-w-[210px] max-w-[250px] shadow-lg group select-none`}>
      {/* Handles */}
      {isSupplier && (
        <>
          <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-amber-400 border border-slate-900" />
          <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-amber-400 border border-slate-900" />
        </>
      )}
      {isCustomer && (
        <>
          <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-400 border border-slate-900" />
          <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-400 border border-slate-900" />
        </>
      )}
      {isPartner && (
        <>
          <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-purple-400 border border-slate-900" />
          <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-purple-400 border border-slate-900" />
        </>
      )}

      {/* Header: Role & Concentration */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${badgeBg}`}>
            {icon}
            <span>{d.relationship_type}</span>
          </span>
          {d.tier && (
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {d.tier}
            </span>
          )}
        </div>
        
        {isSingleSource ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase animate-pulse">
            Sole-Source
          </span>
        ) : (
          d.region && (
            <span className="text-[10px] text-slate-400">
              {d.region}
            </span>
          )
        )}
      </div>

      {/* Entity Name & Ticker */}
      <div className="flex items-baseline justify-between gap-1">
        <div className="font-bold text-white text-xs truncate group-hover:text-amber-300 transition-colors">
          {d.entity_name}
        </div>
        {d.ticker_symbol && (
          <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
            {d.ticker_symbol}
          </span>
        )}
      </div>

      {/* Category / Role */}
      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
        {d.category}
      </div>

      {/* Material BOM / Revenue Share Pill */}
      {d.cogs_or_rev_share && (
        <div className="text-[9px] text-amber-300/90 font-mono truncate mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
          {d.cogs_or_rev_share}
        </div>
      )}

      {/* Click Hint Bar */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 group-hover:text-indigo-400 transition-colors">
        <span className="font-mono">SEC Citation</span>
        <span>Click to fact-check →</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  targetCompany: TargetCompanyNode,
  entityNode: EntityNode,
};

interface SupplyChainGraphProps {
  data: SupplyChainResponse | null;
  loading: boolean;
  ticker: string;
}

export const SupplyChainGraph: React.FC<SupplyChainGraphProps> = ({
  data,
  loading,
  ticker
}) => {
  const [selectedItem, setSelectedItem] = useState<SupplyChainItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'Tier 1' | 'Tier 2' | 'Customer' | 'Partner' | 'SINGLE_SOURCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Node Click to slide out citation drawer
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.id === 'target_company_node') return;
    const item = node.data?.rawItem as SupplyChainItem | undefined;
    if (item) {
      setSelectedItem(item);
      setIsDrawerOpen(true);
    }
  }, []);

  // Filter items
  const filteredRelationships = useMemo(() => {
    if (!data?.relationships) return [];
    let list = data.relationships;

    if (filterType === 'SINGLE_SOURCE') {
      list = list.filter(r => r.concentration_risk === 'Critical Single-Source');
    } else if (filterType === 'Tier 1') {
      list = list.filter(r => r.relationship_type === 'Supplier' && r.tier === 'Tier 1');
    } else if (filterType === 'Tier 2') {
      list = list.filter(r => r.tier === 'Tier 2');
    } else if (filterType === 'Customer') {
      list = list.filter(r => r.relationship_type === 'Customer');
    } else if (filterType === 'Partner') {
      list = list.filter(r => r.relationship_type === 'Partner');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.entity_name.toLowerCase().includes(q) || 
        r.category.toLowerCase().includes(q) ||
        (r.ticker_symbol && r.ticker_symbol.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, filterType, searchQuery]);

  // Construct Multi-Tiered Hierarchical Pipeline Layout
  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const tier2Suppliers = filteredRelationships.filter(r => r.tier === 'Tier 2');
    const tier1Suppliers = filteredRelationships.filter(r => r.relationship_type === 'Supplier' && r.tier !== 'Tier 2');
    const directCustomers = filteredRelationships.filter(r => r.relationship_type === 'Customer' && r.tier !== 'OEM Channel');
    const channelCustomers = filteredRelationships.filter(r => r.relationship_type === 'Customer' && r.tier === 'OEM Channel');
    const partners = filteredRelationships.filter(r => r.relationship_type === 'Partner');

    const allCustomers = [...directCustomers, ...channelCustomers];

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Center focal company
    const centerX = 640;
    const centerY = 280;

    generatedNodes.push({
      id: 'target_company_node',
      type: 'targetCompany',
      position: { x: centerX, y: centerY },
      data: {
        label: data.company_name,
        ticker: data.ticker
      }
    });

    const itemHeight = 105;

    // 1. Column 1: Tier 2 Critical Suppliers & Tooling (X = 40)
    const t2StartY = Math.max(40, centerY - ((tier2Suppliers.length - 1) * itemHeight) / 2);
    tier2Suppliers.forEach((s, idx) => {
      const nodeId = `t2_${idx}`;
      const posY = t2StartY + idx * itemHeight;
      const isMatched = searchQuery.trim().length > 0 && s.entity_name.toLowerCase().includes(searchQuery.toLowerCase());

      generatedNodes.push({
        id: nodeId,
        type: 'entityNode',
        position: { x: 40, y: posY },
        data: { ...s, rawItem: s, isMatched }
      });

      // Connect Tier 2 to Tier 1 or target
      generatedEdges.push({
        id: `e-${nodeId}-t1`,
        source: nodeId,
        target: 'target_company_node',
        style: { stroke: '#818cf8', strokeWidth: 1.5, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }
      });
    });

    // 2. Column 2: Tier 1 Direct Suppliers (X = 330)
    const t1StartY = Math.max(30, centerY - ((tier1Suppliers.length - 1) * itemHeight) / 2);
    tier1Suppliers.forEach((s, idx) => {
      const nodeId = `t1_${idx}`;
      const posY = t1StartY + idx * itemHeight;
      const isSingle = s.concentration_risk === 'Critical Single-Source';
      const isMatched = searchQuery.trim().length > 0 && s.entity_name.toLowerCase().includes(searchQuery.toLowerCase());

      generatedNodes.push({
        id: nodeId,
        type: 'entityNode',
        position: { x: 330, y: posY },
        data: { ...s, rawItem: s, isMatched }
      });

      generatedEdges.push({
        id: `e-${nodeId}-target`,
        source: nodeId,
        target: 'target_company_node',
        animated: isSingle,
        style: { 
          stroke: isSingle ? '#f43f5e' : '#f59e0b', 
          strokeWidth: isSingle ? 2.5 : 1.8 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSingle ? '#f43f5e' : '#f59e0b'
        }
      });
    });

    // 3. Column 3: Downstream Customers & Distribution Channels (X = 960)
    const custStartY = Math.max(30, centerY - ((allCustomers.length - 1) * itemHeight) / 2);
    allCustomers.forEach((c, idx) => {
      const nodeId = `cust_${idx}`;
      const posY = custStartY + idx * itemHeight;
      const isMatched = searchQuery.trim().length > 0 && c.entity_name.toLowerCase().includes(searchQuery.toLowerCase());

      generatedNodes.push({
        id: nodeId,
        type: 'entityNode',
        position: { x: 960, y: posY },
        data: { ...c, rawItem: c, isMatched }
      });

      generatedEdges.push({
        id: `e-target-${nodeId}`,
        source: 'target_company_node',
        target: nodeId,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6'
        }
      });
    });

    // 4. Strategic Alliances & Partners Top & Bottom (X = 640)
    partners.forEach((p, idx) => {
      const nodeId = `partner_${idx}`;
      const isTop = idx % 2 === 0;
      const posX = centerX + (idx > 1 ? (idx % 2 === 0 ? -140 : 140) : 0);
      const posY = isTop ? 40 : 520;
      const isMatched = searchQuery.trim().length > 0 && p.entity_name.toLowerCase().includes(searchQuery.toLowerCase());

      generatedNodes.push({
        id: nodeId,
        type: 'entityNode',
        position: { x: posX, y: posY },
        data: { ...p, rawItem: p, isMatched }
      });

      generatedEdges.push({
        id: `e-${nodeId}-target`,
        source: nodeId,
        target: 'target_company_node',
        style: { stroke: '#c084fc', strokeWidth: 1.8, strokeDasharray: '4 4' }
      });
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [data, filteredRelationships, searchQuery]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg text-center animate-pulse">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Network className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Ingesting SEC Form 10-K & Regulatory Filings...</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Extracting audited supply chain counterparties, verbatim quotes, and concentration bottlenecks for {ticker}.
        </p>
      </div>
    );
  }

  if (!data || data.relationships.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Header Bar: Bloomberg Terminal SPLC <GO> Style */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Interactive Supply Chain Map</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                Bloomberg SPLC &lt;GO&gt;
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                SEC 10-K Audited
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exhaustive multi-tiered supplier ecosystem, downstream channels, and single-source chokepoints
            </p>
          </div>
        </div>

        {/* Bloomberg Metrics: Vulnerability Index & Counterparty Counts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-2 font-mono">
            <span className="text-slate-400">Total Counterparties:</span>
            <span className="font-bold text-indigo-400 font-mono">{data.relationships.length} Verified</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-2 font-mono">
            <span className="text-slate-400">Vulnerability Index:</span>
            <span className={`font-bold ${
              data.vulnerability_index >= 70 ? 'text-rose-400' : data.vulnerability_index >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {data.vulnerability_index}/100
            </span>
          </div>

          {data.single_source_count > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{data.single_source_count} Sole-Source Bottleneck{data.single_source_count > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 text-xs">
        {/* Relationship / Tier Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Counterparties ({data.relationships.length})
          </button>
          <button
            onClick={() => setFilterType('Tier 1')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'Tier 1' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tier 1 Direct ({data.tier1_count || data.relationships.filter(r => r.relationship_type === 'Supplier' && r.tier !== 'Tier 2').length})
          </button>
          <button
            onClick={() => setFilterType('Tier 2')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'Tier 2' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tier 2 Tooling ({data.tier2_count || data.relationships.filter(r => r.tier === 'Tier 2').length})
          </button>
          <button
            onClick={() => setFilterType('Customer')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'Customer' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers ({data.customer_count || data.relationships.filter(r => r.relationship_type === 'Customer').length})
          </button>
          <button
            onClick={() => setFilterType('Partner')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'Partner' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Partners
          </button>
          <button
            onClick={() => setFilterType('SINGLE_SOURCE')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'SINGLE_SOURCE' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sole-Source Only ({data.single_source_count})
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search counterparty (e.g. TSMC, Carrier, OLED)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[540px] w-full rounded-xl border border-slate-800 bg-slate-950/90 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
          attributionPosition="bottom-right"
        >
          <Background color="#334155" gap={24} size={1} />
          <Controls 
            className="!bg-slate-900 !border-slate-800 !shadow-xl [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800" 
          />
          <MiniMap 
            className="!bg-slate-900/90 !border-slate-800 rounded-lg overflow-hidden" 
            nodeColor={(n) => {
              if (n.id === 'target_company_node') return '#10b981';
              if (n.data?.relationship_type === 'Supplier') return '#f59e0b';
              if (n.data?.relationship_type === 'Customer') return '#3b82f6';
              return '#a855f7';
            }}
          />
        </ReactFlow>

        {/* Interactive Bottom Pipeline Guide Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center gap-3.5 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
            <span>Tier 2 Tooling & IP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Tier 1 Direct Supplier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Target Company</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
            <span>Customer / Offtaker</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
            <span>Strategic Partner</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Click any node to verify 10-K citation</span>
          </div>
        </div>
      </div>

      {/* 10-K Strategic Filing Takeaway */}
      <div className="mt-3.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Institutional 10-K Strategic Takeaway: </span>
          <span>{data.investor_summary}</span>
        </div>
      </div>

      {/* Slide-out Side Panel (Drawer) for Fact-Check Citations */}
      <FactCheckCitationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        targetCompanyName={data.company_name}
        targetTicker={data.ticker}
        filingType={data.filing_type}
        filingPeriod={data.filing_period}
        filingAccession={data.filing_accession}
      />
    </div>
  );
};
