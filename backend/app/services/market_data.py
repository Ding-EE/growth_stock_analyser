import time
import pandas as pd
import yfinance as yf
from typing import Optional, Dict, Any

# Simple in-memory TTL cache to optimize rate limits
_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # 5 minutes

# Authoritative company name lookup for Malaysia and US equities
EQUITY_CANONICAL_NAMES: Dict[str, str] = {
    # Bursa Malaysia Watchlist
    "1155.KL": "Malayan Banking Berhad (Maybank)",
    "1023.KL": "CIMB Group Holdings Berhad",
    "1295.KL": "Public Bank Berhad",
    "1066.KL": "RHB Bank Berhad",
    "1015.KL": "AMMB Holdings Berhad (AmBank)",
    "5819.KL": "Hong Leong Bank Berhad",
    "0166.KL": "Inari Amertron Berhad",
    "0097.KL": "ViTrox Corporation Berhad",
    "0128.KL": "Frontken Corporation Berhad",
    "0138.KL": "Zetrix AI Berhad (MY E.G. Services)",
    "0208.KL": "Greatech Technology Berhad",
    "5292.KL": "UWC Berhad",
    "7204.KL": "D&O Green Technologies Berhad",
    "5398.KL": "Gamuda Berhad",
    "8869.KL": "Press Metal Aluminium Holdings",
    "5211.KL": "Sunway Berhad",
    "7277.KL": "Dialog Group Berhad",
    "3816.KL": "MISC Berhad",
    "7084.KL": "QL Resources Berhad",
    "5296.KL": "MR D.I.Y. Group (M) Berhad",
    "4707.KL": "Nestlé (Malaysia) Berhad",
    "5306.KL": "Farm Fresh Berhad",
    "4197.KL": "Sime Darby Berhad",
    "2445.KL": "Kuala Lumpur Kepong Berhad (KLK)",
    "1961.KL": "IOI Corporation Berhad",
    "5225.KL": "IHH Healthcare Berhad",
    "5878.KL": "KPJ Healthcare Berhad",
    "5099.KL": "Capital A Berhad (AirAsia)",
    "5183.KL": "Petronas Chemicals Group Berhad",
    "6033.KL": "Petronas Gas Berhad",
    "5681.KL": "Petronas Dagangan Berhad",
    "5347.KL": "Tenaga Nasional Berhad (TNB)",
    "6742.KL": "YTL Power International Berhad",
    "6888.KL": "Axiata Group Berhad",
    "6947.KL": "CelcomDigi Berhad",
    "4863.KL": "Telekom Malaysia Berhad",
    "5168.KL": "Hartalega Holdings Berhad",
    "7113.KL": "Top Glove Corporation Bhd",
    
    # US Watchlist Leaders
    "AAPL": "Apple Inc.",
    "NVDA": "NVIDIA Corporation",
    "MSFT": "Microsoft Corporation",
    "AMZN": "Amazon.com, Inc.",
    "GOOGL": "Alphabet Inc.",
    "META": "Meta Platforms, Inc.",
    "TSLA": "Tesla, Inc.",
    "AVGO": "Broadcom Inc.",
    "PLTR": "Palantir Technologies Inc.",
    "AMD": "Advanced Micro Devices, Inc.",
    "CRWD": "CrowdStrike Holdings, Inc.",
    "NOW": "ServiceNow, Inc.",
    "SNOW": "Snowflake Inc.",
    "NFLX": "Netflix, Inc.",
    "COST": "Costco Wholesale Corporation",
    "LLY": "Eli Lilly and Company",
    "JPM": "JPMorgan Chase & Co.",
    "V": "Visa Inc.",
    "UNH": "UnitedHealth Group Incorporated",
    "WMT": "Walmart Inc.",
    "QCOM": "Qualcomm Incorporated",
    "TXN": "Texas Instruments Incorporated",
    "UBER": "Uber Technologies, Inc.",
    "ABNB": "Airbnb, Inc.",
    "PANW": "Palo Alto Networks, Inc.",
    "SMCI": "Super Micro Computer, Inc.",
    "COIN": "Coinbase Global, Inc.",
    "ARM": "Arm Holdings plc",
    "ASML": "ASML Holding N.V.",
    "CRM": "Salesforce, Inc."
}

