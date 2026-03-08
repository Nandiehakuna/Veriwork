import { MARQUEE_ITEMS } from '@/lib/data'

export default function MarqueeStrip() {
  // Double items for seamless loop
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="bg-veri-black overflow-hidden border-y border-veri-black py-4">
      <div className="flex gap-12 w-max animate-marquee">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-12 flex-shrink-0">
            <span className="font-display font-bold text-sm text-white/40 tracking-widest whitespace-nowrap">
              {item}
            </span>
            <span className="text-lime text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
