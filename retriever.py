import numpy as np
from backend.services.embeddings import create_embeddings


class RuleRetriever:

    def __init__(self, rules):
        self.rules = rules

        texts = [
            f"{rule.title}. {rule.text}"
            for rule in rules
        ]

        self.embeddings = create_embeddings(texts)

    def search(self, query, top_k=5):

        query_embedding = create_embeddings([query])[0]

        scores = np.dot(
            self.embeddings,
            query_embedding
        )

        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []

        for index in top_indices:

            rule = self.rules[index]

            results.append({
                "rule": rule,
                "similarity": float(scores[index])
            })

        return results