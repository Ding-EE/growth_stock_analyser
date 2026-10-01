import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Bell, Globe } from 'lucide-react';

interface HeaderProps {
  currentTicker: string;
  onSelectTicker: (ticker: string) => void;
  onOpenScreener: () => void;
  onOpenAlerts: () => void;
  activeMarket: 'ALL' | 'US' | 'BURSA';
  onSelectMarket: (market: 'ALL' | 'US' | 'BURSA') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTicker,
  onSelectTicker,
  onOpenScreener,
  onOpenAlerts,
  activeMarket,
  onSelectMarket
}) => {
  const [inputVal, setInputVal] = useState('');
  const [recentTickers, setRecentTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gsa_recent_tickers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['AAPL', 'NVDA', '1155.KL', '0166.KL', '5398.KL'];
  });
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Keep recent tickers updated
  useEffect(() => {
    if (!currentTicker) return;
    setRecentTickers(prev => {
      const filtered = prev.filter(t => t.toUpperCase() !== currentTicker.toUpperCase());
      const updated = [currentTicker.toUpperCase(), ...filtered].slice(0, 6);
      localStorage.setItem('gsa_recent_tickers', JSON.stringify(updated));
      return updated;
    });
  }, [currentTicker]);

  // Periodic health ping
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSelectTicker(inputVal.trim().toUpperCase());
      setInputVal('');
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">GrowthStock</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  TradingAgents
                </span>
              </div>
              <p className="text-xs text-slate-400">US & Bursa Malaysia Equity Intelligence</p>
            </div>
          </div>

          {/* Market Switcher & Live Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => onSelectMarket('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeMarket === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Markets
              </button>
              <button
                onClick={() => { onSelectMarket('US'); onSelectTicker('AAPL'); }}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  activeMarket === 'US' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇺🇸</span> US
              </button>
              <button
                onClick={() => { onSelectMarket('BURSA'); onSelectTicker('1155.KL'); }}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  activeMarket === 'BURSA' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇲🇾</span> Bursa
              </button>
            </div>

            {/* Always-on connection pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className={serverOnline ? 'text-slate-300' : 'text-rose-400'}>
                {serverOnline ? 'Live 24/7' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Tickers */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker (e.g. AAPL, 1155.KL)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
          </form>

          {/* Quick Presets / Recent */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-500 text-[11px]">Recent:</span>
            {recentTickers.map((sym) => (
              <button
                key={sym}
                onClick={() => onSelectTicker(sym)}
                className={`px-2 py-1 rounded border transition-colors ${
                  currentTicker === sym
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={onOpenScreener}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Growth Screener</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Free Alerts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
