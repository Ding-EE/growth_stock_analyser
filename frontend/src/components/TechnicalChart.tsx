import React, { useState } from 'react';
import type { TechnicalData } from '../types';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface TechnicalChartProps {
  technicalData: TechnicalData | null;
  period: string;
  onPeriodChange: (p: string) => void;
  currency: string;
}

export const TechnicalChart: React.FC<TechnicalChartProps> = ({
  technicalData,
  period,
  onPeriodChange,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'price' | 'rsi' | 'macd'>('price');

  if (!technicalData || !technicalData.series || technicalData.series.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        Loading technical indicators and price series...
      </div>
    );
  }

  const { summary, series } = technicalData;
  const currSym = currency === 'MYR' ? 'RM ' : '$';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Technical Analysis & Indicators</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              50-Day SMA: <span className="font-mono text-slate-200">{summary.sma50 ? `${currSym}${summary.sma50}` : 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
              200-Day SMA: <span className="font-mono text-slate-200">{summary.sma200 ? `${currSym}${summary.sma200}` : 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1">
              RSI(14): <span className="font-mono text-slate-200">{summary.rsi || 'N/A'}</span>
            </span>
          </div>
        </div>

        {/* Timeframe & Sub-Indicator Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Selectors */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTab('price')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'price' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Price & SMA
            </button>
            <button
              onClick={() => setActiveTab('rsi')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'rsi' ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setActiveTab('macd')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'macd' ? 'bg-slate-800 text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MACD
            </button>
          </div>

          {/* Timeframe Range */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex text-xs font-mono">
            {['1mo', '3mo', '6mo', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-2.5 py-1 rounded uppercase transition-colors ${
                  period === p ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Uptrend & Golden Cross Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
        <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
          summary.isUptrend
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          {summary.isUptrend ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-slate-500" />}
          <div>
            <div className="font-semibold text-slate-200">Uptrend Confirmation</div>
            <div className="text-[11px]">{summary.isUptrend ? 'Price > 50 SMA > 200 SMA (Bullish)' : 'Neutral / Range-Bound'}</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
          summary.goldenCross
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <TrendingUp className={`w-4 h-4 ${summary.goldenCross ? 'text-amber-400' : 'text-slate-500'}`} />
          <div>
            <div className="font-semibold text-slate-200">Golden Cross Status</div>
            <div className="text-[11px]">{summary.goldenCross ? 'Golden Cross Active (50 > 200 SMA)' : 'No recent crossover'}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg border bg-slate-950 border-slate-800 flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="font-semibold text-slate-200">Momentum Status</div>
            <div className="text-[11px] text-slate-400">{summary.rsiStatus} • {summary.macdMomentum}</div>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'price' ? (
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  name === 'close' ? `${currSym}${Number(val).toFixed(2)}` : val,
                  name === 'close' ? 'Price' : name === 'sma50' ? '50 SMA' : name === 'sma200' ? '200 SMA' : name
                ]}
              />
              <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
              <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
              <Line type="monotone" dataKey="sma200" stroke="#a855f7" strokeWidth={1.8} dot={false} />
            </ComposedChart>
          ) : activeTab === 'rsi' ? (
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}`, 'RSI (14)']}
              />
              <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Overbought (70)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold (30)', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="rsi" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="macdHist" fill="#3b82f6" name="Histogram" />
              <Line type="monotone" dataKey="macd" stroke="#10b981" strokeWidth={1.8} dot={false} name="MACD" />
              <Line type="monotone" dataKey="macdSignal" stroke="#f43f5e" strokeWidth={1.8} dot={false} name="Signal" />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
