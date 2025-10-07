from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from .rag import get_retriever
from .llm import build_rag_chain
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from .router import map_query_to_article_hints

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="Indian AI Legal Assistant API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class ChatRequest(BaseModel):
	message: str


class ChatResponse(BaseModel):
	content: str
	reference: str | None = None
	sources: list[str] | None = None


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}


@app.get("/")
def root():
	# Redirect root to interactive docs for convenience
	return RedirectResponse(url="/docs")


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
	# RAG pipeline with fallback to simple mock
	try:
		retriever = get_retriever(k=6)
		rag_chain = build_rag_chain(retriever)
		question = req.message
		hints = map_query_to_article_hints(question)
		if hints:
			question = "; ".join(hints) + " — " + question
		result = rag_chain.invoke(question)
		content = getattr(result, "content", str(result))
		# Build sources from retriever docs by re-running retrieval (cheap)
		docs = retriever.get_relevant_documents(question)
		sources = [
			d.metadata.get("article") or f"snippet {i+1}"
			for i, d in enumerate(docs)
		]
		return ChatResponse(content=content, sources=sources)
	except Exception:
		from .mock_logic import fallback_chat
		result = fallback_chat(req.message)
		return ChatResponse(**result)


@app.post("/upload")
async def upload_endpoint(file: UploadFile = File(...)) -> dict:
	try:
		data = await file.read()
		from .summarizer import extract_text_from_pdf, summarize_text
		text = extract_text_from_pdf(data)
		return summarize_text(text)
	except Exception:
		from .mock_logic import fallback_upload
		return fallback_upload()


@app.get("/constitution/{article}")
def get_article(article: str) -> dict:
	# Placeholder; will be implemented once constitution text is ingested
	return {
		"article": article,
		"title": "Not Implemented",
		"content": "Direct article lookup will be available once the corpus is loaded.",
	}


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host=HOST, port=PORT)


