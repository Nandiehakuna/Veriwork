'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { WalletState, Receipt, Task } from '@/types'
import { genTxHash, formatTimestamp, getBlockNumber } from '@/lib/utils'

interface AppContextType {
  wallet: WalletState
  receipt: Receipt | null
  toast: string | null
  walletModalOpen: boolean
  receiptModalOpen: boolean
  activeTask: Task | null
  openWalletModal: () => void
  closeWalletModal: () => void
  closeReceiptModal: () => void
  openTaskModal: (task: Task) => void
  closeTaskModal: () => void
  claimTask: (taskId: string, taskName: string, reward: number) => void
  showToast: (msg: string) => void
}

const defaultWallet: WalletState = {
  connected: false,
  address: null,
  pocScore: 0,
  tasksCompleted: 0,
  totalEarned: 0,
  networkSize: 0,
  endorsements: 0,
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [repStats, setRepStats] = useState({
    pocScore: 0,
    tasksCompleted: 0,
    totalEarned: 0,
    networkSize: 0,
    endorsements: 0,
  })

  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [wasConnected, setWasConnected] = useState(false)

  // Watch for wallet connection changes and show success toast
  useEffect(() => {
    if (isConnected && !wasConnected) {
      showToast('Wallet connected successfully')
      setWasConnected(true)
    } else if (!isConnected && wasConnected) {
      setWasConnected(false)
    }
  }, [isConnected, wasConnected])

  const wallet: WalletState = {
    connected: isConnected,
    address: address ?? null,
    ...repStats,
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const claimTask = useCallback(
    (taskId: string, taskName: string, reward: number) => {
      if (!isConnected) {
        setWalletModalOpen(true)
        showToast('Connect your wallet to claim tasks')
        return
      }

      const pocGain = 10 + Math.floor(Math.random() * 12)
      const newReceipt: Receipt = {
        taskName,
        reward: `$${reward}`,
        txHash: genTxHash(),
        block: getBlockNumber(),
        timestamp: formatTimestamp(),
        pocGain,
        worker: address!,
      }

      setReceipt(newReceipt)
      setReceiptModalOpen(true)

      setRepStats(prev => ({
        pocScore: prev.pocScore + pocGain,
        tasksCompleted: prev.tasksCompleted + 1,
        totalEarned: prev.totalEarned + reward,
        networkSize: prev.networkSize + Math.floor(Math.random() * 3),
        endorsements: prev.endorsements,
      }))

      showToast(`Block confirmed — +${pocGain} POC points earned`)
    },
    [isConnected, address, showToast]
  )

  return (
    <AppContext.Provider
      value={{
        wallet,
        receipt,
        toast,
        walletModalOpen,
        receiptModalOpen,
        activeTask,
        openWalletModal: () => setWalletModalOpen(true),
        closeWalletModal: () => setWalletModalOpen(false),
        closeReceiptModal: () => setReceiptModalOpen(false),
        openTaskModal: (task: Task) => setActiveTask(task),
        closeTaskModal: () => setActiveTask(null),
        claimTask,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
