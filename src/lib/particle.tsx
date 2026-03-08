'use client'

import { ReactNode } from 'react'
import { AuthCoreContextProvider } from '@particle-network/authkit'
import { AuthType } from '@particle-network/auth-core'
import { avalanche } from 'wagmi/chains'

export function ParticleProvider({ children }: { children: ReactNode }) {
  // Only render on client side
  if (typeof window === 'undefined') return <>{children}</>
  
  // Additional check to ensure browser APIs are available
  if (typeof indexedDB === 'undefined' || typeof localStorage === 'undefined') {
    return <>{children}</>
  }

  return (
    <AuthCoreContextProvider
      options={{
        projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
        clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
        appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
        themeType: 'light',
        wallet: {
          visible: false,
        },
       chains:[avalanche],
        authTypes: [AuthType.google, AuthType.email, AuthType.twitter],
        fiatCoin: 'USD',
        language: 'en',
      }}
    >
      {children}
    </AuthCoreContextProvider>
  )
}