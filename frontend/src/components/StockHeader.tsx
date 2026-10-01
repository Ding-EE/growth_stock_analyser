import React from 'react';
import type { StockQuote } from '../types';
import { TrendingUp, TrendingDown, Building2 } from 'lucide-react';

interface StockHeaderProps {
  quote: StockQuote;
}

export const StockHeader: React.FC<StockHeaderProps> = ({ quote }) => {
  const isPositive = quote.change >= 0;
  const currSymbol = quote.currency === 'MYR' ? 'RM ' : '$';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Ticker, Name, Sector */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-white">{quote.ticker}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
              quote.market === 'Bursa Malaysia'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {quote.market === 'Bursa Malaysia' ? '🇲🇾 Bursa Malaysia' : '🇺🇸 US Equities'}
            </span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {quote.currency}
            </span>
          </div>

          <div className="text-base text-slate-300 font-medium mt-1">{quote.name}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {quote.sector} • {quote.industry}
            </span>
          </div>
        </div>

        {/* Right: Live Price & Key Institutional Stats */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Price & Change */}
          <div className="text-right">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {currSymbol}{quote.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm font-semibold font-mono ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{quote.change.toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="border-l border-slate-800 pl-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-500">Market Cap:</span>
              <div className="font-mono text-slate-200 font-medium">
                {quote.marketCap > 1e12
                  ? `${currSymbol}${(quote.marketCap / 1e12).toFixed(2)}T`
                  : quote.marketCap > 1e9
                  ? `${currSymbol}${(quote.marketCap / 1e9).toFixed(2)}B`
                  : quote.marketCap > 1e6
                  ? `${currSymbol}${(quote.marketCap / 1e6).toFixed(2)}M`
                  : `${currSymbol}${quote.marketCap.toLocaleString()}`}
              </div>
            </div>

            <div>
              <span className="text-slate-500">52W Range:</span>
              <div className="font-mono text-slate-200 font-medium">
                {currSymbol}{quote.fiftyTwoWeekLow.toFixed(2)} - {currSymbol}{quote.fiftyTwoWeekHigh.toFixed(2)}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Trailing EPS:</span>
              <div className="font-mono text-white font-semibold">
                {quote.trailingEps !== null && quote.trailingEps !== undefined ? `${currSymbol}${quote.trailingEps}` : 'N/A'}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Dividend Yield:</span>
              <div className="font-mono text-amber-400 font-semibold">
                {quote.dividendYield !== null && quote.dividendYield !== undefined ? `${quote.dividendYield}%` : '0.00%'}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Volume:</span>
              <div className="font-mono text-slate-200 font-medium">
                {quote.volume ? (quote.volume > 1e6 ? `${(quote.volume / 1e6).toFixed(1)}M` : quote.volume.toLocaleString()) : 'N/A'}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Avg Vol:</span>
              <div className="font-mono text-slate-200 font-medium">
                {quote.avgVolume ? (quote.avgVolume > 1e6 ? `${(quote.avgVolume / 1e6).toFixed(1)}M` : quote.avgVolume.toLocaleString()) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
