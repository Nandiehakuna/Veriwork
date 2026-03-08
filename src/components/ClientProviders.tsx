'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

const ParticleProvider = dynamic(
  () => import('@/lib/particle').then(mod => ({ default: mod.ParticleProvider })),
  {
    ssr: false,
    loading: () => null,
  }
)

export function ClientProviders({ children }: { children: ReactNode }) {
  // Only render on client side
  if (typeof window === 'undefined') return <>{children}</>
  
  return <ParticleProvider>{children}</ParticleProvider>
}
