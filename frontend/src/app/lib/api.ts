// src/lib/api.ts
import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // URL do seu FastAPI
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos de dados (você pode expandir conforme necessidade)
export interface ProductData {
  data: string;
  estoque: number;
  vendas: number;
}

export interface FullData {
  id: number;
  data: string;
  gasolina: number;
  // ... outros campos conforme seu backend
}

export interface ForecastData {
  data: string;
  vendas_a?: number;
  vendas_b?: number;
}

// Funções de API
export const apiService = {
  // Busca dados completos
  getFullData: async (): Promise<FullData[]> => {
    const response = await api.get('/dados');
    return response.data;
  },

  // Busca dados de um produto específico
  getProductData: async (productId: string): Promise<ProductData[]> => {
    const response = await api.get(`/dados/produto/${productId}`);
    return response.data;
  },

    // Nova função para buscar previsões de 2025
  getProductForecast: async (productId: string): Promise<ForecastData[]> => {
    const response = await api.get(`/ml/forecast-2025/${productId}`);
    return response.data.forecast_data;
  },
  // Adicione outros endpoints conforme necessário
};