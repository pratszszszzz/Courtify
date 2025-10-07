from typing import Dict, List


def fallback_chat(user_message: str) -> Dict:
	lower = user_message.lower()

	if any(k in lower for k in ["fundamental right", "article 14", "equality"]):
		return {
			"content": (
				"Article 14 of the Indian Constitution guarantees the Right to Equality. It states that \"The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.\" This ensures equal treatment and prevents discrimination by the State."
			),
			"reference": "Article 14 - Right to Equality",
			"sources": ["Article 14"],
		}

	if any(k in lower for k in ["free speech", "article 19", "expression"]):
		return {
			"content": (
				"Article 19(1)(a) guarantees freedom of speech and expression to all citizens, subject to reasonable "
				"restrictions under Article 19(2) for sovereignty, integrity, public order, decency, and related grounds."
			),
			"reference": "Article 19 - Freedom of Speech and Expression",
			"sources": ["Article 19"],
		}

	if any(k in lower for k in ["directive principle", "article 38", "welfare"]):
		return {
			"content": (
				"Article 38 directs the State to promote the welfare of the people by securing a social order in which "
				"justice—social, economic and political—shall inform all institutions of national life."
			),
			"reference": "Article 38 - Directive Principles of State Policy",
			"sources": ["Article 38"],
		}

	if any(k in lower for k in ["preamble", "constitution purpose"]):
		return {
			"content": (
				"The Preamble declares India a Sovereign, Socialist, Secular, Democratic Republic and secures Justice, "
				"Liberty, Equality and Fraternity."
			),
			"reference": "Preamble - Constitution of India",
			"sources": ["Preamble"],
		}

	return {
		"content": (
			"I can provide general constitutional guidance and summaries. For specific legal matters, please consult a "
			"qualified lawyer. Which constitutional topic would you like to explore?"
		),
		"reference": "General Legal Guidance",
		"sources": [],
	}


def fallback_upload() -> Dict[str, List[str] | str]:
	return {
		"summary": (
			"This legal document appears to outline terms, obligations, dispute resolution, and termination conditions "
			"between parties, using formal legal terminology."
		),
		"keyPoints": [
			"Binding obligations for parties",
			"Jurisdiction and dispute resolution",
			"Indemnification and liability clauses",
			"Termination and notice requirements",
			"Regulatory compliance references",
			"Confidentiality provisions",
		],
	}


