import React from 'react';
import type { MacroContext } from '../types';
import { Landmark, DollarSign, Activity, Percent } from 'lucide-react';

interface MacroWidgetProps {
  macro: MacroContext | null;
  loading: boolean;
}

export const MacroWidget: React.FC<MacroWidgetProps> = ({ macro, loading }) => {
  if (loading || !macro) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 animate-pulse text-xs text-slate-400">
        Loading macroeconomic indicators...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Title & Badge */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">Macroeconomic Context</div>
            <div className="text-[11px] text-slate-400">US & Malaysia Monetary Policy Backdrop</div>
          </div>
        </div>

        {/* Indicator Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-4xl">
          {/* US Fed Rate */}
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>🇺🇸 US Fed Rate</span>
              <Percent className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              {macro.us.fedRateDisplay}
            </div>
            <div className="text-[10px] text-slate-500 truncate">10Y: {macro.us.treasury10Y}%</div>
          </div>

          {/* Malaysia OPR */}
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>🇲🇾 Malaysia OPR</span>
              <Percent className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
              {macro.malaysia.oprDisplay}
            </div>
            <div className="text-[10px] text-slate-500 truncate">10Y MGS: {macro.malaysia.mgs10Y}%</div>
          </div>

          {/* USD / MYR */}
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>💱 USD / MYR</span>
              <DollarSign className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
              {macro.fx.usdMyr}
            </div>
            <div className="text-[10px] text-slate-500 truncate">{macro.fx.currencyTrend}</div>
          </div>

          {/* Benchmark Indices */}
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>📊 Benchmarks</span>
              <Activity className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-slate-200 mt-0.5 flex justify-between">
              <span>S&P: {macro.us.sp500.toFixed(0)}</span>
              <span className={macro.us.sp500ChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {macro.us.sp500ChangePct >= 0 ? '+' : ''}{macro.us.sp500ChangePct}%
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 flex justify-between text-[11px]">
              <span>KLCI: {macro.malaysia.klci.toFixed(0)}</span>
              <span className={macro.malaysia.klciChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {macro.malaysia.klciChangePct >= 0 ? '+' : ''}{macro.malaysia.klciChangePct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
