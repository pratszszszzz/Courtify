# Courtify – Indian AI Legal Assistant

Courtify is a full‑stack Indian legal assistant that lets you:

- Ask **Constitution & BNS‑aware legal questions** via a RAG (Retrieval‑Augmented Generation) backend
- Explore this functionality through a **modern React + Vite + Tailwind + shadcn/ui frontend**
- Document summarization is a **future/roadmap** capability (not enabled yet)

The project is split into a **FastAPI backend** and a **Vite/React frontend**.

---

## Repository layout

- **`backend/`** – FastAPI RAG backend
  - **`app/`** – API + LLM/RAG logic
    - `main.py` – FastAPI app with `/chat`, `/upload`, `/constitution/{article}`, `/health` and debug endpoints
    - `llm.py` – DeepSeek / LLM selection & verification helpers
    - `rag.py` – FAISS index builder over the Indian Constitution + BNS PDF
    - `summarizer.py` – PDF text extraction utilities
  - **`data/`**
    - `indian_constitution.txt` – core corpus for constitutional RAG (**required and committed**)
  - **`tools/`**
    - `build_index.py` – CLI to build the FAISS index
    - `ingest_constitution.py` – helper/ingestion utilities
  - `requirements.txt` – backend Python dependencies
  - `Dockerfile` – container image for the backend
  - `start_server.ps1` – helper script to start the backend on Windows
  - `storage/` (ignored) – generated FAISS index (e.g. `faiss_index/`)
  - `uploads/` (ignored) – uploaded PDFs at runtime

- **`Courtify/`** – Vite + React + TypeScript frontend
  - `src/` – React app (pages, components, hooks)
    - `lib/api.ts` – calls backend `/chat` and `/upload` (uses `VITE_API_BASE_URL`)
  - `public/` – static assets
  - `tailwind.config.ts`, `tsconfig*.json`, `vite.config.ts` – tooling/config
  - `package.json`, `package-lock.json` – frontend dependencies
  - `.gitignore` – frontend‑specific ignores
  - `a2023-45.pdf` – BNS 2023 PDF; used by backend RAG via a hard‑coded path in `backend/app/rag.py`

- **Top level**
  - `.gitignore` – shared ignores for Python, Node, Vite, env files, indexes, uploads, etc.
  - `README.md` – this file

---

## Getting started 

This section is for someone who **just found this repo on GitHub** and wants to run it locally.

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/courtify.git
cd courtify
```

> Replace `<your-username>` with your actual GitHub username if needed.

### 2. Install prerequisites

- **Python** 3.11+
- **Node.js** 20+ (recommended) with npm
- A **DeepSeek API key** (or compatible OpenAI‑style endpoint) for the backend LLM

### 3. Start the backend (API)

From the project root:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```bash
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

HOST=0.0.0.0
PORT=8000

CONSTITUTION_PATH=./data/indian_constitution.txt
STORAGE_DIR=./storage
UPLOAD_FOLDER=./uploads
```

Build the search index (one-time, or whenever you change the data):

```bash
cd backend
python -m tools.build_index --force
```

Run the backend:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Then open `http://localhost:8000/docs` to see the API.

### 4. Start the frontend (web app)

In a new terminal, from the project root:

```bash
cd Courtify
npm install
npm run dev
```

By default the frontend talks to `http://localhost:8000`. If your backend is on a different URL, create `Courtify/.env.local`:

```bash
VITE_API_BASE_URL=https://your-backend-url
```

Open the URL shown in the terminal (usually `http://localhost:5173`) to use Courtify.

---

## Prerequisites

- **Python**: 3.11+
- **Node.js**: 20+ (recommended) with npm
- A **DeepSeek API key** (or compatible OpenAI‑style endpoint) for the backend LLM

---

## Backend setup (FastAPI + RAG)

