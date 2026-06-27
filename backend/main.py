from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.db.database import engine, Base
from backend.api.api_v1.api import api_router

# Create tables (In production, use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PraOjas AI Clinical Decision Support API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to PraOjas AI API. System is operational."}

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": True}
