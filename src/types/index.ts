export type TaskCategory = 'design' | 'code' | 'translation' | 'data'

export interface Task {
  id: string
  title: string
  category: TaskCategory
  org: string
  orgInitial: string
  orgColor: string
  description: string
  reward: number
  deadline: string
  submissions: number
  postedAt: string
}

export interface WalletState {
  connected: boolean
  address: string | null
  pocScore: number
  tasksCompleted: number
  totalEarned: number
  networkSize: number
  endorsements: number
}

export interface Receipt {
  taskName: string
  reward: string
  txHash: string
  block: number
  timestamp: string
  pocGain: number
  worker: string
}

export type FilterType = 'all' | TaskCategory
