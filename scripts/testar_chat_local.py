import requests

URL = "http://127.0.0.1:8000/api/v1/chat"

while True:
    pergunta = input("\nDigite sua pergunta (ou 'sair'): ")
    if pergunta.lower() == "sair":
        break

    response = requests.post(URL, json={"pergunta": pergunta})

    try:
        print("\nResposta:")
        print(response.json()["resposta"])
    except Exception as e:
        print("❌ Erro ao interpretar resposta:")
        print("Status code:", response.status_code)
        print("Corpo da resposta:", response.text)
