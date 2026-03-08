'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useDisconnect } from 'wagmi'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TaskCategory } from '@/types'
import { CATEGORY_STYLES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import { VERIWORK_ADDRESS, VERIWORK_ABI, USDC_ADDRESS } from '@/lib/contracts'

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface Submission {
  id: string
  worker: string
  taskId: bigint
  taskTitle: string
  submissionLink: string
  submittedAt: string
}

interface PostedTask {
  id: string
  title: string
  category: TaskCategory
  reward: string
  deadline: string
  status: 'open' | 'in_progress' | 'under_review' | 'completed'
  postedAt: string
}

const STATUS_STYLES: Record<PostedTask['status'], string> = {
  open:         'bg-lime/10 text-lime-dark',
  in_progress:  'bg-blue-50 text-blue-600',
  under_review: 'bg-orange-50 text-orange-600',
  completed:    'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<PostedTask['status'], string> = {
  open:         'Open',
  in_progress:  'In Progress',
  under_review: 'Under Review',
  completed:    'Completed',
}

export default function OrgDashboard() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { showToast } = useApp()
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { 
    writeContract: approveUSDC, 
    data: approveHash,
    isPending: approvePending, 
  } = useWriteContract()
  const { 
    writeContract: depositRewards,
    data: depositHash,
    isPending: depositPending,
  } = useWriteContract()
  const { writeContract: _, error: contractError } = useWriteContract()

  const { data: escrowBalance, refetch: refetchEscrow } = useReadContract({
    address: VERIWORK_ADDRESS,
    abi: VERIWORK_ABI,
    functionName: 'getEscrowBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: orgTasksRaw, refetch: refetchOrgTasks } = useReadContract({
    address: VERIWORK_ADDRESS,
    abi: VERIWORK_ABI,
    functionName: 'getOrgTasks',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  })

  const { isLoading: isDepositing, isSuccess: depositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })
  const { 
    isSuccess: approveSuccess 
  } = useWaitForTransactionReceipt({ hash: approveHash })

  const [depositAmount, setDepositAmount] = useState('')
  const [pendingDepositAmount, setPendingDepositAmount] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'design' as TaskCategory,
    description: '',
    reward: '',
    deadline: '',
  })
  const { 
    writeContract: postTaskContract,
    data: postTaskHash,
    isPending: isSubmittingTask,
  } = useWriteContract()
  const { writeContract: approveSubmissionContract, data: approveSubmissionHash } = useWriteContract()
  const { writeContract: rejectSubmissionContract, data: rejectSubmissionHash } = useWriteContract()

  const { isLoading: isPosting, isSuccess: postTaskSuccess } = useWaitForTransactionReceipt({
    hash: postTaskHash,
  })
  const { isSuccess: approveSubmissionSuccess } = useWaitForTransactionReceipt({
    hash: approveSubmissionHash,
  })
  const { isSuccess: rejectSubmissionSuccess } = useWaitForTransactionReceipt({
    hash: rejectSubmissionHash,
  })

 useEffect(() => {
  const timer = setTimeout(() => {
    setAuthChecked(true)
  }, 500)
  return () => clearTimeout(timer)
}, [])

