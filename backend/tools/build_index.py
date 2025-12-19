import argparse
from app.rag import build_or_load_vectorstore


def main():
	parser = argparse.ArgumentParser(description="Build FAISS index from Constitution + BNS PDF")
	parser.add_argument("--force", action="store_true", help="Force rebuild index")
	args = parser.parse_args()
	
	print("[index] Building FAISS index with Constitution + BNS PDF...")
	vectorstore = build_or_load_vectorstore(force_rebuild=args.force)
	print("[index] Ready.")


if __name__ == "__main__":
	main()
