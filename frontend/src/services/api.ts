import type { 
  StockQuote, 
  FundamentalMetrics, 
  TechnicalData, 
  MacroContext, 
  TradingAgentsCommitteeReport,
  KnowledgeGraphData,
  ScreenerResponse,
  SupplyChainResponse 
} from '../types';

const API_BASE = '/api';

export async function fetchStockOverview(ticker: string): Promise<{ quote: StockQuote; fundamentals: FundamentalMetrics; sentiment: any }> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/overview`);
  if (!res.ok) throw new Error(`Failed to fetch stock overview for ${ticker}`);
  return res.json();
}

export async function fetchStockTechnicals(ticker: string, period: string = '1y'): Promise<TechnicalData> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/technicals?period=${period}`);
  if (!res.ok) throw new Error(`Failed to fetch technicals for ${ticker}`);
  return res.json();
}

export async function fetchStockSentiment(ticker: string): Promise<any> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/sentiment`);
  if (!res.ok) throw new Error(`Failed to fetch sentiment for ${ticker}`);
  return res.json();
}

export async function fetchKnowledgeGraph(ticker: string): Promise<KnowledgeGraphData> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/knowledge-graph`);
  if (!res.ok) throw new Error(`Failed to fetch knowledge graph for ${ticker}`);
  return res.json();
}

export async function fetchSupplyChain(ticker: string): Promise<SupplyChainResponse> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/supply-chain`);
  if (!res.ok) throw new Error(`Failed to fetch supply chain for ${ticker}`);
  return res.json();
}

export async function fetchCommitteeReport(ticker: string): Promise<TradingAgentsCommitteeReport> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}/committee`);
  if (!res.ok) throw new Error(`Failed to generate committee report for ${ticker}`);
  return res.json();
}

export async function fetchMacro(): Promise<MacroContext> {
  const res = await fetch(`${API_BASE}/macro`);
  if (!res.ok) throw new Error('Failed to fetch macroeconomic context');
  return res.json();
}

export async function fetchScreener(
  market: 'ALL' | 'US' | 'BURSA' = 'ALL',
  minRev: number = 15.0,
  minEps: number = 15.0,
  maxDE: number = 2.0,
  minRoe: number = 10.0,
  maxPe?: number | null,
  customTicker?: string
): Promise<ScreenerResponse> {
  const params = new URLSearchParams({
    market,
    min_rev_growth: minRev.toString(),
    min_eps_growth: minEps.toString(),
    max_debt_to_equity: maxDE.toString(),
    min_roe: minRoe.toString(),
  });
  if (maxPe !== undefined && maxPe !== null) {
    params.append('max_pe', maxPe.toString());
  }
  if (customTicker && customTicker.trim()) {
    params.append('custom_ticker', customTicker.trim().toUpperCase());
  }
  const res = await fetch(`${API_BASE}/screener?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch screener results');
  return res.json();
}

export async function fetchSchedulerStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/scheduler/status`);
  if (!res.ok) throw new Error('Failed to fetch scheduler status');
  return res.json();
}

export async function triggerScheduler(
  market: string = 'ALL',
  minRev: number = 15.0,
  minEps: number = 15.0,
  webhookUrl?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/scheduler/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      market,
      min_rev_growth: minRev,
      min_eps_growth: minEps,
      webhook_url: webhookUrl || undefined
    })
  });
  if (!res.ok) throw new Error('Failed to trigger background screening run');
  return res.json();
}
