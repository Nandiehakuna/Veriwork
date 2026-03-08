export default function Footer() {
  return (
    <footer className="bg-veri-black px-8 py-12 flex flex-wrap items-center justify-between gap-6">
      <div className="font-display font-extrabold text-xl text-white">
        Veri<span className="text-lime">Work</span>
      </div>
      <div className="flex gap-8">
        {['Tasks', 'How It Works', 'For Orgs', 'Docs'].map(link => (
          <a key={link} href="#" className="text-sm text-white/40 hover:text-white transition-colors cursor-none">
            {link}
          </a>
        ))}
      </div>
      <p className="text-xs text-white/25">
        © 2025 Veriwork · Built on Avalanche · Your proof, your chain.
      </p>
    </footer>
  )
}
