from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models
from .database import engine, SessionLocal
from datetime import datetime

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/dados/")
def listar_dados(db: Session = Depends(get_db)):
    dados = db.query(models.DadosConsolidados).all()
    
    # Converte strings de volta para datetime
    for item in dados:
        item.data = datetime.strptime(item.data, '%Y-%m-%d').date()
    
    return dados
# Rota para dados de um produto específico
@app.get("/dados/produto/{produto_id}")
def dados_produto(produto_id: str, db: Session = Depends(get_db)):
    produto_id = produto_id.lower()
    if produto_id not in ["a", "b"]:
        return {"error": "Produto inválido. Use 'a' ou 'b'."}
    
    columns = ["estoque_" + produto_id, "vendas_" + produto_id]
    dados = db.query(
        models.DadosConsolidados.data,
        models.DadosConsolidados.estoque_a if produto_id == "a" else models.DadosConsolidados.estoque_b,
        models.DadosConsolidados.vendas_a if produto_id == "a" else models.DadosConsolidados.vendas_b
    ).all()
    
    return [{"data": d.data, "estoque": d[1], "vendas": d[2]} for d in dados]