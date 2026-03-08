'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { AppProvider } from '@/lib/store'
import { useState, ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <AppProvider>
          {children}
        </AppProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
