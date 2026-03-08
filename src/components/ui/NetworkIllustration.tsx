export default function NetworkIllustration() {
  return (
    <svg viewBox="0 0 400 400" width="340" height="340" aria-label="Veriwork skill network">
      <defs>
        <radialGradient id="bg-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8ffe0" />
          <stop offset="100%" stopColor="#d0f0b0" />
        </radialGradient>
        <radialGradient id="glow-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7EE000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7EE000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="400" fill="url(#bg-g)" rx="24" />

      {/* Network lines */}
      <g stroke="#7EE000" strokeWidth="1.5" strokeOpacity="0.25">
        <line x1="200" y1="200" x2="100" y2="100" />
        <line x1="200" y1="200" x2="300" y2="100" />
        <line x1="200" y1="200" x2="80"  y2="265" />
        <line x1="200" y1="200" x2="320" y2="275" />
        <line x1="200" y1="200" x2="200" y2="55"  />
        <line x1="200" y1="200" x2="200" y2="345" />
        <line x1="100" y1="100" x2="300" y2="100" />
        <line x1="80"  y1="265" x2="320" y2="275" />
      </g>

      {/* Outer nodes */}
      <g fill="#7EE000" fillOpacity="0.7">
        <circle cx="200" cy="55"  r="7" />
        <circle cx="100" cy="100" r="5" />
        <circle cx="300" cy="100" r="5" />
        <circle cx="80"  cy="265" r="5" />
        <circle cx="320" cy="275" r="5" />
        <circle cx="200" cy="345" r="7" />
      </g>

      {/* Center glow */}
      <circle cx="200" cy="200" r="56" fill="url(#glow-g)" />

      {/* Center node */}
      <circle cx="200" cy="200" r="28" fill="#111111" />
      <circle cx="200" cy="200" r="22" fill="#7EE000" />
      <path d="M188 200 L196 208 L214 192" stroke="#111" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Skill labels */}
      {[
        { x: 200, y: 44,  label: 'DESIGN' },
        { x: 82,  y: 90,  label: 'CODE' },
        { x: 318, y: 90,  label: 'TRANSLATE' },
        { x: 52,  y: 278, label: 'DATA' },
        { x: 348, y: 288, label: 'RESEARCH' },
        { x: 200, y: 362, label: 'WRITING' },
      ].map(({ x, y, label }) => (
        <text key={label} x={x} y={y} textAnchor="middle" fill="#5AB800" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="600">
          {label}
        </text>
      ))}

      {/* POC badge */}
      <rect x="138" y="242" width="124" height="36" rx="18" fill="white" />
      <circle cx="160" cy="260" r="10" fill="#7EE000" />
      <text x="160" y="264" textAnchor="middle" fill="#111" fontFamily="DM Sans" fontSize="11" fontWeight="700">✓</text>
      <text x="230" y="257" textAnchor="middle" fill="#111" fontFamily="DM Sans" fontSize="10" fontWeight="700">POC Score</text>
      <text x="230" y="271" textAnchor="middle" fill="#5AB800" fontFamily="DM Sans" fontSize="11" fontWeight="800">342 pts</text>
    </svg>
  )
}
