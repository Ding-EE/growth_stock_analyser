from fastapi import APIRouter, Query, Body
from typing import Optional, Dict, Any
from pydantic import BaseModel
from ..services.scheduler import get_scheduler_status, run_screener_and_alert_pipeline

router = APIRouter(prefix="/api/scheduler", tags=["Scheduler & Alerting"])

class TriggerPayload(BaseModel):
    market: str = "ALL"
    min_rev_growth: float = 15.0
    min_eps_growth: float = 15.0
    webhook_url: Optional[str] = None

@router.get("/status")
def scheduler_status() -> Dict[str, Any]:
    """Returns background scheduler state, next market close run times, and recent alert history."""
    return get_scheduler_status()

@router.post("/trigger")
def trigger_screening_and_alert(payload: TriggerPayload = Body(...)) -> Dict[str, Any]:
    """
    Manually triggers the background screening process and dispatches Discord alerts
    for all qualifying growth stocks.
    """
    summary = run_screener_and_alert_pipeline(
        market=payload.market,
        min_rev_growth=payload.min_rev_growth,
        min_eps_growth=payload.min_eps_growth,
        webhook_url=payload.webhook_url
    )
    return {
        "status": "success",
        "message": f"Screening pipeline executed across {summary.get('scannedCount')} stocks.",
        "summary": summary
    }
