---
description: Conventional Commits guidance with project-specific scopes and examples
globs: **/*
---

# Git Commit Messages

Use Conventional Commits: `<type>(<scope>): <subject>`

## Types
- feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

## Scopes (project-specific)
- frontend, onchain, infra, deps, docs, ci, release

## Examples
- `feat(frontend): add prestige progress to L2 view`
- `fix(onchain): correct builder reward calculation`
- `refactor(frontend): extract store selectors for miner state`
- `chore(deps): bump expo to 52.x`

## Subject Rules
- Use imperative mood; no trailing period
- Keep subject ≤ 72 chars; provide body if needed
- Reference issues in body/footer when applicable


