'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReadContract } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { VERIWORK_ADDRESS, VERIWORK_ABI } from '@/lib/contracts'
import { FilterType, Task, TaskCategory } from '@/types'
import TaskCard from '@/components/ui/TaskCard'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger)

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Design',      value: 'design' },
  { label: 'Code',        value: 'code' },
  { label: 'Translation', value: 'translation' },
]

const CATEGORY_INDEX_TO_TYPE: TaskCategory[] = ['design', 'code', 'translation', 'data']

const USDC_DECIMALS = 1_000_000

function addressToShortLabel(addr: string): { short: string; initial: string; color: string } {
  const a = addr.slice(2).toLowerCase()
  let h = 0
  for (let i = 0; i < a.length; i++) h = ((h << 5) - h + a.charCodeAt(i)) | 0
  const hue = Math.abs(h % 360)
  return {
    short: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
    initial: addr[2]?.toUpperCase() ?? '?',
    color: `hsl(${hue}, 55%, 42%)`,
  }
}

function formatDeadline(deadlineSeconds: bigint): string {
  const now = Math.floor(Date.now() / 1000)
  const sec = Number(deadlineSeconds) - now
  if (sec <= 0) return 'Expired'
  const hours = Math.floor(sec / 3600)
  if (hours < 24) return `${hours}hr`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function formatPostedAt(postedAtSeconds: bigint): string {
  const sec = Math.floor(Date.now() / 1000) - Number(postedAtSeconds)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function mapContractTaskToTask(raw: any): Task {
  const id = raw.id ?? raw[0]
  const org = raw.org ?? raw[1]
  const title = raw.title ?? raw[3]
  const description = raw.description ?? raw[4]
  const category = Number(raw.category ?? raw[5])
  const reward = raw.reward ?? raw[6]
  const deadline = raw.deadline ?? raw[7]
  const postedAt = raw.postedAt ?? raw[8]
  const { short, initial, color } = addressToShortLabel(org)
  const categoryType = CATEGORY_INDEX_TO_TYPE[category] ?? 'data'
  return {
    id: String(id),
    title,
    category: categoryType,
    org: short,
    orgInitial: initial,
    orgColor: color,
    description,
    reward: Number(reward) / USDC_DECIMALS,
    deadline: formatDeadline(deadline),
    submissions: 0,
    postedAt: formatPostedAt(postedAt),
  }
}

export default function TaskFeedSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const gridRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { openWalletModal } = useApp()

  const { data: openTasksRaw, isLoading } = useReadContract({
    address: VERIWORK_ADDRESS as `0x${string}`,
    abi: VERIWORK_ABI,
    functionName: 'getOpenTasks',
  })

  const tasks: Task[] = useMemo(() => {
    if (!openTasksRaw) return []
    const arr = Array.isArray(openTasksRaw) ? openTasksRaw : []
    return arr.map(mapContractTaskToTask)
  }, [openTasksRaw])

  const filtered = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.category === activeFilter)

  const handleClaimClick = (taskId: string) => {
    if (!isConnected || !address) {
      openWalletModal()
      return
    }
    router.push(`/profile/${address}?tab=available`)
  }

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('[data-task-card]')
    gsap.fromTo(cards,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
      }
    )
  }, [filtered.length])

  return (
    <section id="tasks" className="max-w-[1300px] mx-auto px-8 py-24">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-veri-gray mb-3">
            <span className="w-5 h-0.5 bg-lime rounded" />
            Active Pool
          </div>
          <h2 className="font-display font-extrabold tracking-tight leading-tight" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            Open <span className="text-lime-dark">Tasks</span>
          </h2>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all cursor-none',
                  activeFilter === f.value
                    ? 'bg-veri-black text-white border-veri-black'
                    : 'bg-transparent text-veri-gray border-veri-border hover:border-veri-black hover:text-veri-black'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-veri-gray">No bank account required. Claim, deliver, get paid.</p>
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-veri-gray">
            Loading tasks…
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-veri-gray">
            No open tasks yet
          </div>
        ) : (
          filtered.map(task => (
            <div key={task.id} data-task-card>
              <TaskCard task={task} onClaimClick={() => handleClaimClick(task.id)} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
