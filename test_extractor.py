from backend.services.pdf_processor import extract_text_from_pdf
from backend.services.rule_extractor import extract_rules


PDF_PATH = "backend/data/rulebook/rulebook.pdf"

text = extract_text_from_pdf(PDF_PATH)

rules = extract_rules(text)

print(f"\nTotal rules found: {len(rules)}\n")

for rule in rules:
    print("=" * 60)
    print(f"Section   : {rule.section}")
    print(f"Title     : {rule.title}")
    print(f"Text      : {rule.text}")
    print(f"Condition : {rule.condition}")
    print(f"Exception : {rule.exception}")
    print(f"Authority : {rule.authority}")