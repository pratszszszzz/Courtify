from __future__ import annotations

import io
from typing import List, Dict

import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .llm import get_llm


def extract_text_from_pdf(file_bytes: bytes) -> str:
	with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
		texts = []
		for page in pdf.pages:
			texts.append(page.extract_text() or "")
	return "\n\n".join(texts)


def summarize_text(text: str) -> Dict[str, List[str] | str]:
	splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
	chunks = splitter.split_text(text)
	llm = get_llm()

	summaries: List[str] = []
	for ch in chunks[:8]:  # cap to keep it fast initially
		prompt = (
			"Summarize the following legal text in clear plain English. "
			"Then list 4-6 key points as bullet phrases.\n\nText:\n" + ch
		)
		res = llm.invoke(prompt)
		summaries.append(getattr(res, "content", str(res)))

	full_summary = "\n\n".join(summaries)
	key_points = []
	for line in full_summary.splitlines():
		if line.strip().startswith(("- ", "•", "* ")):
			key_points.append(line.strip().lstrip("-*• "))

	if not key_points:
		key_points = [
			"Key obligations and responsibilities",
			"Dispute resolution and jurisdiction",
			"Liability and indemnification",
			"Termination and notices",
		]

	return {"summary": full_summary[:2000], "keyPoints": key_points[:8]}


