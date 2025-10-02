---
description: JavaScript/TypeScript code quality rules to complement ESLint and formatting
globs: **/*.{ts,tsx}
---

# Code Quality

- Prefer named exports for modules with multiple exports
- Group imports: node, third-party, internal; enforce stable order
- Avoid deep relative imports; prefer `@/` aliases if configured
- Limit function nesting; extract helpers to reduce complexity
- Keep components small; extract UI atoms and hooks for logic
- Avoid side effects in module scope; initialize in functions/providers
- Ensure each Zustand store exposes selectors to avoid over-render
- Memoize expensive calculations with `useMemo` and `useCallback`


