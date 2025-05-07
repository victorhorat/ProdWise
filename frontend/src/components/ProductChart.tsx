'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  zoomPlugin
);

interface ProductData {
  data: string;
  vendas: number;
  estoque: number;
}

interface ForecastData {
  data: string;
  vendas_a?: number;
  vendas_b?: number;
}

export default function ProductChart() {
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('A');
  const [chartData, setChartData] = useState<ProductData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/produtos');
        const data = await response.json();
        setProducts(data.produtos);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProduct) return;

      setLoading(true);
      try {
        // Buscar dados históricos
        const response = await fetch(`/api/v1/dados/produto/${selectedProduct.toLowerCase()}`);
        const data = await response.json();
        setChartData(data);
        
        // Buscar previsões de 2025
        const forecastResponse = await fetch(`/api/v1/ml/forecast-2025/${selectedProduct.toLowerCase()}`);
        const forecastData = await forecastResponse.json();
        setForecastData(forecastData.forecast_data || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProduct]);

  const filteredData = chartData.filter((item) => {
    const itemDate = new Date(item.data);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    return (!from || itemDate >= from) && (!to || itemDate <= to);
  });

  // Determinar qual campo de vendas usar conforme o produto selecionado
  const vendaKey = `vendas_${selectedProduct.toLowerCase()}`;

  const data = {
    labels: [
      ...filteredData.map((item) => item.data.substring(0, 7)),
      ...(showForecast ? forecastData.map((item) => item.data.substring(0, 7)) : []),
    ],
    datasets: [
      {
        label: `Vendas Produto ${selectedProduct}`,
        data: [
          ...filteredData.map((item) => item.vendas),
          ...(showForecast 
            ? forecastData.map((item) => item[vendaKey as keyof typeof item] as number || 0) 
            : []),
        ],
        borderColor: (ctx) => {
          // Alterar cor da linha baseado no índice do ponto
          const index = ctx.dataIndex;
          return index >= filteredData.length ? '#F59E0B' : '#3B82F6'; // Amarelo para previsão, azul para histórico
        },
        backgroundColor: (ctx) => {
          // Alterar cor do preenchimento baseado no índice do ponto
          const index = ctx.dataIndex;
          return index >= filteredData.length ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
        },
        borderWidth: 2,
        tension: 0.4,
        segment: {
          borderDash: (ctx) => {
            // Deixar linha tracejada apenas para os dados de previsão
            const index = ctx.p1DataIndex;
            return index >= filteredData.length ? [6, 6] : undefined;
          },
          borderColor: (ctx) => {
            // Esta é a cor da linha entre pontos
            if (ctx.p0DataIndex < filteredData.length && ctx.p1DataIndex >= filteredData.length) {
              // Este é o segmento de transição (histórico -> previsão)
              return '#F59E0B'; // Usar amarelo para o segmento de transição
            }
            return ctx.p1DataIndex >= filteredData.length ? '#F59E0B' : '#3B82F6';
          }
        },
        pointStyle: (ctx) => {
          const index = ctx.dataIndex;
          return index >= filteredData.length ? 'triangle' : 'circle';
        },
        pointRadius: (ctx) => {
          const index = ctx.dataIndex;
          return index >= filteredData.length ? 4 : 3;
        },
      },
      {
        label: `Estoque Produto ${selectedProduct}`,
        data: filteredData.map((item) => item.estoque),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // removida do ChartJS
      },
      title: {
        display: true,
        text: `Análise do Produto ${selectedProduct}`,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            const isforecast = index >= filteredData.length;
            const title = context[0].label;
            return isforecast ? `Previsão 2025: ${title}` : title;
          }
        }
      },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col justify-between min-h-[520px]">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">
            Selecione o Produto:
          </label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
          >
            {products.map((product) => (
              <option key={product} value={product}>
                Produto {product}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 flex-1">
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">De:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm font-medium text-gray-700 mb-1">Até:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showForecast}
            onChange={(e) => setShowForecast(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          Mostrar previsão para 2025
        </label>
      </div>

      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">Carregando dados...</div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>

      {/* Legenda manual externa */}
      <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-blue-500 rounded-sm inline-block" />
          Vendas Produto {selectedProduct}
        </div>
        {showForecast && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-amber-500 border-t-2 border-dashed border-amber-500 inline-block" />
            Previsão 2025
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 border-t-2 border-dashed border-red-500 inline-block" />
          Estoque Produto {selectedProduct}
        </div>
      </div>
    </div>
  );
}