---
description: Onchain development commands for Cairo, Scarb, Starknet Foundry, and deployment scripts
globs: onchain/**/*
---

## Smart Contract Development

```bash
# Build contracts
cd onchain && scarb build

# Run tests
cd onchain && snforge test

# Deploy contracts
cd onchain/scripts && ./deploy-devnet.sh   # Devnet
cd onchain/scripts && ./deploy-sepolia.sh  # Sepolia
cd onchain/scripts && ./deploy-mainnet.sh  # Mainnet

# Post-deploy setup
cd onchain/scripts && ./setup-contracts.sh
```


