import type { NextConfig } from 'next'
import webpack from 'webpack'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '')
        }
      )
    )
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
