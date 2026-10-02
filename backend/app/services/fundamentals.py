from typing import Dict, Any, Optional
import yfinance as yf
from .market_data import get_ticker_object, normalize_ticker, get_canonical_name

def format_cash_flow(val: Optional[float], currency: str = "USD") -> str:
    if val is None:
        return "N/A"
    curr_sym = "RM " if currency == "MYR" else "$"
    abs_val = abs(val)
    sign = "-" if val < 0 else ("+" if val > 0 else "")
    if abs_val >= 1e12:
        return f"{sign}{curr_sym}{abs_val / 1e12:.2f}T"
    elif abs_val >= 1e9:
        return f"{sign}{curr_sym}{abs_val / 1e9:.2f}B"
    elif abs_val >= 1e6:
        return f"{sign}{curr_sym}{abs_val / 1e6:.2f}M"
    else:
        return f"{sign}{curr_sym}{abs_val:,.0f}"

def get_fundamental_metrics(ticker: str) -> Dict[str, Any]:
    norm_ticker = normalize_ticker(ticker)
    t = get_ticker_object(norm_ticker)
    info = t.info or {}
    
    is_malaysia = norm_ticker.endswith(".KL")
    currency = "MYR" if is_malaysia else info.get("currency", "USD")
    
    # 1. Growth Rates
    raw_rev_growth = info.get("revenueGrowth")
    raw_eps_growth = info.get("earningsGrowth")
    
    rev_growth_pct = round(raw_rev_growth * 100.0, 2) if raw_rev_growth is not None else None
    eps_growth_pct = round(raw_eps_growth * 100.0, 2) if raw_eps_growth is not None else None
    
    # Financial Statement calculation fallback if rev growth is missing
    if rev_growth_pct is None:
        try:
            q_stmt = t.quarterly_income_stmt
            if not q_stmt.empty:
                rev_row = None
                for idx in ["Total Revenue", "Operating Revenue", "TotalRevenue"]:
                    if idx in q_stmt.index:
                        rev_row = q_stmt.loc[idx]
                        break
                if rev_row is not None and len(rev_row) >= 5:
                    current_q = rev_row.iloc[0]
                    prev_year_q = rev_row.iloc[4]
                    if prev_year_q and prev_year_q > 0:
                        rev_growth_pct = round(((current_q - prev_year_q) / prev_year_q) * 100.0, 2)
        except Exception:
            pass

    # 2. Debt-to-Equity handling
    raw_de = info.get("debtToEquity")
    debt_to_equity_ratio = None
    if raw_de is not None:
        debt_to_equity_ratio = round(raw_de / 100.0 if raw_de > 10 else raw_de, 2)
        
    sector = info.get("sector", "")
    is_financial = "Financial" in sector or "Bank" in sector or (sector == "N/A" and norm_ticker.endswith(".KL"))
    
    is_debt_manageable = True
    if debt_to_equity_ratio is not None and not is_financial:
        is_debt_manageable = debt_to_equity_ratio <= 2.0
    
    # 3. Valuation & Profitability
    pe_trailing = info.get("trailingPE")
    pe_forward = info.get("forwardPE")
    peg_ratio = info.get("pegRatio")
    profit_margin = info.get("profitMargins")
    
    # 4. Return on Equity (ROE) -> Target > 10%
    raw_roe = info.get("returnOnEquity")
    roe_pct = round(raw_roe * 100.0, 2) if raw_roe is not None else None
    passes_roe = roe_pct is not None and roe_pct >= 10.0
    
    # 5. Dividend Yield
    # In yfinance, dividendYield can be in percent (e.g. 6.21 for 6.21%) or decimal
    raw_div_yield = info.get("dividendYield")
    trailing_div_yield = info.get("trailingAnnualDividendYield")
    div_yield_pct = None
    if raw_div_yield is not None:
        div_yield_pct = round(raw_div_yield if raw_div_yield > 0.20 else raw_div_yield * 100.0, 2)
    elif trailing_div_yield is not None:
        div_yield_pct = round(trailing_div_yield * 100.0, 2)
        
    # 6. Earnings Per Share (EPS)
    trailing_eps = info.get("trailingEps")
    forward_eps = info.get("forwardEps")
    
    # 7. Free Cash Flow (FCF)
    fcf = info.get("freeCashflow")
    op_cf = info.get("operatingCashflow")
    if fcf is None and not is_financial:
        # Check cash flow statement fallback
        try:
            cf_stmt = t.quarterly_cash_flow
            if not cf_stmt.empty:
                for idx in ["Free Cash Flow", "FreeCashFlow"]:
                    if idx in cf_stmt.index:
                        fcf = float(cf_stmt.loc[idx].iloc[0])
                        break
        except Exception:
            pass
            
    fcf_formatted = format_cash_flow(fcf, currency) if fcf is not None else ("N/A (Regulated Bank Balance)" if is_financial else "N/A")

    # Valuation check: P/E around or less than 15
    passes_pe = pe_trailing is not None and pe_trailing <= 15.0

    # Growth Qualification: Rev > 15%, EPS > 15%, Manageable D/E, and ROE > 10%
    passes_revenue = rev_growth_pct is not None and rev_growth_pct >= 15.0
    passes_eps = eps_growth_pct is not None and eps_growth_pct >= 15.0
    
    qualifies_growth = bool(passes_revenue and passes_eps and is_debt_manageable and (passes_roe or roe_pct is None))
    qualifies_garp = bool(qualifies_growth and (passes_pe or (pe_trailing and pe_trailing <= 20.0)))
    
    return {
        "ticker": norm_ticker,
        "name": get_canonical_name(norm_ticker, info),
        "sector": sector or "General",
        "industry": info.get("industry") or "General",
        "currency": currency,
        "isFinancial": is_financial,
        "revenueGrowthYoY": rev_growth_pct,
        "epsGrowthYoY": eps_growth_pct,
        "debtToEquity": debt_to_equity_ratio,
        "isDebtManageable": is_debt_manageable,
        "trailingPE": round(pe_trailing, 2) if pe_trailing else None,
        "forwardPE": round(pe_forward, 2) if pe_forward else None,
        "pegRatio": round(peg_ratio, 2) if peg_ratio else None,
        "profitMargin": round(profit_margin * 100.0, 2) if profit_margin is not None else None,
        "returnOnEquity": roe_pct,
        "passesROE": passes_roe,
        "dividendYield": div_yield_pct,
        "trailingEps": round(trailing_eps, 2) if trailing_eps is not None else None,
        "forwardEps": round(forward_eps, 2) if forward_eps is not None else None,
        "freeCashflow": fcf,
        "freeCashflowFormatted": fcf_formatted,
        "operatingCashflow": op_cf,
        "passesRevenue": passes_revenue,
        "passesEPS": passes_eps,
        "passesPE": passes_pe,
        "qualifiesGrowth": qualifies_growth,
        "qualifiesGarp": qualifies_garp
    }
