# VeriWork Smart Contract

A decentralized task marketplace built on Avalanche C-Chain for Proof of Contribution (POC).

## Setup

```bash
# Install dependencies
npm install

# Create .env file with your private key and Snowtrace API key
cp .env.example .env
```

## Environment Variables

Create a `.env` file with:

```
PRIVATE_KEY=your_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
```

## Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Fuji testnet
npm run deploy:fuji

# Deploy to Avalanche mainnet
npm run deploy:avalanche

# Verify contracts on Snowtrace
npm run verify:fuji
npm run verify:avalanche
```