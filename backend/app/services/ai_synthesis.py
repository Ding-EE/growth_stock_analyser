import os
import json
from typing import Dict, Any, Optional
from ..config import settings
from .market_data import get_stock_quote
from .fundamentals import get_fundamental_metrics
from .technicals import calculate_technical_indicators
from .macro import get_macro_context
from .sentiment import analyze_stock_sentiment

def _build_deterministic_committee_report(
    ticker: str,
    quote: Dict[str, Any],
    fund: Dict[str, Any],
    tech: Dict[str, Any],
    macro: Dict[str, Any],
    sent: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Veteran Institutional TradingAgents Committee Dossier with Sentiment Synthesis.
    Authored by institutional market practitioners with 30+ years of cycle experience.
    """
    name = quote.get("name", ticker)
    price = quote.get("currentPrice", 0.0)
    curr = quote.get("currency", "USD")
    curr_sym = "RM " if curr == "MYR" else "$"
    
    rev_g = fund.get("revenueGrowthYoY")
    eps_g = fund.get("epsGrowthYoY")
    de = fund.get("debtToEquity")
    roe = fund.get("returnOnEquity")
    div_yield = fund.get("dividendYield")
    trailing_eps = fund.get("trailingEps")
    forward_eps = fund.get("forwardEps")
    pe = fund.get("trailingPE")
    fcf_formatted = fund.get("freeCashflowFormatted", "N/A")
    is_fin = fund.get("isFinancial", False)
    
    tech_sum = tech.get("summary", {})
    sma50 = tech_sum.get("sma50")
    sma200 = tech_sum.get("sma200")
    rsi = tech_sum.get("rsi")
    is_uptrend = tech_sum.get("isUptrend", False)
    golden_cross = tech_sum.get("goldenCross", False)
    
    sent_score = sent.get("sentimentScore", 0)
    sent_label = sent.get("sentimentLabel", "Neutral")
    top_headline = sent.get("topHeadline", "")
    
    # 30-Year Veteran Multi-Factor Scoring Model
    score = 50
    # 1. Fundamental Quality & ROE hurdle (>10%)
    if roe is not None and roe >= 10.0:
        score += min(15, int((roe - 10.0) * 0.4) + 6)
    elif roe is not None and roe < 5.0:
        score -= 10
        
    # 2. Revenue & EPS expansion velocity (>15%)
    if rev_g is not None and rev_g >= 15.0:
        score += min(12, int(rev_g * 0.4))
    if eps_g is not None and eps_g >= 15.0:
        score += min(12, int(eps_g * 0.35))
        
    # 3. Valuation sanity (P/E around <= 15 or reasonable PEG)
    if pe is not None and pe <= 15.0:
        score += 8  # Strong margin of safety
    elif pe is not None and pe <= 22.0:
        score += 4
    elif pe is not None and pe > 40.0:
        score -= 6  # Valuation vulnerability
        
    # 4. Sentiment penalty/bonus (30-year veteran vigilance against value traps)
    if sent_score <= -15:
        score -= 10  # Meaningful penalty for negative headline overhang / skepticism
    elif sent_score >= 25:
        score += 5
        
    # 5. Balance sheet & Free Cash Flow
    if de is not None and de <= 1.0:
        score += 5
    elif is_fin:
        score += 5
        
    # 6. Technical trend confirmation
    if is_uptrend:
        score += 8
    if golden_cross:
        score += 4
    if rsi and 40 <= rsi <= 62:
        score += 4
    elif rsi and rsi > 78:
        score -= 4
        
    score = max(20, min(95, score))
    
    verdict = (
        "STRONG BUY (High-Conviction Compounder)" if score >= 80 else (
            "BUY (Growth at a Reasonable Price - GARP)" if score >= 65 else (
                "HOLD (Caution on Sentiment / Pullback Watch)" if score >= 50 else "REDUCE / AVOID (Negative Asymmetry)"
            )
        )
    )

    # 1. Senior Fundamental Analyst (30+ Years Buy-Side Experience)
    fcf_note = f"Free Cash Flow generation sits at {fcf_formatted}" if not is_fin else "As a regulated financial institution, balance sheet liquidity and statutory reserve ratios serve as primary solvency anchors"
    roe_quality = "exemplary capital stewardship" if (roe or 0) >= 15.0 else ("satisfactory hurdle rate" if (roe or 0) >= 10.0 else "sub-par capital productivity requiring turnaround")
    div_note = f"with a dividend yield of {div_yield:.2f}% providing tangible cash return" if div_yield else "with capital being fully reinvested for operational compounding"
    
    sentiment_caveat = (
        f"However, after 30+ years on the buy-side, we never evaluate accounting numbers in an ivory tower. Recent market sentiment registers as '{sent_label}' (Headline: \"{top_headline}\"). "
        f"When a company's multiple is depressed or headline commentary warns that strong profits may be masking underlying operational or governance issues, seasoned allocators do not treat optical cheapness as a free lunch."
        if sent_score <= 0 else
        f"Market sentiment is corroborating the fundamentals ({sent_label}, Headline: \"{top_headline}\"), reflecting institutional confidence in business execution."
    )
    
    fundamental_take = (
        f"In my 30+ years analyzing corporate income statements through multiple boom-and-bust cycles, true compounding requires both top-line scalability and capital efficiency. "
        f"{name} delivers Year-over-Year Revenue Growth of {rev_g if rev_g is not None else 'N/A'}% and YoY EPS acceleration of {eps_g if eps_g is not None else 'N/A'}%, "
        f"generating Trailing EPS of {curr_sym}{trailing_eps or 'N/A'} (Forward EPS: {curr_sym}{forward_eps or 'N/A'}). "
        f"Crucially, Return on Equity (ROE) clocks in at {roe if roe is not None else 'N/A'}% against our 10.0% institutional baseline—confirming {roe_quality}. "
        f"{fcf_note}, {div_note}. "
        f"From a balance sheet perspective, Debt-to-Equity is {de if de is not None else 'N/A (Financial/Asset-Backed)'}. "
        f"{sentiment_caveat}"
    )
    
    # 2. Chief Technical Market Strategist (30+ Years Cycle Experience)
    uptrend_verdict = "CONFIRMED ACCUMULATION (Price > 50 SMA > 200 SMA)" if is_uptrend else "CONSOLIDATING / STRUCTURAL BASE IN PROGRESS"
    crossover_note = "A fresh Golden Cross confirms dominant multi-month institutional sponsorship" if golden_cross else "No premature crossover; long-term trend alignment remains stable"
    
    technical_take = (
        f"Looking at multi-decade tape dynamics, price action tells the unvarnished story of institutional accumulation versus smart-money distribution. "
        f"Trading at {curr_sym}{price:.2f}, the asset displays a 50-day SMA of {curr_sym}{sma50 or 'N/A'} and a 200-day SMA of {curr_sym}{sma200 or 'N/A'}. "
        f"Structural trend posture is {uptrend_verdict}. {crossover_note}. "
        f"RSI(14) registers at {rsi or 'N/A'}, signaling {tech_sum.get('rsiStatus', 'Neutral')}. "
        f"MACD configuration indicates {tech_sum.get('macdMomentum', 'Neutral')}. If headline sentiment is clouded, watch for supply absorption near the 200-day SMA to confirm whether institutional buyers are stepping in or liquidating."
    )
    
    # 3. Senior Risk Officer & Macro Arbitrageur (30+ Years Crisis & Cycle Experience)
    risk_sentiment_note = (
        f"**Headline & Sentiment Warning:** Sentiment is currently categorized as {sent_label} (Top story: \"{top_headline}\"). "
        f"Sovereign and market history proves that multiple contraction driven by governance scrutiny or headline overhang can overpower optical valuation. We assign a strict discount to forward projections until sentiment neutralizes."
        if sent_score <= 0 else
        f"**Sentiment Profile:** News flow is constructive ({sent_label}), providing supportive narrative momentum."
    )
    
    macro_context_text = (
        f"Having managed portfolios through the 1997 Asian Financial Crisis and the 2008 liquidity freeze, macroeconomic stress-testing is paramount. "
        f"In the US, the Federal Funds Target Rate remains elevated at {macro['us']['fedRateDisplay']} with 10Y Treasuries yielding {macro['us']['treasury10Y']}%, "
        f"meaning long-duration growth multiples remain vulnerable to rate re-pricing unless defended by real earnings power. "
        f"In Malaysia, Bank Negara Malaysia's Overnight Policy Rate (OPR) is anchored at a prudent {macro['malaysia']['oprDisplay']}, maintaining stable domestic financing costs. "
        f"USD/MYR is holding near {macro['fx']['usdMyr']}, balancing imported capital expenditure costs against export competitiveness.\n\n"
        f"{risk_sentiment_note}"
    )
    
    # 4. Managing Partner & Chief Investment Officer (30+ Years Capital Allocator)
    pe_verdict = (
        f"With trailing P/E at {pe:.1f}x (well within our value-growth sweet spot around 15x), this represents an optical margin of safety."
        if pe and pe <= 15.0 else
        (f"Trading at {pe:.1f}x P/E, valuation reflects a premium for quality growth, demanding strict execution discipline." if pe else "Valuation requires ongoing cash flow monitoring.")
    )
    
    cio_take = (
        f"**Executive Mandate: {verdict} | Conviction Score: {score}/100**\n\n"
        f"After 30+ years in the markets, our golden rule is never confuse optical statistical cheapness with an institutional margin of safety. "
        f"{pe_verdict} "
        f"With ROE at {roe or 'N/A'}% and top-line momentum at {rev_g or 'N/A'}%, the quantitative foundation is clear, but current sentiment ({sent_label}) dictates disciplined sizing.\n\n"
        f"**Tactical Execution Playbook:**\n"
        f"• **Accumulation Band:** Scale in between {curr_sym}{(sma50 * 0.98 if sma50 else price * 0.95):.2f} and {curr_sym}{price:.2f} near structural support.\n"
        f"• **Hard Invalidation Level:** A weekly close below {curr_sym}{sma200 or price * 0.85:.2f} triggers an automatic liquidation review.\n"
        f"• **Catalysts & Overhangs to Monitor:** Resolution of headline scrutiny, sustained Free Cash Flow conversion, and quarterly dividend execution."
    )
    
    return {
        "ticker": ticker,
        "name": name,
        "opportunityScore": score,
        "verdict": verdict,
        "committee": {
            "fundamentalAnalyst": fundamental_take,
            "technicalAnalyst": technical_take,
            "riskManagerAndDebate": macro_context_text,
            "chiefInvestmentOfficer": cio_take
        },
        "keyMetrics": {
            "revenueGrowthYoY": rev_g,
            "epsGrowthYoY": eps_g,
            "debtToEquity": de,
            "returnOnEquity": roe,
            "dividendYield": div_yield,
            "trailingEps": trailing_eps,
            "forwardEps": forward_eps,
            "trailingPE": pe,
            "freeCashflowFormatted": fcf_formatted,
            "sentimentScore": sent_score,
            "sentimentLabel": sent_label,
            "sentimentHeadline": top_headline,
            "sma50": sma50,
            "sma200": sma200,
            "rsi": rsi,
            "isUptrend": is_uptrend,
            "fedRate": macro["us"]["fedRateDisplay"],
            "malaysiaOpr": macro["malaysia"]["oprDisplay"],
            "usdMyr": macro["fx"]["usdMyr"]
        },
        "modelUsed": "TradingAgents 30-Year Veteran Virtual Investment Committee"
    }

def generate_committee_synthesis(ticker: str) -> Dict[str, Any]:
    quote = get_stock_quote(ticker)
    fund = get_fundamental_metrics(ticker)
    tech = calculate_technical_indicators(ticker)
    macro = get_macro_context()
    sent = analyze_stock_sentiment(ticker)
    
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    
    if not api_key:
        return _build_deterministic_committee_report(ticker, quote, fund, tech, macro, sent)
        
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
You are the TradingAgents Senior Investment Committee simulating an elite institutional investment firm.
Every member has 30+ YEARS OF PRACTITIONER EXPERIENCE (navigating 1987 Black Monday, 1997 Asian Financial Crisis, 2000 Dot-Com crash, 2008 GFC, and 2022 rate shock).
You speak with seasoned, pragmatic, highly discerning institutional vernacular.

LIVE DATA DOSSIER FOR {quote.get('name')} ({quote.get('ticker')}):
---------------------------------------------------------------
Company: {quote.get('name')} ({quote.get('ticker')})
Market: {quote.get('market')} | Currency: {quote.get('currency')} | Current Price: {quote.get('currentPrice')}
Sector: {fund.get('sector')} | Industry: {fund.get('industry')}

FUNDAMENTALS:
- YoY Revenue Growth: {fund.get('revenueGrowthYoY')}% (Target: > 15%)
- YoY EPS Growth: {fund.get('epsGrowthYoY')}% (Target: > 15%)
- Return on Equity (ROE): {fund.get('returnOnEquity')}% (Target: > 10%)
- Trailing P/E: {fund.get('trailingPE')} (Value benchmark: around or <= 15x) | Forward P/E: {fund.get('forwardPE')}
- Trailing EPS: {fund.get('trailingEps')} | Forward EPS: {fund.get('forwardEps')}
- Dividend Yield: {fund.get('dividendYield')}%
- Free Cash Flow: {fund.get('freeCashflowFormatted')}
- Debt-to-Equity: {fund.get('debtToEquity')} (Target: <= 2.0x, Bank Exempt: {fund.get('isFinancial')})

TECHNICALS (ta library):
- 50-day SMA: {tech['summary'].get('sma50')} | 200-day SMA: {tech['summary'].get('sma200')}
- Uptrend Confirmed: {tech['summary'].get('isUptrend')} | Golden Cross: {tech['summary'].get('goldenCross')}
- RSI (14): {tech['summary'].get('rsi')} ({tech['summary'].get('rsiStatus')}) | MACD: {tech['summary'].get('macdMomentum')}

NEWS & MARKET SENTIMENT:
- Sentiment Label: {sent.get('sentimentLabel')} (Score: {sent.get('sentimentScore'):+d})
- Primary Recent Headline: "{sent.get('topHeadline')}"

MACROECONOMIC REGIME:
- US Fed Rate: {macro['us']['fedRateDisplay']} | BNM OPR: {macro['malaysia']['oprDisplay']}
- US 10Y: {macro['us']['treasury10Y']}% | Malaysia 10Y MGS: {macro['malaysia']['mgs10Y']}% | USD/MYR: {macro['fx']['usdMyr']}

CRITICAL TASK:
Explicitly evaluate news sentiment and public perception in your fundamental analysis and risk debate (e.g. if sentiment is cautious or skeptical, address whether reported accounting profits may be masking underlying issues or facing governance overhang, as often seen in value traps).

Return ONLY a valid JSON object matching this schema:
{{
  "opportunityScore": <integer 1-100>,
  "verdict": "<STRONG BUY | BUY | HOLD | REDUCE>",
  "committee": {{
    "fundamentalAnalyst": "<detailed 30-year veteran analysis considering revenue velocity, ROE >10%, FCF, and news sentiment>",
    "technicalAnalyst": "<detailed 30-year veteran analysis of tape structure, 50/200 SMA, and volume absorption>",
    "riskManagerAndDebate": "<detailed 30-year veteran risk stress-test against macro rates, FX, and headline/sentiment risk>",
    "chiefInvestmentOfficer": "<detailed 30-year veteran CIO consensus, P/E <= 15 margin of safety assessment, accumulation band, and hard stop-loss>"
  }}
}}
Return ONLY raw JSON, without markdown formatting.
"""
        
        interaction = client.interactions.create(
            model=settings.GEMINI_MODEL,
            input=prompt
        )
        
        output_text = interaction.output_text or ""
        if output_text.startswith("```json"):
            output_text = output_text[7:]
        if output_text.startswith("```"):
            output_text = output_text[3:]
        if output_text.endswith("```"):
            output_text = output_text[:-3]
        output_text = output_text.strip()
        
        parsed = json.loads(output_text)
        parsed["ticker"] = ticker
        parsed["name"] = quote.get("name", ticker)
        parsed["keyMetrics"] = {
            "revenueGrowthYoY": fund.get("revenueGrowthYoY"),
            "epsGrowthYoY": fund.get("epsGrowthYoY"),
            "debtToEquity": fund.get("debtToEquity"),
            "returnOnEquity": fund.get("returnOnEquity"),
            "dividendYield": fund.get("dividendYield"),
            "trailingEps": fund.get("trailingEps"),
            "forwardEps": fund.get("forwardEps"),
            "trailingPE": fund.get("trailingPE"),
            "freeCashflowFormatted": fund.get("freeCashflowFormatted"),
            "sentimentScore": sent.get("sentimentScore"),
            "sentimentLabel": sent.get("sentimentLabel"),
            "sentimentHeadline": sent.get("topHeadline"),
            "sma50": tech["summary"].get("sma50"),
            "sma200": tech["summary"].get("sma200"),
            "rsi": tech["summary"].get("rsi"),
            "isUptrend": tech["summary"].get("isUptrend"),
            "fedRate": macro["us"]["fedRateDisplay"],
            "malaysiaOpr": macro["malaysia"]["oprDisplay"],
            "usdMyr": macro["fx"]["usdMyr"]
        }
        parsed["modelUsed"] = f"TradingAgents 30-Year Veteran Committee powered by {settings.GEMINI_MODEL}"
        return parsed
        
    except Exception as e:
        print(f"Notice: Gemini API fallback triggered ({e}). Using 30-year veteran analytical engine.")
        return _build_deterministic_committee_report(ticker, quote, fund, tech, macro, sent)
