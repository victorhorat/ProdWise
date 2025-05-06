from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./data/database.db"
    
    class Config:
        env_file = ".env"

settings = Settings()