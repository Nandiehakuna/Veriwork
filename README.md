# VeriWork dApp

Decentralized work and reputation network built on Avalanche.

## Stack

- **Next.js 16.1.6** (App Router, Turbopack default)
- **React 19**
- **TypeScript 5.7**
- **Tailwind CSS 3.4**
- **GSAP 3.12** (ScrollTrigger, animations)
- **React Context** (global wallet + app state)

## Requirements

- **Node.js ≥ 20.9.0** (required by Next.js 16)

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (Turbopack by default)
npm run dev

# Start with Webpack instead
npm run dev:webpack

# Type check
npm run type-check

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Main page (composes all sections)
│   └── globals.css         # Tailwind + custom global styles
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── TickerBar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── MarqueeStrip.tsx
│   │   ├── TaskFeedSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   └── ReputationSection.tsx
│   └── ui/
│       ├── Cursor.tsx
│       ├── TaskCard.tsx
│       ├── WalletModal.tsx
│       ├── ReceiptModal.tsx
│       ├── Toast.tsx
│       └── NetworkIllustration.tsx
├── lib/
│   ├── data.ts             # Static task data + constants
│   ├── store.tsx           # React Context (wallet state, modals)
│   └── utils.ts            # Helpers (hash gen, formatting, cn)
└── types/
    └── index.ts            # Shared TypeScript types
```

## Next Steps (Production)

### Wallet Integration
Replace the simulated `connectWallet()` in `src/lib/store.tsx`:

```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

### Smart Contract
- Deploy escrow + task registry to Avalanche C-Chain
- Use `wagmi` hooks in `TaskCard.tsx` to call `claimTask()` / `approveSubmission()`
- Use `viem` to read on-chain POC scores in `ReputationSection.tsx`

### Database
- Task metadata → Supabase or Postgres
- File submissions → IPFS / Pinata
- Reputation indexing → The Graph protocol

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `lime` | `#7EE000` | Primary accent, CTA, active states |
| `lime-dark` | `#5AB800` | Text on white, hover states |
| `veri-black` | `#111111` | Primary text, dark backgrounds |
| `veri-gray` | `#666666` | Secondary text, labels |
| `veri-border` | `#E8E8E4` | Card borders, dividers |

## Fonts

- **Syne** — Headings, display, numbers
- **DM Sans** — Body, UI, buttons
