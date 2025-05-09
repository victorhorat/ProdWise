from app.services.api.intent_classifier import verificar_pergunta, VEC_PATH, MODEL_PATH
from pathlib import Path

print("🧠 Verificando arquivos do classificador...\n")
print(f"🔍 Caminho do vectorizer: {VEC_PATH}")
print(f"🔍 Caminho do modelo:     {MODEL_PATH}")

print(f"\n✅ Vectorizer existe? {VEC_PATH.exists()}")
print(f"✅ Modelo existe?     {MODEL_PATH.exists()}")

print("\n💬 Teste rápido de perguntas:")
while True:
    pergunta = input("Digite uma pergunta (ou 'sair'): ")
    if pergunta.lower() == "sair":
        break

    try:
        resultado = verificar_pergunta(pergunta)
        print("➡️ Classificação:", "RELEVANTE ✅" if resultado else "IRRELEVANTE ❌")
    except Exception as e:
        print("⚠️ Erro ao verificar:", str(e))