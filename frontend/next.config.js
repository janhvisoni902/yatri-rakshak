/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['fabric-network', 'fabric-ca-client']
  },
  webpack: (config, { isServer }) => {
    // Handle fabric-network and related packages
    if (isServer) {
      config.externals.push({
        'fabric-network': 'commonjs fabric-network',
        'fabric-ca-client': 'commonjs fabric-ca-client'
      });
    }

    // Handle binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader'
    });

    return config;
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
    BLOCKCHAIN_NETWORK_PATH: process.env.BLOCKCHAIN_NETWORK_PATH || '../network',
    NODE_ENV: process.env.NODE_ENV || 'development'
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  }
};

module.exports = nextConfig;