import re

from backend.services.retriever import RuleRetriever


class DecisionEngine:

    def __init__(self, rules):
        self.rules = rules
        self.retriever = RuleRetriever(rules)

    # =====================================================
    # SEARCH RULES
    # =====================================================

    def search_rules(self, question, top_k=5):

        results = self.retriever.search(
            question,
            top_k=top_k
        )

        relevant_results = [
            result
            for result in results
            if result["similarity"] >= 0.35
        ]

        return relevant_results

    # =====================================================
    # CONFLICT DETECTION
    # =====================================================

    def detect_conflict(self, results, question=""):

        if len(results) < 2:
            return False, []

        question_lower = question.lower()

        conflicts = []

        for i in range(len(results)):

            rule1 = results[i]["rule"]
            text1 = rule1.text.lower()

            for j in range(i + 1, len(results)):

                rule2 = results[j]["rule"]
                text2 = rule2.text.lower()

                # -------------------------------------------------
                # Ignore medical / exception rules
                # -------------------------------------------------

                rule1_is_exception = (
                    "medical" in text1
                    or "exception" in text1
                    or "exemption" in text1
                )

                rule2_is_exception = (
                    "medical" in text2
                    or "exception" in text2
                    or "exemption" in text2
                )

                if rule1_is_exception or rule2_is_exception:
                    continue

                # -------------------------------------------------
                # Extract attendance percentages
                # -------------------------------------------------

                percentages1 = re.findall(
                    r'(\d+(?:\.\d+)?)\s*%',
                    text1
                )

                percentages2 = re.findall(
                    r'(\d+(?:\.\d+)?)\s*%',
                    text2
                )

                if not percentages1 or not percentages2:
                    continue

                percent1 = float(percentages1[0])
                percent2 = float(percentages2[0])

                # -------------------------------------------------
                # Check whether both are attendance rules
                # -------------------------------------------------

                attendance_rule1 = "attendance" in text1
                attendance_rule2 = "attendance" in text2

                if not attendance_rule1 or not attendance_rule2:
                    continue

                # -------------------------------------------------
                # Different attendance requirements = conflict
                # -------------------------------------------------

                if percent1 != percent2:

                    conflicts.append({
                        "rule1": rule1,
                        "rule2": rule2,
                        "reason": (
                            f"Section {rule1.section} mentions "
                            f"{percent1}% attendance while Section "
                            f"{rule2.section} mentions "
                            f"{percent2}% attendance."
                        )
                    })

        if conflicts:
            return True, conflicts

        return False, []

    # =====================================================
    # EVALUATE USER SITUATION
    # =====================================================

    def evaluate_situation(self, situation):

        attendance = situation.get("attendance")

        medical_certificate = situation.get(
            "medical_certificate"
        )

        approval = situation.get(
            "approval"
        )

        # -------------------------------------------------
        # Find important rules
        # -------------------------------------------------

        attendance_rule = next(
            (
                rule for rule in self.rules
                if rule.section == "4.2"
            ),
            None
        )

        medical_rule = next(
            (
                rule for rule in self.rules
                if rule.section == "7.3"
            ),
            None
        )

        approval_rule = next(
            (
                rule for rule in self.rules
                if rule.section == "7.4"
            ),
            None
        )

        # -------------------------------------------------
        # Default attendance requirement
        # -------------------------------------------------

        minimum_attendance = 75

        if attendance_rule:

            match = re.search(
                r'(\d+(?:\.\d+)?)\s*%',
                attendance_rule.text
            )

            if match:
                minimum_attendance = float(
                    match.group(1)
                )

        # -------------------------------------------------
        # Evidence
        # -------------------------------------------------

        sources = []

        for rule in [
            attendance_rule,
            medical_rule,
            approval_rule
        ]:

            if rule:

                sources.append({
                    "section": rule.section,
                    "title": rule.title,
                    "text": rule.text,
                    "similarity": 1.0
                })

        # -------------------------------------------------
        # Missing attendance
        # -------------------------------------------------

        if attendance is None:

            return {
                "status": "NOT_COVERED",
                "decision": "UNKNOWN",
                "explanation": (
                    "Attendance information is required."
                ),
                "sources": sources
            }

        # -------------------------------------------------
        # Attendance sufficient
        # -------------------------------------------------

        if attendance >= minimum_attendance:

            return {
                "status": "ANSWERED",
                "decision": "ELIGIBLE",
                "explanation": (
                    f"Attendance is {attendance}%, which meets "
                    f"the minimum requirement of "
                    f"{minimum_attendance}%."
                ),
                "sources": sources
            }

        # -------------------------------------------------
        # Attendance below requirement
        # -------------------------------------------------

        if attendance < minimum_attendance:

            if medical_certificate and approval:

                return {
                    "status": "ANSWERED",
                    "decision": "POSSIBLE",
                    "explanation": (
                        f"Attendance is {attendance}%, below the "
                        f"{minimum_attendance}% requirement. "
                        "However, the medical exception applies "
                        "because medical documentation and the "
                        "required approval are present."
                    ),
                    "sources": sources
                }

            return {
                "status": "ANSWERED",
                "decision": "NOT_ELIGIBLE",
                "explanation": (
                    f"Attendance is {attendance}%, below the "
                    f"{minimum_attendance}% requirement. "
                    "The medical exception cannot be applied "
                    "because the required conditions are not satisfied."
                ),
                "sources": sources
            }

        return {
            "status": "NOT_COVERED",
            "decision": "UNKNOWN",
            "explanation": (
                "The provided situation does not contain "
                "enough information."
            ),
            "sources": sources
        }

    # =====================================================
    # GENERAL RULEBOOK EVALUATION
    # =====================================================

    def evaluate(self, situation, top_k=5):

        results = self.search_rules(
            situation,
            top_k=top_k
        )

        if not results:

            return {
                "status": "NOT_COVERED",
                "answer": "No relevant rule was found.",
                "sources": [],
                "reasoning": (
                    "The rulebook does not contain enough "
                    "relevant information."
                )
            }

        has_conflict, conflicts = self.detect_conflict(
            results,
            str(situation)
        )

        sources = []

        for result in results:

            rule = result["rule"]

            sources.append({
                "section": rule.section,
                "title": rule.title,
                "text": rule.text,
                "similarity": result["similarity"]
            })

        if has_conflict:

            conflict = conflicts[0]

            rule1 = conflict["rule1"]
            rule2 = conflict["rule2"]

            return {
                "status": "CONFLICT",
                "answer": (
                    "Conflicting regulations were found."
                ),
                "sources": sources,
                "reasoning": (
                    f"Section {rule1.section} "
                    f"({rule1.title}) and Section "
                    f"{rule2.section} ({rule2.title}) "
                    "provide different attendance "
                    "requirements. "
                    f"{conflict['reason']}"
                )
            }

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