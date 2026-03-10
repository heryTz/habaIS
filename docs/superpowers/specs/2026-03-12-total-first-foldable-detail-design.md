# Design: Total à payer en tête, détail repliable

**Date:** 2026-03-12

## Problem

The current results panel shows the "Total à payer" banner at the **bottom**, after six BlockCards of intermediate calculation steps. Users have to scroll past all the detail to reach the final number.

## Goal

Surface the total immediately, with the detail accessible but out of the way by default.

## Design

### Layout order (when a result is available)

1. **Total à payer card** — always visible, rendered first
2. **Detail section** — the six existing BlockCards, collapsed by default, toggled by a button inside the total card

### Total à payer card

Same amber card as today (`bg-amber-500/10 border-amber-500/30`), moved to the top of the results panel. At the bottom of the card, after the total row, a small toggle button:

- Label: `Voir le détail ▾` when collapsed, `Masquer le détail ▴` when expanded
- Style: `text-xs text-amber-600` text button, no border, flush left
- Clicking it flips `showDetail` state

### Detail section

Controlled by a `showDetail: boolean` state variable initialised to `false`. When `false`, the six BlockCards are not rendered. When `true`, they render in their current order:

1. Base imposable
2. IS brut
3. Réduction pour charges éligibles
4. Minimum légal
5. Déduction des acomptes
6. Provision année N

No animation. Simple conditional render.

### State

Add one `useState<boolean>` hook in `App`:

```ts
const [showDetail, setShowDetail] = useState(false)
```

## Changes required

- `src/app.tsx` only — no new files, no logic changes
- Move the total card JSX above the BlockCards
- Wrap the BlockCards in `{showDetail && <>…</>}`
- Add the toggle button inside the total card

## Out of scope

- Per-card collapse
- Animations or transitions
- Persisting the expanded/collapsed state to localStorage
