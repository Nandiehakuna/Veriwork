'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/lib/store'
import NetworkIllustration from '@/components/ui/NetworkIllustration'

export default function HeroSection() {
  const { openWalletModal } = useApp()
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 })
    tl.fromTo(eyebrowRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(headlineRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .fromTo(bodyRef.current,    { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(ctaRef.current,     { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .fromTo(rightRef.current,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
  }, [])

  return (
    <section className="min-h-screen pt-36 pb-20 px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 max-w-[1300px] mx-auto">
      {/* LEFT */}
      <div>
        {/* Eyebrow */}
        <div ref={eyebrowRef} className="inline-flex items-center gap-2 border-[1.5px] border-veri-border rounded-full px-4 py-1.5 text-xs font-medium text-veri-gray mb-8 opacity-0">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse-dot" />
          <span className="bg-lime text-veri-black rounded-full px-2 py-0.5 text-[10px] font-bold">LIVE</span>
          Avalanche · No ID Required
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-display font-extrabold tracking-tight leading-[0.95] mb-6 opacity-0"
          style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)' }}
        >
          Prove.<br />
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 border-[2.5px] border-lime rounded-full px-4 py-1 text-[0.75em]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            </span>
            Earn.
          </span>
          <br />
          <em className="not-italic text-lime-dark">Own.</em>
        </h1>

        {/* Body */}
        <div ref={bodyRef} className="flex items-start gap-8 mb-10 opacity-0">
          <p className="text-veri-gray leading-relaxed max-w-[280px]">
            Your skills cross every border. Your work is your credential — permanently on-chain, portable forever.
          </p>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl">$847K</div>
              <div className="text-[11px] text-veri-gray tracking-wide">PAID OUT</div>
            </div>
            <div className="w-px h-8 bg-veri-border mx-auto" />
            <div className="text-center">
              <div className="font-display font-extrabold text-2xl">12K+</div>
              <div className="text-[11px] text-veri-gray tracking-wide">WORKERS</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="flex items-center gap-4 opacity-0">
          <button
            onClick={() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-veri-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-lime hover:text-veri-black transition-all duration-300 cursor-none"
          >
            Browse Tasks
          </button>
          <button
            onClick={openWalletModal}
            className="border-[1.5px] border-veri-border text-veri-black px-8 py-3.5 rounded-full text-sm font-medium hover:border-veri-black transition-all duration-300 cursor-none"
          >
            Connect Wallet →
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div ref={rightRef} className="relative hidden lg:block opacity-0">
        {/* Social pill */}
        <div className="absolute -top-4 left-10 z-10 bg-veri-black rounded-full flex items-center gap-1 px-3 py-2">
          {['f', 'in', '𝕏'].map(s => (
            <a key={s} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-lime hover:text-veri-black transition-all cursor-none">
              {s}
            </a>
          ))}
        </div>

        {/* Arrow CTA */}
        <button
          onClick={openWalletModal}
          className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-lime flex items-center justify-center text-lg hover:scale-110 hover:rotate-12 transition-all cursor-none"
        >
          ↗
        </button>

        {/* Image card */}
        <div className="bg-veri-light rounded-[2rem] overflow-hidden aspect-[4/5] max-h-[560px] flex items-center justify-center">
          <NetworkIllustration />
        </div>

        {/* More tasks button */}
        <button
          onClick={() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 right-4 bg-white rounded-full px-4 py-2 text-xs font-medium shadow-lg flex items-center gap-1.5 hover:bg-lime transition-all cursor-none"
        >
          More Tasks ↓
        </button>
      </div>
    </section>
  )
}
