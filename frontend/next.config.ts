// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita o strict mode do React (recomendado)
  reactStrictMode: true,
  
  // Configuração de rewrites para proxy da API
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Todas chamadas para /api no frontend
        destination: 'http://localhost:8000/api/:path*', // Serão redirecionadas para o FastAPI
      },
      {
        source: '/docs', // Se usar Swagger UI
        destination: 'http://localhost:8000/docs',
      },
    ];
  },

  // Configuração de CORS simplificada
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Altere para seu domínio em produção
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;