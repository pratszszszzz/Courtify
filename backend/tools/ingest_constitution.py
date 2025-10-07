import os
from pathlib import Path
import sys
import pdfplumber


def extract_text(pdf_path: Path) -> str:
	text_parts = []
	with pdfplumber.open(str(pdf_path)) as pdf:
		for page in pdf.pages:
			text = page.extract_text() or ""
			text_parts.append(text)
	return "\n\n".join(text_parts)


def main():
	# Default paths
	project_root = Path(__file__).resolve().parents[2]
	default_pdf = project_root / "Courtify" / "constitution.pdf"
	default_txt = Path(__file__).resolve().parents[1] / "data" / "indian_constitution.txt"

	pdf_arg = Path(sys.argv[1]) if len(sys.argv) > 1 else default_pdf
	out_arg = Path(sys.argv[2]) if len(sys.argv) > 2 else default_txt

	if not pdf_arg.exists():
		raise FileNotFoundError(f"PDF not found at {pdf_arg}")

	out_arg.parent.mkdir(parents=True, exist_ok=True)

	print(f"[ingest] Reading PDF: {pdf_arg}")
	text = extract_text(pdf_arg)

	# Light cleanup
	text = text.replace("\uf0b7", "-")
	text = "\n".join(line.rstrip() for line in text.splitlines())

	out_arg.write_text(text, encoding="utf-8")
	print(f"[ingest] Wrote text to: {out_arg}")


if __name__ == "__main__":
	main()


