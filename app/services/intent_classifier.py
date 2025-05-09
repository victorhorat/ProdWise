from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from pathlib import Path
import joblib
import os
import unicodedata
import re



PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
VEC_PATH = MODELS_DIR / "vectorizer.joblib"
MODEL_PATH = MODELS_DIR / "intent_model.joblib"


def normalizar_texto(texto):
    texto = texto.lower()  # tudo minúsculo
    texto = unicodedata.normalize('NFKD', texto)
    texto = texto.encode('ascii', 'ignore').decode('utf-8')  # remove acentos
    texto = re.sub(r'[^\w\s]', '', texto)  # remove pontuação
    return texto

def treinar_classificador():
    perguntas_relevantes = [
        "como funciona o modelo knn?",
        "qual foi a última previsão feita?",
        "o que aparece no dashboard?",
        "quais dados são usados para prever?",
        "qual a acurácia do modelo?",
        "como interpretar os resultados da previsão?",
        "como o modelo decide os vizinhos mais próximos?",
        "os dados são salvos onde?",
        "como visualizar os resultados no app?",
        "como acessar as previsões anteriores?"
    ]

    perguntas_irrelevantes = [
        "qual o melhor filme da netflix?",
        "vai chover amanhã?",
        "quantos anos você tem?",
        "me conta uma piada?",
        "você acredita em aliens?",
        "quem é o presidente do brasil?",
        "qual o sentido da vida?",
        "você gosta de música?",
        "quem ganhou o jogo ontem?",
        "me fala uma curiosidade"
    ]

    perguntas = [normalizar_texto(p) for p in (perguntas_relevantes + perguntas_irrelevantes)]
    classes = ["relevante"] * len(perguntas_relevantes) + ["irrelevante"] * len(perguntas_irrelevantes)

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(perguntas)

    modelo = LogisticRegression()
    modelo.fit(X, classes)

    joblib.dump(vectorizer, VEC_PATH)
    joblib.dump(modelo, MODEL_PATH)

def verificar_pergunta(texto: str) -> bool:
    vectorizer = joblib.load(VEC_PATH)
    modelo = joblib.load(MODEL_PATH)
    texto_limpo = normalizar_texto(texto)
    X = vectorizer.transform([texto_limpo])
    pred = modelo.predict(X)[0]
    return pred == "relevante"

if __name__ == "__main__":
    treinar_classificador()
