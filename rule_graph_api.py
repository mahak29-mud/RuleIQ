# =====================================================
# RULELENS - RULE GRAPH API
# =====================================================

from fastapi import APIRouter

from backend.services.rule_graph import create_rule_graph


router = APIRouter(
    prefix="/rule-graph",
    tags=["Rule Graph"]
)


@router.get("/")
def get_rule_graph():

    graph = create_rule_graph()

    return {
        "status": "ANSWERED",
        "graph": graph
    }