import time
from typing import Dict, Any, List
from .market_data import get_stock_quote, normalize_ticker
from .sentiment import analyze_stock_sentiment
from .macro import get_macro_context
from .fundamentals import get_fundamental_metrics

_KG_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 600

def generate_stock_knowledge_graph(ticker: str) -> Dict[str, Any]:
    """
    Constructs a Financial News Knowledge Graph (KG) grounded in real-time news headlines,
    corporate profile, and macroeconomic relationships (inspired by tpetkovich/news_KG).
    
    Extracts structured entity nodes and relationship edges:
    - Nodes: Company, Leadership, Regulators, Products/Technology, Competitors, Macro Drivers, Risk Factors.
    - Edges: Typed directional connections with sentiment polarity (positive, negative, neutral).
    """
    norm_ticker = normalize_ticker(ticker)
    now = time.time()
    
    if norm_ticker in _KG_CACHE:
        entry = _KG_CACHE[norm_ticker]
        if now - entry["timestamp"] < CACHE_TTL:
            return entry["data"]
            
    quote = get_stock_quote(norm_ticker)
    fund = get_fundamental_metrics(norm_ticker)
    sent = analyze_stock_sentiment(norm_ticker)
    macro = get_macro_context()
    
    company_name = quote.get("name", norm_ticker)
    sector = quote.get("sector", "General")
    is_my = norm_ticker.endswith(".KL")
    
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    
    # 1. Central Core Node (Target Company)
    nodes.append({
        "id": "target_company",
        "label": company_name,
        "type": "Company",
        "ticker": norm_ticker,
        "category": "core",
        "color": "#10b981", # Emerald
        "size": 24,
        "details": f"Market Cap: {quote.get('marketCap')}, Sector: {sector}"
    })
    
    # 2. Macro Nodes
    if is_my:
        nodes.append({
            "id": "bnm",
            "label": "Bank Negara Malaysia (BNM)",
            "type": "CentralBank",
            "category": "macro",
            "color": "#6366f1", # Indigo
            "size": 16,
            "details": f"OPR Policy: {macro['malaysia']['oprDisplay']}"
        })
        edges.append({
            "source": "bnm",
            "target": "target_company",
            "relation": "MONETARY_POLICY",
            "label": f"Anchors OPR at {macro['malaysia']['oprDisplay']}",
            "polarity": "neutral"
        })
        
        nodes.append({
            "id": "fx_rate",
            "label": f"USD/MYR ({macro['fx']['usdMyr']})",
            "type": "MacroCurrency",
            "category": "macro",
            "color": "#8b5cf6",
            "size": 14,
            "details": f"Currency stance: {macro['fx']['currencyTrend']}"
        })
        edges.append({
            "source": "fx_rate",
            "target": "target_company",
            "relation": "EXCHANGE_RATE_EXPOSURE",
            "label": "Impacts Import Costs & Export Margin",
            "polarity": "neutral"
        })
    else:
        nodes.append({
            "id": "fed",
            "label": "Federal Reserve (Fed)",
            "type": "CentralBank",
            "category": "macro",
            "color": "#6366f1",
            "size": 16,
            "details": f"Fed Funds Corridor: {macro['us']['fedRateDisplay']}"
        })
        edges.append({
            "source": "fed",
            "target": "target_company",
            "relation": "DISCOUNT_RATE",
            "label": f"Terminal Rate at {macro['us']['fedRateDisplay']}",
            "polarity": "warning"
        })

    # 3. Supply Chain Network Ingestion (SEC 10-K & Regulatory Disclosures)
    try:
        from .sec_supply_chain import extract_sec_supply_chain
        sc_data = extract_sec_supply_chain(norm_ticker)
        relationships = sc_data.get("relationships", [])
        
        for idx, rel in enumerate(relationships[:5]):
            entity_id = f"sc_entity_{idx}"
            rel_type = rel.get("relationship_type", "Partner")
            is_single = rel.get("concentration_risk") == "Critical Single-Source"
            
            # Color code based on relationship type
            if rel_type == "Supplier":
                node_color = "#f59e0b" if is_single else "#10b981" # Amber for critical supplier, Emerald for standard
                node_cat = "supplier"
            elif rel_type == "Customer":
                node_color = "#3b82f6" # Blue
                node_cat = "customer"
            else:
                node_color = "#8b5cf6" # Violet
                node_cat = "partner"
                
            nodes.append({
                "id": entity_id,
                "label": rel.get("entity_name", "Supply Chain Node"),
                "type": rel_type,
                "category": node_cat,
                "color": node_color,
                "size": 15 if is_single else 13,
                "details": f"[{rel_type}] {rel.get('financial_impact') or rel.get('category')} | 10-K Quote: \"{rel.get('evidence_quote')[:120]}...\""
            })
            
            if rel_type == "Supplier":
                edges.append({
                    "source": entity_id,
                    "target": "target_company",
                    "relation": "SUPPLIES_CRITICAL_INPUT",
                    "label": "Sole-Source Silicon / BOM" if is_single else "Supplies Hardware/Components",
                    "polarity": "warning" if is_single else "positive"
                })
            elif rel_type == "Customer":
                edges.append({
                    "source": "target_company",
                    "target": entity_id,
                    "relation": "DISTRIBUTES_TO",
                    "label": rel.get("category") or "Commercial Offtake",
                    "polarity": "positive"
                })
            else:
                edges.append({
                    "source": entity_id,
                    "target": "target_company",
                    "relation": "STRATEGIC_ALLIANCE",
                    "label": rel.get("category") or "Technology Alliance",
                    "polarity": "positive"
                })
    except Exception as e:
        print(f"Notice: Supply chain graph integration fallback ({e})")

    # 3. Dynamic News Event Extraction (news_KG approach)
    headlines = sent.get("headlines", [])
    
    # Detect specific news narrative clusters
    cluster_idx = 0
    for h in headlines[:4]:
        title = h.get("title", "")
        summary = h.get("summary", "")
        title_lower = title.lower()
        cluster_idx += 1
        
        if any(w in title_lower for w in ["masking", "underlying issues", "scrutiny", "probe", "weakness", "not reveal"]):
            # Risk / Accounting Skepticism Node (like Zetrix / MyEG)
            risk_id = f"risk_node_{cluster_idx}"
            nodes.append({
                "id": risk_id,
                "label": "Accounting & Operational Scrutiny",
                "type": "RiskFactor",
                "category": "risk",
                "color": "#f43f5e", # Rose
                "size": 16,
                "details": title
            })
            edges.append({
                "source": risk_id,
                "target": "target_company",
                "relation": "CHALLENGES_DISCLOSURE",
                "label": "Market questions profit durability",
                "polarity": "negative"
            })
            
        elif any(w in title_lower for w in ["ceo", "executive", "leadership", "ternus", "cook", "appoint"]):
            # Executive / Leadership Node
            lead_id = f"exec_node_{cluster_idx}"
            lead_name = "Executive Leadership"
            if "ternus" in title_lower:
                lead_name = "John Ternus (Executive)"
            elif "cook" in title_lower:
                lead_name = "Tim Cook (Leadership)"
                
            nodes.append({
                "id": lead_id,
                "label": lead_name,
                "type": "Leadership",
                "category": "governance",
                "color": "#38bdf8", # Sky
                "size": 14,
                "details": title
            })
            edges.append({
                "source": lead_id,
                "target": "target_company",
                "relation": "LEADERSHIP_STEWARDSHIP",
                "label": "Executes Product & AI Roadmap",
                "polarity": "positive"
            })
            
        elif any(w in title_lower for w in ["profit", "earnings", "growth", "revenue", "surge", "record"]):
            # Earnings Momentum Node
            growth_id = f"growth_node_{cluster_idx}"
            nodes.append({
                "id": growth_id,
                "label": "Top-Line Growth Acceleration",
                "type": "FinancialCatalyst",
                "category": "catalyst",
                "color": "#10b981",
                "size": 14,
                "details": title
            })
            edges.append({
                "source": growth_id,
                "target": "target_company",
                "relation": "DRIVES_CASH_EXPANSION",
                "label": f"YoY Rev +{fund.get('revenueGrowthYoY')}%",
                "polarity": "positive"
            })
            
        elif any(w in title_lower for w in ["ai", "chip", "semiconductor", "blockchain", "cloud", "software"]):
            # Technology Node
            tech_id = f"tech_node_{cluster_idx}"
            tech_name = "AI / Platform Innovation"
            if "blockchain" in title_lower or "zetrix" in title_lower:
                tech_name = "Zetrix Blockchain Infrastructure"
                
            nodes.append({
                "id": tech_id,
                "label": tech_name,
                "type": "Technology",
                "category": "product",
                "color": "#a855f7", # Purple
                "size": 14,
                "details": title
            })
            edges.append({
                "source": "target_company",
                "target": tech_id,
                "relation": "COMMERCIALIZES",
                "label": "Core Product Expansion",
                "polarity": "positive"
            })

    # Fallback product node if headlines were sparse
    if len(nodes) < 4:
        prod_id = "core_product_node"
        nodes.append({
            "id": prod_id,
            "label": f"{sector} Core Operations",
            "type": "ProductLine",
            "category": "product",
            "color": "#06b6d4",
            "size": 14,
            "details": f"Operating in {quote.get('industry')}"
        })
        edges.append({
            "source": "target_company",
            "target": prod_id,
            "relation": "GENERATES_REVENUE",
            "label": f"ROE: {fund.get('returnOnEquity')}%",
            "polarity": "positive"
        })

    # Summary narrative of the Knowledge Graph
    risk_nodes = [n for n in nodes if n["category"] == "risk"]
    kg_summary = (
        f"Knowledge Graph mapped {len(nodes)} interconnected entities across news, macro, and governance. "
        f"{'CRITICAL WARNING: Found direct risk edges challenging accounting durability.' if risk_nodes else 'Knowledge graph indicates constructive alignment with macro and product expansion.'}"
    )

    data = {
        "ticker": norm_ticker,
        "companyName": company_name,
        "nodesCount": len(nodes),
        "edgesCount": len(edges),
        "nodes": nodes,
        "edges": edges,
        "summary": kg_summary,
        "hasHighRiskEdge": len(risk_nodes) > 0
    }
    
    _KG_CACHE[norm_ticker] = {"data": data, "timestamp": now}
    return data
