import os
from pathlib import Path
from app.rag import build_or_load_vectorstore, _read_constitution_text, _chunk_text


def main():
	print("[index] Reading corpus and computing chunks...")
	text = _read_constitution_text()
	chunks = _chunk_text(text)
	print(f"[index] Corpus chars: {len(text):,} | chunks: {len(chunks):,}")
	print("[index] Rebuilding FAISS index (force=true)...")
	store = build_or_load_vectorstore(force_rebuild=True)
	print("[index] Ready. Index contains:", store.index.ntotal, "vectors")


if __name__ == "__main__":
	main()


