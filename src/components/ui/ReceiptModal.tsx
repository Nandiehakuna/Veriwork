'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/store'

export default function ReceiptModal() {
  const { receipt, receiptModalOpen, closeReceiptModal, wallet } = useApp()
  const [displayHash, setDisplayHash] = useState('')
  const [stamped, setStamped] = useState(false)
  const etchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!receiptModalOpen || !receipt) return
    setDisplayHash('')
    setStamped(false)

    let i = 0
    const hash = receipt.txHash

    function etch() {
      if (i < hash.length) {
        setDisplayHash(hash.slice(0, i + 1))
        i++
        etchRef.current = setTimeout(etch, 16)
      } else {
        setTimeout(() => setStamped(true), 300)
      }
    }
    setTimeout(etch, 300)

    return () => { if (etchRef.current) clearTimeout(etchRef.current) }
  }, [receiptModalOpen, receipt])

  if (!receiptModalOpen || !receipt) return null

  const rows = [
    { label: 'Task',      value: receipt.taskName,               style: '' },
    { label: 'Worker',    value: receipt.worker,                  style: 'font-mono text-xs break-all' },
    { label: 'Amount',    value: `${receipt.reward} USDC`,        style: 'font-display font-extrabold text-xl' },
    { label: 'TX Hash',   value: displayHash,                     style: 'font-mono text-xs break-all' },
    { label: 'Block',     value: receipt.block.toLocaleString(),  style: '' },
    { label: 'Time',      value: receipt.timestamp,               style: 'text-xs' },
    { label: 'Status',    value: 'Confirmed ✓',                   style: 'text-green-600 font-semibold' },
    { label: 'POC Score', value: `+${receipt.pocGain} pts → ${wallet.pocScore}`, style: 'text-lime-dark font-bold' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xl z-[500] flex items-center justify-center p-6"
      onClick={closeReceiptModal}
    >
      <div
        className="bg-white rounded-4xl max-w-md w-full p-10 shadow-2xl relative border-t-4 border-lime"
        onClick={e => e.stopPropagation()}
      >
        {/* Stamp */}
        <div
          className={`absolute top-10 right-10 w-16 h-16 rounded-full border-[3px] border-green-500/50 flex items-center justify-center text-green-600/70 text-[10px] font-bold text-center leading-tight rotate-[-15deg] transition-opacity duration-500 ${stamped ? 'opacity-100' : 'opacity-0'}`}
        >
          BLOCK<br />CONFIRMED
        </div>

        <h2 className="font-display font-extrabold text-2xl tracking-tight mb-1">Payment Receipt</h2>
        <p className="text-veri-gray text-[11px] uppercase tracking-widest mb-8">
          Veriwork Smart Contract · Avalanche C-Chain
        </p>

        <div className="space-y-0">
          {rows.map(row => (
            <div key={row.label} className="flex justify-between items-start py-3 border-b border-veri-border last:border-none">
              <span className="text-veri-gray text-sm flex-shrink-0 mr-4">{row.label}</span>
              <span className={`text-right text-sm font-medium ${row.style}`}>{row.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={closeReceiptModal}
          className="mt-6 w-full bg-veri-black text-white rounded-full py-3 text-sm font-medium hover:bg-lime hover:text-veri-black transition-all cursor-none"
        >
          Close — Proof saved on-chain
        </button>
      </div>
    </div>
  )
}