def get_canonical_name(ticker: str, info: Optional[Dict[str, Any]] = None) -> str:
    norm_ticker = normalize_ticker(ticker)
    if norm_ticker in EQUITY_CANONICAL_NAMES:
        return EQUITY_CANONICAL_NAMES[norm_ticker]
    if info:
        long_n = info.get("longName")
        if long_n and long_n.strip() and long_n.strip().upper() != norm_ticker:
            return long_n.strip()
        short_n = info.get("shortName")
        if short_n and short_n.strip() and short_n.strip().upper() != norm_ticker:
            return short_n.strip()
    return norm_ticker

def normalize_ticker(ticker: str) -> str:
    """
    Standardize ticker symbol:
    - Uppercase and strip whitespace.
    - If ticker is numeric (e.g., '1155', '1023') or known Bursa code, append '.KL' if not already present.
    """
    clean = ticker.strip().upper()
    if clean.isdigit():
        clean = f"{clean}.KL"
    elif clean.endswith(".K"):
        clean = f"{clean}L"
    return clean

def get_ticker_object(ticker: str) -> yf.Ticker:
    norm_ticker = normalize_ticker(ticker)
    return yf.Ticker(norm_ticker)

def get_stock_quote(ticker: str) -> Dict[str, Any]:
    norm_ticker = normalize_ticker(ticker)
    now = time.time()
    
    # Check cache
    cache_key = f"quote_{norm_ticker}"
    if cache_key in _CACHE:
        entry = _CACHE[cache_key]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]
            
    t = get_ticker_object(norm_ticker)
    info = t.info or {}
    
    # Historical recent day for accurate price fallback
    hist = t.history(period="5d")
    current_price = info.get("currentPrice") or info.get("regularMarketPrice")
    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose")
    
    if current_price is None and not hist.empty:
        current_price = float(hist["Close"].iloc[-1])
        if len(hist) > 1:
            prev_close = float(hist["Close"].iloc[-2])
            
    change = 0.0
    change_pct = 0.0
    if current_price and prev_close:
        change = current_price - prev_close
        change_pct = (change / prev_close) * 100.0
        
    is_malaysia = norm_ticker.endswith(".KL")
    currency = "MYR" if is_malaysia else info.get("currency", "USD")
    
    raw_div = info.get("dividendYield")
    trailing_div = info.get("trailingAnnualDividendYield")
    div_yield_pct = None
    if raw_div is not None:
        div_yield_pct = round(raw_div if raw_div > 0.20 else raw_div * 100.0, 2)
    elif trailing_div is not None:
        div_yield_pct = round(trailing_div * 100.0, 2)
        
    data = {
        "ticker": norm_ticker,
        "name": get_canonical_name(norm_ticker, info),
        "currentPrice": round(current_price, 3) if current_price else 0.0,
        "change": round(change, 3),
        "changePercent": round(change_pct, 2),
        "currency": currency,
        "market": "Bursa Malaysia" if is_malaysia else "US Equities",
        "marketCap": info.get("marketCap", 0),
        "volume": info.get("regularMarketVolume") or info.get("volume", 0),
        "avgVolume": info.get("averageVolume", 0),
        "dividendYield": div_yield_pct,
        "trailingEps": round(info.get("trailingEps"), 2) if info.get("trailingEps") is not None else None,
        "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", 0.0),
        "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", 0.0),
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "summary": info.get("longBusinessSummary", "")
    }
    
    _CACHE[cache_key] = {"data": data, "timestamp": now}
    return data

def get_historical_data(ticker: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    norm_ticker = normalize_ticker(ticker)
    cache_key = f"hist_{norm_ticker}_{period}_{interval}"
    now = time.time()
    
    if cache_key in _CACHE:
        entry = _CACHE[cache_key]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]
            
    t = get_ticker_object(norm_ticker)
    df = t.history(period=period, interval=interval)
    
    if df.empty:
        # Fallback period if 1y is empty
        df = t.history(period="6mo", interval=interval)
        
    # Reset index and clean date
    if not df.empty:
        df = df.copy()
        df.reset_index(inplace=True)
        # Standardize Date column
        date_col = "Date" if "Date" in df.columns else "Datetime"
        if date_col in df.columns:
            df["DateStr"] = df[date_col].dt.strftime("%Y-%m-%d")
            
    _CACHE[cache_key] = {"data": df, "timestamp": now}
    return df
