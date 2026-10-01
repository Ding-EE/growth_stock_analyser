# Growth Stock Analyzer (US & Bursa Malaysia Equities)

An institutional-grade, full-stack stock screening and equity intelligence dashboard combining real-time fundamental financial data, technical indicator analysis, macroeconomic contextualization, automated background market-close alerting, and a 5-role TradingAgents Multi-Agent Investment Committee with 30-year veteran institutional depth.

---

## 🚀 Always-On Availability: "Works Whenever You Log On"

The system is configured to run silently as a unified background service on Windows.

### 1. Windows Startup (Runs automatically every time you log into your PC)
Run the auto-start installer once:
```bat
setup_autostart.bat
```
- **What it does**:
  - Automatically places a silent background runner in your Windows Startup folder (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\GrowthStockAnalyser.lnk`).
  - Creates a **Growth Stock Analyser** 1-click shortcut on your **Desktop**.
  - Starts the service silently in the background (0 console window, completely windowless).
  - Every time you boot or log into your Windows computer, the server starts silently, market-close alert schedulers activate, and `http://localhost:8000` is immediately ready!

### 2. Manual 1-Click Launch Anytime
Double-click:
```bat
start_dashboard.bat
```
- Verifies background health, boots the service if inactive, and opens `http://localhost:8000` in your default browser.

### 3. Stop or Disable Auto-Start
- **Stop Service**: Double-click `stop_dashboard.bat` (cleanly terminates port 8000 background worker).
- **Uninstall Auto-Start**: Double-click `uninstall_autostart.bat` (removes Windows Startup and Desktop shortcuts).

---

## 🌐 Free Public & Mobile Access (Access From Anywhere on Earth for $0.00)

### Option A: Instant Free Cloudflare Tunnel (Recommended for Phone / Laptop)
Double-click:
```bat
start_public_tunnel.bat
```
- Instantly creates a secure, temporary HTTPS public link (e.g. `https://random-words.trycloudflare.com`).
- Open that URL on your smartphone, tablet, or work computer without needing router port forwarding or DNS setup.

### Option B: 24/7 Cloud Hosting (Render / Hugging Face Spaces / Fly.io)
- Connect your GitHub repository to [Render.com](https://render.com) using the included `render.yaml` or `Dockerfile`.
- Deploys on Render's 100% free tier with automated SSL certificate.

---

## 🧠 Key Features & Modules

### 1. Multi-Tier Supply Chain Map (`Bloomberg SPLC <GO>`)
- Multi-tier dependency graph powered by `@xyflow/react`.
- Grounded in SEC Form 10-K and Bursa Malaysia annual regulatory filings with verifiable verbatim citations, tier separation (Tier-2 Tooling $\rightarrow$ Tier-1 Foundries $\rightarrow$ Target Company $\rightarrow$ Channels/Customers), and concentration risk ratings.

### 2. TradingAgents Multi-Agent Investment Committee
- **Quantitative Analyst**: YoY Revenue (>15%), YoY EPS (>15%), ROE (>10%), P/E, Free Cash Flow (+ve green, -ve red).
- **Technical Market Strategist**: Continuous 200 SMA, 50 SMA, RSI (14), MACD histogram.
- **Risk & Geopolitical Officer**: Single-source bottleneck analysis, Taiwan Strait / Strait of Malacca transit risk, margin compression vulnerability.
- **Fundamental & Growth Thesis Analyst**: Economic moat durability, reinvestment rate, pricing power.
- **Chief Investment Officer (CIO)**: 30-year veteran capital allocator synthesis with a Growth Opportunity Score (0-100) and actionable decision.

### 3. Automated Post-Market Background Screener & Free Discord Alerts
- **Bursa Malaysia Close**: Runs daily at 17:15 MYT (15 mins after 17:00 closing bell).
- **US Equities Close**: Runs daily at 16:30 EDT (30 mins after 16:00 closing bell).
- Automatically screens watchlists, synthesizes qualifying opportunities, and dispatches structured dossiers to your free Discord webhook.

---

## 📂 Architecture
- **Unified Port**: Port `8000` (`http://localhost:8000`) serves both the FastAPI REST backend and the production-optimized React/Vite Single-Page Application (`frontend/dist`).
- **Persistence**: Remembers your active stock ticker, market switch, chart duration, and custom watchlists across sessions in `localStorage`.
- **Zero Cost**: Built entirely with free APIs, open-source libraries, and zero-cost cloud options.
