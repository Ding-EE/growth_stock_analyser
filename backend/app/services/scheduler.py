import datetime
import pytz
from typing import Dict, Any, List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from ..config import settings
from .fundamentals import get_fundamental_metrics
from .ai_synthesis import generate_committee_synthesis
from .alerting import send_discord_alert

# Global scheduler instance and execution history
scheduler = BackgroundScheduler()
_RUN_HISTORY: List[Dict[str, Any]] = []

def run_screener_and_alert_pipeline(
    market: str = "ALL", 
    min_rev_growth: float = 15.0, 
    min_eps_growth: float = 15.0,
    webhook_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes automated screening across watchlists.
    For qualifying growth stocks (YoY Rev > 15% and YoY EPS > 15%),
    generates the TradingAgents Committee dossier and dispatches a Discord alert.
    """
    start_time = datetime.datetime.now()
    tickers_to_scan = []
    
    if market.upper() in ["US", "ALL"]:
        tickers_to_scan.extend(settings.US_WATCHLIST)
    if market.upper() in ["BURSA", "MALAYSIA", "ALL"]:
        tickers_to_scan.extend(settings.BURSA_WATCHLIST)
        
    qualifying_stocks = []
    alerts_dispatched = []
    
    for ticker in tickers_to_scan:
        try:
            fund = get_fundamental_metrics(ticker)
            rev_g = fund.get("revenueGrowthYoY")
            eps_g = fund.get("epsGrowthYoY")
            
            # Growth Criteria Check
            passes_rev = rev_g is not None and rev_g >= min_rev_growth
            passes_eps = eps_g is not None and eps_g >= min_eps_growth
            passes_debt = fund.get("isDebtManageable", True)
            
            if passes_rev and passes_eps and passes_debt:
                # Stock qualifies as a growth opportunity!
                # Trigger TradingAgents Multi-Agent Committee
                report = generate_committee_synthesis(ticker)
                qualifying_stocks.append(report)
                
                # Dispatch Free Discord Webhook alert
                success = send_discord_alert(report, webhook_url=webhook_url)
                alerts_dispatched.append({
                    "ticker": ticker,
                    "score": report.get("opportunityScore"),
                    "verdict": report.get("verdict"),
                    "alertSent": success
                })
        except Exception as e:
            print(f"Error evaluating {ticker} in screening pipeline: {e}")
            
    summary = {
        "timestamp": start_time.isoformat(),
        "market": market,
        "scannedCount": len(tickers_to_scan),
        "qualifyingCount": len(qualifying_stocks),
        "alertsDispatched": alerts_dispatched,
        "durationSeconds": round((datetime.datetime.now() - start_time).total_seconds(), 2)
    }
    
    _RUN_HISTORY.insert(0, summary)
    if len(_RUN_HISTORY) > 20:
        _RUN_HISTORY.pop()
        
    return summary

def scheduled_bursa_close_job():
    """Triggered Mon-Fri 17:15 Asia/Kuala_Lumpur (15 min after Bursa Malaysia close)"""
    print("[Scheduler] Running daily post-market screening for Bursa Malaysia...")
    run_screener_and_alert_pipeline(market="BURSA")

def scheduled_us_close_job():
    """Triggered Mon-Fri 16:30 America/New_York (30 min after US close)"""
    print("[Scheduler] Running daily post-market screening for US Equities...")
    run_screener_and_alert_pipeline(market="US")

def start_scheduler():
    """Initializes and starts the background scheduler."""
    if not scheduler.running:
        # Bursa Malaysia Market Close: 17:15 MYT Mon-Fri
        scheduler.add_job(
            scheduled_bursa_close_job,
            CronTrigger(day_of_week="mon-fri", hour=17, minute=15, timezone=pytz.timezone("Asia/Kuala_Lumpur")),
            id="bursa_market_close_screener",
            replace_existing=True
        )
        
        # US Equities Market Close: 16:30 EDT/EST Mon-Fri
        scheduler.add_job(
            scheduled_us_close_job,
            CronTrigger(day_of_week="mon-fri", hour=16, minute=30, timezone=pytz.timezone("America/New_York")),
            id="us_market_close_screener",
            replace_existing=True
        )
        
        scheduler.start()
        print("[Scheduler] Background scheduler initialized with Bursa (17:15 MYT) and US (16:30 EDT) close jobs.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()

def get_scheduler_status() -> Dict[str, Any]:
    jobs_info = []
    if scheduler.running:
        for job in scheduler.get_jobs():
            next_run = job.next_run_time.isoformat() if job.next_run_time else "N/A"
            jobs_info.append({
                "id": job.id,
                "name": job.name,
                "nextRun": next_run
            })
            
    return {
        "running": scheduler.running,
        "scheduledJobs": jobs_info,
        "recentRuns": _RUN_HISTORY[:5]
    }
