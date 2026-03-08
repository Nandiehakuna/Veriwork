import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function genTxHash(): string {
  const chars = '0123456789abcdef'
  let h = '0x'
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * chars.length)]
  return h
}

export function genWalletAddress(): string {
  const hex = Math.random().toString(16).slice(2, 10).toUpperCase()
  return `0x${hex}...4F2A`
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
}

export function getBlockNumber(): number {
  return 18452991 + Math.floor(Math.random() * 200)
}