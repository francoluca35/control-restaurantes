/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica sin PWA por ahora
  // Disable tracing to avoid permission issues
  experimental: {
    // Removed trace to fix permission issues
  },
  // Add proper error handling for missing environment variables
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "firebase/app": "commonjs firebase/app",
        "firebase/auth": "commonjs firebase/auth",
        "firebase/firestore": "commonjs firebase/firestore",
        "firebase/database": "commonjs firebase/database",
      });
    }
    
    // Configuración para el módulo buffer
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
    };
    
    // Agregar el plugin para Buffer
    config.plugins.push(
      new (require('webpack')).ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
};

export default nextConfig;
