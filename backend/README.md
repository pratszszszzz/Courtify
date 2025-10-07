# Backend - Indian AI Legal Assistant

FastAPI backend providing RAG-based constitutional Q&A and document summarization.

## Endpoints

- POST `/chat` – Constitutional Q&A (RAG)
- POST `/upload` – PDF upload + summarization
- GET `/constitution/{article}` – Direct article lookup
- GET `/health` – Health check

## Dev Setup

1. Python 3.11+
2. `pip install -r backend/requirements.txt`
3. `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

Configure env vars in a `.env` (same directory):

```
OPENAI_API_KEY= # optional
MODEL_TYPE=openai # or local
CONSTITUTION_PATH=./data/indian_constitution.txt
UPLOAD_FOLDER=./uploads
PORT=8000
```

## Docker

```
docker build -t courtify-backend backend
docker run -p 8000:8000 -v %cd%/backend/data:/app/data -v %cd%/backend/uploads:/app/uploads courtify-backend
```


