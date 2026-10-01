import urllib.request
import json

def fetch_json(url):
    req = urllib.request.urlopen(url)
    return json.loads(req.read().decode('utf-8'))

def test_upgrades():
    print("=== 1. AAPL Overview Check ===")
    aapl = fetch_json('http://127.0.0.1:8000/api/stock/AAPL/overview')
    fund_aapl = aapl['fundamentals']
    print(f"ROE: {fund_aapl['returnOnEquity']}% | Passes ROE > 10%: {fund_aapl['passesROE']}")
    print(f"Div Yield: {fund_aapl['dividendYield']}% | EPS: ${fund_aapl['trailingEps']}")
    print(f"Free Cash Flow: {fund_aapl['freeCashflowFormatted']}")
    print(f"P/E: {fund_aapl['trailingPE']}x | Passes P/E <= 15: {fund_aapl['passesPE']}")

    print("\n=== 2. 1155.KL (Maybank) Overview Check ===")
    my = fetch_json('http://127.0.0.1:8000/api/stock/1155.KL/overview')
    fund_my = my['fundamentals']
    print(f"ROE: {fund_my['returnOnEquity']}% | Passes ROE > 10%: {fund_my['passesROE']}")
    print(f"Div Yield: {fund_my['dividendYield']}% | EPS: RM {fund_my['trailingEps']}")
    print(f"Free Cash Flow: {fund_my['freeCashflowFormatted']}")
    print(f"P/E: {fund_my['trailingPE']}x | Passes P/E <= 15: {fund_my['passesPE']}")

    print("\n=== 3. 30-Year Veteran Committee Reasoning (AAPL) ===")
    c_aapl = fetch_json('http://127.0.0.1:8000/api/stock/AAPL/committee')
    print(f"Mandate: {c_aapl['verdict']} | Score: {c_aapl['opportunityScore']}/100")
    print("Fundamental Analyst (30+ Yrs Exp):\n", c_aapl['committee']['fundamentalAnalyst'][:300], "...\n")
    print("CIO Mandate & Execution Playbook:\n", c_aapl['committee']['chiefInvestmentOfficer'][:300], "...\n")

    print("\n=== 4. 30-Year Veteran Committee Reasoning (1155.KL) ===")
    c_my = fetch_json('http://127.0.0.1:8000/api/stock/1155.KL/committee')
    print(f"Mandate: {c_my['verdict']} | Score: {c_my['opportunityScore']}/100")
    print("Fundamental Analyst (30+ Yrs Exp):\n", c_my['committee']['fundamentalAnalyst'][:300], "...\n")
    print("CIO Mandate & Execution Playbook:\n", c_my['committee']['chiefInvestmentOfficer'][:300], "...\n")

    print("\n=== 5. Screener with ROE > 10% and P/E <= 15 (Bursa & US) ===")
    scr = fetch_json('http://127.0.0.1:8000/api/screener?market=ALL&min_roe=10&max_pe=15')
    print(f"Total Scanned: {scr['totalScanned']} | Qualifying: {scr['qualifyingCount']}")
    for r in scr['results'][:4]:
        print(f" - {r['ticker']} ({r['name']}): ROE={r['returnOnEquity']}% | P/E={r['trailingPE']}x | Div={r['dividendYield']}% | EPS={r['trailingEps']} | FCF={r['freeCashflowFormatted']} | Qualifies={r['qualifiesGrowth']}")

if __name__ == "__main__":
    test_upgrades()
