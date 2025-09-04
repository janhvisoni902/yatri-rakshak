const nextConfig = {
  // Remove asset prefix for local development
  // assetPrefix: "/exp3-static",
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],    
  },
  // Development configuration
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
}

export default nextConfig
