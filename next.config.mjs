/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore pino/thread-stream in client bundles (fixes WalletConnect build issues)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino': false,
        'thread-stream': false,
      }
    }
    
    // Ignore node-specific modules
    config.externals.push({
      'pino-pretty': 'pino-pretty',
      'lokijs': 'lokijs',
      'encoding': 'encoding',
    })

    return config
  },
}

export default nextConfig
