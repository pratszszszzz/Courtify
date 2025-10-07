from __future__ import annotations

from typing import List


KEYWORD_HINTS = {
	# Sexual orientation / same-sex topics
	"same sex": ["Article 14", "Article 15", "Article 19", "Article 21"],
	"same-sex": ["Article 14", "Article 15", "Article 19", "Article 21"],
	"homosexual": ["Article 14", "Article 15", "Article 19", "Article 21"],
	"gay": ["Article 14", "Article 15", "Article 19", "Article 21"],
	"lgbt": ["Article 14", "Article 15", "Article 19", "Article 21"],
	"privacy": ["Article 21"],
	# Misc examples
	"article 300": ["Article 300"],
}


def map_query_to_article_hints(query: str) -> List[str]:
	q = query.lower()
	labels: List[str] = []
	for key, arts in KEYWORD_HINTS.items():
		if key in q:
			for a in arts:
				if a not in labels:
					labels.append(a)
	return labels


