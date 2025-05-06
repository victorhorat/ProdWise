from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.dados import DadosConsolidados
from app.core.database import get_db

router = APIRouter(prefix="/api/v1")

@router.get("/dados/")
async def listar_dados(db: Session = Depends(get_db)):
    dados = db.query(DadosConsolidados).all()
    return dados 

@router.get("/dados/produto/{produto_id}")
async def dados_produto(produto_id: str, db: Session = Depends(get_db)):
    produto_id = produto_id.lower()
    if produto_id not in ["a", "b"]:
        return {"error": "Produto inválido. Use 'a' ou 'b'."}
    
    dados = db.query(
        DadosConsolidados.data,
        DadosConsolidados.estoque_a if produto_id == "a" else DadosConsolidados.estoque_b,
        DadosConsolidados.vendas_a if produto_id == "a" else DadosConsolidados.vendas_b
    ).all()
    
    return [{
        "data": data.isoformat() if data else None,  # Converte date para string ISO
        "estoque": estoque,
        "vendas": vendas
    } for data, estoque, vendas in dados]

@router.get("/produtos")
async def listar_produtos():
    return {"produtos": ["A", "B"]}