export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ChatApiResponse {
	content: string;
	reference?: string;
	sources?: string[];
}

function fallbackChat(userMessage: string): ChatApiResponse {
	const lowerMessage = userMessage.toLowerCase();

	if (
		lowerMessage.includes("fundamental right") ||
		lowerMessage.includes("article 14") ||
		lowerMessage.includes("equality")
	) {
		return {
			content:
				'Article 14 of the Indian Constitution guarantees the Right to Equality. It states that "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India." This means all citizens are equal before law regardless of their religion, race, caste, sex, or place of birth. This fundamental right ensures equal treatment and prevents discrimination by the State.',
			reference: "Article 14 - Right to Equality",
		};
	}

	if (
		lowerMessage.includes("free speech") ||
		lowerMessage.includes("article 19") ||
		lowerMessage.includes("expression")
	) {
		return {
			content:
				"Article 19(1)(a) of the Indian Constitution guarantees freedom of speech and expression to all citizens. However, this right is subject to reasonable restrictions under Article 19(2) in the interests of sovereignty, integrity, security of State, friendly relations with foreign States, public order, decency, morality, contempt of court, defamation, or incitement to offence. The Supreme Court has held this to be one of the most important fundamental rights in a democracy.",
			reference: "Article 19 - Freedom of Speech and Expression",
		};
	}

	if (
		lowerMessage.includes("directive principle") ||
		lowerMessage.includes("article 38") ||
		lowerMessage.includes("welfare")
	) {
		return {
			content:
				"Article 38 is a Directive Principle of State Policy that directs the State to promote the welfare of the people by securing a social order in which justice - social, economic and political - informs all institutions of national life. While not enforceable in courts, these principles are fundamental in governance and it is the duty of the State to apply these principles in making laws.",
			reference: "Article 38 - Directive Principles of State Policy",
		};
	}

	if (lowerMessage.includes("preamble") || lowerMessage.includes("constitution purpose")) {
		return {
			content:
				"The Preamble to the Indian Constitution declares India to be a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC. It secures JUSTICE (social, economic, political), LIBERTY (of thought, expression, belief, faith, worship), EQUALITY (of status and opportunity), and FRATERNITY (assuring dignity of individual and unity of nation). The Preamble reflects the philosophy and fundamental values upon which the Constitution is based.",
			reference: "Preamble - Constitution of India",
		};
	}

	return {
		content:
			"I understand you have a question about Indian law. While I can provide general constitutional guidance, for specific legal matters I recommend consulting with a qualified lawyer. I can help explain constitutional provisions, fundamental rights, directive principles, and general legal concepts. Could you please specify which aspect of Indian constitutional law you'd like to know about?",
		reference: "General Legal Guidance",
	};
}

export async function chat(message: string): Promise<ChatApiResponse> {
	try {
		const response = await fetch(`${API_BASE_URL}/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message }),
			mode: "cors",
		});

		if (!response.ok) {
			return fallbackChat(message);
		}

		const data = (await response.json()) as Partial<ChatApiResponse> & { content?: string; answer?: string };
		return {
			content: data.content ?? data.answer ?? "",
			reference: data.reference,
			sources: data.sources,
		};
	} catch {
		return fallbackChat(message);
	}
}

export interface UploadResult {
	summary: string;
	keyPoints: string[];
}

function fallbackUpload(): UploadResult {
	return {
		summary:
			"This legal document appears to outline terms and conditions between parties, with standard legal provisions including definitions, obligations, rights, remedies, dispute resolution, and termination conditions.",
		keyPoints: [
			"Contains binding legal obligations for parties",
			"Specifies dispute resolution and jurisdiction",
			"Includes indemnification and liability clauses",
			"Outlines termination conditions and notices",
			"References applicable laws and compliance",
			"Contains confidentiality provisions",
		],
	};
}

export async function uploadDocument(file: File): Promise<UploadResult> {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`${API_BASE_URL}/upload`, {
			method: "POST",
			body: formData,
			mode: "cors",
		});

		if (!response.ok) {
			return fallbackUpload();
		}

		const data = (await response.json()) as any;
		return {
			summary: data.summary ?? data?.result?.summary ?? "",
			keyPoints: data.keyPoints ?? data.key_points ?? data?.result?.keyPoints ?? [],
		};
	} catch {
		return fallbackUpload();
	}
}


