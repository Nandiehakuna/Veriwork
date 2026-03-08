'use client'

import { Task } from '@/types'
import { CATEGORY_STYLES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const { openTaskModal } = useApp()
  const catStyle = CATEGORY_STYLES[task.category]

  return (
    <div
      className="group border-[1.5px] border-veri-border rounded-3xl p-7 bg-white hover:border-lime hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(126,224,0,0.12)] transition-all duration-300 cursor-none relative overflow-hidden"
      data-cursor
    >
      {/* Hover bg tint */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lime/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Category tag */}
        <span className={cn('inline-block text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-5', catStyle.bg, catStyle.text)}>
          {catStyle.label}
        </span>

        {/* Org row */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: task.orgColor }}
          >
            {task.orgInitial}
          </div>
          <span className="text-veri-gray text-xs font-medium">{task.org} · {task.postedAt}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg tracking-tight leading-tight mb-3">{task.title}</h3>

        {/* Description */}
        <p className="text-veri-gray text-sm leading-relaxed mb-6">{task.description}</p>

        {/* Footer */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="font-display font-extrabold text-2xl tracking-tight">${task.reward}</div>
            <div className="text-[11px] text-veri-gray font-medium tracking-wide mt-0.5">USDC · {task.deadline} deadline</div>
          </div>
          <div className="text-right text-xs text-veri-gray">{task.submissions} submission{task.submissions !== 1 ? 's' : ''}</div>
        </div>

        {/* Claim button */}
        <button
          onClick={() => openTaskModal(task)}
          className="w-full rounded-full py-3 text-sm font-medium bg-veri-black text-white hover:bg-lime hover:text-veri-black transition-all cursor-none"
        >
          Claim Task →
        </button>
      </div>
    </div>
  )
}
