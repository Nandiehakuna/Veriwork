'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger)

interface Node { x: number; y: number; r: number; alpha: number; color: string }

export default function ReputationSection() {
  const { wallet } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const tasksRef = useRef<HTMLDivElement>(null)
  const earnedRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  const targetScore   = wallet.pocScore     || 342
  const targetTasks   = wallet.tasksCompleted || 14
  const targetEarned  = wallet.totalEarned   || 312
  const targetNetwork = wallet.networkSize   || 18

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (triggered.current) return
        triggered.current = true
        animateStats()
        initConstellation()
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  function animateStats() {
    const circumference = 502
    gsap.to({ v: 0 }, { v: targetScore, duration: 2, ease: 'power2.out', onUpdate: function() {
      const v = Math.floor(this.targets()[0].v)
      if (scoreRef.current) scoreRef.current.textContent = String(v)
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(circumference - (v / 1000) * circumference)
    }})
    gsap.to({ v: 0 }, { v: targetTasks,   duration: 1.5, ease: 'power2.out', onUpdate: function() { if (tasksRef.current)   tasksRef.current.textContent   = String(Math.floor(this.targets()[0].v)) }})
    gsap.to({ v: 0 }, { v: targetEarned,  duration: 1.5, ease: 'power2.out', onUpdate: function() { if (earnedRef.current)  earnedRef.current.textContent   = '$' + String(Math.floor(this.targets()[0].v)) }})
    gsap.to({ v: 0 }, { v: targetNetwork, duration: 1.5, ease: 'power2.out', onUpdate: function() { if (networkRef.current) networkRef.current.textContent  = String(Math.floor(this.targets()[0].v)) }})
  }

  function initConstellation() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.offsetWidth, H = 260
    canvas.width = W; canvas.height = H

    const count = Math.min(targetTasks + 5, 26)
    const palette = ['#7EE000', '#4A90D9', '#F5A623', '#a855f7']
    const nodes: Node[] = Array.from({ length: count }, () => ({
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
      nodes.forEach(n => { n.alpha = Math.min(n.alpha + 0.014, 1) })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 90 && a.alpha > 0.3 && b.alpha > 0.3) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(126,224,0,${0.1 * Math.min(a.alpha, b.alpha)})`
            ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        const hex = n.color.replace('#', '')
        const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16)
        ctx.fillStyle = `rgba(${r},${g},${b},${n.alpha})`
        ctx.fill()
      })
      if (frame < 220) requestAnimationFrame(draw)
    }
    draw()
  }

  const statBox = (label: string, ref: React.RefObject<HTMLDivElement>, init = '0') => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div ref={ref} className="font-display font-extrabold text-3xl text-lime leading-none">{init}</div>
      <div className="text-xs text-white/40 mt-1 tracking-widest uppercase">{label}</div>
    </div>
  )

  return (
    <section id="reputation" ref={sectionRef} className="max-w-[1300px] mx-auto px-8 py-24">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-veri-gray mb-3">
        <span className="w-5 h-0.5 bg-lime rounded" />
        Proof of Contribution
      </div>
      <h2 className="font-display font-extrabold tracking-tight leading-tight mb-3" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
        Your on-chain CV.<br /><span className="text-lime-dark">Owned by you.</span>
      </h2>
      <p className="text-veri-gray max-w-xl leading-relaxed mb-12">
        Every task completed. Every payment received. Every endorsement earned. Recorded permanently — readable by any employer in the world.
      </p>

      {/* Dark card */}
      <div className="bg-veri-black rounded-[2rem] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left */}
          <div className="p-10 lg:p-12">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
              <span className="w-4 h-0.5 bg-lime rounded" />
              Your Score
            </div>
            <h3 className="font-display font-extrabold text-3xl text-white tracking-tight mb-2">
              Proof of<br />Contribution
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-8">
              Connect a wallet to see your live POC score. Complete tasks to grow it across borders.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {statBox('POC Score',    scoreRef)}
              {statBox('Tasks Done',   tasksRef)}
              {statBox('Total Earned', earnedRef, '$0')}
              {statBox('Network Size', networkRef)}
            </div>
          </div>

          {/* Right */}
          <div className="p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/8">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-4">
              // Skill Constellation
            </div>
            <canvas ref={canvasRef} className="w-full h-[260px] rounded-xl" />

            {/* Score ring */}
            <div className="flex justify-center mt-6">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                  <circle className="fill-none stroke-white/5" cx="90" cy="90" r="80" strokeWidth="10" />
                  <circle
                    ref={ringRef}
                    className="fill-none stroke-lime stroke-[10px] ring-fill-transition"
                    cx="90" cy="90" r="80"
                    strokeLinecap="round"
                    strokeDasharray="502"
                    strokeDashoffset="502"
                    style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div ref={scoreRef} className="font-display font-extrabold text-4xl text-white leading-none">—</div>
                  <div className="text-[10px] text-white/40 tracking-widest mt-1">POC SCORE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
