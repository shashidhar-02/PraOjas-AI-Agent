from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PraOjas AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "praojas"
    DATABASE_URI: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Models
    MODEL_WEIGHTS_PATH: str = "/models/transformer_weights.pth"
    
    # Gemini
    GEMINI_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"

    @property
    def sync_database_uri(self) -> str:
        if self.DATABASE_URI:
            return self.DATABASE_URI
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
