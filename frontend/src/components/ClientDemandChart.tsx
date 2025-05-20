'use client';

import dynamic from 'next/dynamic';

const DemandChart = dynamic(() => import('./DemandChart'), {
  ssr: false, //  garante que só será renderizado no navegador
});

export default DemandChart;
