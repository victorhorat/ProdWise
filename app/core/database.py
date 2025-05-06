import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

# Caminho relativo mais confiável (considerando que database.py está em app/core/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Raiz do projeto (onde está a pasta data/)
DATABASE_URL = f"sqlite:///{BASE_DIR}/data/database.db"  # Ajuste o caminho conforme sua estrutura real

# Verifica se o diretório existe
os.makedirs(BASE_DIR / "data", exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    echo=True  # Ativa logs SQL (útil para desenvolvimento)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    """Gerador de sessões para injeção de dependência"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()