'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const isBig = useRef(false)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'none' })
    }

    const onEnter = () => {
      isBig.current = true
      gsap.to(cursor, { width: 40, height: 40, opacity: 0.5, duration: 0.2 })
    }

    const onLeave = () => {
      isBig.current = false
      gsap.to(cursor, { width: 12, height: 12, opacity: 1, duration: 0.2 })
    }

    document.addEventListener('mousemove', onMove)

    const targets = document.querySelectorAll('button, a, [data-cursor]')
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    // MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('button, a, [data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-lime pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
      style={{ willChange: 'transform' }}
    />
  )
}
