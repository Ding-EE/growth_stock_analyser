import time
import html
import requests
import xml.etree.ElementTree as ET
from typing import Dict, Any, List
from .market_data import get_ticker_object, normalize_ticker

# In-memory cache for sentiment to prevent repeated network calls
_SENTIMENT_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 600  # 10 minutes

# Financial sentiment keywords
POSITIVE_KEYWORDS = [
    "strong", "growth", "expansion", "record", "surge", "beat", "upgrade", 
    "dividend", "profit", "buy", "rebound", "bullish", "jump", "soar", 
    "outperform", "higher", "gain", "breakthrough", "partnership", "success",
    "healthy", "opportunity", "robust", "resilient", "accelerate", "war chest",
    "boost", "billions", "rally", "unlock", "stake", "approval", "milestone",
    "top pick", "innovation", "upside", "solid", "wins", "bull", "leader",
    "accelerating", "tailwinds", "climb", "revenue jump", "all-time high"
]

NEGATIVE_KEYWORDS = [
    "masking", "underlying issue", "underlying issues", "weakness", "plunge", "slump", "drop", 
    "probe", "investigation", "scrutiny", "risk", "debt", "selloff", 
    "downgrade", "caution", "litigation", "short", "lag", "concern", 
    "fail", "loss", "bearish", "scandal", "fall", "struggle", "pressure",
    "controversy", "fraud", "overhang", "uncertainty", "disappoint", "sluggish",
    "lawsuit", "layoffs", "penalty", "subpoena", "default", "warning", "antitrust",
    "recall", "headwinds", "cut", "miss", "delisting", "offloading", "faulty", "disrupt"
]

SKEPTICISM_PATTERNS = [
    "masking", "underlying issue", "underlying issues", "scrutiny", "probe", 
    "investigation", "fraud", "auditor", "delisting", "subpoena", "short seller", 
    "accounting issue", "governance", "whistleblower", "profit masking"
]

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def _fetch_live_headlines(ticker: str) -> List[Dict[str, str]]:
    """
    Fetches live financial headlines across multiple resilient feeds:
    1. Primary: Yahoo Finance RSS Feed (bypasses yfinance's deprecated JSON endpoint)
    2. Fallback: Google News RSS Search (covers Bursa Malaysia and global equities)
    3. Fallback: Upstream yfinance ticker.news
    """
    headlines: List[Dict[str, str]] = []
    headers = {"User-Agent": USER_AGENT}
    
    # 1. Primary: Yahoo Finance RSS feed
    try:
        rss_url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}"
        resp = requests.get(rss_url, headers=headers, timeout=5)
        if resp.status_code == 200 and resp.content:
            root = ET.fromstring(resp.content)
            for item in root.findall(".//item")[:15]:
                title_elem = item.find("title")
                desc_elem = item.find("description")
                if title_elem is not None and title_elem.text:
                    title_clean = html.unescape(title_elem.text.strip())
                    desc_clean = html.unescape(desc_elem.text.strip()) if (desc_elem is not None and desc_elem.text) else ""
                    headlines.append({
                        "title": title_clean,
                        "summary": desc_clean[:250],
                        "provider": "Yahoo Finance"
                    })
    except Exception as e:
        pass

    # 2. Secondary Fallback: Google News RSS if Yahoo returns fewer than 3 items
    if len(headlines) < 3:
        try:
            query = ticker.replace(".KL", " Bursa Malaysia") + " stock news"
            g_url = f"https://news.google.com/rss/search?q={requests.utils.quote(query)}&hl=en-US&gl=US&ceid=US:en"
            resp = requests.get(g_url, headers=headers, timeout=5)
            if resp.status_code == 200 and resp.content:
                root = ET.fromstring(resp.content)
                for item in root.findall(".//item")[:10]:
                    title_elem = item.find("title")
                    if title_elem is not None and title_elem.text:
                        title_clean = html.unescape(title_elem.text.strip())
                        # Avoid duplicates
                        if not any(h["title"] == title_clean for h in headlines):
                            headlines.append({
                                "title": title_clean,
                                "summary": "",
                                "provider": "Google News"
                            })
        except Exception:
            pass

    # 3. Tertiary Fallback: yfinance Ticker.news
    if not headlines:
        try:
            t = get_ticker_object(ticker)
            raw = getattr(t, "news", None) or []
            for item in raw[:5]:
                title = item.get("title") or (item.get("content", {}).get("title") if isinstance(item.get("content"), dict) else "")
                if title:
                    headlines.append({
                        "title": html.unescape(title.strip()),
                        "summary": "",
                        "provider": "Yahoo Ticker Stream"
                    })
        except Exception:
            pass

    return headlines

def analyze_stock_sentiment(ticker: str) -> Dict[str, Any]:
    norm_ticker = normalize_ticker(ticker)
    now = time.time()
    
    if norm_ticker in _SENTIMENT_CACHE:
        entry = _SENTIMENT_CACHE[norm_ticker]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]
            
    headlines = _fetch_live_headlines(norm_ticker)
    
    text_corpus = " ".join([f"{h['title']} {h.get('summary', '')}" for h in headlines]).lower()
    
    # Calculate sentiment polarity score (-100 to +100)
    pos_hits = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_corpus)
    neg_hits = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_corpus)
    
    # Critical skepticism penalty (for governance, accounting probes, or profit masking like Zetrix)
    for sp in SKEPTICISM_PATTERNS:
        if sp in text_corpus:
            neg_hits += 4
            
    total_signals = pos_hits + neg_hits
    score = 0
    if total_signals > 0:
        score = int(((pos_hits - neg_hits) / total_signals) * 100)
        
    # Categorization labels
    if score >= 15:
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
        "headlines": headlines[:5],
        "positiveSignalCount": pos_hits,
        "negativeSignalCount": neg_hits,
        "summary": (
            f"Sentiment is {label} (Score: {score:+d}). "
            f"{'Recent press highlights caution or underlying risks.' if score <= -15 else 'Headlines highlight constructive momentum.' if score >= 15 else 'Market sentiment remains balanced with mixed commentary.'}"
        )
    }
    
    _SENTIMENT_CACHE[norm_ticker] = {"data": sentiment_data, "timestamp": now}
    return sentiment_data
