from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from ..config import settings
from ..services.market_data import get_stock_quote, normalize_ticker, get_canonical_name
from ..services.fundamentals import get_fundamental_metrics
from ..services.technicals import calculate_technical_indicators
from ..services.sentiment import analyze_stock_sentiment

router = APIRouter(prefix="/api/screener", tags=["Screener"])

def _process_screener_stock(ticker: str, min_rev_growth: float, min_eps_growth: float, max_debt_to_equity: float, min_roe: float, max_pe: Optional[float]) -> Optional[Dict[str, Any]]:
    try:
        norm_ticker = normalize_ticker(ticker)
        quote = get_stock_quote(norm_ticker)
        fund = get_fundamental_metrics(norm_ticker)
        tech = calculate_technical_indicators(norm_ticker, period="6mo")
        sent = analyze_stock_sentiment(norm_ticker)
        
        tech_sum = tech.get("summary", {})
        
        rev_g = fund.get("revenueGrowthYoY")
        eps_g = fund.get("epsGrowthYoY")
        de = fund.get("debtToEquity")
        roe = fund.get("returnOnEquity")
        pe = fund.get("trailingPE")
        is_fin = fund.get("isFinancial", False)
        
        passes_rev = rev_g is not None and rev_g >= min_rev_growth
        passes_eps = eps_g is not None and eps_g >= min_eps_growth
        passes_debt = is_fin or (de is None) or (de <= max_debt_to_equity)
        passes_roe = roe is not None and roe >= min_roe
        
        passes_pe_filter = True
        if max_pe is not None and max_pe > 0:
            passes_pe_filter = pe is not None and pe <= max_pe
            
        qualifies = bool(passes_rev and passes_eps and passes_debt and passes_roe and passes_pe_filter)
        
        return {
            "ticker": norm_ticker,
            "name": quote.get("name") or get_canonical_name(norm_ticker),
            "market": quote.get("market"),
            "currency": quote.get("currency"),
            "price": quote.get("currentPrice"),
            "changePercent": quote.get("changePercent"),
            "sector": fund.get("sector"),
            "revenueGrowthYoY": rev_g,
            "epsGrowthYoY": eps_g,
            "debtToEquity": de,
            "returnOnEquity": roe,
            "passesROE": passes_roe,
            "trailingPE": pe,
            "passesPE": (pe is not None and pe <= 15.0),
            "dividendYield": fund.get("dividendYield"),
            "trailingEps": fund.get("trailingEps"),
            "forwardEps": fund.get("forwardEps"),
            "freeCashflow": fund.get("freeCashflow"),
            "freeCashflowFormatted": fund.get("freeCashflowFormatted"),
            "isUptrend": tech_sum.get("isUptrend", False),
            "goldenCross": tech_sum.get("goldenCross", False),
            "rsi": tech_sum.get("rsi"),
            "sentimentScore": sent.get("sentimentScore", 0),
            "sentimentLabel": sent.get("sentimentLabel", "Neutral"),
            "sentimentHeadline": sent.get("topHeadline", ""),
            "qualifiesGrowth": qualifies
        }
    except Exception as e:
        print(f"Error screening ticker {ticker}: {e}")
        return None

@router.get("")
def screen_stocks(
    market: str = Query("ALL", pattern="^(ALL|US|BURSA)$"),
    min_rev_growth: float = Query(15.0, description="Minimum YoY Revenue Growth %"),
    min_eps_growth: float = Query(15.0, description="Minimum YoY EPS Growth %"),
    max_debt_to_equity: float = Query(2.0, description="Maximum Debt-to-Equity ratio"),
    min_roe: float = Query(10.0, description="Minimum Return on Equity (ROE) %"),
    max_pe: Optional[float] = Query(None, description="Optional Maximum Trailing P/E threshold"),
    custom_ticker: Optional[str] = Query(None, description="Optional custom ticker to include in the screen")
) -> Dict[str, Any]:
    """
    High-Performance Institutional Screener across US and Bursa Malaysia equities:
    - Multi-threaded screening
    - Filters: ROE > 10%, YoY Rev > 15%, YoY EPS > 15%, P/E <= 15, Manageable D/E
    - Metrics: Dividend Yield, EPS, Free Cash Flow, and News Sentiment
    - Allows adding any custom ticker dynamically
    """
    tickers = []
    if market in ["US", "ALL"]:
        tickers.extend(settings.US_WATCHLIST)
    if market in ["BURSA", "ALL"]:
        tickers.extend(settings.BURSA_WATCHLIST)
        
    if custom_ticker:
        norm_cust = normalize_ticker(custom_ticker)
        if norm_cust not in tickers:
            tickers.insert(0, norm_cust)
            
    # Remove duplicates preserving order
    unique_tickers = list(dict.fromkeys(tickers))
    
    results = []
    # Use ThreadPoolExecutor for fast concurrent data fetching
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {
            executor.submit(
                _process_screener_stock, 
                ticker, 
                min_rev_growth, 
                min_eps_growth, 
                max_debt_to_equity, 
                min_roe, 
                max_pe
            ): ticker for ticker in unique_tickers
        }
        for future in as_completed(futures):
            res = future.result()
            if res:
                results.append(res)
                
    # Default sort: qualifying stocks first, then by ROE and revenue growth
    results.sort(
        key=lambda x: (
            x["qualifiesGrowth"], 
            (x["returnOnEquity"] or -999), 
            (x["revenueGrowthYoY"] or -999)
        ), 
        reverse=True
    )
    
    qualifying_count = sum(1 for r in results if r["qualifiesGrowth"])
    
    return {
        "market": market,
        "totalScanned": len(results),
        "qualifyingCount": qualifying_count,
        "criteria": {
            "minRevenueGrowth": min_rev_growth,
            "minEpsGrowth": min_eps_growth,
            "maxDebtToEquity": max_debt_to_equity,
            "minROE": min_roe,
            "maxPE": max_pe
        },
        "results": results
    }
