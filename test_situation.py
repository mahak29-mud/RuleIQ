from backend.services.decision_engine import DecisionEngine
from backend.services.pdf_processor import extract_text_from_pdf
from backend.services.rule_extractor import extract_rules


PDF_PATH = "backend/data/rulebook/rulebook.pdf"

text = extract_text_from_pdf(PDF_PATH)
rules = extract_rules(text)

engine = DecisionEngine(rules)


situation = {
    "attendance": 68,
    "medical_certificate": True,
    "approval": False
}


result = engine.evaluate_situation(situation)

print("\nRULELENS DECISION")
print("=" * 50)

print("Attendance:", situation["attendance"], "%")
print("Medical Certificate:", situation["medical_certificate"])
print("Approval:", situation["approval"])

print("\nDecision:", result["decision"])
print("Status:", result["status"])
print("Explanation:", result["explanation"])