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


def _select_llm_info():
	"""Return (provider, model, base_url) chosen from env, with DeepSeek auto if key present."""
	env_model_type = os.getenv("MODEL_TYPE", "").strip().lower()
	if not env_model_type and os.getenv("DEEPSEEK_API_KEY"):
		model_type = "deepseek"
	else:
		model_type = (env_model_type or "openai").lower()
	if model_type == "deepseek":
		return ("deepseek", os.getenv("DEEPSEEK_MODEL", "deepseek-chat"), os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"))
	if model_type == "gemini":
		return ("gemini", os.getenv("GEMINI_MODEL", "gemini-1.5-flash"), None)
	# default openai
	return ("openai", os.getenv("OPENAI_MODEL", "gpt-4o-mini"), None)


def log_llm_choice():
	provider, model, base_url = _select_llm_info()
	msg = f"[llm] provider={provider} model={model}"
	if base_url:
		msg += f" base_url={base_url}"
	print(msg, flush=True)


def get_llm():
	# Force DeepSeek only - no mock fallback
	if not exists_openai:
		raise ImportError("langchain-openai not installed!")
	
	api_key = os.getenv("DEEPSEEK_API_KEY")
	if not api_key:
		raise ValueError("DEEPSEEK_API_KEY environment variable is not set!")
	
	base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
	model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
	
	return ChatOpenAI(model=model, temperature=0.2, api_key=api_key, base_url=base_url, timeout=30)


def verify_llm() -> dict:
	"""Perform a minimal call to verify the selected LLM works. Returns a small status dict."""
	provider, model, base_url = _select_llm_info()
	try:
		llm = get_llm()
		# LangChain LLMs support .invoke; our mock is callable
		if hasattr(llm, "invoke"):
			res = llm.invoke("ping")
			content = getattr(res, "content", str(res))
		else:
			content = str(llm("ping"))
		return {"ok": True, "provider": provider, "model": model, "base_url": base_url, "sample": str(content)[:160]}
	except Exception as e:
		return {"ok": False, "provider": provider, "model": model, "base_url": base_url, "error": f"{type(e).__name__}: {e}"}


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


