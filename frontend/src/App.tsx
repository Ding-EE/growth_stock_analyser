import React, { useState, useEffect } from 'react';
import type { 
  StockQuote, 
  FundamentalMetrics, 
  TechnicalData, 
  MacroContext, 
  TradingAgentsCommitteeReport,
  KnowledgeGraphData,
  SupplyChainResponse 
} from './types';
import { 
  fetchStockOverview, 
  fetchStockTechnicals, 
  fetchCommitteeReport, 
  fetchKnowledgeGraph,
  fetchSupplyChain,
  fetchMacro, 
  triggerScheduler 
} from './services/api';

import { Header } from './components/Header';
import { MacroWidget } from './components/MacroWidget';
import { StockHeader } from './components/StockHeader';
import { FundamentalCard } from './components/FundamentalCard';
import { TechnicalChart } from './components/TechnicalChart';
import { SupplyChainGraph } from './components/SupplyChainGraph';
import { KnowledgeGraphWidget } from './components/KnowledgeGraphWidget';
import { TradingAgentsCommitteeView } from './components/TradingAgentsCommitteeView';
import { ScreenerModal } from './components/ScreenerModal';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { Layers, Network } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTicker, setCurrentTicker] = useState<string>(() => {
    return localStorage.getItem('gsa_current_ticker') || 'AAPL';
  });
  const [activeMarket, setActiveMarket] = useState<'ALL' | 'US' | 'BURSA'>(() => {
    const saved = localStorage.getItem('gsa_active_market');
    return (saved === 'US' || saved === 'BURSA' || saved === 'ALL') ? saved : 'ALL';
  });
  
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [fundamentals, setFundamentals] = useState<FundamentalMetrics | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [macro, setMacro] = useState<MacroContext | null>(null);
  const [committeeReport, setCommitteeReport] = useState<TradingAgentsCommitteeReport | null>(null);
  const [kgData, setKgData] = useState<KnowledgeGraphData | null>(null);
  const [supplyChainData, setSupplyChainData] = useState<SupplyChainResponse | null>(null);
  const [activeNetworkTab, setActiveNetworkTab] = useState<'SUPPLY_CHAIN' | 'KNOWLEDGE_GRAPH'>(() => {
    const saved = localStorage.getItem('gsa_active_network_tab');
    return saved === 'KNOWLEDGE_GRAPH' ? 'KNOWLEDGE_GRAPH' : 'SUPPLY_CHAIN';
  });
  
  const [period, setPeriod] = useState<string>(() => {
    return localStorage.getItem('gsa_chart_period') || '1y';
  });

  // Save state changes to localStorage so sessions restore seamlessly whenever the user visits
  useEffect(() => {
    if (currentTicker) localStorage.setItem('gsa_current_ticker', currentTicker);
  }, [currentTicker]);

  useEffect(() => {
    localStorage.setItem('gsa_active_market', activeMarket);
  }, [activeMarket]);

  useEffect(() => {
    localStorage.setItem('gsa_active_network_tab', activeNetworkTab);
  }, [activeNetworkTab]);

  useEffect(() => {
    localStorage.setItem('gsa_chart_period', period);
  }, [period]);
  const [loadingStock, setLoadingStock] = useState<boolean>(true);
  const [loadingCommittee, setLoadingCommittee] = useState<boolean>(true);
  const [loadingKg, setLoadingKg] = useState<boolean>(true);
  const [loadingSupplyChain, setLoadingSupplyChain] = useState<boolean>(true);
  const [loadingMacro, setLoadingMacro] = useState<boolean>(true);
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const [isScreenerOpen, setIsScreenerOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Initial Macro Fetch
  useEffect(() => {
    const loadMacroData = async () => {
      try {
        setLoadingMacro(true);
        const m = await fetchMacro();
        setMacro(m);
      } catch (e) {
        console.error('Error fetching macro data', e);
      } finally {
        setLoadingMacro(false);
      }
    };
    loadMacroData();
  }, []);

  // Fetch Stock Data on ticker change
  useEffect(() => {
    const loadStock = async () => {
      try {
        setLoadingStock(true);
        const data = await fetchStockOverview(currentTicker);
        setQuote(data.quote);
        setFundamentals(data.fundamentals);
        // Automatically sync market selector
        if (currentTicker.endsWith('.KL')) {
          setActiveMarket('BURSA');
        } else {
          setActiveMarket('US');
        }
      } catch (e) {
        console.error('Error fetching stock overview', e);
      } finally {
        setLoadingStock(false);
      }
    };

    loadStock();
  }, [currentTicker]);

  // Fetch Technicals on ticker or period change
  useEffect(() => {
    const loadTechnicals = async () => {
      try {
        const tech = await fetchStockTechnicals(currentTicker, period);
        setTechnicalData(tech);
      } catch (e) {
        console.error('Error fetching technicals', e);
      }
    };

    loadTechnicals();
  }, [currentTicker, period]);

  // Fetch Committee Report on ticker change
  useEffect(() => {
    const loadCommittee = async () => {
      try {
        setLoadingCommittee(true);
        const report = await fetchCommitteeReport(currentTicker);
        setCommitteeReport(report);
      } catch (e) {
        console.error('Error generating committee report', e);
      } finally {
        setLoadingCommittee(false);
      }
    };

    loadCommittee();
  }, [currentTicker]);

  // Fetch Knowledge Graph on ticker change
  useEffect(() => {
    const loadKg = async () => {
      try {
        setLoadingKg(true);
        const data = await fetchKnowledgeGraph(currentTicker);
        setKgData(data);
      } catch (e) {
        console.error('Error fetching knowledge graph', e);
      } finally {
        setLoadingKg(false);
      }
    };

    loadKg();
  }, [currentTicker]);

  // Fetch Supply Chain on ticker change
  useEffect(() => {
    const loadSupplyChain = async () => {
      try {
        setLoadingSupplyChain(true);
        const data = await fetchSupplyChain(currentTicker);
        setSupplyChainData(data);
      } catch (e) {
        console.error('Error fetching supply chain data', e);
      } finally {
        setLoadingSupplyChain(false);
      }
    };

    loadSupplyChain();
  }, [currentTicker]);

  const handleRefreshCommittee = async () => {
    try {
      setLoadingCommittee(true);
      const report = await fetchCommitteeReport(currentTicker);
      setCommitteeReport(report);
    } catch (e) {
      console.error('Error refreshing committee report', e);
    } finally {
      setLoadingCommittee(false);
    }
  };

  const handleSendDiscordAlert = async () => {
    try {
      setSendingAlert(true);
      const savedWebhook = localStorage.getItem('growth_stock_discord_webhook') || undefined;
      const res = await triggerScheduler('ALL', 15.0, 15.0, savedWebhook);
      setAlertSuccess(`Alert sent successfully for qualifying candidates! (${res.summary?.qualifyingCount} qualified)`);
      setTimeout(() => setAlertSuccess(null), 5000);
    } catch (e) {
      console.error('Error sending alert', e);
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTicker={currentTicker}
        onSelectTicker={(t) => setCurrentTicker(t)}
        onOpenScreener={() => setIsScreenerOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeMarket={activeMarket}
        onSelectMarket={(m) => setActiveMarket(m)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Macro Context Status Banner */}
        <MacroWidget macro={macro} loading={loadingMacro} />

        {/* Temporary Alert Toast */}
        {alertSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>{alertSuccess}</span>
            <button onClick={() => setAlertSuccess(null)} className="text-emerald-400 hover:text-white">&times;</button>
          </div>
        )}

        {/* Stock Quote Header */}
        {loadingStock || !quote ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse text-slate-500 text-xs">
            Loading quote and company fundamentals for {currentTicker}...
          </div>
        ) : (
          <StockHeader quote={quote} />
        )}

        {/* Grid: Fundamentals & Technicals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Technicals Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <TechnicalChart
              technicalData={technicalData}
              period={period}
              onPeriodChange={(p) => setPeriod(p)}
              currency={quote?.currency || 'USD'}
            />
          </div>

          {/* Right Column: Fundamental Health (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            {fundamentals ? (
              <FundamentalCard fundamentals={fundamentals} />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-500 text-xs">
                Loading fundamentals...
              </div>
            )}
          </div>
        </div>

        {/* Institutional Network & Supply Chain Intelligence Suite */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveNetworkTab('SUPPLY_CHAIN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeNetworkTab === 'SUPPLY_CHAIN'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Interactive Supply Chain Map (Bloomberg SPLC &lt;GO&gt; &amp; 10-K Citations)</span>
              </button>

              <button
                onClick={() => setActiveNetworkTab('KNOWLEDGE_GRAPH')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeNetworkTab === 'KNOWLEDGE_GRAPH'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Macro &amp; Strategic Risk Knowledge Graph (news_KG)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-2 px-3">
              <span>Dual Institutional Network Engine</span>
            </div>
          </div>

          {activeNetworkTab === 'SUPPLY_CHAIN' ? (
            <SupplyChainGraph
              data={supplyChainData}
              loading={loadingSupplyChain}
              ticker={currentTicker}
            />
          ) : (
            <KnowledgeGraphWidget
              kgData={kgData}
              loading={loadingKg}
              ticker={currentTicker}
            />
          )}
        </div>

        {/* TradingAgents Multi-Agent Investment Committee Dossier */}
        <TradingAgentsCommitteeView
          report={committeeReport}
          loading={loadingCommittee}
          onRefresh={handleRefreshCommittee}
          onSendDiscordAlert={handleSendDiscordAlert}
          sendingAlert={sendingAlert}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>Growth Stock Screener & TradingAgents Multi-Agent Investment Committee • Dual-Market US & Bursa Malaysia Live Financial Analytics</p>
      </footer>

      {/* Screener Modal */}
      <ScreenerModal
        isOpen={isScreenerOpen}
        onClose={() => setIsScreenerOpen(false)}
        onSelectTicker={(t) => setCurrentTicker(t)}
        initialMarket={activeMarket}
      />

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />
    </div>
  );
};

export default App;
