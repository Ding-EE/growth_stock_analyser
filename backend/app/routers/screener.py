import time
import threading
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from ..config import settings
from ..services.market_data import get_stock_quote, normalize_ticker, get_canonical_name
from ..services.fundamentals import get_fundamental_metrics
from ..services.technicals import calculate_technical_indicators
from ..services.sentiment import analyze_stock_sentiment

router = APIRouter(prefix="/api/screener", tags=["Screener"])

# In-memory raw stock data cache (15-minute TTL)
# This enables instant (<1ms) re-filtering, sorting, and tab switching without repetitive network calls
_SCREENER_DATA_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 900  # 15 minutes

def _fetch_single_stock_data(ticker: str) -> Optional[Dict[str, Any]]:
    norm_ticker = normalize_ticker(ticker)
    now = time.time()
    
    # Check cache first
    if norm_ticker in _SCREENER_DATA_CACHE:
        entry = _SCREENER_DATA_CACHE[norm_ticker]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]

    try:
        quote = get_stock_quote(norm_ticker)
        fund = get_fundamental_metrics(norm_ticker)
        tech = calculate_technical_indicators(norm_ticker, period="6mo")
        sent = analyze_stock_sentiment(norm_ticker)
        
        tech_sum = tech.get("summary", {})
        
        data = {
            "ticker": norm_ticker,
            "name": quote.get("name") or get_canonical_name(norm_ticker),
            "market": quote.get("market"),
            "currency": quote.get("currency"),
            "price": quote.get("currentPrice"),
            "changePercent": quote.get("changePercent"),
            "sector": fund.get("sector"),
            "revenueGrowthYoY": fund.get("revenueGrowthYoY"),
            "epsGrowthYoY": fund.get("epsGrowthYoY"),
            "debtToEquity": fund.get("debtToEquity"),
            "returnOnEquity": fund.get("returnOnEquity"),
            "isFinancial": fund.get("isFinancial", False),
            "trailingPE": fund.get("trailingPE"),
            "dividendYield": fund.get("dividendYield"),
            "trailingEps": fund.get("trailingEps"),
            "forwardEps": fund.get("forwardEps"),
            "freeCashflow": fund.get("freeCashflow"),
            "freeCashflowFormatted": fund.get("freeCashflowFormatted"),
            "isUptrend": tech_sum.get("isUptrend", False),
            "goldenCross": tech_sum.get("goldenCross", False),
            "rsi": tech_sum.get("rsi"),
            "sentimentScore": sent.get("sentimentScore", 0),
            "sentimentLabel": sent.get("sentimentLabel", "Neutral / Mixed"),
            "sentimentHeadline": sent.get("topHeadline", "")
        }
        
        _SCREENER_DATA_CACHE[norm_ticker] = {"data": data, "timestamp": now}
        return data
    except Exception as e:
        print(f"Error fetching screener data for {ticker}: {e}")
        return None

def warmup_screener_cache():
    """Background task to pre-populate screener cache for rapid response on cloud instances."""
    print("[Screener Warmup] Pre-warming watchlist cache in background...")
    top_tickers = settings.US_WATCHLIST[:12] + settings.BURSA_WATCHLIST[:12]
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(_fetch_single_stock_data, top_tickers))
    print("[Screener Warmup] Initial pre-warming complete!")

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
    Ultra-Fast Institutional Screener across US and Bursa Malaysia equities:
    - Cached stock metrics (15-min TTL) prevent repetitive network calls on Render
    - Real-time in-memory filtering: slider adjustments and tab changes take <1ms
    - 6 worker concurrency avoids thread thrashing and memory exhaustion on cloud instances
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
    
    # 1. Identify tickers that need network fetching
    now = time.time()
    needed = [
        t for t in unique_tickers 
        if normalize_ticker(t) not in _SCREENER_DATA_CACHE 
        or (now - _SCREENER_DATA_CACHE[normalize_ticker(t)]["timestamp"] >= CACHE_TTL)
    ]
    
    # 2. Fetch missing items concurrently (6 workers optimized for 0.1 vCPU / 512MB RAM)
    if needed:
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = [executor.submit(_fetch_single_stock_data, t) for t in needed]
            for f in as_completed(futures):
                pass
                
    # 3. Instantaneous in-memory evaluation of user filter criteria
    results = []
    for ticker in unique_tickers:
        norm_t = normalize_ticker(ticker)
        if norm_t in _SCREENER_DATA_CACHE:
            base = _SCREENER_DATA_CACHE[norm_t]["data"]
            
            rev_g = base.get("revenueGrowthYoY")
            eps_g = base.get("epsGrowthYoY")
            de = base.get("debtToEquity")
            roe = base.get("returnOnEquity")
            pe = base.get("trailingPE")
            is_fin = base.get("isFinancial", False)
            
            passes_rev = rev_g is not None and rev_g >= min_rev_growth
            passes_eps = eps_g is not None and eps_g >= min_eps_growth
            passes_debt = is_fin or (de is None) or (de <= max_debt_to_equity)
            passes_roe = roe is not None and roe >= min_roe
            
            passes_pe_filter = True
            if max_pe is not None and max_pe > 0:
                passes_pe_filter = pe is not None and pe <= max_pe
                
            qualifies = bool(passes_rev and passes_eps and passes_debt and passes_roe and passes_pe_filter)
            
            item = dict(base)
            item["passesROE"] = passes_roe
            item["passesPE"] = (pe is not None and pe <= 15.0)
            item["qualifiesGrowth"] = qualifies
            results.append(item)
                
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
