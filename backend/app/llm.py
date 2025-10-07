from __future__ import annotations

import os
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

try:
	from langchain_openai import ChatOpenAI
	exists_openai = True
except Exception:
	exists_openai = False

try:
	from langchain_google_genai import ChatGoogleGenerativeAI
	exists_gemini = True
except Exception:
	exists_gemini = False


SYSTEM_PROMPT = (
	"You are an expert Indian Constitutional Law assistant. Answer using only the provided context. "
	"Cite relevant articles/parts when applicable. If the answer is not in context, say you don't know."
)


def get_llm():
	model_type = os.getenv("MODEL_TYPE", "openai").lower()
	if model_type == "openai" and exists_openai and os.getenv("OPENAI_API_KEY"):
		return ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), temperature=0.2)
	if model_type == "gemini" and exists_gemini:
		api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
		if api_key:
			return ChatGoogleGenerativeAI(model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"), temperature=0.2, google_api_key=api_key)
	# Fallback: return a callable accepted by LC Runnables
	def llm_call(prompt_value):
		try:
			messages = prompt_value.to_messages() if hasattr(prompt_value, "to_messages") else prompt_value
			if isinstance(messages, list) and len(messages) > 0:
				last = messages[-1]
				content = getattr(last, "content", str(last))
			else:
				content = str(prompt_value)
		except Exception:
			content = str(prompt_value)
		return f"Mock answer based on provided context: {content}"

	return llm_call


def build_rag_chain(retriever):
	prompt = ChatPromptTemplate.from_messages([
		("system", SYSTEM_PROMPT),
		("human", "Question: {question}\n\nContext:\n{context}"),
	])

	def format_docs(docs):
		return "\n\n".join(f"[Source] {i+1}: {d.page_content}" for i, d in enumerate(docs))

	chain = (
		{"context": retriever | format_docs, "question": RunnablePassthrough()}
		| prompt
		| get_llm()
		| StrOutputParser()
	)

	return chain


