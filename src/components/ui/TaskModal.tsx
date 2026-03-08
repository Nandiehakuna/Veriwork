'use client'

import { useState, useRef } from 'react'
import { Task } from '@/types'
import { CATEGORY_STYLES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TaskModalProps {
  task: Task
}

type ViewState = 'details' | 'submission'

export default function TaskModal({ task }: TaskModalProps) {
  const { closeTaskModal, claimTask, showToast } = useApp()
  const [view, setView] = useState<ViewState>('details')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const catStyle = CATEGORY_STYLES[task.category]

  const handleClaim = () => {
    setView('submission')
  }

  const handleSubmit = () => {
    if (!notes.trim()) {
      showToast('Please add submission notes')
      return
    }
    claimTask(task.id, task.title, task.reward)
    closeTaskModal()
    setView('details')
    setNotes('')
    setFile(null)
  }

  const handleBack = () => {
    setView('details')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[700] flex items-center justify-center p-6"
      onClick={closeTaskModal}
    >
      <div
        className="bg-white rounded-4xl max-w-lg w-full p-10 shadow-2xl border-t-4 border-lime relative"
        onClick={e => e.stopPropagation()}
      >
        {view === 'submission' && (
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-veri-gray hover:text-veri-black transition-colors cursor-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <button
          onClick={closeTaskModal}
          className="absolute top-6 right-6 text-veri-gray hover:text-veri-black transition-colors cursor-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            view === 'details' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 absolute pointer-events-none'
          )}
        >
          <span className={cn('inline-block text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-5', catStyle.bg, catStyle.text)}>
            {catStyle.label}
          </span>

          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: task.orgColor }}
            >
              {task.orgInitial}
            </div>
            <span className="font-light-poppins text-veri-gray text-xs">{task.org} · {task.postedAt}</span>
          </div>

          <h2 className="font-display font-bold text-2xl tracking-tight mb-4">{task.title}</h2>

          <p className="font-body text-veri-gray leading-relaxed mb-6">{task.description}</p>

          <div className="font-display font-extrabold text-3xl text-lime mb-6">${task.reward}</div>

          <div className="font-light-poppins text-sm text-veri-gray mb-8">
            <div>Deadline: {task.deadline}</div>
            <div>{task.submissions} submission{task.submissions !== 1 ? 's' : ''} already</div>
          </div>

          <button
            onClick={handleClaim}
            className="w-full bg-veri-black text-white rounded-full py-4 font-medium text-sm hover:bg-lime hover:text-veri-black transition-all cursor-none"
          >
            Claim This Task →
          </button>
        </div>

        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            view === 'submission' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 absolute pointer-events-none'
          )}
        >
          <h2 className="font-display font-bold text-2xl tracking-tight mb-6">Submit Your Work</h2>

          <div className="mb-6">
            <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
              Submission Notes *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you delivered and any relevant links..."
              className="w-full h-32 border-[1.5px] border-veri-border rounded-2xl p-4 font-body text-sm resize-none focus:outline-none focus:border-lime transition-colors"
            />
          </div>

          <div className="mb-8">
            <label className="font-light-poppins text-sm text-veri-gray mb-2 block">
              Attach Files (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.zip"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
                file ? 'border-lime bg-lime/[0.03]' : 'border-veri-border hover:border-lime'
              )}
            >
              {file ? (
                <div className="font-body text-sm text-veri-black">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-veri-gray text-xs mt-1">Click to change</div>
                </div>
              ) : (
                <div className="font-light-poppins text-sm text-veri-gray">
                  <div>Drop files here or click to upload</div>
                  <div className="text-xs mt-1">PDF, PNG, JPG, ZIP</div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-veri-black text-white rounded-full py-4 font-medium text-sm hover:bg-lime hover:text-veri-black transition-all cursor-none"
          >
            Submit Work →
          </button>
        </div>
      </div>
    </div>
  )
}
