---
description: DRY and SOLID principles adapted to the game architecture
globs: **/*
---

# Optimize (DRY, SOLID)

- Single Responsibility: stores manage state; hooks orchestrate logic; components render
- Open/Closed: prefer extending config-driven behaviors over branching
- Liskov: ensure hook return shapes remain compatible when extended
- Interface Segregation: split large props and store slices into cohesive pieces
- Dependency Inversion: depend on abstractions (selectors, service interfaces), not concretions

## DRY in Game Logic
- Consolidate reward, timer, and multiplier calculations into shared utilities
- Use shared constants/configs for balancing across UI and contracts


