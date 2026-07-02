# Backend — Python/FastAPI Microservice

> **Note:** This is a **separate microservice** from the main Node.js/Express application.
> To run the primary PraOjas AI application locally, see the [root README](../README.md).
> You do **not** need this service to run the main app.

---

## Overview

This directory contains a **Python/FastAPI** backend that serves as an alternative API gateway and Python-native inference engine. It is intended for:
- Running the raw **PraOjas PyTorch Transformer** model directly (without the Gemini LLM layer)
- Providing a Python-native REST API with SQLAlchemy/PostgreSQL integration
- Supporting deeper ML experimentation and evaluation workflows

---

## Directory Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker image for this service
│
├── api/
│   └── api_v1/
│       ├── api.py       # API router (assembles all endpoint routers)
│       └── endpoints/
│           ├── predict.py     # POST /api/v1/predict — PyTorch model inference
│           ├── auth.py        # POST /api/v1/auth — JWT authentication
│           └── evaluation.py  # GET /api/v1/evaluation — Model metrics
│
├── core/
│   ├── config.py        # Pydantic Settings (env var configuration)
│   └── security.py      # JWT token creation and verification
│
├── db/
│   ├── database.py      # SQLAlchemy engine and session factory
│   └── models.py        # SQLAlchemy ORM table models
│
├── schemas/
│   └── schemas.py       # Pydantic request/response schemas
│
├── models/
│   └── transformer_service.py  # PraOjas PyTorch Transformer wrapper
│
├── services/
│   └── evaluation_service.py   # Model evaluation metrics (AUROC, ECE)
│
├── agents/
│   ├── coordinator.py          # Python-native agent coordinator
│   ├── document_parser.py      # PDF/text parsing agent
│   └── explainability.py       # SHAP/Integrated Gradients explainability
│
└── tests/               # Python unit tests (pytest)
```

---

## API Endpoints (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check — returns welcome message |
| `GET` | `/health` | System health status |
| `POST` | `/api/v1/predict` | Run PyTorch model inference on patient data |
| `POST` | `/api/v1/auth/login` | Obtain JWT access token |
| `GET` | `/api/v1/evaluation/metrics` | Retrieve model evaluation metrics |

Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs` when running.

---

## Running Locally (Python Service Only)

### Prerequisites

- Python 3.10+
- PostgreSQL (running locally or via Docker)

### Setup

```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment

Create a `.env` file in the **project root** (not in `backend/`) with:

```env
DATABASE_URI=postgresql://postgres:postgres@localhost/praojas
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-secret-key-here
```

### Start the FastAPI Server

```bash
# From the project root
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Or using Docker Compose (also starts PostgreSQL):

```bash
docker-compose up
```

The API will be available at `http://localhost:8000`.

---

## Running with Docker Compose

The `docker-compose.yml` in the project root defines both the PostgreSQL database and this Python backend:

```bash
# Start PostgreSQL + Python backend
docker-compose up

# Start only PostgreSQL (for use with the Node.js app)
docker-compose up db -d
```

---

## Configuration (`core/config.py`)

All configuration is managed via Pydantic Settings and can be overridden with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URI` | *(auto-built)* | Full PostgreSQL connection string |
| `POSTGRES_SERVER` | `localhost` | PostgreSQL host |
| `POSTGRES_USER` | `postgres` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `praojas` | PostgreSQL database name |
| `SECRET_KEY` | *(placeholder)* | JWT signing secret — **change in production** |
| `GEMINI_API_KEY` | `""` | Gemini API key for Python-side agents |
| `MODEL_WEIGHTS_PATH` | `/models/transformer_weights.pth` | Path to PyTorch model checkpoint |