useEffect(() => {
  if (authChecked && !isConnected) {
    router.push('/')
  }
}, [authChecked, isConnected, router])

  useEffect(() => {
    if (depositSuccess) {
      showToast('USDC deposited to escrow successfully!')
      refetchEscrow()
      setDepositAmount('')
    }
  }, [depositSuccess, showToast, refetchEscrow])

  useEffect(() => {
    if (approveSuccess && pendingDepositAmount) {
      showToast('Approved! Now depositing to escrow...')
      depositRewards({
        address: VERIWORK_ADDRESS,
        abi: VERIWORK_ABI,
        functionName: 'depositRewards',
        args: [parseUnits(pendingDepositAmount, 6)],
      })
      setPendingDepositAmount('')
    }
  }, [approveSuccess, pendingDepositAmount, depositRewards, showToast])

  useEffect(() => {
    if (approveSubmissionSuccess) {
      showToast('Submission approved! USDC released to worker.')
      refetchOrgTasks()
      refetchEscrow()
    }
  }, [approveSubmissionSuccess, showToast, refetchOrgTasks, refetchEscrow])

  useEffect(() => {
    if (rejectSubmissionSuccess) {
      showToast('Submission rejected.')
      refetchOrgTasks()
    }
  }, [rejectSubmissionSuccess, showToast, refetchOrgTasks])

  useEffect(() => {
    if (postTaskSuccess) {
      showToast('Task posted successfully!')
      refetchOrgTasks()
      setTaskForm({
        title: '',
        category: 'design',
        description: '',
        reward: '',
        deadline: '',
      })
    }
  }, [postTaskSuccess, showToast, refetchOrgTasks])

  const handleDeposit = () => {
    if (!isConnected) {
      showToast('Please connect your wallet first')
      return
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast('Please enter a valid amount')
      return
    }
    setPendingDepositAmount(depositAmount)
    showToast('Step 1/2: Approving USDC spend...')
    approveUSDC({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [VERIWORK_ADDRESS, parseUnits(depositAmount, 6)],
    })
  }

  const handlePostTask = () => {
    if (!isConnected) {
      showToast('Please connect your wallet first')
      return
    }
    if (!taskForm.title || !taskForm.description || !taskForm.reward || !taskForm.deadline) {
      showToast('Please fill in all required fields')
      return
    }
    const categoryMap: Record<TaskCategory, number> = {
      design: 0,
      code: 1,
      translation: 2,
      data: 3,
    }
    postTaskContract({
      address: VERIWORK_ADDRESS,
      abi: VERIWORK_ABI,
      functionName: 'postTask',
      args: [
        taskForm.title,
        taskForm.description,
        categoryMap[taskForm.category],
        parseUnits(taskForm.reward, 6),
        BigInt(parseInt(taskForm.deadline)),
      ],
    } as any)
  }

  const handleApprove = (submission: Submission) => {
    if (!isConnected) {
      showToast('Please connect your wallet first')
      return
    }
    approveSubmissionContract({
      address: VERIWORK_ADDRESS,
      abi: VERIWORK_ABI,
      functionName: 'approveSubmission',
      args: [BigInt(submission.taskId), submission.worker as `0x${string}`],
    } as any)
    setSubmissions((prev: any) => prev.filter((s: any) => s.id !== submission.id))
    showToast('Submission approved! USDC released.')
  }

  const handleReject = (submission: Submission) => {
    if (!isConnected) {
      showToast('Please connect your wallet first')
      return
    }
    rejectSubmissionContract({
      address: VERIWORK_ADDRESS,
      abi: VERIWORK_ABI,
      functionName: 'rejectSubmission',
      args: [BigInt(submission.taskId), submission.worker as `0x${string}`],
    } as any)
    setSubmissions((prev: any) => prev.filter((s: any) => s.id !== submission.id))
    showToast('Submission rejected.')
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview'
      case 'post-task': return 'Post Task'
      case 'my-tasks': return 'My Tasks'
      case 'deposit': return 'Deposit USDC'
      case 'submissions': return 'Submissions'
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
    { id: 'post-task', label: 'Post Task', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="8" y1="4" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'my-tasks', label: 'My Tasks', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'deposit', label: 'Deposit USDC', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M6 4V2a1 1 0 011-1h2a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { id: 'submissions', label: 'Submissions', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
  ]

 if (!authChecked) return null
if (!isConnected) return null

  const balanceFormatted = escrowBalance ? formatUnits(escrowBalance as bigint, 6) : '0'

  const orgTasks = orgTasksRaw && Array.isArray(orgTasksRaw) ? orgTasksRaw.map((task: any) => ({
    id: task.id.toString(),
    title: task.title,
    category: ['design', 'code', 'translation', 'data'][task.category] as TaskCategory,
    reward: formatUnits(task.reward as bigint, 6),
    deadline: `${Math.ceil((Number(task.deadline) - Date.now() / 1000) / 3600)}hr`,
    status: ['open', 'in_progress', 'under_review', 'completed', 'cancelled'][task.status] as PostedTask['status'],
    postedAt: new Date(Number(task.postedAt) * 1000).toLocaleDateString(),
  })) : []

  const pendingSubmissions = orgTasksRaw && Array.isArray(orgTasksRaw) ? orgTasksRaw.filter((task: any) => task.status === 2).map((task: any) => ({
    id: task.id.toString(),
    worker: task.worker,
    taskId: BigInt(task.id),
    taskTitle: task.title,
    submissionLink: task.submissionURI || '',
    submittedAt: new Date(Number(task.postedAt) * 1000).toLocaleDateString(),
  })) : []

  const analyticsStats = [
    { label: 'Tasks Posted',        value: orgTasks.length,   suffix: '' },
    { label: 'USDC in Escrow',      value: balanceFormatted,     suffix: ' USDC' },
    { label: 'Pending Submissions', value: pendingSubmissions.length,   suffix: '' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-16 bottom-0 z-50">
        
        {/* Org identity */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-veri-black flex items-center justify-center text-lime font-display font-bold text-sm">
              {address?.slice(2,4).toUpperCase()}
            </div>
            <div>
              <div className="font-body font-semibold text-sm">
                Organization
              </div>
              <div className="font-light-poppins text-xs text-veri-gray">
                {address?.slice(0,6)}...{address?.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
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

        {/* Bottom sign out */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => disconnect()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-veri-gray hover:bg-red-50 hover:text-red-500 transition-all cursor-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 8H3M6 5l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="9" y="3" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 pt-16">
        
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">
            {getTabTitle()}
          </h1>
          {/* Show Post Task button only on overview tab */}
          {activeTab === 'overview' && (
            <button 
              onClick={() => setActiveTab('post-task')}
              className="bg-veri-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-lime hover:text-veri-black transition-all cursor-none"
            >
              + Post Task
            </button>
          )}
        </div>

        {/* Page content - switches based on activeTab */}
        <div className="p-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Analytics strip - 3 cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {analyticsStats.map(stat => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-6 border-t-4 border-lime shadow-sm"
                  >
                    <div className="font-display font-bold text-3xl text-veri-black">
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="font-light-poppins text-sm text-veri-gray mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Posted tasks list below */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border-t-4 border-lime">
                <h2 className="font-display font-bold text-xl mb-6">Your Posted Tasks</h2>
                {orgTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📋</div>
                    <div className="font-body text-veri-gray">No tasks posted yet</div>
                    <div className="font-light-poppins text-sm text-veri-gray mt-1">
                      Use the Post Task tab to create your first task
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orgTasks.map((task: any) => {
                      const catStyle = CATEGORY_STYLES[task.category]
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between border border-veri-border rounded-2xl px-6 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              'text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full',
                              catStyle.bg,
                              catStyle.text
                            )}>
                              {catStyle.label}
                            </span>
                            <div>
                              <div className="font-body font-semibold text-sm">
                                {task.title}
                              </div>
                              <div className="font-light-poppins text-xs text-veri-gray mt-0.5">
                                {task.reward} USDC · {task.deadline} · Posted {task.postedAt}
                              </div>
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full',
                            STATUS_STYLES[task.status as PostedTask['status']]
                          )}>
                            {STATUS_LABELS[task.status as PostedTask['status']]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* POST TASK TAB */}
          {activeTab === 'post-task' && (
            <div className="max-w-2xl">
              <section className="bg-white rounded-3xl p-8 shadow-sm border-t-4 border-lime">
                <div className="grid gap-6">
                  <div>
                    <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Design a landing page"
                      className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                        Category *
                      </label>
                      <select
                        value={taskForm.category}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                        className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors bg-white"
                      >
                        <option value="design">Design</option>
                        <option value="code">Code</option>
                        <option value="translation">Translation</option>
                        <option value="data">Data</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                        Reward (USDC) *
                      </label>
                      <input
                        type="number"
                        value={taskForm.reward}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, reward: e.target.value }))}
                        placeholder="0.00"
                        className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                      Deadline (hours) *
                    </label>
                    <input
                      type="number"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, deadline: e.target.value }))}
                      placeholder="e.g., 24"
                      className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                      Description *
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe task requirements..."
                      rows={4}
                      className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors resize-none"
                    />
                  </div>
                  <button
                    onClick={handlePostTask}
                    disabled={isSubmittingTask || isPosting}
                    className="bg-veri-black text-white rounded-full py-4 font-body font-medium hover:bg-lime hover:text-veri-black transition-all disabled:opacity-50 cursor-none"
                  >
                    {isSubmittingTask || isPosting ? 'Posting...' : 'Post Task →'}
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* MY TASKS TAB */}
          {activeTab === 'my-tasks' && (
            <div>
              <section className="bg-white rounded-3xl p-8 shadow-sm border-t-4 border-lime">
                <h2 className="font-display font-bold text-xl mb-6">My Tasks</h2>
                {orgTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📋</div>
                    <div className="font-body text-veri-gray">No tasks posted yet</div>
                    <div className="font-light-poppins text-sm text-veri-gray mt-1">
                      Use Post Task tab to create your first task
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orgTasks.map((task: any) => {
                      const catStyle = CATEGORY_STYLES[task.category]
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between border border-veri-border rounded-2xl px-6 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              'text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full',
                              catStyle.bg,
                              catStyle.text
                            )}>
                              {catStyle.label}
                            </span>
                            <div>
                              <div className="font-body font-semibold text-sm">
                                {task.title}
                              </div>
                              <div className="font-light-poppins text-xs text-veri-gray mt-0.5">
                                {task.reward} USDC · {task.deadline} · Posted {task.postedAt}
                              </div>
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full',
                            STATUS_STYLES[task.status as PostedTask['status']]
                          )}>
                            {STATUS_LABELS[task.status as PostedTask['status']]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* DEPOSIT TAB */}
          {activeTab === 'deposit' && (
            <div className="max-w-lg">
              <section className="bg-white rounded-3xl p-8 shadow-sm border-t-4 border-lime">
                <h2 className="font-display font-bold text-xl mb-6">Deposit USDC to Escrow</h2>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-[1.5px] border-veri-border rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-lime transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={depositPending || isDepositing || approvePending}
                    className="bg-veri-black text-white rounded-2xl px-6 py-3 font-body font-medium hover:bg-lime hover:text-veri-black transition-all disabled:opacity-50 cursor-none"
                  >
                    {approvePending 
                      ? 'Approving USDC...' 
                      : depositPending || isDepositing 
                        ? 'Depositing...' 
                        : 'Deposit'}
                  </button>
                </div>
                <div className="mt-6 p-4 bg-veri-light rounded-xl">
                  <div className="font-light-poppins text-sm text-veri-gray">
                    Current Escrow Balance
                  </div>
                  <div className="font-display font-bold text-2xl text-lime">
                    {balanceFormatted} USDC
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === 'submissions' && (
            <div>
              <section className="bg-white rounded-3xl p-8 shadow-sm border-t-4 border-lime">
                <h2 className="font-display font-bold text-xl mb-6">Pending Submissions</h2>
                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📥</div>
                    <div className="font-body text-veri-gray">No pending submissions</div>
                    <div className="font-light-poppins text-sm text-veri-gray mt-2">
                      Submissions from workers will appear here
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions.map((sub: any) => (
                      <div key={sub.id} className="border border-veri-border rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-display font-bold text-lg mb-1">
                              {sub.taskTitle}
                            </div>
                            <div className="font-light-poppins text-sm text-veri-gray">
                              Worker: {sub.worker.slice(0, 6)}...{sub.worker.slice(-4)}
                            </div>
                          </div>
                          <div className="font-light-poppins text-xs text-veri-gray">
                            {sub.submittedAt}
                          </div>
                        </div>
                        {sub.submissionLink && (
                          <a
                            href={sub.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime hover:underline font-body text-sm mb-4 block"
                          >
                            View Submission →
                          </a>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(sub)}
                            className="flex-1 bg-lime text-veri-black rounded-full py-2 font-body font-medium hover:bg-lime-dark transition-all cursor-none"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub)}
                            className="flex-1 border border-veri-border text-veri-gray rounded-full py-2 font-body font-medium hover:border-veri-black hover:text-veri-black transition-all cursor-none"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}