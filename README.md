# ProdWise

![ProdWise Logo](https://via.placeholder.com/150x50?text=ProdWise) *(adicione seu logo depois)*

**Sistema de Visualização e Previsão de Dados com IA**  
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
    C --> F[(Banco de Dados)]  
    D --> G[LLM: GPT-3.5/Llama2]
