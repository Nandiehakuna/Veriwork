// src/components/Providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { ParticleProvider } from '@/lib/particle'
import { AppProvider } from '@/lib/store'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // We initialize the QueryClient inside the client component to ensure
  // it is only created once per browser session.
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ParticleProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ParticleProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}