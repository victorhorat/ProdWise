'use client';

import dynamic from 'next/dynamic';

const ProductChart = dynamic(() => import('./ProductChart'), {
  ssr: false, // Garante que só será renderizado no lado do cliente
});

export default ProductChart;
