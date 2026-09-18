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

## 2026-08-02 — Token completion + WellbeingSession-adjacent UI

- **Full palette unification (round 2):** `indigo-*` → `pes` and `amber-*` → `warning`
  tokens across the app (~188 occurrences / ~25 files, two passes incl. `-600`/border/
  gradient shades). The app palette is now entirely indigo-brand + semantic tokens —
  **0 stray `blue-*`/`indigo-*`/`amber-*` accents remain.**
- **Stress evaluation reset callout** ([app/(admin)/models/stress/page.tsx](<app/(admin)/models/stress/page.tsx>)):
  copy updated to the client-confirmed `RESET_MESSAGE` ("Significant difference
  recorded (H₀ rejected) — call for reset of the settings"), warning-token styling.
  (Trigger still the ANOVA H₀ as an interim; moves to the feeling band with the
  WellbeingSession migration — see docs/stress-sessions.md.)
- **Login save-info prompt** ([app/(auth)/login/page.tsx](<app/(auth)/login/page.tsx>)):
  Credential Management API call on success so the native "save password?" prompt fires.

> This entry's stress-session/data-model work (schema, migration, service layer) is
> tracked separately in [docs/stress-sessions.md](docs/stress-sessions.md).

## 2026-08-02 (pt.2) — Tailwind v4 + shadcn component library

- **Upgraded to Tailwind v4 (CSS-first).** All tokens moved into `@theme` in
  [app/globals.css](app/globals.css) and generate utilities; `tailwind.config.ts`
  retired; PostCSS → `@tailwindcss/postcss`; font var → `--font-inter`. Fixed v4
  renames across the app (`flex-shrink-0`→`shrink-0`, `flex-grow`→`grow`,
  `bg-opacity-*`→`/opacity`). Verified: typecheck 0, all routes 200.
- **Initialized shadcn** (`components.json`, aliases → `app/components/ui` +
  `app/components/widgets`) and built a **Radix-based component library themed to the
  tokens** (not a parallel theme, to keep one source of truth): Dialog + Modal, Tabs,
  Select, Checkbox, RadioGroup, Switch, DropdownMenu, Tooltip, Avatar, Label,
  Textarea, Field, Alert, Empty, Separator, Progress, Breadcrumb, Pagination,
  FileUpload, DateTimeInput. Barrel at `@/app/components/ui`.
- **Fixed flagged pages:** dashboard Over/Underperforming (oversized `text-xl` → tidy
  section labels, token colors); `/em-database/add-employee` (off-center success
  overlay → Modal, yellow → warning tokens, step bars → `PageHeader` + `Progress`,
  oversized `text-lg` inputs → token inputs, tightened spacing); `PermissionSelector`
  (huge `h-6 w-6` checkboxes → shared `Checkbox` component).
- **`/em-database`:** dated top-nav (`bg-white h-[4rem] text-gray-300`, `w-[30%]`,
  ad-hoc underlines) → the new `Tabs` component + a proper page title; Employee header
  de-duplicated (title now in the tab bar), Add buttons + Undeliverable/error badges
  tokenized.
- **v4 dynamic-class bug fix (important):** the migration exposed latent
  `bg-${x}-100`/`text-${x}-500`/`border-${x}` classes that **Tailwind v4 can't generate
  on-demand** (they rendered colorless). Converted all of them to static conditional
  token classes — role badges (`Employee` → `Badge` tones), goal/status colors
  (`goalChunk`, `goals`), auditor yes/no cells, and the `/evaluation` tab underlines.
  Verified: **0 dynamic color classes remain**, typecheck 0.
- **Header on the new kit:** the navbar notification bell now opens a
  **`DropdownMenu`** with recent notifications (unread dots, relative time, empty
  state) instead of a redux modal; the profile button is also a `DropdownMenu`
  (account label, Profile, Get help, Log out). The old redux `Action`/`Notification`
  modals are now unused (left mounted, harmless).
- **Visual once-over** via headless Chrome confirmed the v4 token system renders
  correctly (login pixel-correct). Authenticated pages can't be screenshotted without
  a live session; they're covered by typecheck + detector + route-200 + review.
- **`red-*` → `danger` token sweep** (307 occurrences across 72 files; 0 remaining) +
  fixed stray `hover:bg-purple-*` on indigo buttons. Error/danger styling is now
  fully tokenized.
- **Redux modals → `Modal` (all of them):** failure, success, role_created,
  notification_sent, deletegoal, **newgoal, editgoal, viewgoal, setnotification** now
  use the Radix `Modal` (backdrop + focus trap + escape), bridging redux visibility to
  `isOpen`/`setIsOpen`. The goal/notification forms were rebuilt on `Field` + `Input` +
  `Select` + `DateTimeInput` + `Button` + `Alert` (replacing bespoke `border rounded-sm
  py-4` inputs and raw `<select>`). Deleted the orphaned `action.tsx` + `notification.tsx`
  (replaced by the header dropdowns). **Every modal in `app/components/modals/` is now on
  the kit.**
- **`DataTable`:** new kit component wrapping `Table` + `Pagination` — client-side
  search, pagination with a "showing X–Y of N" line, and a toolbar slot. Tokenized the
  base `Table` (divide-line rows, uppercase muted header, `bg-surface`). Applied to the
  **em-database Employee list** (searchable by name/email/dept/role, 10/page).
- **Model-page inputs unified:** swept the bespoke `numberInput` input class (ring +
  `rounded-md` + `bg-canvas`) to the kit style (`rounded-lg`, `bg-surface`,
  `focus:shadow-focus`) — ~40 inputs across ~16 files; 0 ring-based inputs remain.

## 2026-08-04 — Z-index scale + more table migrations

- **Z-index scale (one source of truth).** Replaced ad-hoc/invalid z-index classes
  (bare `z-9999` generates NO css in Tailwind v4; scattered `z-[99999]`/`z-[999999]`)
  with named `@utility` classes in `app/globals.css`:
  `z-nav`(30) < `z-drawer-scrim`(40) < `z-drawer`(50) < `z-overlay`(100) <
  `z-modal`(110) < `z-popover`(120). Applied to navbar, sidebar drawer, Dialog
  overlay/content, and Select/Dropdown/Tooltip content — so a modal overlay covers the
  navbar and a Select opened *inside* a modal renders above it. Verified the utilities
  compile with the right values.
- Converted **completed-appraisals** and **maintenance/inventory** tables to `DataTable`
  (searchable + paginated).
