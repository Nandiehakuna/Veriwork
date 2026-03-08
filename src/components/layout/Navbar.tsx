'use client'

import Link from 'next/link'
import { useApp } from '@/lib/store'

const NAV_LINKS = [
  { label: 'Tasks', href: '/#tasks' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Reputation', href: '/#reputation' },
  { label: 'For Orgs', href: '/org' },
]

export default function Navbar() {
  const { wallet, openWalletModal } = useApp()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-veri-border h-16 flex items-center justify-between px-8">
      <Link href="/" className="cursor-none">
        <div className="font-display font-extrabold text-xl tracking-tight">
          Veri<span className="text-lime-dark">Work</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-md font-bold text-veri-black hover:text-lime-dark transition-colors cursor-none"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full border-[1.5px] border-veri-border flex items-center justify-center hover:border-veri-black transition-colors cursor-none text-base">
          🔍
        </button>
        {wallet.connected ? (
          <Link 
            href={`/profile/${wallet.address}`}
            className="text-sm font-medium px-5 py-2 rounded-full bg-lime text-veri-black cursor-none"
          >
            {wallet.address?.slice(0,6)}...{wallet.address?.slice(-4)}
          </Link>
        ) : (
          <button
            onClick={openWalletModal}
            className="text-sm font-medium px-5 py-2 rounded-full bg-veri-black text-white hover:bg-lime hover:text-veri-black transition-all cursor-none"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  )
}