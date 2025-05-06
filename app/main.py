from fastapi import FastAPI
from app.routes import api_router
from app.core.database import engine, Base

app = FastAPI(title="ProdWise API", version="0.1.0")

# Configuração do banco (síncrona)
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)  # Removido o async/await

# Inclui as rotas
app.include_router(api_router)

# Rota de health check
@app.get("/")
async def root():
    return {"status": "API ProdWise está online"}