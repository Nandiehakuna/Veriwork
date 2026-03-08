'use client'

import { useApp } from '@/lib/store'
import { useConnect, useAccount } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect } from 'react'

const WALLETS = [
  { name: 'Core Wallet', icon: '🔷', 
    desc: 'Native Avalanche wallet', type: 'injected' },
  { name: 'MetaMask', icon: '🦊', 
    desc: 'Popular browser wallet', type: 'injected' },
]

export default function ClientWalletModal() {
  const { wallet, walletModalOpen, closeWalletModal } = useApp()
  const { connect } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected) {
      closeWalletModal()
    }
  }, [isConnected, closeWalletModal])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWalletModal()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [closeWalletModal])

  if (!walletModalOpen) return null

  const handleConnect = () => {
    connect({ connector: injected() })
    closeWalletModal()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm 
      flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full 
        mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">
            Connect Wallet
          </h2>
          <button
            onClick={closeWalletModal}
            className="w-8 h-8 rounded-full bg-gray-100 
              hover:bg-gray-200 flex items-center justify-center 
              transition-colors cursor-none"
          >
            <span className="text-gray-600 text-sm">×</span>
          </button>
        </div>
        <div className="space-y-3">
          {WALLETS.map((w) => (
            <button
              key={w.type + w.name}
              onClick={handleConnect}
              className="w-full flex items-center gap-4 p-4 
                rounded-2xl border border-gray-200 
                hover:border-gray-300 hover:bg-gray-50 
                transition-all cursor-none"
            >
              <span className="text-2xl">{w.icon}</span>
              <div className="text-left">
                <div className="font-body font-semibold text-sm">
                  {w.name}
                </div>
                <div className="font-light-poppins text-xs 
                  text-gray-500">
                  {w.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
