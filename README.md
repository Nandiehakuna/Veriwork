# VeriWork — Decentralized Work & Reputation Network

**Work is the credential.** VeriWork is a decentralized task marketplace built on Avalanche where organizations post tasks with USDC rewards and workers earn on-chain reputation by completing them — no CV, no bank account, no ID required.

Built for underserved communities: refugees, gig workers, and unbanked populations worldwide.

---

## Live Demo

- **Live MVP:** https://veriwork.vercel.app 
- **Smart Contract (Fuji Testnet):** [`0x6a6fe10e11AAec61a455Cb19Bb2E4D7df5087Bbf`](https://testnet.snowtrace.io/address/0x6a6fe10e11AAec61a455Cb19Bb2E4D7df5087Bbf)
- **Test USDC (Fuji):** [`0x5425890298aed601595a70AB815c96711a31Bc65`](https://testnet.snowtrace.io/address/0x5425890298aed601595a70AB815c96711a31Bc65)

---

## How It Works

1. **Organization** connects wallet → posts a task with USDC reward + deadline
2. **Worker** connects wallet → browses open tasks → claims one
3. **Worker** completes work → submits a link (GitHub, Figma, Google Drive, etc.)
4. **Organization** reviews submission → approves → USDC released on-chain
5. **Worker's POC score** increases permanently on-chain — their proof of contribution

---

## Tech Stack

### Frontend
- **Next.js 16.1.6** (App Router, React 19)
- **TypeScript 5.7**
- **Tailwind CSS 3.4** with custom design tokens
- **GSAP 3.12** (ScrollTrigger, animations)
- **React Context** for global state management

### Web3 / Blockchain
- **Wagmi 3.5.0** — wallet connection & contract interaction
- **Viem 2.46** — Ethereum client library
- **@tanstack/react-query 5.90** — async state management
- **@particle-network/authkit 2.1.1** — social login & wallet auth
- **Avalanche Fuji Testnet** — deployed and verifiable on Snowtrace

### Smart Contracts
- **Solidity 0.8.20** with OpenZeppelin (ReentrancyGuard, Ownable)
- **Hardhat** — development, testing, deployment
- Escrow-based USDC reward system
- On-chain POC (Proof of Contribution) scoring

---

## Requirements

- **Node.js ≥ 20.9.0**
- A wallet with Avalanche Fuji testnet configured (Chain ID: 43113)
- Test AVAX from [Fuji faucet](https://faucet.avax.network/)
- Test USDC from the MockERC20 contract above

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/veriwork-v2
cd veriwork-v2

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
veriwork-v2/
├── contracts/                    # Smart contracts
│   ├── contracts/
│   │   ├── VeriWork.sol         # Main marketplace contract
│   │   └── MockERC20.sol        # Test USDC token
│   ├── deployments.json         # Contract addresses
│   └── hardhat.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing page
│   │   ├── org/page.tsx         # Organization dashboard
│   │   └── profile/[address]/page.tsx  # Worker profile
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── TickerBar.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── TaskFeedSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ReputationSection.tsx
│   │   │   └── MarqueeStrip.tsx
│   │   └── ui/
│   │       ├── TaskCard.tsx
│   │       ├── TaskModal.tsx
│   │       ├── WalletModal.tsx
│   │       ├── ReceiptModal.tsx
│   │       ├── Toast.tsx
│   │       └── Cursor.tsx
│   ├── lib/
│   │   ├── contracts.ts         # ABIs and contract addresses
│   │   ├── wagmi.ts             # Wagmi config
│   │   ├── store.tsx            # React Context (global state)
│   │   ├── data.ts              # Static data helpers
│   │   └── utils.ts             # Utility functions
│   └── types/
│       └── index.ts             # TypeScript types
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Smart Contract — Key Functions

| Function | Who Calls | Description |
|---|---|---|
| `postTask()` | Organization | Post task with USDC reward into escrow |
| `claimTask()` | Worker | Claim an open task |
| `submitTask()` | Worker | Submit work URI for review |
| `approveSubmission()` | Organization | Release USDC to worker |
| `endorseWorker()` | Any worker | Add +5 POC to another worker |
| `getWorkerProfile()` | Anyone | Fetch worker stats and POC score |
| `getOpenTasks()` | Anyone | Fetch all claimable tasks |

---

## POC Score — Proof of Contribution

Each worker has an on-chain reputation score:

- **+10 POC** per completed task
- **+5 POC** per endorsement received
- Score is permanent and non-transferable
- Replaces CVs, references, and traditional credentials

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `lime` | `#7EE000` | Primary accent, CTAs, active states |
| `lime-dark` | `#5AB800` | Text on white, hover states |
| `veri-black` | `#111111` | Primary text, dark backgrounds |
| `veri-gray` | `#666666` | Secondary text, labels |
| `veri-border` | `#E8E8E4` | Card borders, dividers |
| `veri-light` | `#F5F5F2` | Page background |

## Fonts
- **Syne** — Headings, display, numbers
- **DM Sans** — Body, UI, buttons

---

## Testing on Fuji Testnet

1. Add Avalanche Fuji to your wallet:
   - RPC: `https://api.avax-test.network/ext/bc/C/rpc`
   - Chain ID: `43113`
   - Symbol: `AVAX`
2. Get test AVAX: https://faucet.avax.network/
3. Connect wallet on the live site
4. Post a task as an org or claim one as a worker
5. Verify transactions on [Snowtrace Testnet](https://testnet.snowtrace.io/)

---

## Roadmap

### V2 (Planned)
- **Cash Out / Offramp** — Convert USDC to mobile money (M-Pesa, MTN), bank transfer, or cash pickup
- **IPFS file submissions** — Decentralized file storage
- **The Graph indexing** — Faster data queries
- **Mobile app** — React Native client
- **Advanced reputation** — Skill-based POC scoring

---

## License

MIT
