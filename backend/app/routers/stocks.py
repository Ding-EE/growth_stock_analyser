from fastapi import APIRouter, HTTPException, Query
from ..services.market_data import get_stock_quote, normalize_ticker
from ..services.fundamentals import get_fundamental_metrics
from ..services.technicals import calculate_technical_indicators
from ..services.ai_synthesis import generate_committee_synthesis
from ..services.sentiment import analyze_stock_sentiment
from ..services.knowledge_graph import generate_stock_knowledge_graph

router = APIRouter(prefix="/api/stock", tags=["Stocks"])

@router.get("/{ticker}/overview")
def get_stock_overview(ticker: str):
    """Returns combined real-time quote, fundamental metrics, and news sentiment."""
    try:
        norm_ticker = normalize_ticker(ticker)
        quote = get_stock_quote(norm_ticker)
        fundamentals = get_fundamental_metrics(norm_ticker)
        sentiment = analyze_stock_sentiment(norm_ticker)
        return {
            "quote": quote,
            "fundamentals": fundamentals,
            "sentiment": sentiment
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock overview: {str(e)}")

@router.get("/{ticker}/technicals")
def get_stock_technicals(ticker: str, period: str = Query("1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$")):
    """Returns 50-day and 200-day SMA, RSI (14), and MACD (12, 26, 9) historical series and summary."""
    try:
        norm_ticker = normalize_ticker(ticker)
        return calculate_technical_indicators(norm_ticker, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate technicals: {str(e)}")

@router.get("/{ticker}/sentiment")
def get_stock_sentiment(ticker: str):
    """Returns news headline sentiment analysis."""
    try:
        norm_ticker = normalize_ticker(ticker)
        return analyze_stock_sentiment(norm_ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze sentiment: {str(e)}")

@router.get("/{ticker}/knowledge-graph")
def get_stock_knowledge_graph(ticker: str):
    """
    Returns the Financial News Knowledge Graph (KG) grounded in real-time news,
    macroeconomic institutions, and risk entities (inspired by tpetkovich/news_KG).
    """
    try:
        norm_ticker = normalize_ticker(ticker)
        return generate_stock_knowledge_graph(norm_ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate knowledge graph: {str(e)}")

@router.get("/{ticker}/supply-chain")
def get_stock_supply_chain(ticker: str):
    """
    Returns the Interactive Supply Chain Network with Fact-Checked Citations (Bloomberg SPLC <GO> style):
    - Upstream Suppliers, Downstream Customers, and Strategic Partners
    - Exact verbatim citations and source sections extracted from SEC Form 10-K & Bursa Malaysia Annual Reports
    - Institutional Vulnerability Index & Single-Source Concentration Flags
    """
    try:
        from ..services.sec_supply_chain import extract_sec_supply_chain
        norm_ticker = normalize_ticker(ticker)
        return extract_sec_supply_chain(norm_ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract supply chain: {str(e)}")

@router.get("/{ticker}/committee")
def get_committee_analysis(ticker: str):
    """
    Executes the TradingAgents 30-Year Veteran Investment Committee process:
    - Senior Buy-Side Fundamental Analyst (ROE > 10%, FCF, Earnings Quality)
    - Chief Technical Strategist (50/200 SMA tape structure, RSI, MACD, Wyckoff phase)
    - Senior Risk Officer (Fed vs BNM OPR, USD/MYR, Headline Risk & Sentiment)
    - Managing Partner & CIO (P/E margin of safety, Score 1-100, tactical execution plan)
    """
    try:
        norm_ticker = normalize_ticker(ticker)
        return generate_committee_synthesis(norm_ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate committee synthesis: {str(e)}")
