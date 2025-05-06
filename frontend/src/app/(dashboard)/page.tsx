// src/app/(dashboard)/page.tsx
'use client';

import { useState } from 'react';
import DemandChart from '@/components/ClientDemandChart';
import ProductChart from '@/components/ClientProductChart';
import ChatWidget from '@/components/ChatWidget';


type DateRange = {
  start: string;
  end: string;
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2016-01-01',
    end: '2016-12-31',
  });

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-center text-gray-800">Dashboard ProdWise</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Visão Geral */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Visão Geral</h2>
          <DemandChart dateRange={dateRange} />
        </div>

        {/* Análise por Produto */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Análise por Produto</h2>
          <ProductChart dateRange={dateRange} />
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
