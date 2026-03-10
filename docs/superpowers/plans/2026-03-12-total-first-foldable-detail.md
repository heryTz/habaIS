# Total-First Foldable Detail Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the "Total à payer" card to the top of the results panel and wrap the six BlockCards in a single collapsible section, collapsed by default.

**Architecture:** Single-file JSX restructure in `src/app.tsx`. Add one `useState<boolean>` for `showDetail` (default `false`), move the total card above the BlockCards, add a toggle button inside the total card, and wrap the BlockCards in a conditional render.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest (unit), pnpm

---

## Chunk 1: Restructure the results panel

### Task 1: Add `showDetail` state and reorder JSX in `src/app.tsx`

**Files:**
- Modify: `src/app.tsx`

**Spec:** `docs/superpowers/specs/2026-03-12-total-first-foldable-detail-design.md`

- [ ] **Step 1: Add `showDetail` state**

In `App`, after the existing `const [values, setValues] = useState<Fields>(EXAMPLE)` line, add:

```tsx
const [showDetail, setShowDetail] = useState(false)
```

- [ ] **Step 2: Move the total card above the BlockCards**

In the results panel JSX (inside the `{!result ? … : <> … </>}` block), move the total card `<div>` (currently the last element, the amber `rounded-2xl bg-amber-500/10` div) to be the **first** child inside the fragment, before the first `<BlockCard>`.

- [ ] **Step 3: Add the toggle button inside the total card**

At the bottom of the total card (after the `flex items-center justify-between` row), add:

```tsx
<button
  type="button"
  onClick={() => setShowDetail(v => !v)}
  className="mt-3 text-xs text-amber-600 hover:text-amber-700 focus:outline-none"
>
  {showDetail ? 'Masquer le détail ▴' : 'Voir le détail ▾'}
</button>
```

- [ ] **Step 4: Wrap the six BlockCards in a conditional render**

Wrap all six `<BlockCard …>` elements in:

```tsx
{showDetail && (
  <div className="space-y-4">
    {/* BlockCard: Base imposable */}
    {/* BlockCard: IS brut */}
    {/* BlockCard: Réduction */}
    {/* BlockCard: Minimum légal */}
    {/* BlockCard: Déduction des acomptes */}
    {/* BlockCard: Provision année N */}
  </div>
)}
```

Keep the existing `space-y-4` wrapper that was around all the cards — just move it to wrap only the BlockCards now (the total card sits outside this wrapper, above it).

- [ ] **Step 5: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Build check**

Run: `pnpm build`
Expected: exits 0, no errors

- [ ] **Step 7: Visual verification**

Run `pnpm dev` and open the browser. Verify:
1. Results panel shows the amber "Total à payer" card first
2. Below it: "Voir le détail ▾" button
3. The six BlockCards are not visible by default
4. Clicking the button reveals all six BlockCards and changes label to "Masquer le détail ▴"
5. Clicking again hides them

- [ ] **Step 8: Commit**

```bash
git add src/app.tsx
git commit -m "feat: show total at top, fold detail by default"
```
