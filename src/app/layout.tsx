import type { Metadata } from 'next'
import './globals.css'

import { Providers } from '@/components/Provider'
import Navbar from '@/components/layout/Navbar'
import WalletModal from '@/components/ui/WalletModal'
import Toast from '@/components/ui/Toast'
import Cursor from '@/components/ui/Cursor'

export const metadata: Metadata = {
  title: 'VeriWork — Proof of Contribution',
  description: 'Decentralized work and reputation network. No ID required. Your work is your credential.',
  keywords: ['blockchain', 'work', 'USDC', 'Avalanche', 'reputation', 'refugee', 'gig'],
  openGraph: {
    title: 'VeriWork — Proof of Contribution',
    description: 'Claim tasks, get paid in USDC instantly, build your on-chain reputation.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <WalletModal />
          <Toast />
          <Cursor />
        </Providers>
       
      </body>
    </html>
  )
}
