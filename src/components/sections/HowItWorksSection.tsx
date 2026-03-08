'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HOW_IT_WORKS } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorksSection() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardsRef.current) return
    gsap.fromTo(
      cardsRef.current.querySelectorAll('[data-how-card]'),
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', once: true },
      }
    )
  }, [])

  return (
    <section id="how-it-works" className="bg-veri-light">
      <div className="max-w-[1300px] mx-auto px-8 py-24">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-veri-gray mb-3">
          <span className="w-5 h-0.5 bg-lime rounded" />
          How It Works
        </div>
        <h2 className="font-display font-extrabold tracking-tight leading-tight mb-12" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
          Four steps.<br />No gatekeeping.
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.num}
              data-how-card
              className="group p-8 rounded-3xl border-[1.5px] border-veri-border bg-white hover:border-lime hover:bg-veri-light transition-all duration-300 cursor-default"
            >
              <div className="font-display font-extrabold text-5xl text-veri-border group-hover:text-lime transition-colors duration-300 leading-none mb-4">
                {step.num}
              </div>
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="font-display font-bold text-base mb-2">{step.title}</h3>
              <p className="text-veri-gray text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
