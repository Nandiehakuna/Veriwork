'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { cn } from '@/lib/utils'
import { VERIWORK_ADDRESS, VERIWORK_ABI } from '@/lib/contracts'
import { useApp } from '@/lib/store'
import TaskModal from '@/components/ui/TaskModal'

const CATEGORY_MAP: Record<number, string> = {
  0: 'Design',
  1: 'Code',
  2: 'Translation',
  3: 'Data',
}

const CATEGORY_COLORS: Record<string, string> = {
  Design:      'bg-lime/10 text-lime-dark',
  Code:        'bg-blue-50 text-blue-600',
  Translation: 'bg-orange-50 text-orange-600',
  Data:        'bg-purple-50 text-purple-600',
}

const CATEGORY_STYLES: Record<string, string> = {
  Design:      'bg-lime-light',
  Code:        'bg-blue-50',
  Translation: 'bg-orange-50',
  Data:        'bg-purple-50',
}

interface WorkerProfile {
  pocScore: bigint
  tasksCompleted: bigint
  totalEarned: bigint
  networkSize: bigint
  endorsements: bigint
  completedTaskIds: bigint[]
}

interface TaskData {
  id: bigint
  title: string
  category: bigint
  description: string
  reward: bigint
  deadline: bigint
  org: string
  orgInitial: string
  orgColor: string
  status: bigint
  worker: Address
  txHash: string
  createdAt: bigint
}

export default function ProfilePage() {
  const params = useParams()
  const { address: connectedAddress } = useAccount()
  const address = params.address as string
  const isOwnProfile = connectedAddress?.toLowerCase() === address?.toLowerCase()
  const { openTaskModal, activeTask, closeTaskModal,showToast } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [animated, setAnimated] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)

  // Worker profile data
const { data: profileRaw, isLoading: profileLoading } = useReadContract({
  address: VERIWORK_ADDRESS,
  abi: VERIWORK_ABI,
  functionName: 'getWorkerProfile',
  args: [address as Address],
  query: { enabled: !!address },
} as any)

