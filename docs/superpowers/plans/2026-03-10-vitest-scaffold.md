# Vitest Scaffold Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest unit testing infrastructure with a passing hello-world test.

**Architecture:** Inline Vitest config inside `vite.config.ts`, globals enabled, node environment. One trivial test in `src/lib/hello.test.ts` to verify the setup works.

**Tech Stack:** Vitest, TypeScript, pnpm

---

## Chunk 1: Wire up Vitest

### Task 1: Install Vitest

**Files:**
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Install vitest as a dev dependency**

```bash
cd /Users/nirintsoa/prog/streamer/habaIS && pnpm add -D vitest
```

Expected: vitest appears in `devDependencies` in `package.json` and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Add test scripts to package.json**

In `package.json`, add to the `scripts` block:
```json
"test": "vitest",
"test:run": "vitest run"
```

Result:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

---

### Task 2: Configure Vitest in vite.config.ts

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add the triple-slash reference and test block**

Replace the contents of `vite.config.ts` with:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'node',
  },
})
```

The `/// <reference types="vitest/config" />` directive is required so TypeScript knows about the `test` property on `defineConfig`.

---

### Task 3: Update tsconfig.app.json for Vitest globals

**Files:**
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Add vitest/globals to types array**

In `tsconfig.app.json`, change:
```json
"types": ["vite/client"]
```
to:
```json
"types": ["vite/client", "vitest/globals"]
```

This makes `describe`, `it`, `expect`, etc. available globally in test files without needing imports.

---

### Task 4: Create the hello-world test

**Files:**
- Create: `src/lib/hello.test.ts`

- [ ] **Step 1: Create src/lib/ directory and hello.test.ts**

Create `src/lib/hello.test.ts` with:
```ts
describe('hello', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

No imports needed — globals are enabled.

- [ ] **Step 2: Run the test to verify it passes**

```bash
cd /Users/nirintsoa/prog/streamer/habaIS && pnpm test:run
```

Expected output:
```
✓ src/lib/hello.test.ts (1)
  ✓ hello (1)
    ✓ works

Test Files  1 passed (1)
Tests       1 passed (1)
```

- [ ] **Step 3: Commit**

```bash
cd /Users/nirintsoa/prog/streamer/habaIS
git add package.json pnpm-lock.yaml vite.config.ts tsconfig.app.json src/lib/hello.test.ts docs/
git commit -m "feat: scaffold vitest with hello-world test"
```
