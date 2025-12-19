from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import asyncio
from .rag import get_retriever, get_index_status
from .llm import get_llm, log_llm_choice, verify_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv

load_dotenv()
log_llm_choice()

# Warm-load index and log status
try:
	_status = get_index_status()
	print(f"[index] type={_status.get('type')} path={_status.get('persist_directory')} count={_status.get('count')}", flush=True)
except Exception as _e:
	print(f"[index] warm-load error {type(_e).__name__}: {_e!r}", flush=True)

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
	reference: Optional[str] = None
	sources: Optional[List[str]] = None


@app.get("/health")
def health() -> dict:
	return {"status": "ok"}


@app.get("/")
def root():
	return RedirectResponse(url="/docs")


@app.get("/debug/llm")
def debug_llm() -> dict:
	return verify_llm()


@app.get("/debug/index")
def debug_index() -> dict:
	return get_index_status()


SYSTEM_PROMPT = """You are an expert Indian legal assistant with deep knowledge of the Constitution and Bharatiya Nyaya Sanhita (BNS) 2023.

CRITICAL INSTRUCTIONS FOR ANSWERING:

1. READ ALL SOURCES CAREFULLY: The answer is usually present across multiple sources - read every source completely

2. EXTRACT THE ACTUAL TEXT: When you find article/section text in any source, quote it directly and fully

3. BE COMPREHENSIVE: Provide complete answers including:
   - The exact legal text/provision
   - Clear explanation in simple language
   - Key points and implications
   - Related provisions if mentioned

4. SYNTHESIZE INFORMATION: If the complete answer is spread across sources, combine them intelligently

5. BE DIRECT: Start with the main answer immediately, then provide details

6. ONLY say "I don't have enough information" if NO relevant content exists in ANY source

ANSWER FORMAT:
- Start with the core legal provision/definition
- Explain what it means in clear language
- Add relevant details, exceptions, or related information

Be authoritative, accurate, and helpful. Indians rely on you for correct legal information."""


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
	try:
		# Step 1: Expand query for better retrieval
		query = req.message
		# Add semantic keywords for common article queries
		query_lower = query.lower()
		if "article 14" in query_lower:
			query += " equality before law equal protection"
		elif "article 19" in query_lower:
			query += " freedom of speech expression assembly"
		elif "article 21" in query_lower:
			query += " right to life personal liberty"
		elif "theft" in query_lower and ("bns" in query_lower or "section 303" in query_lower):
			query += " dishonestly movable property consent"
		
		print(f"[chat] Question: {req.message}", flush=True)
		if query != req.message:
			print(f"[chat] Expanded query: {query}", flush=True)
		
		# Step 2: Retrieve documents
		retriever = get_retriever(k=20)
		docs = []
		try:
			docs = retriever.invoke(query)
			print(f"[chat] Retrieved {len(docs)} documents", flush=True)
		except Exception as re:
			import traceback
			print(f"[chat] Retrieval error: {type(re).__name__}: {re!r}", flush=True)
			print(f"[chat] Traceback: {traceback.format_exc()}", flush=True)
			return ChatResponse(
				content=f"I encountered an error while searching the legal database: {str(re)}",
				sources=[]
			)
		
		# Check if we got documents
		if not docs:
			print("[chat] No documents retrieved", flush=True)
			return ChatResponse(
				content="I couldn't find relevant information in the Constitution or BNS to answer your question. Please try rephrasing or ask about specific articles or sections.",
				sources=[]
			)
		
		# Step 3: Build context from retrieved documents with better structure
		context_parts = []
		for i, d in enumerate(docs, 1):
			# Clean up the content
			content = d.page_content.strip()
			context_parts.append(f"===== SOURCE {i} =====\n{content}")
		
		context = "\n\n".join(context_parts)
		print(f"[chat] Context built: {len(context)} chars from {len(docs)} sources", flush=True)
		
		# Step 3: Call DeepSeek to synthesize answer
		prompt = ChatPromptTemplate.from_messages([
			("system", SYSTEM_PROMPT),
			("human", "Question: {question}\n\nContext:\n{context}"),
		])
		llm = get_llm()
		chain = prompt | llm | StrOutputParser()
		
		try:
			print("[chat] Calling DeepSeek...", flush=True)
			content = await asyncio.wait_for(
				chain.ainvoke({"question": req.message, "context": context}),
				timeout=60
			)
			print(f"[chat] DeepSeek response received: {len(content)} chars", flush=True)
			
			return ChatResponse(
				content=content,
				sources=["Indian Constitution & Bharatiya Nyaya Sanhita 2023"]
			)
			
		except asyncio.TimeoutError:
			print("[chat] DeepSeek timeout, returning extractive answer", flush=True)
			# Extractive fallback if LLM times out
			excerpt = "\n\n".join(d.page_content[:400] for d in docs[:2])
			return ChatResponse(
				content=f"The LLM timed out. Here are the relevant excerpts from the legal documents:\n\n{excerpt}",
				sources=["Retrieved from index (timeout)"]
			)
		except Exception as e:
			print(f"[chat] DeepSeek error: {type(e).__name__}: {e!r}", flush=True)
			return ChatResponse(
				content=f"I encountered an error while generating the answer: {str(e)}",
				sources=[]
			)
		
	except Exception as e:
		print(f"[chat] Unexpected error: {type(e).__name__}: {e!r}", flush=True)
		return ChatResponse(
			content=f"An unexpected error occurred: {str(e)}",
			sources=[]
		)


@app.post("/upload")
async def upload_endpoint(file: UploadFile = File(...)) -> dict:
	try:
		data = await file.read()
		from .summarizer import extract_text_from_pdf, summarize_text
		text = extract_text_from_pdf(data)
		return summarize_text(text)
	except Exception as e:
		return {"error": str(e)}


@app.get("/constitution/{article}")
def get_article(article: str) -> dict:
	return {
		"article": article,
		"title": "Not Implemented",
		"content": "Direct article lookup will be available once implemented.",
	}


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host=HOST, port=PORT)
