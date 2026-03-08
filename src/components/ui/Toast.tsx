'use client'

import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-[400]',
        'bg-veri-black text-white',
        'px-6 py-3 rounded-full',
        'flex items-center gap-3',
        'text-sm font-medium whitespace-nowrap',
        'transition-all duration-500',
        toast
          ? 'translate-y-0 opacity-100'
          : 'translate-y-16 opacity-0 pointer-events-none'
      )}
    >
      <span className="w-2 h-2 rounded-full bg-lime flex-shrink-0 animate-pulse-dot" />
      {toast}
    </div>
  )
}
