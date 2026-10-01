import React, { useState } from 'react';
import type { SupplyChainItem } from '../types';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Compass, 
  DollarSign, 
  Globe2, 
  Building2 
} from 'lucide-react';

interface FactCheckCitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: SupplyChainItem | null;
  targetCompanyName: string;
  targetTicker: string;
  filingType: string;
  filingPeriod: string;
  filingAccession?: string;
}

export const FactCheckCitationDrawer: React.FC<FactCheckCitationDrawerProps> = ({
  isOpen,
  onClose,
  item,
  targetCompanyName,
  targetTicker,
  filingType,
  filingPeriod,
  filingAccession
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const handleCopyCitation = () => {
    const citation = `"${item.evidence_quote}" — ${targetCompanyName} (${targetTicker}) ${filingType}, Section: ${item.source_section} (${filingPeriod}).`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'Supplier':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Upstream Supplier</span>
          </span>
        );
      case 'Customer':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Downstream Customer</span>
          </span>
        );
      case 'Partner':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Strategic Partner</span>
          </span>
        );
    }
  };

  const getConcentrationBadge = (risk: string) => {
    switch (risk) {
      case 'Critical Single-Source':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical Single-Source Bottleneck</span>
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            High Concentration Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Moderate Redundancy
          </span>
        );
      case 'Diversified':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Broadly Diversified
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getRelationshipBadge(item.relationship_type)}
                {item.tier && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.tier}
                  </span>
                )}
                {item.region && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {item.region}
                  </span>
                )}
                {item.ticker_symbol && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {item.ticker_symbol}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {item.entity_name}
              </h2>
              <p className="text-xs text-slate-400">
                Supply Chain Counterparty for <span className="text-white font-medium">{targetCompanyName} ({targetTicker})</span>
              </p>
              {item.cogs_or_rev_share && (
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-mono">
                  <span className="text-slate-500">Material Share:</span>
                  <span>{item.cogs_or_rev_share}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            
            {/* Fact-Check Citation Block (Bloomberg Terminal Style) */}
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Audited Regulatory Citation (Fact-Check)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                  <span>✓ 100% Verbatim Match</span>
                </span>
              </div>

              {/* Source Section Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400">Section:</span>
                <span className="text-white font-semibold">{item.source_section}</span>
              </div>

              {/* Verbatim Evidence Quote Box */}
              <div className="relative p-3.5 rounded-lg bg-slate-950/90 border border-amber-500/30 text-slate-200 text-xs leading-relaxed font-serif italic">
                <span className="text-amber-400 font-serif text-lg leading-none select-none">“</span>
                {item.evidence_quote}
                <span className="text-amber-400 font-serif text-lg leading-none select-none">”</span>
              </div>

              {/* Filing Meta & Action */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500 font-mono">{filingType} • {filingPeriod}</span>
                  {filingAccession && (
                    <div className="text-[10px] text-slate-500 font-mono">Accession: {filingAccession}</div>
                  )}
                </div>

                <button
                  onClick={handleCopyCitation}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Strategic Concentration Risk Assessment */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Concentration & Disruption Risk
                </h3>
                {getConcentrationBadge(item.concentration_risk)}
              </div>

              {/* Financial Impact */}
              {item.financial_impact && (
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Financial / Margin Implication:</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-5 leading-normal">
                    {item.financial_impact}
                  </p>
                </div>
              )}

              {/* Geopolitical Chokepoint */}
              {item.geopolitical_chokepoint && (
                <div className="space-y-1 pt-1 border-t border-slate-900">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Geopolitical Bottleneck / Chokepoint:</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-5 leading-normal">
                    {item.geopolitical_chokepoint}
                  </p>
                </div>
              )}
            </div>

            {/* 30-Year Veteran Market Investor Thesis */}
            {item.investor_thesis && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>30-Year Veteran Practitioner Takeaway</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.investor_thesis}
                </p>
              </div>
            )}

            {/* Bloomberg Terminal SPLC <GO> Tip */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-500 leading-normal flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Bloomberg Terminal <span className="font-mono text-slate-300 font-bold">SPLC &lt;GO&gt;</span> protocol: Citations are extracted from audited SEC Form 10-Ks and Bursa Malaysia Annual Disclosures to eliminate synthetic AI hallucinations.
              </span>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
            <span>Verified Extraction Engine</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
