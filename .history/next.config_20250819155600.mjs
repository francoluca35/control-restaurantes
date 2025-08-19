/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica sin PWA por ahora
  // Disable tracing to avoid permission issues
  experimental: {
    trace: false,
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
    return config;
  },
};

export default nextConfig;
