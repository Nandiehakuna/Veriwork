'use client'

import { useEffect, useState } from 'react'

export default function TickerBar() {
  const [amount, setAmount] = useState(2340.0)
  const [workers, setWorkers] = useState(1203)

  useEffect(() => {
    const amtInterval = setInterval(() => {
      setAmount(prev => prev + Math.random() * 2)
    }, 2000)
    const wrkInterval = setInterval(() => {
      setWorkers(prev => prev + Math.floor(Math.random() * 2))
    }, 5000)
    return () => { clearInterval(amtInterval); clearInterval(wrkInterval) }
  }, [])

  return (
    <div className="fixed top-16 left-0 right-0 z-[99] bg-lime px-8 py-1.5 flex items-center justify-between text-xs font-medium text-veri-black">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-veri-black animate-blink" />
        AVALANCHE C-CHAIN — LIVE
      </div>
      <div>
        <span className="font-bold">${amount.toFixed(2)}</span> paid out this hour
      </div>
      <div className="hidden md:block">
        47 tasks open · <span>{workers.toLocaleString()}</span> contributors
      </div>
    </div>
  )
}
