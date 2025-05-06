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
  zoomPlugin
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const filteredData = chartData.filter(item => {
    const itemDate = new Date(item.data);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    return (!from || itemDate >= from) && (!to || itemDate <= to);
  });

  const data = {
    labels: filteredData.map(item => item.data.substring(0, 7)),
    datasets: [
      {
        label: 'Vendas Produto A',
        data: filteredData.map(item => item.vendas_a),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Vendas Produto B',
        data: filteredData.map(item => item.vendas_b),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Estoque A',
        data: filteredData.map(item => item.estoque_a),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y1',
      },
      {
        label: 'Estoque B',
        data: filteredData.map(item => item.estoque_b),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y1',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // desativa legenda do ChartJS
      },
      title: {
        display: true,
        text: 'Análise de Vendas e Estoque',
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
        },
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Vendas' },
        beginAtZero: true,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Estoque' },
        beginAtZero: true,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col justify-between min-h-[520px]">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Filtrar por Data</h2>

      <div className="flex gap-4 flex-wrap mb-6">
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1">De:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1">Até:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">Carregando dados...</div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>

      {/* Legenda manual fora do gráfico */}
      <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-blue-500 rounded-sm inline-block" />
          Vendas Produto A
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-green-500 rounded-sm inline-block" />
          Vendas Produto B
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 border-t-2 border-dashed border-red-500 inline-block" />
          Estoque A
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 border-t-2 border-dashed border-purple-500 inline-block" />
          Estoque B
        </div>
      </div>
    </div>
  );
}
