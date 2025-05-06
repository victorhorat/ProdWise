// src/app/(dashboard)/page.tsx
'use client';
import { useState } from 'react';
import DemandChart from '@/components/DemandChart';
import ProductChart from '@/components/ProductChart';

type DateRange = {
  start: string;
  end: string;
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2016-01-01',
    end: '2016-12-31'
  });

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Dashboard ProdWise</h1>
        
        {/* Filtro de Data - Agora responsivo */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Data Inicial
            </label>
            <input
              type="date"
              id="start-date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <input
              type="date"
              id="end-date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid ajustado para manter proporções */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico Visão Geral */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Visão Geral</h2>
          <div className="w-full h-[400px]">
            <DemandChart dateRange={dateRange} />
          </div>
        </div>

        {/* Gráfico por Produto */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Análise por Produto</h2>
          <div className="w-full h-[400px]">
            <ProductChart dateRange={dateRange} />
          </div>
        </div>
      </div>
    </div>
  );
}