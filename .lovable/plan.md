## Scope

Add two new **common (school-wide)** roles and a **password gate** on `/admin`. Nothing else changes — voting flow, house pages, existing SPL/ASPL, results styling all stay identical.

## 1. New roles: Sports Secretary + Cultural Secretary

They behave exactly like SPL/ASPL: `house: null`, one winner school-wide, shown on every house's vote page in the "common" section, and grouped with SPL/ASPL in Results.

### `src/lib/election.ts`
- Extend `Role` type: `"spl" | "aspl" | "sports-sec" | "cultural-sec" | "captain" | "vice-captain"`.
- Add to `ROLE_LABEL`: `"sports-sec": "Sports Secretary"`, `"cultural-sec": "Cultural Secretary"`.
- Extend `seedIfEmpty()` with two seed candidates each for the two new roles (house: null), matching the SPL/ASPL pattern.

### `src/routes/vote.$house.tsx`
- Wherever the "common" roles array is defined (currently `["spl", "aspl"]`), extend to `["spl", "aspl", "sports-sec", "cultural-sec"]`. No layout/style changes.
- Ballot validation (require a pick per role before submit) automatically covers the new roles via the same loop.

### `src/routes/admin.tsx`
- Roles dropdown when adding/editing a candidate: add the two new options.
- Results tab's `commonGrouped` array: extend to include the two new roles (they'll render as additional common sections after SPL/ASPL using the exact same card component already used there).

No database schema change — candidates/votes are stored in localStorage keyed by role string, so new role strings just work.

## 2. Admin password gate

- **Password:** `dawn2026`
- **Persistence:** sessionStorage — re-enter every new browser session/tab.
- **Approach:** simple client-side check. Constant lives in one place; correct entry sets `sessionStorage["admin.unlocked"] = "1"`. Not cryptographically secure, but matches the requested "simple and reliable" bar and needs no backend round-trip.

### `src/routes/admin.tsx`
- At the top of the admin component, read `sessionStorage["admin.unlocked"]` inside a `useEffect` (SSR-safe) into `unlocked` state.
- If not unlocked: render a centered glass card matching existing luxury styling — school brand header, single password input, Unlock button, subtle error message on wrong entry. No other admin content mounts.
- On correct password: set sessionStorage flag + state, admin panel renders exactly as it does today.
- Add a small "Lock" button in the existing admin header that clears the flag and returns to the gate. Nothing else in the admin panel changes.

## Out of scope (explicitly untouched)

- House selection page, voting flow logic, existing SPL/ASPL behavior, results styling/theme, animations, house colors, Supabase schema, logo sync, house lock logic.

## Files edited

- `src/lib/election.ts` — add roles + labels + seeds
- `src/routes/vote.$house.tsx` — extend common roles list
- `src/routes/admin.tsx` — new role options + results grouping + password gate