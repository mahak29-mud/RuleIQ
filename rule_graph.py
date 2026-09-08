class RuleGraph:

    def __init__(self):
        self.nodes = []
        self.edges = []

    # =================================================
    # ADD RULE
    # =================================================

    def add_rule(self, section, title):

        node = {
            "section": section,
            "title": title
        }

        if node not in self.nodes:
            self.nodes.append(node)

    # =================================================
    # ADD RELATIONSHIP
    # =================================================

    def add_relationship(
        self,
        source,
        target,
        relationship
    ):

        edge = {
            "source": source,
            "target": target,
            "relationship": relationship
        }

        self.edges.append(edge)

    # =================================================
    # GET GRAPH
    # =================================================

    def get_graph(self):

        return {
            "nodes": self.nodes,
            "edges": self.edges
        }


# =====================================================
# CREATE RULELENS RULE GRAPH
# =====================================================

def create_rule_graph():

    graph = RuleGraph()

    # -------------------------------------------------
    # RULE NODES
    # -------------------------------------------------

    graph.add_rule(
        "4.2",
        "Attendance Requirement"
    )

    graph.add_rule(
        "7.3",
        "Medical Exception"
    )

    graph.add_rule(
        "7.4",
        "Approval Requirement"
    )

    graph.add_rule(
        "8.1",
        "Alternative Attendance Requirement"
    )

    # -------------------------------------------------
    # RULE RELATIONSHIPS
    # -------------------------------------------------

    graph.add_relationship(
        "4.2",
        "7.3",
        "exception-of"
    )

    graph.add_relationship(
        "7.3",
        "7.4",
        "requires"
    )

    graph.add_relationship(
        "8.1",
        "4.2",
        "contradicts"
    )

    return graph.get_graph()
