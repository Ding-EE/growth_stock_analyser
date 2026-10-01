export interface StockQuote {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  market: string;
  marketCap: number;
  volume: number;
  avgVolume: number;
  dividendYield?: number | null;
  trailingEps?: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sector: string;
  industry: string;
  summary: string;
}

export interface StockSentiment {
  ticker: string;
  sentimentScore: number;
  sentimentLabel: string;
  badgeColor: string;
  topHeadline: string;
  headlinesAnalyzed: number;
  positiveSignalCount: number;
  negativeSignalCount: number;
  summary: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
  category: 'core' | 'governance' | 'product' | 'macro' | 'risk' | 'catalyst';
  color: string;
  size: number;
  details?: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relation: string;
  label: string;
  polarity: 'positive' | 'negative' | 'neutral' | 'warning';
}

export interface KnowledgeGraphData {
  ticker: string;
  companyName: string;
  nodesCount: number;
  edgesCount: number;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  summary: string;
  hasHighRiskEdge: boolean;
}

export interface FundamentalMetrics {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  currency: string;
  isFinancial: boolean;
  revenueGrowthYoY: number | null;
  epsGrowthYoY: number | null;
  debtToEquity: number | null;
  isDebtManageable: boolean;
  trailingPE: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  profitMargin: number | null;
  returnOnEquity: number | null;
  passesROE: boolean;
  dividendYield: number | null;
  trailingEps: number | null;
  forwardEps: number | null;
  freeCashflow: number | null;
  freeCashflowFormatted: string;
  operatingCashflow: number | null;
  passesRevenue: boolean;
  passesEPS: boolean;
  passesPE: boolean;
  qualifiesGrowth: boolean;
  qualifiesGarp: boolean;
}

export interface TechnicalPoint {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number;
  sma50: number | null;
  sma200: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
}

export interface TechnicalSummary {
  currentPrice: number;
  sma50: number | null;
  sma200: number | null;
  isUptrend: boolean;
  goldenCross: boolean;
  deathCross: boolean;
  rsi: number | null;
  rsiStatus: string;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  macdMomentum: string;
}

export interface TechnicalData {
  ticker: string;
  summary: TechnicalSummary;
  series: TechnicalPoint[];
  error?: string;
}

export interface MacroContext {
  timestamp: number;
  us: {
    fedFundsRate: number;
    fedRateDisplay: string;
    treasury10Y: number;
    sp500: number;
    sp500ChangePct: number;
    monetaryStance: string;
    impactOnGrowth: string;
  };
  malaysia: {
    opr: number;
    oprDisplay: string;
    mgs10Y: number;
    klci: number;
    klciChangePct: number;
    monetaryStance: string;
    impactOnGrowth: string;
  };
  fx: {
    usdMyr: number;
    currencyTrend: string;
    implication: string;
  };
}

export interface TradingAgentsCommitteeReport {
  ticker: string;
  name: string;
  opportunityScore: number;
  verdict: string;
  committee: {
    fundamentalAnalyst: string;
    technicalAnalyst: string;
    riskManagerAndDebate: string;
    chiefInvestmentOfficer: string;
  };
  keyMetrics: {
    revenueGrowthYoY: number | null;
    epsGrowthYoY: number | null;
    debtToEquity: number | null;
    returnOnEquity?: number | null;
    dividendYield?: number | null;
    trailingEps?: number | null;
    forwardEps?: number | null;
    trailingPE?: number | null;
    freeCashflowFormatted?: string;
    sentimentScore?: number;
    sentimentLabel?: string;
    sentimentHeadline?: string;
    sma50: number | null;
    sma200: number | null;
    rsi: number | null;
    isUptrend: boolean;
    fedRate: string;
    malaysiaOpr: string;
    usdMyr: number;
  };
  modelUsed: string;
}

export interface ScreenerItem {
  ticker: string;
  name: string;
  market: string;
  currency: string;
  price: number;
  changePercent: number;
  sector: string;
  revenueGrowthYoY: number | null;
  epsGrowthYoY: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  passesROE: boolean;
  trailingPE: number | null;
  passesPE: boolean;
  dividendYield: number | null;
  trailingEps: number | null;
  forwardEps: number | null;
  freeCashflow: number | null;
  freeCashflowFormatted: string;
  isUptrend: boolean;
  goldenCross: boolean;
  rsi: number | null;
  sentimentScore?: number;
  sentimentLabel?: string;
  sentimentHeadline?: string;
  qualifiesGrowth: boolean;
}

export interface ScreenerResponse {
  market: string;
  totalScanned: number;
  qualifyingCount: number;
  criteria: {
    minRevenueGrowth: number;
    minEpsGrowth: number;
    maxDebtToEquity: number;
    minROE?: number;
    maxPE?: number | null;
  };
  results: ScreenerItem[];
}

export interface SupplyChainItem {
  entity_name: string;
  relationship_type: 'Supplier' | 'Customer' | 'Partner';
  evidence_quote: string;
  source_section: string;
  ticker_symbol?: string | null;
  category: string;
  tier?: string | null;
  region?: string | null;
  cogs_or_rev_share?: string | null;
  concentration_risk: 'Critical Single-Source' | 'High' | 'Moderate' | 'Diversified';
  financial_impact?: string | null;
  geopolitical_chokepoint?: string | null;
  investor_thesis?: string | null;
}

export interface SupplyChainResponse {
  ticker: string;
  company_name: string;
  filing_type: string;
  filing_period: string;
  filing_accession: string;
  vulnerability_index: number;
  single_source_count: number;
  tier1_count?: number;
  tier2_count?: number;
  customer_count?: number;
  relationships: SupplyChainItem[];
  investor_summary: string;
  model_used: string;
}

