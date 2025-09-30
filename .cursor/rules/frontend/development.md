---
description: Frontend development commands and workflows for Expo/React Native app
globs: frontend/**/*
---

## Frontend Development

```bash
# Install dependencies
cd frontend && npm install

# Start development server (Expo)
cd frontend && npx expo start

# Start with specific Starknet environment
cd frontend && npm run start:devnet   # Local devnet
cd frontend && npm run start:sepolia  # Sepolia testnet
cd frontend && npm run start:mainnet  # Mainnet

# Run on specific platforms
cd frontend && expo run:android
cd frontend && expo run:ios

# Linting
cd frontend && npx expo lint
cd frontend && npx expo lint --fix

# Tests (Jest)
cd frontend && npm test
```


