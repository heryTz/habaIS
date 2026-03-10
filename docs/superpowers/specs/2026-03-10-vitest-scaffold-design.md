# Vitest Scaffold Design

**Date:** 2026-03-10
**Scope:** Add Vitest unit testing infrastructure to the habaIS React + TypeScript + Vite project.

## Goal

Scaffold a minimal Vitest setup to support future unit tests for the IS (Impôt Synthétique) tax calculation logic. Initial deliverable is a passing hello-world test that confirms the setup works.

## Decisions

- **Test type:** Unit tests only (no component/DOM testing)
- **Coverage:** None (keep it minimal)
- **Config location:** Inline in `vite.config.ts` (no separate config file)
- **Globals:** Enabled (`globals: true`) — no imports needed in test files
- **Environment:** `node` (lighter than jsdom; no DOM required)

## Changes

### `package.json`
- Add `vitest` to `devDependencies`
- Add `"test": "vitest"` script (watch mode)
- Add `"test:run": "vitest run"` script (single-pass / CI)

### `vite.config.ts`
Add a `test` block:
```ts
test: {
  globals: true,
  environment: 'node',
}
```

### `tsconfig.app.json`
Add `"vitest/globals"` to the `compilerOptions.types` array so TypeScript recognizes global test functions.

### `src/lib/hello.test.ts` (new file)
A trivial passing test to verify the setup:
```ts
describe('hello', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

## Future

Test files for the IS calculation logic will be colocated alongside their source module, e.g., `src/lib/is.test.ts` next to `src/lib/is.ts`.
