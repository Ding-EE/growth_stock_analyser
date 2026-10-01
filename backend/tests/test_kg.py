import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from backend.app.services.knowledge_graph import generate_stock_knowledge_graph

def test_kg():
    kg_z = generate_stock_knowledge_graph('0138.KL')
    print("=== 0138.KL (Zetrix) Knowledge Graph ===")
    print("Nodes:", [n['label'] for n in kg_z['nodes']])
    for e in kg_z['edges']:
        print(f"  Edge: {e['source']} --[{e['relation']}]--> {e['target']} (polarity: {e['polarity']})")
    print("Has High Risk Edge:", kg_z['hasHighRiskEdge'])

    kg_a = generate_stock_knowledge_graph('AAPL')
    print("\n=== AAPL Knowledge Graph ===")
    print("Nodes:", [n['label'] for n in kg_a['nodes']])
    for e in kg_a['edges']:
        print(f"  Edge: {e['source']} --[{e['relation']}]--> {e['target']} (polarity: {e['polarity']})")

if __name__ == "__main__":
    test_kg()
