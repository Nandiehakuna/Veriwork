'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { AppProvider } from '@/lib/store'
import { useState, useEffect, ReactNode } from 'react'

function ParticleWrapper({ children }: { children: ReactNode }) {
  const [ParticleProvider, setParticleProvider] = useState<React.ComponentType<{ children: ReactNode }> | null>(null)

  useEffect(() => {
    import('@/lib/particle').then((mod) => {
      setParticleProvider(() => mod.ParticleProvider)
    })
  }, [])

  if (!ParticleProvider) return <>{children}</>
  return <ParticleProvider>{children}</ParticleProvider>
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <ParticleWrapper>
          <AppProvider>
            {children}
          </AppProvider>
        </ParticleWrapper>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
