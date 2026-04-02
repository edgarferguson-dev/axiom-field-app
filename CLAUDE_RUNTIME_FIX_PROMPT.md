# Handoff prompt: fix unhandled runtime error (Axiom Field App)

Copy everything below the line into a new chat with Claude (or another coding agent). **Replace the bracketed sections** with your actual error text and URL.

---

## Context

You are working in **`axiom-field-app`**: a **Next.js 14.2** App Router app on **Windows**, **React 18**, **TypeScript**, **Tailwind**, **Zustand** with `persist` (localStorage), **next/font/google** (Inter + JetBrains Mono).

### Stack / behavior

- **Home (`/`)**: `app/page.tsx` is a **Server Component** that renders **`HomePageClient`** (`components/home/HomePageClient.tsx`) so route config is not mixed with `"use client"` (that previously caused webpack / module errors).
- **Session routes**: `app/session/[sessionId]/…` use a **client layout** that waits for Zustand persist hydration before rendering chrome (`hooks/use-session-store-hydrated.ts`).
- **API routes**: `/api/coaching`, `/api/pre-call`, `/api/score`.

### Already applied mitigations (do not remove without cause)

- **`next.config.mjs`**: `webpack.cache = false` **only when `dev === true`** — reduces stale chunk errors (`Cannot find module './682.js'`, `__webpack_modules__[moduleId] is not a function`) on Windows when `.next` is corrupted.
- **`package.json` scripts**: `clean:next`, `dev:clean`, `build:clean` — use **`npm run clean:next`** then **`npm run dev`** if the error looks like missing webpack chunks or cache corruption.
- **Homepage**: `components/home/HomeHero.tsx`, `SystemOverview.tsx`, `HomePageClient.tsx`.

### Constraints

1. **Minimal, targeted fixes** — do not redesign the app or rewrite architecture.
2. **Do not break** session flow, Zustand `startSession` → `router.push(/session/...)`, or API contracts unless the bug requires it.
3. **Prefer** `app/error.tsx` (route error boundary) or fixing the **root cause** over swallowing errors silently.
4. Run **`npx tsc --noEmit`** and **`npx next build`** before declaring done.

### Environment notes

- **Only one `npm run dev` at a time** if possible; multiple instances fight ports (3000, 3001, …) and caches.
- If the error mentions **missing `./NNN.js`** or **webpack-runtime**: stop dev, run **`npm run clean:next`**, single **`npm run dev`**, hard-refresh browser.

---

## What I need you to do

### 1) Reproduce and capture

[PASTE: exact **Unhandled Runtime Error** title and message from the Next.js overlay]

[PASTE: **browser DevTools → Console** first red error + stack]

[PASTE: **terminal** output when the error occurs, if any]

[PASTE: URL and route, e.g. `http://localhost:3000/` or `/session/abc/field-read`]

### 2) Diagnose

- Map the error to **file + line** (or chunk) in **this repo**.
- Say whether it is: **React render**, **hydration**, **Zustand persist**, **client/server boundary**, **webpack/.next stale**, or **API/network**.

### 3) Fix

- Implement the **smallest** code change that resolves the runtime error.
- If helpful, add **`app/error.tsx`** (and optionally **`app/global-error.tsx`**) with a readable message and a link/button to retry or go home — **keep styling consistent** with existing `globals.css` tokens (`background`, `foreground`, `accent`, etc.).

### 4) Verify

- `npx tsc --noEmit`
- `npx next build`
- Describe how to confirm in the browser on the **same URL** as the failure.

---

## Files often involved (start here if no stack trace)

| Area | Paths |
|------|--------|
| Home | `app/page.tsx`, `components/home/HomePageClient.tsx`, `HomeHero.tsx`, `SystemOverview.tsx` |
| Session shell | `app/session/[sessionId]/layout.tsx`, `components/layout/session-flow-progress.tsx` |
| Store | `store/session-store.ts`, `hooks/use-session-store-hydrated.ts` |
| Coaching overlay | `components/coaching/LiveCoachingOverlay.tsx` |
| Root | `app/layout.tsx`, `app/globals.css` |

---

## Output format

Reply with:

1. **Root cause** (one short paragraph).
2. **Files changed** (list).
3. **Diff summary** (what you changed and why).
4. **Confirmation** steps for the user.

---

_End of handoff prompt — fill bracketed sections before sending._
