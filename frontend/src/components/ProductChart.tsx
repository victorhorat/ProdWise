// src/components/ProductChart.tsx
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
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface ProductData {
  data: string;
  vendas: number;
  estoque: number;
}

export default function ProductChart() {
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('A');
  const [chartData, setChartData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca lista de produtos disponíveis
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

  // Busca dados do produto selecionado
  useEffect(() => {
    const fetchProductData = async () => {
      if (!selectedProduct) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/dados/produto/${selectedProduct.toLowerCase()}`);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [selectedProduct]);

  const data = {
    labels: chartData.map(item => item.data.substring(0, 7)),
    datasets: [
      {
        label: `Vendas Produto ${selectedProduct}`,
        data: chartData.map(item => item.vendas),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: `Estoque Produto ${selectedProduct}`,
        data: chartData.map(item => item.estoque),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Análise do Produto ${selectedProduct}`,
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">
          Selecione o Produto:
        </label>
        <select
          id="product-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {products.map(product => (
            <option key={product} value={product}>
              Produto {product}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Carregando dados...
          </div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
}