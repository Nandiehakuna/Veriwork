import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This silences the "Turbopack vs Webpack" warning in Next.js 16
  
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // 1. Fix the "node:" prefix errors (UnhandledSchemeError)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );

      // 2. Map uninstalled Wagmi optional dependencies to 'false'
      // This stops the "Module not found" errors for Safe, MetaMask SDK, Porto, etc.
      config.resolve.alias = {
        ...config.resolve.alias,
        "porto": false,
        "porto/internal": false,
        "@base-org/account": false,
        "@metamask/sdk": false,
        "@safe-global/safe-apps-sdk": false,
        "@safe-global/safe-apps-provider": false,
        // Existing AWS SDK fix
        "@aws-sdk/util-user-agent-node": false,
      };

      // 3. Provide browser fallbacks for Node.js internals
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: false,
      };
    }
    return config;
  },
}

export default nextConfig