import React, { useState, useEffect, useMemo } from 'react';
import type { ScreenerResponse, ScreenerItem } from '../types';
import { fetchScreener } from '../services/api';
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
  initialMarket?: 'ALL' | 'US' | 'BURSA';
}

type SortField = 
  | 'ticker' 
  | 'price' 
  | 'returnOnEquity' 
  | 'trailingPE' 
  | 'dividendYield' 
  | 'trailingEps' 
  | 'freeCashflow' 
  | 'revenueGrowthYoY' 
  | 'epsGrowthYoY' 
  | 'sentimentScore' 
  | 'qualifiesGrowth';

export const ScreenerModal: React.FC<ScreenerModalProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  initialMarket = 'ALL'
}) => {
  const [market, setMarket] = useState<'ALL' | 'US' | 'BURSA'>(initialMarket);
  const [minRev, setMinRev] = useState(15.0);
  const [minEps, setMinEps] = useState(15.0);
  const [maxDE, setMaxDE] = useState(2.0);
  const [minRoe, setMinRoe] = useState(10.0);
  const [enablePeFilter, setEnablePeFilter] = useState(false);
  const [maxPe, setMaxPe] = useState(15.0);
  
  // Custom Ticker Addition
  const [customTickerInput, setCustomTickerInput] = useState('');
  const [activeCustomTicker, setActiveCustomTicker] = useState<string | undefined>(undefined);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('qualifiesGrowth');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadScreener = async () => {
    setLoading(true);
    try {
      const peParam = enablePeFilter ? maxPe : null;
      const res = await fetchScreener(market, minRev, minEps, maxDE, minRoe, peParam, activeCustomTicker);
      setData(res);
    } catch (e) {
      console.error('Failed to load screener data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadScreener();
    }
  }, [isOpen, market, enablePeFilter, activeCustomTicker]);

  const handleAddCustomTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTickerInput.trim()) {
      setActiveCustomTicker(customTickerInput.trim().toUpperCase());
      setCustomTickerInput('');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Memoized client-side sorted results for instantaneous re-sorting
  const sortedResults = useMemo(() => {
    if (!data || !data.results) return [];
    const items = [...data.results];

    items.sort((a, b) => {
      let valA: any = a[sortField as keyof ScreenerItem];
      let valB: any = b[sortField as keyof ScreenerItem];

      // Handle nulls and undefined
      if (valA === null || valA === undefined) valA = -999999;
      if (valB === null || valB === undefined) valB = -999999;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        const numA = valA ? 1 : 0;
        const numB = valB ? 1 : 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return items;
  }, [data, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 inline ml-1 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-400 inline ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400 inline ml-1 font-bold" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Institutional Growth & Quality Screener</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  Multi-Column Sortable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Filters for ROE &gt;10%, YoY Rev/EPS &gt;15%, P/E &le;15, Free Cash Flow, and News Sentiment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadScreener}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Rerun Screen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Filter Controls & Custom Ticker Input Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3 text-xs">
          {/* Top Row: Universe Selection & Custom Stock Addition */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Universe:</span>
              <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
                <button
                  onClick={() => setMarket('ALL')}
                  className={`px-3 py-1 rounded transition-colors ${
                    market === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Markets (60+ Stocks)
                </button>
                <button
                  onClick={() => setMarket('US')}
                  className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                    market === 'US' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🇺🇸</span> US Equities
                </button>
                <button
                  onClick={() => setMarket('BURSA')}
                  className={`px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                    market === 'BURSA' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🇲🇾</span> Bursa Malaysia
                </button>
              </div>
            </div>

            {/* Custom Stock Input: "Are all stocks in Malaysia and US included?" -> Yes, user can add any ticker! */}
            <form onSubmit={handleAddCustomTicker} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add any stock (e.g. TSLA, 5398.KL)..."
                value={customTickerInput}
                onChange={(e) => setCustomTickerInput(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 w-56"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Screen</span>
              </button>
            </form>

            {/* P/E <= 15 Toggle */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="peFilterToggle"
                checked={enablePeFilter}
                onChange={(e) => setEnablePeFilter(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="peFilterToggle" className="cursor-pointer text-slate-300 font-medium select-none">
                Filter for P/E &le; 15 (GARP)
              </label>
            </div>
          </div>

          {/* Bottom Row: Threshold Sliders */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-800/60">
            {/* Min ROE > 10% */}
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">Min ROE:</span>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={minRoe}
                onChange={(e) => setMinRoe(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-emerald-400 w-10">{minRoe}%</span>
            </div>

            {/* Min YoY Rev */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Min Rev Growth:</span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={minRev}
                onChange={(e) => setMinRev(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-slate-200 w-10">{minRev}%</span>
            </div>

            {/* Min YoY EPS */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Min EPS Growth:</span>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={minEps}
                onChange={(e) => setMinEps(Number(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-slate-200 w-10">{minEps}%</span>
            </div>

            {/* Max Debt/Equity */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Max Debt/Equity:</span>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={maxDE}
                onChange={(e) => setMaxDE(Number(e.target.value))}
                className="w-20 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-blue-400 w-10">{maxDE}x</span>
            </div>

            {enablePeFilter && (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-semibold">Max P/E:</span>
                <input
                  type="range"
                  min="8"
                  max="35"
                  step="1"
                  value={maxPe}
                  onChange={(e) => setMaxPe(Number(e.target.value))}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-400 w-10">{maxPe}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Screener Results Table with Interactive Sorting */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
              <p className="font-semibold text-white">Scanning market universe & evaluating news sentiment...</p>
              <p className="text-xs text-slate-500 mt-1">Cross-referencing ROE, cash flow conversion, and headline risk</p>
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No stocks matched all criteria. Try adjusting the ROE or P/E thresholds, or add a custom ticker above.
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-400 mb-3 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Showing <strong className="text-white">{sortedResults.length}</strong> stocks (
                  <strong className="text-emerald-400">{data?.qualifyingCount}</strong> passing institutional criteria).
                  Click any column header to sort.
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hover over Sentiment for latest headline context</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold select-none">
                    <tr>
                      <th onClick={() => handleSort('ticker')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors">
                        Ticker {renderSortIcon('ticker')}
                      </th>
                      <th className="py-3 px-2">Market</th>
                      <th onClick={() => handleSort('price')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        Price {renderSortIcon('price')}
                      </th>
                      <th onClick={() => handleSort('returnOnEquity')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        ROE (&gt;10%) {renderSortIcon('returnOnEquity')}
                      </th>
                      <th onClick={() => handleSort('trailingPE')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        P/E (&le;15) {renderSortIcon('trailingPE')}
                      </th>
                      <th onClick={() => handleSort('dividendYield')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        Div Yield {renderSortIcon('dividendYield')}
                      </th>
                      <th onClick={() => handleSort('trailingEps')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        EPS {renderSortIcon('trailingEps')}
                      </th>
                      <th onClick={() => handleSort('freeCashflow')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        Free Cash Flow {renderSortIcon('freeCashflow')}
                      </th>
                      <th onClick={() => handleSort('revenueGrowthYoY')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        YoY Rev % {renderSortIcon('revenueGrowthYoY')}
                      </th>
                      <th onClick={() => handleSort('epsGrowthYoY')} className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors">
                        YoY EPS % {renderSortIcon('epsGrowthYoY')}
                      </th>
                      <th onClick={() => handleSort('sentimentScore')} className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors">
                        Sentiment {renderSortIcon('sentimentScore')}
                      </th>
                      <th onClick={() => handleSort('qualifiesGrowth')} className="py-3 px-2 text-center cursor-pointer hover:text-white transition-colors">
                        Status {renderSortIcon('qualifiesGrowth')}
                      </th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {sortedResults.map((row) => (
                      <tr 
                        key={row.ticker} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          row.qualifiesGrowth ? 'bg-emerald-950/15' : ''
                        }`}
                      >
                        {/* Ticker & Name */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{row.ticker}</span>
                            {row.isUptrend && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Confirmed Uptrend"></span>
                            )}
                          </div>
                          <div className="text-[10px] font-sans text-slate-400 truncate max-w-[125px]">{row.name}</div>
                        </td>

                        {/* Market */}
                        <td className="py-3 px-2 font-sans text-slate-400 text-[11px]">
                          {row.ticker.endsWith('.KL') ? '🇲🇾 Bursa' : '🇺🇸 US'}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-bold text-white">
                          {row.currency === 'MYR' ? 'RM ' : '$'}{row.price?.toFixed(2)}
                          <div className={`text-[10px] ${row.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {row.changePercent >= 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                          </div>
                        </td>

                        {/* Return on Equity (ROE) */}
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            row.returnOnEquity && row.returnOnEquity >= minRoe
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'text-slate-400'
                          }`}>
                            {row.returnOnEquity !== null ? `${row.returnOnEquity}%` : 'N/A'}
                          </span>
                        </td>

                        {/* Trailing P/E (Target <= 15) */}
                        <td className="py-3 px-3 text-right">
                          <span className={`font-semibold ${
                            row.trailingPE && row.trailingPE <= 15.0
                              ? 'text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/20'
                              : 'text-slate-300'
                          }`}>
                            {row.trailingPE ? `${row.trailingPE}x` : 'N/A'}
                          </span>
                        </td>

                        {/* Dividend Yield */}
                        <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                          {row.dividendYield !== null && row.dividendYield !== undefined ? `${row.dividendYield}%` : '—'}
                        </td>

                        {/* EPS */}
                        <td className="py-3 px-3 text-right text-slate-200">
                          {row.currency === 'MYR' ? 'RM ' : '$'}{row.trailingEps ?? 'N/A'}
                        </td>

                        {/* Free Cash Flow - Color Coded: Green (+ve), Red (-ve) */}
                        <td className="py-3 px-3 text-right">
                          {(() => {
                            const isPos = row.freeCashflow !== null && row.freeCashflow !== undefined 
                              ? row.freeCashflow > 0 
                              : (row.freeCashflowFormatted && row.freeCashflowFormatted.startsWith('+'));
                            const isNeg = row.freeCashflow !== null && row.freeCashflow !== undefined 
                              ? row.freeCashflow < 0 
                              : (row.freeCashflowFormatted && row.freeCashflowFormatted.startsWith('-'));

                            if (isPos) {
                              return (
                                <span className="inline-block px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 font-bold text-xs">
                                  {row.freeCashflowFormatted}
                                </span>
                              );
                            } else if (isNeg) {
                              return (
                                <span className="inline-block px-1.5 py-0.5 rounded text-rose-400 bg-rose-950/40 border border-rose-500/40 font-bold text-xs">
                                  {row.freeCashflowFormatted}
                                </span>
                              );
                            } else {
                              return (
                                <span className="text-slate-500 text-[11px]">
                                  {row.freeCashflowFormatted || 'N/A'}
                                </span>
                              );
                            }
                          })()}
                        </td>

                        {/* YoY Revenue Growth */}
                        <td className="py-3 px-3 text-right">
                          <span className={row.revenueGrowthYoY && row.revenueGrowthYoY >= minRev ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {row.revenueGrowthYoY !== null ? `${row.revenueGrowthYoY >= 0 ? '+' : ''}${row.revenueGrowthYoY}%` : 'N/A'}
                          </span>
                        </td>

                        {/* YoY EPS Growth */}
                        <td className="py-3 px-3 text-right">
                          <span className={row.epsGrowthYoY && row.epsGrowthYoY >= minEps ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {row.epsGrowthYoY !== null ? `${row.epsGrowthYoY >= 0 ? '+' : ''}${row.epsGrowthYoY}%` : 'N/A'}
                          </span>
                        </td>

                        {/* News Sentiment with Tooltip (Live RSS Grounded) */}
                        <td className="py-3 px-3 text-center">
                          <div className="relative group inline-block">
                            {(() => {
                              const sc = row.sentimentScore || 0;
                              const isBearish = sc <= -15 || row.sentimentLabel?.toLowerCase().includes('caution') || row.sentimentLabel?.toLowerCase().includes('bearish');
                              const isBullish = sc >= 15 || row.sentimentLabel?.toLowerCase().includes('bullish') || row.sentimentLabel?.toLowerCase().includes('positive');
                              
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold border cursor-help ${
                                  isBearish
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    : isBullish
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                }`}>
                                  {isBearish && <AlertCircle className="w-3 h-3 text-rose-400" />}
                                  <span>{row.sentimentLabel || 'Neutral / Mixed'}</span>
                                </span>
                              );
                            })()}

                            {/* Headline hover tooltip */}
                            {row.sentimentHeadline && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-[11px] font-sans text-slate-200 shadow-2xl pointer-events-none text-left">
                                <div className="flex items-center justify-between font-semibold text-white mb-1 pb-1 border-b border-slate-800">
                                  <span>Top Headline Context:</span>
                                  {row.sentimentScore !== undefined && (
                                    <span className={`font-mono text-[10px] ${
                                      row.sentimentScore > 0 ? 'text-emerald-400' : row.sentimentScore < 0 ? 'text-rose-400' : 'text-slate-400'
                                    }`}>
                                      Score: {row.sentimentScore > 0 ? `+${row.sentimentScore}` : row.sentimentScore}
                                    </span>
                                  )}
                                </div>
                                <div className="italic text-slate-300 leading-snug">"{row.sentimentHeadline}"</div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Pass Status Badge */}
                        <td className="py-3 px-2 text-center font-sans">
                          {row.qualifiesGrowth ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              PASS
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Filter</span>
                          )}
                        </td>

                        {/* Action Inspect Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              onSelectTicker(row.ticker);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-sans font-medium transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
