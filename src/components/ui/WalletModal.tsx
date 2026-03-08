'use client'

import { useApp } from '@/lib/store'
import { useConnect as useWagmiConnect } from 'wagmi'
import { useConnect } from '@particle-network/authkit'
import type { SocialAuthType } from '@particle-network/auth-core'
import { useEffect } from 'react'

const WALLETS = [
  {
    name: 'Continue with Google',
    icon: '🔵',
    desc: 'Sign in with your Google account',
    type: 'google',
  },
  {
    name: 'Continue with Email',
    icon: '✉️',
    desc: 'Receive a magic link via email',
    type: 'email',
  },
  {
    name: 'Core Wallet',
    icon: '🔷',
    desc: 'Native Avalanche wallet',
    type: 'core',
  },
  {
    name: 'MetaMask',
    icon: '🦊',
    desc: 'Connect with MetaMask',
    type: 'metamask',
  },
]

export default function WalletModal() {
  const { walletModalOpen, closeWalletModal, showToast } = useApp()
  const { connect: wagmiConnect, connectors } = useWagmiConnect()
  const { connect, connected } = useConnect()

  // Check for Core Wallet availability
  const hasCoreWallet = typeof window !== 'undefined' && (
    !!(window as any).avalanche ||
    !!(window as any).ethereum?.isAvalanche ||
    connectors.some(c => 
      c.name?.toLowerCase().includes('core') ||
      c.id?.toLowerCase().includes('core') ||
      c.id?.toLowerCase().includes('coinbase')
    )
  )

  if (!walletModalOpen) return null

  const handleConnect = async (type: string) => {
    if (type === 'google' || type === 'email') {
      if (!connected) {
        await connect({ socialType: type as SocialAuthType })
      }
      closeWalletModal()
      showToast('Wallet connected successfully')
      return
    }

    if (type === 'core') {
      if (!hasCoreWallet) {
        showToast('Core Wallet not found — install at core.app')
        return
      }
      
      const coreConnector = connectors.find(c => 
        c.name?.toLowerCase().includes('core') ||
        c.id?.toLowerCase().includes('core') ||
        c.id?.toLowerCase().includes('coinbase') ||
        c.id === 'injected'
      )
      
      if (coreConnector) {
        closeWalletModal()
        showToast('Wallet connected successfully')
        wagmiConnect({ connector: coreConnector })
      } else {
        showToast('Core Wallet not found — install at core.app')
      }
      return
    }

    if (type === 'metamask') {
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask')
        ?? connectors.find(c => c.id === 'injected')
      if (metaMaskConnector) {
        closeWalletModal()
        showToast('Wallet connected successfully')
        wagmiConnect({ connector: metaMaskConnector })
      } else {
        showToast('MetaMask not found — install it at metamask.io')
      }
      return
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[600] flex items-center justify-center p-6"
      onClick={closeWalletModal}
    >
      <div
        className="bg-white rounded-4xl max-w-sm w-full p-10 shadow-2xl border-t-4 border-lime"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display font-extrabold text-2xl tracking-tight mb-1">
          Connect Wallet
        </h2>
        <p className="text-veri-gray text-sm leading-relaxed mb-8">
          Connect to claim tasks and receive instant USDC. No ID, no bank account needed.
        </p>

        <div className="space-y-3">
          {WALLETS.map(w => (
            <button
              key={w.type}
              onClick={() => handleConnect(w.type)}
              className="w-full flex items-center gap-4 border-[1.5px] border-veri-border rounded-2xl p-4 hover:border-lime hover:bg-lime/5 transition-all cursor-none text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-veri-light flex items-center justify-center text-xl flex-shrink-0">
                {w.icon}
              </div>
              <div>
                <div className="font-body font-semibold text-sm">{w.name}</div>
                <div className="font-light-poppins text-veri-gray text-xs">{w.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={closeWalletModal}
          className="mt-5 w-full border-[1.5px] border-veri-border rounded-full py-3 text-sm text-veri-gray hover:border-veri-black hover:text-veri-black transition-all cursor-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}