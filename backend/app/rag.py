from __future__ import annotations

import os
"""
Ensure HuggingFace / Transformers do NOT try to import TensorFlow.
TensorFlow in this environment has a protobuf version conflict, which was
causing `sentence_transformers` imports to fail and breaking index builds.
By setting this env var before importing HuggingFaceEmbeddings, we keep
the stack purely PyTorch-based, which is all we need here.
"""
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
import shutil
from pathlib import Path
from typing import List, Optional

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

try:
	import pdfplumber
	exists_pdf = True
except Exception:
	exists_pdf = False

try:
	from PyPDF2 import PdfReader
	exists_pypdf2 = True
except Exception:
	exists_pypdf2 = False


_MODULE_ROOT = Path(__file__).resolve().parents[1]
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", str(_MODULE_ROOT / "storage"))).resolve()
CONSTITUTION_PATH = _MODULE_ROOT / "data" / "indian_constitution.txt"
BNS_PDF_PATH = Path(r"C:\Users\prath\Desktop\courtify\Courtify\a2023-45.pdf")


def _get_embeddings_model() -> HuggingFaceEmbeddings:
	model_name = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
	return HuggingFaceEmbeddings(model_name=model_name)


def _get_text_splitter() -> RecursiveCharacterTextSplitter:
	chunk_size = int(os.getenv("CHUNK_SIZE", "1800"))
	chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "200"))
	return RecursiveCharacterTextSplitter(
		separators=["\n\n", "\n", ". "],
		chunk_size=chunk_size,
		chunk_overlap=chunk_overlap,
		length_function=len,
	)


def _load_constitution() -> str:
	if not CONSTITUTION_PATH.exists():
		raise FileNotFoundError(f"Constitution not found at {CONSTITUTION_PATH}")
	return CONSTITUTION_PATH.read_text(encoding="utf-8", errors="ignore")


def _load_pdf(path: Path) -> str:
	if not path.exists():
		raise FileNotFoundError(f"PDF not found at {path}")
	text = ""
	# Try pdfplumber first
	if exists_pdf:
		try:
			with pdfplumber.open(str(path)) as pdf:
				pages = [pg.extract_text() or "" for pg in pdf.pages]
				text = "\n\n".join(pages)
				if text.strip():
					return text
		except Exception:
			pass
	# Fallback to PyPDF2
	if exists_pypdf2:
		try:
			reader = PdfReader(str(path))
			pages = [pg.extract_text() or "" for pg in reader.pages]
			text = "\n\n".join(pages)
		except Exception:
			pass
	return text


def build_or_load_vectorstore(force_rebuild: bool = False) -> FAISS:
	"""Build or load FAISS vectorstore with Constitution + BNS PDF."""
	STORAGE_DIR.mkdir(parents=True, exist_ok=True)
	faiss_path = STORAGE_DIR / "faiss_index"
	
	if faiss_path.exists() and not force_rebuild:
		embeddings = _get_embeddings_model()
		return FAISS.load_local(str(faiss_path), embeddings, allow_dangerous_deserialization=True)
	
	if force_rebuild and faiss_path.exists():
		try:
			shutil.rmtree(faiss_path)
		except Exception:
			pass
	
	# Load documents
	print("[index] Loading Constitution...")
	constitution_text = _load_constitution()
	print(f"[index] Constitution: {len(constitution_text):,} chars")
	
	print("[index] Loading BNS PDF...")
	bns_text = _load_pdf(BNS_PDF_PATH)
	print(f"[index] BNS PDF: {len(bns_text):,} chars")
	
	# Chunk
	print("[index] Chunking documents...")
	splitter = _get_text_splitter()
	constitution_chunks = splitter.split_text(constitution_text)
	print(f"[index] Constitution chunks: {len(constitution_chunks):,}")
	
	bns_chunks = splitter.split_text(bns_text) if bns_text.strip() else []
	print(f"[index] BNS chunks: {len(bns_chunks):,}")
	
	all_texts = constitution_chunks + bns_chunks
	print(f"[index] Total chunks: {len(all_texts):,}")
	
	if not all_texts:
		raise ValueError("No documents to index")
	
	# Build FAISS index
	print("[index] Building embeddings (this may take 2-3 minutes)...")
	embeddings = _get_embeddings_model()
	print("[index] Creating FAISS index...")
	vectorstore = FAISS.from_texts(all_texts, embeddings)
	print("[index] Saving index to disk...")
	vectorstore.save_local(str(faiss_path))
	print(f"[index] SUCCESS: FAISS index saved to {faiss_path}")
	
	return vectorstore


_vectorstore: Optional[FAISS] = None


def get_retriever(k: int = 6):
	"""Get similarity retriever from FAISS index."""
	global _vectorstore
	if _vectorstore is None:
		_vectorstore = build_or_load_vectorstore()
	# Use similarity search instead of MMR for better article text retrieval
	return _vectorstore.as_retriever(
		search_type="similarity",
		search_kwargs={"k": k}
	)


def get_index_status() -> dict:
	"""Return basic information about the FAISS index."""
	global _vectorstore
	try:
		if _vectorstore is None:
			_vectorstore = build_or_load_vectorstore()
		count = _vectorstore.index.ntotal if hasattr(_vectorstore, 'index') else -1
		return {
			"ok": True,
			"type": "FAISS",
			"persist_directory": str(STORAGE_DIR / "faiss_index"),
			"embedding_model": os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
			"count": count,
		}
	except Exception as e:
		return {"ok": False, "error": f"{type(e).__name__}: {e}"}
