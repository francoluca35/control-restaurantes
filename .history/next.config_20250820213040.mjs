/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  experimental: {
    // Configuración experimental mínima
  },
  
  // Configuración de webpack simplificada
  webpack: (config, { isServer }) => {
    // Configuración para el módulo buffer
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
    };

    return config;
  },
  
  // Asegurar que las variables de entorno se carguen correctamente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
