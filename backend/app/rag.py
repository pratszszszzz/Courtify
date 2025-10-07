from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional
import re

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter


DATA_PATH = Path(os.getenv("CONSTITUTION_PATH", "./data/indian_constitution.txt")).resolve()
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "./storage")).resolve()
INDEX_PATH = STORAGE_DIR / "faiss_index"


def _read_constitution_text() -> str:
	if not DATA_PATH.exists():
		raise FileNotFoundError(f"Constitution file not found at {DATA_PATH}")
	return DATA_PATH.read_text(encoding="utf-8", errors="ignore")


def _chunk_text(text: str) -> List[str]:
	# Article-aware first pass, then length-based sub-splitting
	article_blocks = re.split(r"(?=\n?Article\s+[0-9]+[A-Z]?)", text, flags=re.IGNORECASE)
	blocks = [b.strip() for b in article_blocks if b and b.strip()]

	chunk_size = int(os.getenv("CHUNK_SIZE", "900"))
	chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "120"))
	splitter = RecursiveCharacterTextSplitter(
		separators=["\n\n", "\n", ". "],
		chunk_size=chunk_size,
		chunk_overlap=chunk_overlap,
		length_function=len,
	)

	chunks: List[str] = []
	for block in blocks:
		chunks.extend(splitter.split_text(block))
	return chunks


def _get_embeddings_model() -> HuggingFaceEmbeddings:
	model_name = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
	return HuggingFaceEmbeddings(model_name=model_name)


def build_or_load_vectorstore(force_rebuild: bool = False) -> Chroma:
	STORAGE_DIR.mkdir(parents=True, exist_ok=True)
	chroma_path = STORAGE_DIR / "chroma_index"
	if chroma_path.exists() and not force_rebuild:
		return Chroma(persist_directory=str(chroma_path), embedding_function=_get_embeddings_model())

	text = _read_constitution_text()
	chunks = _chunk_text(text)
	embeddings = _get_embeddings_model()

	def detect_article_label(chunk: str) -> str:
		m = re.search(r"Article\s+([0-9]+[A-Z]?)", chunk, flags=re.IGNORECASE)
		if m:
			return f"Article {m.group(1)}"
		if chunk.strip().lower().startswith("preamble"):
			return "Preamble"
		m2 = re.search(r"Part\s+([IVXLC]+)\b", chunk)
		if m2:
			return f"Part {m2.group(1)}"
		return "Unknown"

	metadatas = [{"chunk_id": i, "article": detect_article_label(ch)} for i, ch in enumerate(chunks)]
	store = Chroma.from_texts(chunks, embedding=embeddings, metadatas=metadatas, persist_directory=str(chroma_path))
	store.persist()
	return store


_vectorstore: Optional[Chroma] = None


def get_retriever(k: int = 6):
	global _vectorstore
	if _vectorstore is None:
		_vectorstore = build_or_load_vectorstore()
	return _vectorstore.as_retriever(search_kwargs={"k": k, "fetch_k": max(20, k*3), "mmr": True, "lambda_mult": 0.5})


