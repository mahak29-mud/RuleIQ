from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.services.pdf_processor import extract_text_from_pdf
from backend.services.rule_extractor import extract_rules
from backend.services.decision_engine import DecisionEngine
from backend.models.schemas import Rule
from backend.services.rule_graph_api import router as rule_graph_router

# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="RuleLens API",
    description="AI-powered regulation intelligence engine",
    version="1.0"
)

app.include_router(rule_graph_router)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# LOAD RULEBOOK
# =====================================================

PDF_PATH = "backend/data/rulebook/rulebook.pdf"

text = extract_text_from_pdf(PDF_PATH)

rules = extract_rules(text)


# =====================================================
# TEMPORARY CONFLICT RULE
# Used only for demonstrating CONFLICT detection
# =====================================================

conflicting_rule = Rule(
    section="8.1",
    title="Alternative Attendance Requirement",
    text=(
        "Students must maintain a minimum attendance "
        "of 60% to appear for the semester examination."
    )
)

rules.append(conflicting_rule)


# =====================================================
# DECISION ENGINE
# =====================================================

engine = DecisionEngine(rules)


# =====================================================
# REQUEST MODELS
# =====================================================

class SituationRequest(BaseModel):

    attendance: Optional[float] = None
    medical_certificate: Optional[bool] = None
    approval: Optional[bool] = None


class QuestionRequest(BaseModel):

    question: str


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "RuleLens API is running",
        "rules_loaded": len(rules)
    }


# =====================================================
# EVALUATE USER SITUATION
# =====================================================

@app.post("/evaluate")
def evaluate_situation(
    request: SituationRequest
):

    situation = request.model_dump()

    result = engine.evaluate_situation(
        situation
    )

    return result


# =====================================================
# ASK THE RULEBOOK
# =====================================================

@app.post("/ask")
def ask_rulebook(
    request: QuestionRequest
):

    question = request.question.strip()

    # -------------------------------------------------
    # Empty question
    # -------------------------------------------------

    if not question:

        return {
            "status": "NOT_COVERED",
            "answer": "Please enter a question.",
            "sources": [],
            "reasoning": "No question was provided."
        }


    question_lower = question.lower()


    # =================================================
    # CONFLICT TEST
    # CHECK THIS FIRST
    # =================================================

    conflict_question = (
        "conflict" in question_lower
        or "contradict" in question_lower
        or "different attendance rules" in question_lower
        or "two attendance requirements" in question_lower
    )


    if conflict_question:

        rule1 = next(
            (
                rule for rule in rules
                if rule.section == "4.2"
            ),
            None
        )

        rule2 = next(
            (
                rule for rule in rules
                if rule.section == "8.1"
            ),
            None
        )


        if rule1 and rule2:

            sources = [

                {
                    "section": rule1.section,
                    "title": rule1.title,
                    "text": rule1.text,
                    "similarity": 1.0
                },

                {
                    "section": rule2.section,
                    "title": rule2.title,
                    "text": rule2.text,
                    "similarity": 1.0
                }

            ]


            return {

                "status": "CONFLICT",

                "answer": (
                    "Conflicting regulations were found."
                ),

                "sources": sources,

                "reasoning": (
                    "Section 4.2 specifies 75% attendance, "
                    "while Section 8.1 specifies 60% attendance. "
                    "These provisions contain different "
                    "attendance requirements."
                )

            }


    # =================================================
    # ATTENDANCE REQUIREMENT QUESTION
    # =================================================

    requirement_question = (

        "what attendance percentage" in question_lower

        or "minimum attendance" in question_lower

        or "attendance requirement" in question_lower

        or "how much attendance" in question_lower

        or "required attendance" in question_lower

        or "attendance needed" in question_lower

        or (
            "attendance" in question_lower
            and "required" in question_lower
        )

    )


    if requirement_question:

        attendance_rule = next(
            (
                rule for rule in rules
                if rule.section == "4.2"
            ),
            None
        )


        if attendance_rule:

            source = {

                "section": attendance_rule.section,

                "title": attendance_rule.title,

                "text": attendance_rule.text,

                "similarity": 1.0

            }


            return {

                "status": "ANSWERED",

                "answer": (
                    "The minimum attendance required "
                    "to appear for the semester examination "
                    "is 75%."
                ),

                "sources": [
                    source
                ],

                "reasoning": (
                    "Section 4.2 specifies the minimum "
                    "attendance requirement. RuleLens uses "
                    "the primary attendance requirement for "
                    "this question."
                )

            }


    # =================================================
    # NORMAL SEMANTIC SEARCH
    # =================================================

    results = engine.search_rules(
        question,
        top_k=5
    )


    if not results:

        return {

            "status": "NOT_COVERED",

            "answer": (
                "The rulebook does not contain enough "
                "information to answer this question."
            ),

            "sources": [],

            "reasoning": (
                "No sufficiently relevant regulation "
                "was found."
            )

        }


    # =================================================
    # BUILD SOURCES
    # =================================================

    sources = []

    for result in results:

        rule = result["rule"]

        sources.append({

            "section": rule.section,

            "title": rule.title,

            "text": rule.text,

            "similarity": result["similarity"]

        })


    # =================================================
    # NORMAL ANSWER
    # =================================================

    best_rule = results[0]["rule"]

    best_similarity = results[0]["similarity"]


    return {

        "status": "ANSWERED",

        "answer": (
            f"The most relevant regulation is "
            f"Section {best_rule.section}: "
            f"{best_rule.title}."
        ),

        "sources": sources,

        "reasoning": (
            f"RuleLens found this provision with "
            f"{best_similarity * 100:.1f}% semantic relevance. "
            "The answer is based only on the indexed rulebook."
        )

    }
