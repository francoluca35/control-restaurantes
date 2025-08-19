/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica sin PWA por ahora
  experimental: {
    // Disable server components for now to avoid deployment issues
    serverComponentsExternalPackages: [],
  },
  // Ensure proper environment variable handling
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Add proper error handling for missing environment variables
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase/app': 'commonjs firebase/app',
        'firebase/auth': 'commonjs firebase/auth',
        'firebase/firestore': 'commonjs firebase/firestore',
        'firebase/database': 'commonjs firebase/database',
      });
    }
    return config;
  },
};

export default nextConfig;
