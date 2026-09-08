import re
from typing import List
from backend.models.schemas import Rule


def extract_rules(text: str) -> List[Rule]:
    """
    Extract rule sections from the rulebook text.
    """

    pattern = r"(?:^|\n)\s*(\d+(?:\.\d+)*)\s+([^\n]+)\n(.*?)(?=\n\s*\d+(?:\.\d+)*\s+[^\n]+|\Z)"

    matches = re.findall(pattern, text, re.DOTALL)

    rules = []

    for section, title, content in matches:

        content = content.strip()

        condition = None
        exception = None
        authority = None

        # Detect common rule keywords
        condition_match = re.search(
            r"(?:condition|applies to|applicable to)[:\-]?\s*(.*?)(?:\.|$)",
            content,
            re.IGNORECASE
        )

        exception_match = re.search(
            r"(?:exception|except|exemption)[:\-]?\s*(.*?)(?:\.|$)",
            content,
            re.IGNORECASE
        )

        authority_match = re.search(
            r"(?:approval|authority|approved by)[:\-]?\s*(.*?)(?:\.|$)",
            content,
            re.IGNORECASE
        )

        if condition_match:
            condition = condition_match.group(1).strip()

        if exception_match:
            exception = exception_match.group(1).strip()

        if authority_match:
            authority = authority_match.group(1).strip()

        rules.append(
            Rule(
                section=section,
                title=title.strip(),
                text=content,
                condition=condition,
                exception=exception,
                authority=authority
            )
        )

    return rules
