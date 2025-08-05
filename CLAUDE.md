# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Development
```bash
# Install dependencies
cd frontend && npm install

# Start development server (uses Expo)
cd frontend && npx expo start

# Start with specific Starknet environment
cd frontend && npm run start:devnet   # For local devnet
cd frontend && npm run start:sepolia  # For Sepolia testnet  
cd frontend && npm run start:mainnet  # For mainnet

# Run on specific platforms
cd frontend && expo run:android
cd frontend && expo run:ios

# Linting
cd frontend && npx expo lint
cd frontend && npx expo lint --fix

# Run tests (Jest)
cd frontend && npm test
```

### Smart Contract Development
```bash
# Build contracts
cd onchain && scarb build

# Run tests
cd onchain && snforge test

# Deploy contracts
cd onchain/scripts && ./deploy-devnet.sh   # Deploy to devnet
cd onchain/scripts && ./deploy-sepolia.sh  # Deploy to Sepolia
cd onchain/scripts && ./deploy-mainnet.sh  # Deploy to mainnet

# Setup contracts after deployment
cd onchain/scripts && ./setup-contracts.sh
```

## Architecture Overview

### Frontend Architecture
POW! is a React Native mobile game using Expo Router for file-based navigation. The frontend follows a modular architecture with:

- **State Management**: Zustand stores in `/frontend/app/stores/` manage game state, user data, blockchain interactions, and UI state
- **Blockchain Integration**: Multiple React contexts in `/frontend/app/contexts/` handle different blockchain connections (StarknetJS, AVNU SDK)
- **Game Logic**: Custom hooks in `/frontend/app/hooks/` encapsulate game mechanics, timers, and state calculations
- **Component Structure**: Page components use store observers for reactive updates and delegate logic to hooks

Key architectural patterns:
- Store observers trigger re-renders when relevant state changes
- Hooks calculate derived state from stores and manage game intervals
- Context providers wrap the app to provide blockchain connectivity
- Environment variables control which blockchain network to connect to

### Smart Contract Architecture
The onchain contracts use Cairo and follow a modular component-based design:

- **Core Contract**: `pow_game` contract in `/onchain/src/pow_game.cairo` is the main entry point
- **Component System**: Separate components for different game features (upgrades, prestige, builders, staking)
- **Upgradeability**: Uses OpenZeppelin's upgradeable contract pattern
- **Security**: Leverages OpenZeppelin components for standard security features

Contract interaction flow:
1. Frontend uses Starknet.js to call contract methods
2. Embedded wallet (AVNU SDK) sponsors gas fees for users
3. Game state is stored on-chain and synced to frontend stores
4. Events emitted by contracts update frontend state

### Key Integration Points
- **Account Creation**: Uses OpenZeppelin Smart Account with AVNU paymasters for gasless transactions
- **State Sync**: Frontend polls blockchain for state updates and caches in Zustand stores
- **Asset Management**: Game assets (images, sounds, fonts) are bundled with the app
- **Configuration**: JSON files define game mechanics, balancing, and progression curves