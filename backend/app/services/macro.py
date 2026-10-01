import time
import yfinance as yf
from typing import Dict, Any

_MACRO_CACHE: Dict[str, Any] = {}
_MACRO_CACHE_TIME = 0
CACHE_DURATION = 900  # 15 minutes

def get_macro_context() -> Dict[str, Any]:
    global _MACRO_CACHE, _MACRO_CACHE_TIME
    now = time.time()
    
    if _MACRO_CACHE and (now - _MACRO_CACHE_TIME < CACHE_DURATION):
        return _MACRO_CACHE
        
    # Baseline defaults in case of network variance
    us_fed_rate = 5.25  # Target rate %
    my_opr = 3.00       # BNM OPR %
    us_10y_yield = 4.25
    my_10y_yield = 3.82
    usd_myr = 4.35
    sp500_price = 5800.0
    sp500_change = 0.0
    klci_price = 1640.0
    klci_change = 0.0
    
    try:
        # Fetch live US 10Y Treasury
        tnx = yf.Ticker("^TNX").history(period="2d")
        if not tnx.empty:
            us_10y_yield = round(float(tnx["Close"].iloc[-1]), 2)
            
        # Fetch USD/MYR currency pair
        fx = yf.Ticker("MYR=X").history(period="2d")
        if not fx.empty:
            usd_myr = round(float(fx["Close"].iloc[-1]), 4)
            
        # Fetch S&P 500
        sp = yf.Ticker("^GSPC").history(period="2d")
        if not sp.empty:
            sp500_price = round(float(sp["Close"].iloc[-1]), 2)
            if len(sp) > 1:
                p_close = float(sp["Close"].iloc[-2])
                sp500_change = round(((sp500_price - p_close) / p_close) * 100.0, 2)
                
        # Fetch FBM KLCI (Bursa Malaysia Benchmark)
        klci = yf.Ticker("^KLSE").history(period="2d")
        if not klci.empty:
            klci_price = round(float(klci["Close"].iloc[-1]), 2)
            if len(klci) > 1:
                p_close = float(klci["Close"].iloc[-2])
                klci_change = round(((klci_price - p_close) / p_close) * 100.0, 2)
                
    except Exception as e:
        print(f"Notice: Using standard macro baselines: {e}")
        
    macro_data = {
        "timestamp": now,
        "us": {
            "fedFundsRate": us_fed_rate,
            "fedRateDisplay": f"{us_fed_rate:.2f}%",
            "treasury10Y": us_10y_yield,
            "sp500": sp500_price,
            "sp500ChangePct": sp500_change,
            "monetaryStance": "Restrictive / Data-Dependent",
            "impactOnGrowth": "Higher yields compress long-duration tech valuations, favoring companies with high cash flows and low debt."
        },
        "malaysia": {
            "opr": my_opr,
            "oprDisplay": f"{my_opr:.2f}%",
            "mgs10Y": my_10y_yield,
            "klci": klci_price,
            "klciChangePct": klci_change,
            "monetaryStance": "Neutral & Accommodative at 3.00%",
            "impactOnGrowth": "Stable OPR provides predictable borrowing costs for local industrials, banks, and technology exporters."
        },
        "fx": {
            "usdMyr": usd_myr,
            "currencyTrend": "MYR Strengthening" if usd_myr < 4.40 else "USD Dominant",
            "implication": "A stronger Ringgit lowers imported capital equipment costs for Malaysian tech manufacturing while US tech stocks provide foreign currency hedge."
        }
    }
    
    _MACRO_CACHE = macro_data
    _MACRO_CACHE_TIME = now
    return macro_data
