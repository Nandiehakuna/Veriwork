import { createConfig, http } from 'wagmi'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'


export const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    // Detects Core Wallet, MetaMask, Rabby — any injected wallet
    injected()
  ],
  transports: {
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
  // This is what gives you wallet persistence across page refreshes
  ssr: true,
})

