import os
import requests
import json
from typing import Dict, Any, Optional
from ..config import settings

def send_discord_alert(report: Dict[str, Any], webhook_url: Optional[str] = None) -> bool:
    """
    Sends a rich, formatted Discord Webhook embed alert with 30-year veteran committee analysis.
    100% Free with zero subscription cost.
    """
    url = webhook_url or settings.DISCORD_WEBHOOK_URL or os.getenv("DISCORD_WEBHOOK_URL", "")
    
    ticker = report.get("ticker", "UNKNOWN")
    name = report.get("name", ticker)
    score = report.get("opportunityScore", 50)
    verdict = report.get("verdict", "WATCHLIST")
    metrics = report.get("keyMetrics", {})
    committee = report.get("committee", {})
    
    # Embed Color: Green (0x00FF88) for score >= 75, Gold (0xFFCC00) for >= 60, Blue (0x3399FF)
    color = 0x00FF88 if score >= 75 else (0xFFCC00 if score >= 60 else 0x3399FF)
    
    market_tag = "🇲🇾 Bursa Malaysia" if ticker.endswith(".KL") else "🇺🇸 US Equities"
    
    embed = {
        "title": f"🚀 Institutional Growth Alert: {name} ({ticker})",
        "description": f"**30-Year Veteran Committee Mandate:** `{verdict}` | **Conviction Score:** `{score}/100`\nMarket: **{market_tag}**",
        "color": color,
        "fields": [
            {
                "name": "📊 Core Growth & ROE (>10%)",
                "value": f"• **YoY Rev:** `+{metrics.get('revenueGrowthYoY', 'N/A')}%`\n• **YoY EPS:** `+{metrics.get('epsGrowthYoY', 'N/A')}%`\n• **ROE:** `{metrics.get('returnOnEquity', 'N/A')}%`\n• **Debt/Equity:** `{metrics.get('debtToEquity', 'N/A')}`",
                "inline": True
            },
            {
                "name": "💰 Cash Flow & Valuation (<15 PE)",
                "value": f"• **Trailing P/E:** `{metrics.get('trailingPE', 'N/A')}x`\n• **Trailing EPS:** `{metrics.get('trailingEps', 'N/A')}`\n• **Dividend Yield:** `{metrics.get('dividendYield', 'N/A')}%`\n• **Free Cash Flow:** `{metrics.get('freeCashflowFormatted', 'N/A')}`",
                "inline": True
            },
            {
                "name": "📈 Technical Setup & Macro (ta)",
                "value": f"• **Uptrend:** `{'✅ Confirmed' if metrics.get('isUptrend') else '⚠️ Basing'}`\n• **50/200 SMA:** `{metrics.get('sma50', 'N/A')} / {metrics.get('sma200', 'N/A')}`\n• **Fed / OPR:** `{metrics.get('fedRate', 'N/A')} / {metrics.get('malaysiaOpr', 'N/A')}`\n• **USD/MYR:** `{metrics.get('usdMyr', 'N/A')}`",
                "inline": True
            },
            {
                "name": "🏛️ Senior Fundamental Analyst (30+ Yrs Exp)",
                "value": (committee.get("fundamentalAnalyst", "")[:450] + "...") if len(committee.get("fundamentalAnalyst", "")) > 450 else committee.get("fundamentalAnalyst", "Quality verified."),
                "inline": False
            },
            {
                "name": "⚖️ Risk Officer & Macro Arbitrageur (30+ Yrs Exp)",
                "value": (committee.get("riskManagerAndDebate", "")[:450] + "...") if len(committee.get("riskManagerAndDebate", "")) > 450 else committee.get("riskManagerAndDebate", "Stress tested."),
                "inline": False
            },
            {
                "name": "🎯 Managing Partner & CIO Execution Playbook (30+ Yrs Exp)",
                "value": (committee.get("chiefInvestmentOfficer", "")[:450] + "...") if len(committee.get("chiefInvestmentOfficer", "")) > 450 else committee.get("chiefInvestmentOfficer", "Approved."),
                "inline": False
            }
        ],
        "footer": {
            "text": f"Growth Stock Analyzer • TradingAgents 30-Year Veteran Committee • {report.get('modelUsed', 'Deterministic Engine')}"
        }
    }
    
    payload = {
        "username": "TradingAgents 30-Yr Veteran Committee",
        "avatar_url": "https://img.icons8.com/color/512/bullish.png",
        "embeds": [embed]
    }
    
    if not url:
        print(f"[Simulated Discord Alert] No webhook URL configured. Simulated payload for {ticker}:\n{json.dumps(payload, indent=2)}")
        return True
        
    try:
        res = requests.post(url, json=payload, timeout=10)
        return res.status_code in [200, 204]
    except Exception as e:
        print(f"Error dispatching Discord alert for {ticker}: {e}")
        return False