const profile = profileRaw as WorkerProfile | undefined

  // Completed task IDs
  const { data: completedTaskIds, isLoading: completedLoading } = useReadContract({
    address: VERIWORK_ADDRESS,
    abi: VERIWORK_ABI,
    functionName: 'getCompletedTaskIds',
    args: [address as Address],
    query: { enabled: !!address },
  } as any)

  // Available tasks
  const { data: availableTasks, isLoading: availableLoading, refetch: refetchAvailableTasks } = useReadContract({
    address: VERIWORK_ADDRESS,
    abi: VERIWORK_ABI,
    functionName: 'getOpenTasks',
    query: { enabled: true },
  } as any)

  // Active tasks for worker
  const { data: activeTasks, isLoading: activeLoading, refetch: refetchActiveTasks } = useReadContract({
    address: VERIWORK_ADDRESS,
    abi: VERIWORK_ABI,
    functionName: 'getWorkerActiveTasks',
    args: [address as Address],
    query: { enabled: !!address },
  } as any)

  // Claim task contract hook
  const { writeContract: claimTaskContract, data: claimHash, isPending: claimPending } = useWriteContract()
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  const stats = profile ? {
    pocScore: Number(profile.pocScore),
    tasksCompleted: Number(profile.tasksCompleted),
    totalEarned: Number(profile.totalEarned) / 1_000_000,
    networkSize: Number(profile.networkSize),
    endorsements: Number(profile.endorsements),
    memberSince: new Date().toLocaleDateString(),
    topSkills: ['Design', 'Code'],
  } : {
    pocScore: 0,
    tasksCompleted: 0,
    totalEarned: 0,
    networkSize: 0,
    endorsements: 0,
    memberSince: new Date().toLocaleDateString(),
    topSkills: ['Design', 'Code'],
  }

  const topSkills = stats.topSkills

  const isLoading = profileLoading || completedLoading || availableLoading || activeLoading

  // Handle successful claim
  useEffect(() => {
    if (claimSuccess) {
      showToast('Task claimed successfully!')
      refetchAvailableTasks()
      refetchActiveTasks()
    }
  }, [claimSuccess, showToast, refetchAvailableTasks, refetchActiveTasks])

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview'
      case 'available-tasks': return 'Available Tasks'
      case 'active-tasks': return 'My Active Tasks'
      case 'completed-tasks': return 'Completed Tasks'
      case 'earnings': return 'Earnings'
      case 'reputation': return 'Reputation'
      default: return 'Overview'
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    )},
    { id: 'available-tasks', label: 'Available Tasks', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M6 4V2a1 1 0 011-1h2a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'active-tasks', label: 'My Active Tasks', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="8" y1="5" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'completed-tasks', label: 'Completed Tasks', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13 5l-7 7-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { id: 'earnings', label: 'Earnings', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="4" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="6" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'reputation', label: 'Reputation', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polygon points="8,2 10,6 14,6 11,9 12,13 8,11 4,13 5,9 2,6 6,6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    )},
  ]

  useEffect(() => {
    if (!isLoading && stats && !animated) {
      const timer = setTimeout(() => {
        setAnimated(true)
        animateScore()
        initConstellation()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading, stats, animated])

  function animateScore() {
    if (!stats) return
    const target = stats.pocScore
    const circumference = 502
    let current = 0
    const step = target / 60

    const interval = setInterval(() => {
      current = Math.min(current + step, target)
      if (scoreRef.current) {
        scoreRef.current.textContent = String(Math.floor(current))
      }
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(
          circumference - (current / 1000) * circumference
        )
      }
      if (current >= target) clearInterval(interval)
    }, 16)
  }

  function initConstellation() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.offsetWidth
    const H = 200
    canvas.width = W
    canvas.height = H

    const palette = ['#7EE000', '#4A90D9', '#F5A623', '#a855f7']
    const nodes = Array.from({ length: 20 }, () => ({
      x: 16 + Math.random() * (W - 32),
      y: 16 + Math.random() * (H - 32),
      r: 2 + Math.random() * 3,
      alpha: 0,
      color: palette[Math.floor(Math.random() * palette.length)],
    }))

    let frame = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)
      frame++
      nodes.forEach(n => { n.alpha = Math.min(n.alpha + 0.02, 1) })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 100 && a.alpha > 0.3 && b.alpha > 0.3) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(126,224,0,${0.12 * Math.min(a.alpha, b.alpha)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        const hex = n.color.replace('#', '')
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        ctx.fillStyle = `rgba(${r},${g},${b},${n.alpha})`
        ctx.fill()
      })

      if (frame < 180) requestAnimationFrame(draw)
    }
    draw()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClaim = (taskId: bigint) => {
    claimTaskContract({
      address: VERIWORK_ADDRESS,
      abi: VERIWORK_ABI,
      functionName: 'claimTask',
      args: [BigInt(taskId)],
    })
  }

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '—'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="font-body text-veri-gray">Loading profile...</div>
      </div>
    )
  }

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="font-body text-veri-gray">This is your personal dashboard. Access your profile from the Navbar.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-16 bottom-0 z-50">
        
        {/* Worker identity */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-veri-black flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-lime text-lg">
                {address?.slice(2,4).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-body font-semibold text-sm">
                {address?.slice(0,6)}...{address?.slice(-4)}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span className="font-light-poppins text-xs text-veri-gray">
                  Avalanche Fuji
                </span>
              </div>
            </div>
          </div>
          
          {/* POC Score pill */}
          <div className="mt-4 bg-veri-black rounded-xl p-3 flex items-center justify-between">
            <span className="font-light-poppins text-xs text-white/50">
              POC Score
            </span>
            <span className="font-display font-bold text-lime text-lg">
              {stats.pocScore}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-none',
                activeTab === item.id
                  ? 'bg-veri-black text-white'
                  : 'text-veri-gray hover:bg-gray-50 hover:text-veri-black'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Skills at bottom of sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="font-light-poppins text-xs text-veri-gray mb-2">Top Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((skill: string) => (
              <span key={skill} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-lime/10 text-lime-dark">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 pt-16">
        
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">
            {getTabTitle()}
          </h1>
          {/* Copy address button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm font-light-poppins text-veri-gray hover:text-veri-black transition-colors cursor-none"
          >
            {copied ? '✓ Copied' : 'Copy Address'}
          </button>
        </div>

        <div className="p-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats strip - 4 cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'POC Score', value: stats.pocScore, suffix: ' pts' },
                  { label: 'Tasks Done', value: stats.tasksCompleted, suffix: '' },
                  { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(2)}`, suffix: '' },
                  { label: 'Endorsements', value: stats.endorsements, suffix: '' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border-t-4 border-lime shadow-sm">
                    <div className="font-display font-bold text-2xl text-veri-black">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="font-light-poppins text-xs text-veri-gray mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* POC Ring + Constellation side by side */}
              <div className="bg-veri-black rounded-3xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Score ring */}
                  <div className="p-10 flex flex-col items-center justify-center">
                    <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-6">
                      // Proof of Contribution
                    </div>
                    <div className="relative w-44 h-44">
                      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                        <circle className="fill-none stroke-white/5" cx="90" cy="90" r="80" strokeWidth="10"/>
                        <circle
                          ref={ringRef}
                          className="fill-none stroke-lime stroke-[10px]"
                          cx="90" cy="90" r="80"
                          strokeLinecap="round"
                          strokeDasharray="502"
                          strokeDashoffset="502"
                          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div ref={scoreRef} className="font-display font-bold text-4xl text-white leading-none">0</div>
                        <div className="text-[10px] text-white/40 tracking-widest mt-1">POC SCORE</div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-6">
                      <div className="text-center">
                        <div className="font-display font-bold text-xl text-lime">{stats.endorsements}</div>
                        <div className="font-light-poppins text-[10px] text-white/40 tracking-widest uppercase">Endorsements</div>
                      </div>
                      <div className="w-px bg-white/10" />
                      <div className="text-center">
                        <div className="font-display font-bold text-xl text-lime">{stats.networkSize}</div>
                        <div className="font-light-poppins text-[10px] text-white/40 tracking-widest uppercase">Network</div>
                      </div>
                    </div>
                  </div>
                  {/* Constellation */}
                  <div className="p-10 border-t md:border-t-0 md:border-l border-white/8">
                    <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-4">
                      // Skill Constellation
                    </div>
                    <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: '200px' }} />
                    <div className="mt-4 flex gap-3 flex-wrap">
                      {topSkills.map((skill: string) => (
                        <div key={skill} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-lime" />
                          <span className="font-light-poppins text-xs text-white/50">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity - last 3 completed tasks */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display font-bold text-lg mb-4">Recent Activity</h3>
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-body text-veri-gray">No recent activity</div>
                </div>
              </div>
            </div>
          )}

          {/* AVAILABLE TASKS TAB */}
          {activeTab === 'available-tasks' && (
            <div>
              {availableLoading ? (
                <div className="text-center py-12">
                  <div className="font-body text-veri-gray">Loading available tasks...</div>
                </div>
              ) : !availableTasks || (Array.isArray(availableTasks) && availableTasks.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="font-body text-veri-gray">No available tasks</div>
                  <div className="font-light-poppins text-sm text-veri-gray mt-1">Check back later for new opportunities</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(availableTasks) ? availableTasks : []).map((task: any, index: number) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-lime/10 text-lime-dark">
                          {CATEGORY_MAP[Number(task.category)] || 'Unknown'}
                        </span>
                        <div>
                          <div className="font-body font-semibold">{task.title}</div>
                          <div className="font-light-poppins text-xs text-veri-gray mt-0.5">
                            {task.org} · {task.deadline} · 0 submissions
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-display font-bold text-lime text-lg">
                          ${(Number(task.reward) / 1_000_000).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleClaim(task.id)}
                          disabled={claimPending}
                          className="bg-veri-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-lime hover:text-veri-black transition-all disabled:opacity-50 cursor-none"
                        >
                          {claimPending ? 'Claiming...' : 'Claim →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY ACTIVE TASKS TAB */}
          {activeTab === 'active-tasks' && (
            <div>
              {activeLoading ? (
                <div className="text-center py-12">
                  <div className="font-body text-veri-gray">Loading active tasks...</div>
                </div>
              ) : !activeTasks || (Array.isArray(activeTasks) && activeTasks.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="font-body text-veri-gray">No active tasks</div>
                  <div className="font-light-poppins text-sm text-veri-gray mt-1">Claim one from Available Tasks</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(activeTasks) ? activeTasks : []).map((task: any, index: number) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-yellow/10 text-yellow-600">
                            In Progress
                          </span>
                          <div>
                            <div className="font-body font-semibold">{task.title}</div>
                            <div className="font-light-poppins text-xs text-veri-gray mt-0.5">
                              {task.org} · {task.deadline}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => openTaskModal(task)}
                          className="bg-lime text-veri-black px-4 py-2 rounded-full text-sm font-medium hover:bg-lime-dark transition-all cursor-none"
                        >
                          Submit Work
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPLETED TASKS TAB */}
          {activeTab === 'completed-tasks' && (
            <div>
              {/* Total earned card */}
              <div className="bg-white rounded-2xl p-6 border-t-4 border-lime mb-6">
                <div className="font-light-poppins text-sm text-veri-gray">Total Earned</div>
                <div className="font-display font-bold text-3xl text-lime">
                  ${stats.totalEarned.toFixed(2)} USDC
                </div>
              </div>
              
              {completedLoading ? (
                <div className="text-center py-12">
                  <div className="font-body text-veri-gray">Loading completed tasks...</div>
                </div>
              ) : !completedTaskIds || (Array.isArray(completedTaskIds) && completedTaskIds.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔗</div>
                  <div className="font-body text-veri-gray">No completed tasks</div>
                  <div className="font-light-poppins text-sm text-veri-gray mt-1">Completed tasks will appear here</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(completedTaskIds) ? completedTaskIds : []).slice(0, 10).map((taskId: bigint, index: number) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-green/10 text-green-600">
                            Completed
                          </span>
                          <div>
                            <div className="font-body font-semibold">Task #{taskId.toString()}</div>
                            <div className="font-light-poppins text-xs text-veri-gray mt-0.5">
                              Completed on-chain
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-display font-bold text-lime text-lg">
                            +${(Math.random() * 100).toFixed(2)}
                          </div>
                          <a
                            href={`https://testnet.snowtrace.io/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-light-poppins text-[10px] text-veri-gray hover:text-lime transition-colors cursor-none"
                          >
                            View on Snowtrace ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              {/* Balance card */}
              <div className="bg-veri-black rounded-2xl p-8">
                <div className="font-light-poppins text-sm text-white/40 mb-1">Total Earned</div>
                <div className="font-display font-bold text-5xl text-lime mb-4">
                  ${stats.totalEarned.toFixed(2)}
                </div>
                <div className="font-light-poppins text-xs text-white/40">
                  USDC · Avalanche C-Chain · {stats.tasksCompleted} tasks completed
                </div>
              </div>

              {/* Earnings breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display font-bold text-lg mb-4">Earnings Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-body text-sm">Design Tasks</span>
                    <span className="font-display font-bold text-lime">${(stats.totalEarned * 0.4).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-body text-sm">Code Tasks</span>
                    <span className="font-display font-bold text-lime">${(stats.totalEarned * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-body text-sm">Other Tasks</span>
                    <span className="font-display font-bold text-lime">${(stats.totalEarned * 0.3).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPUTATION TAB */}
          {activeTab === 'reputation' && (
            <div className="space-y-4">
              {/* POC Score card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display font-bold text-lg mb-6">Proof of Contribution Score</h3>
                <div className="relative w-44 h-44 mx-auto mb-6">
                  <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                    <circle className="fill-none stroke-gray-200" cx="90" cy="90" r="80" strokeWidth="10"/>
                    <circle
                      ref={ringRef}
                      className="fill-none stroke-lime stroke-[10px]"
                      cx="90" cy="90" r="80"
                      strokeLinecap="round"
                      strokeDasharray="502"
                      strokeDashoffset="502"
                      style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div ref={scoreRef} className="font-display font-bold text-4xl text-veri-black leading-none">0</div>
                    <div className="text-[10px] text-veri-gray tracking-widest mt-1">POC SCORE</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-lime">{stats.tasksCompleted * 10}</div>
                    <div className="font-light-poppins text-xs text-veri-gray mt-1">From Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-lime">{stats.endorsements * 5}</div>
                    <div className="font-light-poppins text-xs text-veri-gray mt-1">From Endorsements</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-lime">{stats.pocScore}</div>
                    <div className="font-light-poppins text-xs text-veri-gray mt-1">Total Score</div>
                  </div>
                </div>
              </div>

              {/* Endorsements */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg">Endorsements</h3>
                  <span className="font-display font-bold text-2xl text-lime">{stats.endorsements}</span>
                </div>
                <p className="font-light-poppins text-sm text-veri-gray">
                  Endorsements from other verified workers add +5 POC points each and increase your reputation score permanently on-chain.
                </p>
              </div>

              {/* Share profile */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-display font-bold text-lg mb-2">Share Your Profile</h3>
                <p className="font-light-poppins text-sm text-veri-gray mb-4">
                  Share your on-chain resume with employers worldwide. No CV needed.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 font-light-poppins text-sm text-veri-gray truncate">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="bg-veri-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-lime hover:text-veri-black transition-all cursor-none"
                  >
                    {copied ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Task Modal */}
      {activeTask && <TaskModal task={activeTask} />}
    </div>
  )
}
