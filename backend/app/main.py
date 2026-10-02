import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .services.scheduler import start_scheduler, stop_scheduler
from .routers import stocks, screener, macro, scheduler_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background market close scheduler
    print("[Server Startup] Starting APScheduler for daily post-market screening...")
    start_scheduler()
    
    # Warm up screener cache asynchronously in a background thread to maximize Render performance
    import threading
    from .routers.screener import warmup_screener_cache
    threading.Thread(target=warmup_screener_cache, daemon=True).start()
    yield
    # Shutdown: Graceful stop
    print("[Server Shutdown] Stopping APScheduler...")
    stop_scheduler()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Full-stack Growth Stock Screener with TradingAgents Multi-Agent Investment Committee and Automated Alerting for US & Bursa Malaysia.",
    lifespan=lifespan
)

# CORS middleware for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(stocks.router)
app.include_router(screener.router)
app.include_router(macro.router)
app.include_router(scheduler_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }

# If frontend static build exists, mount it
dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
