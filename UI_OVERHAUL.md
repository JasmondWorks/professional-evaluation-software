# UI Overhaul — change log

Running record of the design revamp. See [DESIGN.md](DESIGN.md) for the design
system itself (tokens, components, patterns) and [PRODUCT.md](PRODUCT.md) for
product truth. This file is the *what changed and why*; DESIGN.md is the *rules
to follow going forward*.

**Direction:** refined institutional dashboard, played straight, at Linear's craft
bar — light, systematized indigo (`#322b80`), mobile-first. Chosen over a rolled
"Examination Register" concept and a night-flight-instrument challenger.

> When you make further UI changes, add them under a new dated entry below and,
> if you introduce or change a token/component/pattern, update DESIGN.md too.

---

## 2026-08-01 → 2026-08-02 — Foundation + full retrofit

### Foundation (design system)
- **Tokens** ([tailwind.config.ts](tailwind.config.ts)): `pes` became a full ramp
  `pes-50…950` while keeping `DEFAULT` (so existing `bg-pes`/`text-pes` still work);
  added semantic `surface`/`canvas`/`line` and `success`/`warning`/`danger`; added a
  real offset-blur shadow scale (`xs/sm/card/md/lg/focus`).
- **Global base** ([app/globals.css](app/globals.css)): CSS-variable token layer,
  one visible `:focus-visible` ring, thin scrollbars; removed the harmful universal
  `*{margin:0;padding:0}` reset and the `15.5px` body; added `prefers-reduced-motion`.
- **Font**: one face (Inter via `next/font`, `--font-sans`) wired at the root
  ([app/layout.tsx](app/layout.tsx)); removed the admin-only Lato and the commented
  root font. Direction contract recorded as an HTML comment in the root layout body.

### Shell
- **Sidebar** ([app/components/sidebar.tsx](app/components/sidebar.tsx)): fixed 16rem
  rail, org header, grouped nav with indigo active state + left accent bar, user
  footer, mobile drawer with scrim. Role/permission logic unchanged.
- **Navbar** ([app/components/navbar.tsx](app/components/navbar.tsx)): sticky
  translucent bar, accessible notifications + avatar.
- **Layout** ([app/(admin)/layout.tsx](app/(admin)/layout.tsx)): moved from
  `w-1/5`/`w-4/5` to a fixed rail + `lg:pl-64`; fixed a stray `~` syntax bug.

### New shared primitives (`app/components/ui/`)
- `Button` (variants + sizes + `loading`), `Input` (label/hint/error + ARIA wired,
  exports `inputBase`), `Card`/`CardHeader`/`CardBody`, `Badge` (static purge-safe
  tones — replaces unsafe dynamic `bg-${color}`), `PageHeader` (enforces the
  "every page has a title" rule).

### Pages retrofitted onto the system
- Dashboard + `Quickstats`, work-sampling tool, employee-scores, evaluation/staff
  ("plain estimating"), em-database/[user], data-entry (auditor, students, appraisal,
  landing, stress-category), and the performance wizard + `CriteriaForm`.

### App-wide sweeps (scripted + audited)
- `alert()` → `notify` toasts — 39 calls across 16 files (emojis stripped, correct
  success/error mapping).
- Stripped 35 stray `console.log`; deleted the dead `app/components/ecommerce/`
  folder (TailAdmin leftovers, incl. the only — fake — `dark:` classes).
- `text-gray-400` → `text-muted` (a11y contrast) — 113.
- **Stray `blue-*` accents → indigo `pes` brand** — ~180 classes / 52 files.
- `text-gray-{500..900}` → `text-strong`/`text-body`/`text-muted` — 756 / 100 files.
- `border-gray-*` → `border-line`, `bg-gray-50/100` → `bg-canvas`,
  `divide-gray-*` → `divide-line` — 771 / 104 files.
- Spinner loaders normalized to `border-2 … border-t-transparent` (25); plain
  "Loading…" text → spinner (4).
- Certificate literal `"signature"` placeholder → a signature line + caption
  (1st/2nd/3rd).
- Detector fixes: killed all `ai-color-palette` (indigo/purple headings),
  `side-tab`, `gray-on-color`, `gradient-text`, and a `broken-image` false positive.

### Verification at end of session
- Design detector: **0 UI findings** (only 5 server-side email-template
  `overused-font` remain — out of UI scope).
- TypeScript: **0 errors** project-wide. All sampled routes: **200**.

### Known follow-ups (not done)
- Browser-based finish review (no browser automation was available in the session).
- `<button>` → shared `Button` migration (opportunistic, page-by-page).
- `bg-white` → `bg-surface` alignment (skipped — visually identical).
