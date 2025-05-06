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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProductData {
  data: string;
  vendas_a: number;
  vendas_b: number;
  estoque_a: number;
  estoque_b: number;
}

export default function DemandChart() {
  const [chartData, setChartData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/dados');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Carregando gráfico...</div>;

  // Dados formatados para o ChartJS
  const data = {
    labels: chartData.map(item => item.data.substring(0, 7)), // Formato YYYY-MM
    datasets: [
      {
        label: 'Vendas Produto A',
        data: chartData.map(item => item.vendas_a),
        borderColor: '#3B82F6', // Azul
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Vendas Produto B',
        data: chartData.map(item => item.vendas_b),
        borderColor: '#10B981', // Verde
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Estoque A',
        data: chartData.map(item => item.estoque_a),
        borderColor: '#EF4444', // Vermelho
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y1'
      },
      {
        label: 'Estoque B',
        data: chartData.map(item => item.estoque_b),
        borderColor: '#8B5CF6', // Roxo
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Análise de Vendas e Estoque',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Vendas'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Estoque'
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="h-[400px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}