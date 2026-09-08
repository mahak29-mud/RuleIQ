from backend.services.pdf_processor import extract_text_from_pdf
from backend.services.rule_extractor import extract_rules
from backend.services.retriever import RuleRetriever


PDF_PATH = "backend/data/rulebook/rulebook.pdf"

text = extract_text_from_pdf(PDF_PATH)

rules = extract_rules(text)

print("Rules loaded:", len(rules))

retriever = RuleRetriever(rules)

query = "Can I appear for my exam if my attendance is low?"

print("Searching:", query)

results = retriever.search(query, top_k=3)

print("\nSEARCH RESULTS\n")

for result in results:

    rule = result["rule"]

    print("=" * 60)
    print("Section:", rule.section)
    print("Title:", rule.title)
    print("Similarity:", round(result["similarity"], 4))
    print("Text:", rule.text)
