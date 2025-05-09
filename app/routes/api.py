from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.dados import DadosConsolidados
from app.core.database import get_db
from pydantic import BaseModel
from app.services.ml_service import MLService
from app.services.api.chat_service import montar_contexto, chamar_claude
from app.services.api.intent_classifier import verificar_pergunta

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

@router.get("/ml/normalize-data")
async def normalize_data(update_scalers: bool = False, db: Session = Depends(get_db)):
    ml_service = MLService(db)
    normalized_data = ml_service.normalize_data(update_scalers=update_scalers)
    
    # Extrair informações básicas para retorno (sem os dados completos para evitar resposta muito grande)
    return {
        "status": "success",
        "message": "Dados normalizados com sucesso",
        "rows_processed": len(normalized_data['original']),
        "scalers_updated": update_scalers
    }

@router.get("/ml/product-data/{product_id}")
async def get_product_data(product_id: str, db: Session = Depends(get_db)):
    ml_service = MLService(db)
    try:
        data = ml_service.get_normalized_product_data(product_id)
        return {
            "status": "success",
            "product_id": product_id,
            "data_sample": data.to_dict(orient="records")
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    
@router.get("/ml/train-model/{product_id}")
async def train_model(product_id: str, k: int = 8, db: Session = Depends(get_db)):
    """Endpoint para treinar modelo KNN para um produto específico"""
    ml_service = MLService(db)
    try:
        result = ml_service.train_knn_model(product_id, k)
        return {
            "status": "success",
            "message": f"Modelo KNN para vendas do produto {product_id} treinado com sucesso",
            "model_info": result
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}

@router.get("/ml/forecast-2025/{product_id}")
async def forecast_2025(product_id: str, db: Session = Depends(get_db)):
    """Endpoint para prever vendas de 2025 para um produto específico"""
    ml_service = MLService(db)
    try:
        forecast_df = ml_service.predict_sales_for_2025(product_id)
        
        # Formatar datas para JSON
        forecast_dict = forecast_df.copy()
        forecast_dict['data'] = forecast_dict['data'].dt.strftime('%Y-%m-%d')
        
        return {
            "status": "success",
            "product_id": product_id,
            "forecast_data": forecast_dict.to_dict(orient="records")
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}

class ChatRequest(BaseModel):
    pergunta: str

@router.post("/chat")
def responder_chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        if not verificar_pergunta(request.pergunta):
            return {"resposta": "Desculpa, não consigo responder isso."}
    except Exception as e:
        return {"resposta": f"Erro ao classificar pergunta: {str(e)}"}

    contexto = montar_contexto(db)
    resposta = chamar_claude(request.pergunta, contexto)
    return {"resposta": resposta}