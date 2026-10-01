import React from 'react';
import type { FundamentalMetrics } from '../types';
import { CheckCircle2, AlertTriangle, Zap, DollarSign, Percent, TrendingUp } from 'lucide-react';

interface FundamentalCardProps {
  fundamentals: FundamentalMetrics;
}

export const FundamentalCard: React.FC<FundamentalCardProps> = ({ fundamentals }) => {
  const currSym = fundamentals.currency === 'MYR' ? 'RM ' : '$';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Card Header & Growth Status */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Institutional Quality & Growth Screen</h2>
              <p className="text-[11px] text-slate-400">ROE &gt;10%, YoY Rev/EPS &gt;15%, P/E &le;15, FCF & Dividends</p>
            </div>
          </div>

          <div>
            {fundamentals.qualifiesGrowth ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Growth Candidate Qualified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Partial Quality Alignment
              </span>
            )}
          </div>
        </div>

        {/* 4 Core Pillars: YoY Rev, YoY EPS, ROE (>10%), Debt/Equity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* YoY Revenue Growth */}
          <div className={`p-3 rounded-lg border ${
            fundamentals.passesRevenue
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>YoY Rev</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">&gt;15%</span>
            </div>
            <div className="text-xl font-bold font-mono">
              {fundamentals.revenueGrowthYoY !== null ? (
                `${fundamentals.revenueGrowthYoY >= 0 ? '+' : ''}${fundamentals.revenueGrowthYoY}%`
              ) : 'N/A'}
            </div>
            <div className="text-[10px] mt-1 text-emerald-400 font-medium truncate">
              {fundamentals.passesRevenue ? '✓ Target Met' : 'Below 15%'}
            </div>
          </div>

          {/* YoY EPS Growth */}
          <div className={`p-3 rounded-lg border ${
            fundamentals.passesEPS
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>YoY EPS</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">&gt;15%</span>
            </div>
            <div className="text-xl font-bold font-mono">
              {fundamentals.epsGrowthYoY !== null ? (
                `${fundamentals.epsGrowthYoY >= 0 ? '+' : ''}${fundamentals.epsGrowthYoY}%`
              ) : 'N/A'}
            </div>
            <div className="text-[10px] mt-1 text-emerald-400 font-medium truncate">
              {fundamentals.passesEPS ? '✓ Accelerating' : 'Below 15%'}
            </div>
          </div>

          {/* Return on Equity (ROE) -> Target > 10% */}
          <div className={`p-3 rounded-lg border ${
            fundamentals.passesROE
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>ROE</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">&gt;10%</span>
            </div>
            <div className="text-xl font-bold font-mono">
              {fundamentals.returnOnEquity !== null ? `${fundamentals.returnOnEquity}%` : 'N/A'}
            </div>
            <div className="text-[10px] mt-1 text-emerald-400 font-medium truncate">
              {fundamentals.passesROE ? '✓ High Capital Return' : 'Sub-10% Hurdle'}
            </div>
          </div>

          {/* Debt-to-Equity */}
          <div className={`p-3 rounded-lg border ${
            fundamentals.isDebtManageable
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Debt / Equity</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">&le;2.0</span>
            </div>
            <div className="text-xl font-bold font-mono">
              {fundamentals.debtToEquity !== null ? `${fundamentals.debtToEquity}x` : 'N/A'}
            </div>
            <div className="text-[10px] mt-1 truncate">
              {fundamentals.isFinancial ? (
                <span className="text-blue-400">🏛️ Bank Exemption</span>
              ) : fundamentals.isDebtManageable ? (
                <span className="text-emerald-400">✓ Prudent Leverage</span>
              ) : (
                <span className="text-rose-400">⚠️ High Leverage</span>
              )}
            </div>
          </div>
        </div>

        {/* Free Cash Flow, Earnings Per Share (EPS), Dividend Yield, and Valuation (P/E <= 15) */}
        <div className="border-t border-slate-800 pt-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Cash Flow, Earnings & Valuation Depth</span>
            {fundamentals.passesPE && (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                P/E &le; 15 (Value-Growth Zone)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Free Cash Flow - Color Coded: Green (+ve), Red (-ve) */}
            {(() => {
              const isPos = fundamentals.freeCashflow !== null && fundamentals.freeCashflow !== undefined 
                ? fundamentals.freeCashflow > 0 
                : (fundamentals.freeCashflowFormatted && fundamentals.freeCashflowFormatted.startsWith('+'));
              const isNeg = fundamentals.freeCashflow !== null && fundamentals.freeCashflow !== undefined 
                ? fundamentals.freeCashflow < 0 
                : (fundamentals.freeCashflowFormatted && fundamentals.freeCashflowFormatted.startsWith('-'));
              
              return (
                <div className={`p-2.5 rounded-lg border ${
                  isPos
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : isNeg
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Free Cash Flow:</span>
                    <DollarSign className={`w-3.5 h-3.5 ${isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400'}`} />
                  </div>
                  <div className={`font-mono text-sm font-bold mt-1 ${isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-300'}`}>
                    {fundamentals.freeCashflowFormatted || 'N/A'}
                  </div>
                  <div className="text-[10px] mt-0.5 truncate">
                    {isPos ? (
                      <span className="text-emerald-400">✓ Positive Cash Flow</span>
                    ) : isNeg ? (
                      <span className="text-rose-400">⚠️ Cash Burn / Deficit</span>
                    ) : (
                      <span className="text-slate-500">Capital Neutral</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Trailing & Forward EPS */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-500">
                <span>Trailing EPS:</span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="font-mono text-white text-sm font-bold mt-1">
                {currSym}{fundamentals.trailingEps ?? 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Fwd: {currSym}{fundamentals.forwardEps ?? 'N/A'}
              </div>
            </div>

            {/* Dividend Yield */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-slate-500">
                <span>Dividend Yield:</span>
                <Percent className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="font-mono text-amber-400 text-sm font-bold mt-1">
                {fundamentals.dividendYield !== null && fundamentals.dividendYield !== undefined ? `${fundamentals.dividendYield}%` : '0.00%'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Cash Yield Payout
              </div>
            </div>

            {/* Trailing P/E */}
            <div className={`p-2.5 rounded-lg border ${
              fundamentals.passesPE
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-500">
                <span>Trailing P/E:</span>
                <span className="text-[10px] text-slate-400 font-mono">Fwd: {fundamentals.forwardPE ? `${fundamentals.forwardPE}x` : 'N/A'}</span>
              </div>
              <div className="font-mono text-white text-sm font-bold mt-1">
                {fundamentals.trailingPE ? `${fundamentals.trailingPE}x` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5">
                {fundamentals.passesPE ? (
                  <span className="text-emerald-400 font-semibold">✓ Below 15x Multiple</span>
                ) : (
                  <span className="text-slate-500">Above 15x Multiple</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
