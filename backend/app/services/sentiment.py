import time
from typing import Dict, Any, List
from .market_data import get_ticker_object, normalize_ticker

# In-memory cache for sentiment to prevent repeated yfinance news calls
_SENTIMENT_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 600  # 10 minutes

# Financial sentiment keywords
POSITIVE_KEYWORDS = [
    "strong", "growth", "expansion", "record", "surge", "beat", "upgrade", 
    "dividend", "profit", "buy", "rebound", "bullish", "jump", "soar", 
    "outperform", "higher", "gain", "breakthrough", "partnership", "success",
    "healthy", "opportunity", "robust", "resilient", "accelerate"
]

NEGATIVE_KEYWORDS = [
    "masking", "underlying issues", "weakness", "plunge", "slump", "drop", 
    "probe", "investigation", "scrutiny", "risk", "debt", "selloff", 
    "downgrade", "caution", "litigation", "short", "lag", "concern", 
    "fail", "loss", "bearish", "scandal", "fall", "struggle", "pressure",
    "controversy", "fraud", "overhang", "uncertainty", "disappoint", "sluggish"
]

def analyze_stock_sentiment(ticker: str) -> Dict[str, Any]:
    norm_ticker = normalize_ticker(ticker)
    now = time.time()
    
    if norm_ticker in _SENTIMENT_CACHE:
        entry = _SENTIMENT_CACHE[norm_ticker]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]
            
    t = get_ticker_object(norm_ticker)
    raw_news = t.news or []
    
    headlines: List[Dict[str, str]] = []
    text_corpus = ""
    
    for item in raw_news[:10]:
        # Handle both yfinance 1.x nested content and classic schema
        title = ""
        summary = ""
        provider = ""
        
        if "content" in item and isinstance(item["content"], dict):
            c = item["content"]
            title = c.get("title") or ""
            summary = c.get("summary") or ""
            provider = c.get("provider", {}).get("displayName") or ""
        else:
            title = item.get("title") or ""
            summary = item.get("summary") or ""
            provider = item.get("publisher") or ""
            
        if title:
            headlines.append({
                "title": title,
                "summary": summary[:200],
                "provider": provider
            })
            text_corpus += f" {title.lower()} {summary.lower()}"
            
    # Calculate sentiment polarity score (-100 to +100)
    pos_hits = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_corpus)
    neg_hits = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_corpus)
    
    # Specific detection for accounting skepticism (like Zetrix "masking underlying issues")
    skepticism_patterns = ["masking", "underlying issue", "underlying issues", "weakness", "not reveal", "has not materialized", "scrutiny", "probe"]
    for sp in skepticism_patterns:
        if sp in text_corpus:
            neg_hits += 2
            
    total_signals = pos_hits + neg_hits
    score = 0
    if total_signals > 0:
        score = int(((pos_hits - neg_hits) / total_signals) * 100)
        
    # Labeling
    if score >= 20:
        label = "Bullish / Positive"
        badge_color = "emerald"
    elif score <= -15:
        label = "Caution / Bearish"
        badge_color = "rose"
    else:
        label = "Neutral / Mixed"
        badge_color = "amber"
        
    top_headline = headlines[0]["title"] if headlines else "No recent breaking news detected."
    
    sentiment_data = {
        "ticker": norm_ticker,
        "sentimentScore": score,
        "sentimentLabel": label,
        "badgeColor": badge_color,
        "topHeadline": top_headline,
        "headlinesAnalyzed": len(headlines),
        "headlines": headlines[:4],
        "positiveSignalCount": pos_hits,
        "negativeSignalCount": neg_hits,
        "summary": (
            f"Sentiment is {label} (Score: {score:+d}). "
            f"{'Recent press highlights caution or underlying risks.' if score <= -15 else 'Headlines highlight constructive momentum.' if score >= 20 else 'Market sentiment remains balanced.'}"
        )
    }
    
    _SENTIMENT_CACHE[norm_ticker] = {"data": sentiment_data, "timestamp": now}
    return sentiment_data
