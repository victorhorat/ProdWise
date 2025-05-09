import os
import requests
from app.services.ml_service import MLService
from sqlalchemy.orm import Session
from app.core.config import settings


api_key = settings.CLAUDE_API_KEY

def montar_contexto(db: Session) -> str:
    ml = MLService(db)
    previsoes_a = ml.get_previsoes_produto("a", limit=3)
    previsoes_b = ml.get_previsoes_produto("b", limit=3)

    contexto = "Últimas previsões de vendas:\n\n"

    contexto += "Produto A:\n"
    for p in previsoes_a:
        contexto += f"- {p['data']}: {p['previsao']} unidades\n"

    contexto += "\nProduto B:\n"
    for p in previsoes_b:
        contexto += f"- {p['data']}: {p['previsao']} unidades\n"

    contexto += "\nUse essas informações para responder apenas perguntas relacionadas ao sistema ProdWise."
    return contexto


def chamar_claude(pergunta: str, contexto: str) -> str:
    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        raise ValueError("CLAUDE_API_KEY não definida no ambiente.")

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }

    data = {
        "model": "claude-3-7-sonnet-20250219",
        "system": f"""
        Você é um assistente do sistema ProdWise. Responda apenas perguntas relacionadas às previsões, dados e funcionamento da plataforma.
        Use as informações abaixo como base para suas respostas:

        {contexto}

        Caso receba uma pergunta fora do escopo, diga: 'Desculpa, não consigo responder isso.'
        """,
        "messages": [{"role": "user", "content": pergunta}],
        "max_tokens": 500,
        "temperature": 0.3
    }

    response = requests.post("https://api.anthropic.com/v1/messages", json=data, headers=headers)

    if response.status_code != 200:
        raise ValueError(f"Erro na chamada da API Claude: {response.status_code} - {response.text}")

    try:
        resp_json = response.json()
        if "content" in resp_json and isinstance(resp_json["content"], list):
            return resp_json["content"][0]["text"]
        else:
            raise ValueError(f"Resposta inesperada do Claude: {resp_json}")
    except Exception as e:
        raise ValueError(f"Erro ao interpretar resposta do Claude: {e}")
