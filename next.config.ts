import type { NextConfig } from 'next'
import webpack from 'webpack'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack, isServer }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '')
        }
      )
    )
    
    // Add polyfills for browser APIs that Particle Network needs
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        // Add browser API polyfills
        'indexeddb': false,
        'localStorage': false,
        'sessionStorage': false,
      }
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
      }
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'porto': false,
      '@base-org/account': false,
      '@metamask/sdk': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
    }
    return config
  },
}

export default nextConfig
