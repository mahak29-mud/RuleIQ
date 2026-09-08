from pydantic import BaseModel, Field
from typing import List, Optional


class Rule(BaseModel):
    section: str
    title: str
    text: str
    condition: Optional[str] = None
    exception: Optional[str] = None
    authority: Optional[str] = None


class Evidence(BaseModel):
    section: str
    title: str
    text: str
    similarity: float = Field(ge=0.0, le=1.0)


class DecisionResponse(BaseModel):
    status: str
    answer: str
    sources: List[Evidence] = []
    reasoning: Optional[str] = None

class UserSituation(BaseModel):
    attendance: Optional[float] = None
    medical_certificate: Optional[bool] = None
    approval: Optional[bool] = None
    question: Optional[str] = None


class RuleDecision(BaseModel):
    status: str
    decision: str
    explanation: str
    sources: List[Evidence] = []
