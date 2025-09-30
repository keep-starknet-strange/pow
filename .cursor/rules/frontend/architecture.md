---
description: Frontend architecture overview for the Expo/React Native game
globs: frontend/**/*
---

## Frontend Architecture

- **State Management**: Zustand stores in `frontend/app/stores/` manage game state, user data, blockchain interactions, and UI state
- **Blockchain Integration**: Context providers in `frontend/app/context/` (StarknetJS, AVNU SDK) handle connectivity and transactions
- **Game Logic**: Hooks in `frontend/app/hooks/` encapsulate game mechanics, timers, and derived state calculations
- **Rendering**: Page components subscribe to store slices via observers for reactive updates; heavy logic lives in hooks
- **Configuration**: JSON files define game mechanics, balancing, and progression curves under `frontend/app/configs/`
- **Environment**: Environment variables control network selection and features

### Patterns
- Store observers trigger re-renders when relevant state changes
- Hooks compute derived state and manage intervals; components remain declarative
- Context providers wrap the app to provide blockchain connectivity


