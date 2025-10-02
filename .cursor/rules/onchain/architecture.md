---
description: Smart contract architecture overview for Cairo components and system design
globs: onchain/**/*
---

## Smart Contract Architecture

- **Core Contract**: `pow_game` in `/onchain/src/pow.cairo` is the main entry point
- **Component System**: Separate modules for upgrades, prestige, builders, staking, and transactions
- **Upgradeability**: Uses OpenZeppelin's upgradeable contract patterns
- **Security**: Leverages OpenZeppelin components for standard security features

### Interaction Flow
1. Frontend uses Starknet.js to call contract methods
2. Embedded wallet (AVNU SDK) may sponsor gas fees for users
3. Game state is stored on-chain and synced to frontend stores
4. Events emitted by contracts update frontend state


