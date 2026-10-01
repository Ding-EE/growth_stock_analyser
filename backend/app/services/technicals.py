import pandas as pd
import numpy as np
import ta
from typing import Dict, Any, List
from .market_data import get_historical_data, normalize_ticker

# Mapping of display period to target display trading days
PERIOD_BARS_MAP = {
    "1mo": 22,
    "3mo": 66,
    "6mo": 130,
    "1y": 252,
    "2y": 504,
    "5y": 1260
}

# Warmup fetch period needed so 200-day SMA is already fully formed from bar 1
PERIOD_FETCH_MAP = {
    "1mo": "2y",
    "3mo": "2y",
    "6mo": "2y",
    "1y": "2y",
    "2y": "5y",
    "5y": "max"
}

def calculate_technical_indicators(ticker: str, period: str = "1y") -> Dict[str, Any]:
    """
    Computes 50-day and 200-day Simple Moving Averages, RSI (14), and MACD (12, 26, 9)
    using institutional warm-up data so indicators run continuously across the entire requested view.
    """
    norm_ticker = normalize_ticker(ticker)
    fetch_period = PERIOD_FETCH_MAP.get(period, "2y")
    
    # Fetch historical data with warm-up buffer
    df = get_historical_data(norm_ticker, period=fetch_period)
    
    if df.empty or len(df) < 20:
        return {
            "ticker": norm_ticker,
            "error": "Insufficient historical data for technical analysis.",
            "series": [],
            "summary": {}
        }
        
    df = df.copy()
    close = df["Close"]
    
    # Simple Moving Averages: 50-day and 200-day computed on full warm-up series
    df["SMA_50"] = ta.trend.sma_indicator(close, window=min(50, len(df)), fillna=False)
    if len(df) >= 200:
        df["SMA_200"] = ta.trend.sma_indicator(close, window=200, fillna=False)
    else:
        # Fallback to available period
        df["SMA_200"] = ta.trend.sma_indicator(close, window=len(df), fillna=False)
        
    # Relative Strength Index (RSI 14)
    df["RSI_14"] = ta.momentum.rsi(close, window=14, fillna=False)
    
    # MACD (12, 26, 9)
    macd = ta.trend.MACD(close, window_fast=12, window_slow=26, window_sign=9)
    df["MACD"] = macd.macd()
    df["MACD_Signal"] = macd.macd_signal()
    df["MACD_Hist"] = macd.macd_diff()
    
    # Clean NaN values
    df.replace({np.nan: None}, inplace=True)
    
    # Latest indicators summary before slicing
    latest = df.iloc[-1]
    
    current_close = float(latest["Close"]) if latest["Close"] is not None else 0.0
    sma_50 = float(latest["SMA_50"]) if latest["SMA_50"] is not None else None
    sma_200 = float(latest["SMA_200"]) if latest["SMA_200"] is not None else None
    rsi = float(latest["RSI_14"]) if latest["RSI_14"] is not None else None
    macd_val = float(latest["MACD"]) if latest["MACD"] is not None else None
    macd_sig = float(latest["MACD_Signal"]) if latest["MACD_Signal"] is not None else None
    macd_hist = float(latest["MACD_Hist"]) if latest["MACD_Hist"] is not None else None
    
    # Uptrend confirmation & Golden Cross detection
    is_uptrend = False
    golden_cross = False
    death_cross = False
    
    if sma_50 is not None and sma_200 is not None:
        is_uptrend = current_close > sma_50 and sma_50 > sma_200
        recent_df = df.tail(15)
        had_below = any(
            r["SMA_50"] is not None and r["SMA_200"] is not None and r["SMA_50"] < r["SMA_200"] 
            for _, r in recent_df.iterrows()
        )
        if had_below and sma_50 > sma_200:
            golden_cross = True
        elif sma_50 < sma_200:
            death_cross = True
            
    # RSI Condition
    rsi_status = "Neutral"
    if rsi is not None:
        if rsi >= 70:
            rsi_status = "Overbought (High Momentum)"
        elif rsi <= 30:
            rsi_status = "Oversold (Value Zone)"
        elif rsi > 50:
            rsi_status = "Bullish Momentum"
        else:
            rsi_status = "Bearish / Consolidation"
            
    # MACD Condition
    macd_momentum = "Neutral"
    if macd_val is not None and macd_sig is not None:
        if macd_val > macd_sig and (macd_hist or 0) > 0:
            macd_momentum = "Bullish Acceleration"
        elif macd_val > macd_sig:
            macd_momentum = "Bullish"
        elif macd_val < macd_sig and (macd_hist or 0) < 0:
            macd_momentum = "Bearish Expansion"
        else:
            macd_momentum = "Bearish"
            
    # Slice dataframe to the requested display timeframe
    target_bars = PERIOD_BARS_MAP.get(period, 252)
    display_df = df.tail(target_bars).copy()
    
    # Serialize historical series for frontend chart
    series_data: List[Dict[str, Any]] = []
    for _, row in display_df.iterrows():
        series_data.append({
            "date": str(row.get("DateStr") or row.get("Date") or ""),
            "open": round(row["Open"], 2) if row.get("Open") is not None else None,
            "high": round(row["High"], 2) if row.get("High") is not None else None,
            "low": round(row["Low"], 2) if row.get("Low") is not None else None,
            "close": round(row["Close"], 2) if row.get("Close") is not None else None,
            "volume": int(row["Volume"]) if row.get("Volume") is not None else 0,
            "sma50": round(row["SMA_50"], 2) if row.get("SMA_50") is not None else None,
            "sma200": round(row["SMA_200"], 2) if row.get("SMA_200") is not None else None,
            "rsi": round(row["RSI_14"], 2) if row.get("RSI_14") is not None else None,
            "macd": round(row["MACD"], 3) if row.get("MACD") is not None else None,
            "macdSignal": round(row["MACD_Signal"], 3) if row.get("MACD_Signal") is not None else None,
            "macdHist": round(row["MACD_Hist"], 3) if row.get("MACD_Hist") is not None else None,
        })
        
    return {
        "ticker": norm_ticker,
        "summary": {
            "currentPrice": round(current_close, 3),
            "sma50": round(sma_50, 3) if sma_50 else None,
            "sma200": round(sma_200, 3) if sma_200 else None,
            "isUptrend": is_uptrend,
            "goldenCross": golden_cross,
            "deathCross": death_cross,
            "rsi": round(rsi, 2) if rsi else None,
            "rsiStatus": rsi_status,
            "macd": round(macd_val, 3) if macd_val else None,
            "macdSignal": round(macd_sig, 3) if macd_sig else None,
            "macdHist": round(macd_hist, 3) if macd_hist else None,
            "macdMomentum": macd_momentum,
        },
        "series": series_data
    }
