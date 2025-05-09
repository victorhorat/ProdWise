from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/database.db"
    CLAUDE_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()