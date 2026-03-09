'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { AppProvider } from '@/lib/store'
import { useState, ReactNode, useEffect } from 'react'
import { useReconnect } from 'wagmi'

function ReconnectOnMount() {
  const { reconnect } = useReconnect()
  useEffect(() => {
    reconnect()
  }, [reconnect])
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ReconnectOnMount />
        <AppProvider>
          {children}
        </AppProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
