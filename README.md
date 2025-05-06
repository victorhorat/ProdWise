# ProdWise

![ProdWise Logo](https://via.placeholder.com/150x50?text=ProdWise) *(adicione seu logo depois)*

**Plataforma de análise preditiva com IA para tomada de decisões baseada em dados”**  
Integra análise de dados, modelos de Machine Learning e assistente conversacional para insights empresariais.

---

## 🚀 **Principais Funcionalidades**
- **Upload e Visualização de Dados**: Suporte a CSV, Excel e conexões SQL
- **Modelos Preditivos**: Treinamento e inferência em tempo real
- **Assistente de IA**: Explicações naturais sobre previsões
- **Dashboard Interativo**: Gráficos dinâmicos e filtros avançados

---

## 🛠 **Arquitetura Técnica Simplificada**
```mermaid
graph TD
    A[Frontend React] -->|HTTP| B[Backend FastAPI]
    B --> C[Serviço de ML]
    B --> D[Agente de IA]
    C --> E[(Modelos.joblib)]  
    C --> F[(SQLite Database)]  
    D --> G[LLM: GPT-3.5/Llama2]
```
## 🛠 **Arquitetura Técnica Explicada**
```mermaid
graph TD
    A[Frontend React] -->|HTTP Requests| B[Backend FastAPI]
    B --> C[Serviço de ML]
    B --> D[Agente de IA]
    C --> E[(Modelos.joblib)]
    C --> F[(SQLite Database)]
    D --> G[LLM\nGPT-3.5/Llama2]
    F -->|Fornece dados| C
    F -->|Consulta dados| D
```
## 🏗️**Estruturação de pastas**
```
ProdWise/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── config.py       # Configurações globais
│   │   └── database.py     # Conexão com DB (SQLAlchemy)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py         # Modelos base
│   │   └── dados.py        # Modelos de dados
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── api.py          # Endpoints FastAPI
│   │   └── views.py        # Templates (se houver front)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py # Lógica de dados
│   │   └── ml_service.py   # Serviços de ML
│   └── main.py             # App FastAPI principal
│
├── data/
│   ├── database.db        
│   └── base.csv
│
├── scripts/
│   ├── import_csv.py       # Scripts de ETL
│   └── preprocess.py       # Pré-processamento
│
├── tests/                  # Testes automatizados
│   ├── unit/
│   └── integration/
│
├── infrastructure/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── requirements/
│   ├── base.txt            # Dependências principais
│   ├── dev.txt             # Dev-only (pytest, etc)
│   └── prod.txt            # Produção
│
├── .env.example            # Template de variáveis
├── .gitignore
├── LICENSE
└── README.md
```