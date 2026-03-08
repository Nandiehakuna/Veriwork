import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: [
    '@aws-sdk/credential-provider-cognito-identity',
    '@aws-sdk/credential-providers',
    '@aws-sdk/util-user-agent-node',
  ],
}

export default nextConfig