1. **Create & activate a virtualenv (recommended)**

   ```bash
   cd backend
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS / Linux
   source .venv/bin/activate
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables** (create `backend/.env`)

   ```bash
   # LLM / DeepSeek
   DEEPSEEK_API_KEY=sk-...
   DEEPSEEK_MODEL=deepseek-chat
   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

   # Optional/general
   MODEL_TYPE=deepseek
   HOST=0.0.0.0
   PORT=8000

   # Data paths (defaults shown)
   CONSTITUTION_PATH=./data/indian_constitution.txt
   STORAGE_DIR=./storage
   UPLOAD_FOLDER=./uploads
   ```

   > Note: `backend/app/rag.py` currently points `BNS_PDF_PATH` to `Courtify/a2023-45.pdf`. Ensure that file exists and update the path if you move it.

4. **Build the FAISS index (Constitution + BNS PDF)**

   From the `backend/` directory:

   ```bash
   # First build (or rebuild) the index
   python -m tools.build_index --force
   ```

   This will read `backend/data/indian_constitution.txt` and `Courtify/a2023-45.pdf`, chunk them, build embeddings, and save a FAISS index under `backend/storage/faiss_index/` (ignored by git).

5. **Run the backend (dev)**

   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or, on Windows, you can use the helper script (if configured):

   ```powershell
   cd backend
   ./start_server.ps1
   ```

6. **API docs**

   Once running, open `http://localhost:8000/docs` to explore the FastAPI Swagger UI.

---

## Backend API overview

- **`GET /health`** – health check
- **`GET /`** – redirects to `/docs`
- **`GET /debug/llm`** – verify LLM connectivity/config
- **`GET /debug/index`** – verify FAISS index status
- **`POST /chat`** – constitutional/BNS Q&A (RAG over Constitution + BNS)
- **`GET /constitution/{article}`** – placeholder for direct article lookup

---

## Frontend setup (Vite + React + shadcn/ui)

1. **Install dependencies**

   ```bash
   cd Courtify
   npm install
   ```

2. **Configure environment variables** (optional)

   By default, the frontend calls `http://localhost:8000`:

   ```ts
   // Courtify/src/lib/api.ts
   export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";
   ```

   To override this (e.g. when deploying backend separately), create `Courtify/.env.local`:

   ```bash
   VITE_API_BASE_URL=https://your-backend-url
   ```

3. **Run the frontend (dev)**

   ```bash
   cd Courtify
   npm run dev
   ```

   Then open the printed URL (typically `http://localhost:5173`).

4. **Build for production**

   ```bash
   cd Courtify
   npm run build
   npm run preview   # optional local preview
   ```

---

## Docker (backend)

From the repository root (or `backend/`):

```bash
cd backend

# Build image
docker build -t courtify-backend .

# Run container
# On Windows PowerShell, %cd% will be replaced with the current directory.
docker run -p 8000:8000 \
  -v %cd%/data:/app/data \
  -v %cd%/uploads:/app/uploads \
  --env-file .env \
  courtify-backend
```

Adjust volume paths and env file as needed for your environment.

---

## Development notes

- The **backend RAG index** is built from `backend/data/indian_constitution.txt` and `Courtify/a2023-45.pdf`. If you change either source, rebuild the index with `python -m tools.build_index --force`.
- **LLM provider** is currently wired for DeepSeek via `langchain-openai`. You can adapt `backend/app/llm.py` if you want to support different providers.
- Frontend calls are centralized in `Courtify/src/lib/api.ts` – this is the main place to tweak routing or add new endpoints.
- Document summarization/uploads are on the roadmap and currently disabled for end users.

## Screenshots
  <img width="1145" height="747" alt="Screenshot 2025-12-14 153602" src="https://github.com/user-attachments/assets/e8a2d30c-9fc1-435d-a071-799cf9b1909d" />
  <img width="904" height="560" alt="Screenshot 2025-12-14 153953" src="https://github.com/user-attachments/assets/2c7587ef-58ed-4361-86e8-551fd83c9179" />


