import React from 'react';
import type { TradingAgentsCommitteeReport } from '../types';
import { 
  Bot, 
  Sparkles, 
  Award, 
  LineChart, 
  Scale, 
  Briefcase, 
  RefreshCw,
  Send,
  Target
} from 'lucide-react';

interface TradingAgentsCommitteeViewProps {
  report: TradingAgentsCommitteeReport | null;
  loading: boolean;
  onRefresh: () => void;
  onSendDiscordAlert: () => void;
  sendingAlert: boolean;
}

export const TradingAgentsCommitteeView: React.FC<TradingAgentsCommitteeViewProps> = ({
  report,
  loading,
  onRefresh,
  onSendDiscordAlert,
  sendingAlert
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg text-center">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Convening 30-Year Veteran Investment Committee...</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Deliberating ROE durability (&gt;10%), Free Cash Flow conversion, P/E margin of safety, 50/200 SMA tape structure, and central bank macro risks.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg text-center">
        <Bot className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No Committee Dossier Loaded</h3>
        <button
          onClick={onRefresh}
          className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Generate 30-Year Veteran Committee Dossier
        </button>
      </div>
    );
  }

  const { opportunityScore, verdict, committee, modelUsed, ticker, name, keyMetrics } = report;

  // Score colors: Green for >= 75, Gold for >= 60, Blue for below
  const scoreColor = opportunityScore >= 75 ? 'text-emerald-400' : (opportunityScore >= 60 ? 'text-amber-400' : 'text-blue-400');
  const scoreBorder = opportunityScore >= 75 ? 'border-emerald-500/30 bg-emerald-500/10' : (opportunityScore >= 60 ? 'border-amber-500/30 bg-amber-500/10' : 'border-blue-500/30 bg-blue-500/10');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Header & Verdict Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                TradingAgents Institutional Investment Committee
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold font-mono">
                30+ Years Cycle Experience
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Seasoned multi-decade capital allocation review for {name} ({ticker})
            </p>
          </div>
        </div>

        {/* Score & Verdict Display */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${scoreBorder}`}>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Conviction Score</div>
              <div className={`text-2xl font-extrabold font-mono ${scoreColor}`}>
                {opportunityScore}<span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Executive Mandate</div>
              <div className="text-sm font-bold text-white font-mono">{verdict}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSendDiscordAlert}
              disabled={sendingAlert}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
              title="Dispatch Discord Webhook Alert"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingAlert ? 'Sending...' : 'Send Alert'}</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Refresh Committee Analysis"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Key Metrics Strip */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-5 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
        <div>
          <span className="text-slate-500 text-[10px] block">ROE (&gt;10%):</span>
          <span className="text-emerald-400 font-bold">{keyMetrics?.returnOnEquity !== undefined && keyMetrics.returnOnEquity !== null ? `${keyMetrics.returnOnEquity}%` : 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Trailing P/E:</span>
          <span className={keyMetrics?.trailingPE && keyMetrics.trailingPE <= 15.0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
            {keyMetrics?.trailingPE ? `${keyMetrics.trailingPE}x` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Free Cash Flow:</span>
          <span className="text-emerald-400 font-bold truncate block">{keyMetrics?.freeCashflowFormatted || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Dividend Yield:</span>
          <span className="text-amber-400 font-bold">{keyMetrics?.dividendYield !== undefined && keyMetrics.dividendYield !== null ? `${keyMetrics.dividendYield}%` : '0.00%'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Trailing EPS:</span>
          <span className="text-white font-bold">{keyMetrics?.trailingEps ?? 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">50 / 200 SMA:</span>
          <span className="text-slate-300 truncate block">{keyMetrics?.sma50 || 'N/A'} / {keyMetrics?.sma200 || 'N/A'}</span>
        </div>
      </div>

      {/* 4 Multi-Agent Committee Deliberation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 1. Senior Buy-Side Fundamental Analyst */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>1. Senior Fundamental Analyst (30+ Yrs Buy-Side)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {committee.fundamentalAnalyst}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pillars: ROE &gt;10%, FCF conversion, EPS acceleration, debt runway</span>
            <span className="text-emerald-400 font-mono font-medium">ROE: {keyMetrics?.returnOnEquity ?? 'N/A'}%</span>
          </div>
        </div>

        {/* 2. Chief Technical Market Strategist */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <LineChart className="w-4 h-4" />
              <span>2. Chief Technical Strategist (30+ Yrs Market Cycles)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {committee.technicalAnalyst}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tape & Cycle: 50 & 200 SMA structure, volume shelf, Wyckoff phase</span>
            <span className="text-blue-400 font-mono font-medium">{keyMetrics?.isUptrend ? 'Accumulation' : 'Consolidating'}</span>
          </div>
        </div>

        {/* 3. Senior Risk Officer & Macro Arbitrageur */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              <span>3. Senior Risk Officer (30+ Yrs Crisis Management)</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              {committee.riskManagerAndDebate.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Stress Test: Fed {keyMetrics?.fedRate} • BNM OPR {keyMetrics?.malaysiaOpr} • USD/MYR {keyMetrics?.usdMyr}</span>
            <span className="text-amber-400 font-mono font-medium">Rate Shock Buffer</span>
          </div>
        </div>

        {/* 4. Managing Partner & Chief Investment Officer */}
        <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-br from-purple-950/25 to-slate-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              <Briefcase className="w-4 h-4" />
              <span>4. Managing Partner & CIO (30+ Yrs Capital Allocator)</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-line">
              {committee.chiefInvestmentOfficer}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-900/40 text-[11px] text-purple-300 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>Execution Mandate & Margin of Safety</span>
            </span>
            <span className="font-mono font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
              {verdict}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Engine Model Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
        <span>Engine: {modelUsed}</span>
        <span className="text-emerald-400/80">30-Year Veteran Committee Deliberation Standard Active</span>
      </div>
    </div>
  );
};
