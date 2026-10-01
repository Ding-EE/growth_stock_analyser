import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.services.market_data import get_stock_quote, normalize_ticker
from backend.app.services.fundamentals import get_fundamental_metrics
from backend.app.services.technicals import calculate_technical_indicators
from backend.app.services.macro import get_macro_context
from backend.app.services.ai_synthesis import generate_committee_synthesis
from backend.app.services.alerting import send_discord_alert

def test_backend():
    print("=== 1. Testing Ticker Normalization ===")
    assert normalize_ticker("aapl") == "AAPL"
    assert normalize_ticker("1155") == "1155.KL"
    assert normalize_ticker("1155.KL") == "1155.KL"
    print("Ticker normalization passed!")

    print("\n=== 2. Testing Market Data: AAPL (US) ===")
    q_us = get_stock_quote("AAPL")
    print(f"AAPL: {q_us['name']} | Price: ${q_us['currentPrice']} | MCap: {q_us['marketCap']}")
    assert q_us["currentPrice"] > 0
    assert q_us["currency"] == "USD"

    print("\n=== 3. Testing Market Data: 1155.KL (Bursa Malaysia / Maybank) ===")
    q_my = get_stock_quote("1155.KL")
    print(f"1155.KL: {q_my['name']} | Price: RM {q_my['currentPrice']} | Market: {q_my['market']}")
    assert q_my["currentPrice"] > 0
    assert q_my["currency"] == "MYR"

    print("\n=== 4. Testing Fundamentals: AAPL & 1155.KL ===")
    f_us = get_fundamental_metrics("AAPL")
    print(f"AAPL Fundamentals: Rev YoY: {f_us['revenueGrowthYoY']}% | EPS YoY: {f_us['epsGrowthYoY']}% | D/E: {f_us['debtToEquity']} | Growth Pass: {f_us['qualifiesGrowth']}")
    
    f_my = get_fundamental_metrics("1155.KL")
    print(f"1155.KL Fundamentals: Rev YoY: {f_my['revenueGrowthYoY']}% | EPS YoY: {f_my['epsGrowthYoY']}% | Bank Exemption: {f_my['isFinancial']}")

    print("\n=== 5. Testing Technicals (SMA 50/200, RSI, MACD) via 'ta' ===")
    t_us = calculate_technical_indicators("AAPL", period="1y")
    s_us = t_us["summary"]
    print(f"AAPL Technicals: 50 SMA={s_us['sma50']} | 200 SMA={s_us['sma200']} | Uptrend={s_us['isUptrend']} | RSI={s_us['rsi']} | MACD={s_us['macdMomentum']}")
    assert len(t_us["series"]) > 50

    t_my = calculate_technical_indicators("1155.KL", period="1y")
    s_my = t_my["summary"]
    print(f"1155.KL Technicals: 50 SMA={s_my['sma50']} | 200 SMA={s_my['sma200']} | RSI={s_my['rsi']}")
    assert len(t_my["series"]) > 50

    print("\n=== 6. Testing Macroeconomic Engine ===")
    m = get_macro_context()
    print(f"Macro Context: US Fed Rate={m['us']['fedRateDisplay']} | Malaysia OPR={m['malaysia']['oprDisplay']} | USD/MYR={m['fx']['usdMyr']}")
    assert m["us"]["fedFundsRate"] > 0
    assert m["malaysia"]["opr"] == 3.00

    print("\n=== 7. Testing TradingAgents Virtual Committee Synthesis ===")
    c_us = generate_committee_synthesis("AAPL")
    print(f"TradingAgents Verdict for AAPL: {c_us['verdict']} | Score: {c_us['opportunityScore']}/100")
    print(f"Fundamental Analyst Take: {c_us['committee']['fundamentalAnalyst'][:120]}...")
    print(f"Risk Debate: {c_us['committee']['riskManagerAndDebate'][:120]}...")
    print(f"CIO Take: {c_us['committee']['chiefInvestmentOfficer'][:120]}...")

    print("\n=== 8. Testing Free Discord Alert Simulation ===")
    alert_result = send_discord_alert(c_us, webhook_url=None)
    assert alert_result is True
    print("Discord alert simulation successful!")

    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_backend()
