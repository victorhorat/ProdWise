from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Importe o middleware
from app.routes import api_router
from app.core.database import engine, Base

app = FastAPI(title="ProdWise API", version="0.1.0")

# 🔒 Configuração CORS (Adicione aqui, antes das rotas!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Todos os headers
)

# Configuração do banco (síncrona)
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# Inclui as rotas (depois do CORS)
app.include_router(api_router)

# Rota de health check
@app.get("/")
async def root():
    return {"status": "API ProdWise está online"}