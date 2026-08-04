# Design

<!-- impeccable:design-doc -->

The PES design system: a **refined institutional dashboard**, the category standard
executed straight (no metaphor), at Linear's craft bar. Light, systematized indigo,
mobile-first. This file documents the built world — it is ground truth for how new
UI should look. See [PRODUCT.md](PRODUCT.md) for product truth.

## Direction contract

- **Thesis:** an institutional, trustworthy evaluation platform. It refuses the old
  split-personality (modern pages inside dated chrome) by unifying every surface on
  one token system.
- **Register:** Operate mode — scanability, consistency, and native form/table
  affordances outrank expression. Brand lives in precise details, not decoration.
- **Craft bar:** Linear — tight type scale, restrained color, immaculate spacing,
  every state designed (hover, focus, disabled, loading, empty, error).

## Stack

**Tailwind v4, CSS-first.** All design tokens live in `@theme` inside
[app/globals.css](app/globals.css) and are generated into utilities
(`bg-pes-600`, `text-muted`, `border-line`, `shadow-card`, `font-sans`, …). There is
**no `tailwind.config.ts`** — change a token in one place and it flows everywhere.
PostCSS uses `@tailwindcss/postcss`; the font is exposed as `--font-inter`.

## Color

Tokens live in the `@theme` block of [app/globals.css](app/globals.css).

### Brand — systematized indigo (`pes`)
`pes` is a full ramp **and** keeps a `DEFAULT`, so `bg-pes`/`text-pes` still resolve
while `pes-50…950` are available.

| Token | Hex | Use |
|---|---|---|
| `pes-50` | `#f3f3fb` | active-nav bg, subtle accent surfaces, info chips |
| `pes-100` | `#e6e6f6` | badge/avatar backgrounds, hover borders |
| `pes-600` | `#464099` | secondary brand text/links |
| `pes` / `pes-700` | `#322b80` | primary buttons, active state, brand ink |
| `pes-800` | `#2a2469` | primary button hover |

Do **not** introduce generic `blue-*` accents — the brand is indigo. All prior
`blue-*` accents were mapped to `pes`.

### Semantic surfaces (CSS vars → Tailwind)
| Token | Value | Use |
|---|---|---|
| `bg-canvas` | `#f7f7fa` | app background, table headers, inset panels |
| `bg-surface` | `#ffffff` | cards, sidebar, navbar, inputs |
| `border-line` | `#e5e5ee` | all hairline borders, dividers |
| `text-strong` | `#18182b` | headings, key values (AA+) |
| `text-body` | `#3c3c52` | body copy, labels |
| `text-muted` | `#6c6c82` | captions, secondary text (AA on white ≈5.3:1) |

Never use `text-gray-400` for text — it fails AA. Use `text-muted`.

### Status
`success` (green `#1c9c07`), `warning` (amber `#9e7400`), `danger` (red `#dc2626`),
each with `-50/-100/-700` steps. Use the `-50` bg + `-700` text pairing for
alerts/badges (e.g. `bg-danger-50 text-danger-700`).

## Typography

- One face: **Inter** via `next/font` (`--font-sans`), applied at the root so
  marketing, auth, and app share one voice. No per-area fonts.
- Headings use `text-strong`, `tracking-tight`, `text-wrap: balance`.
- Numbers in tables/results use `tabular-nums`.
- Scale in practice: page title `text-2xl font-semibold`, section `text-lg font-semibold`,
  body `text-sm`, captions `text-xs/[13px]`.

## Depth & shape

- Shadows are offset+blur (never a zero-offset halo): `shadow-card` for resting
  cards, `shadow-md` on hover, `shadow-focus` for the focus ring.
- Radii: `rounded-lg` (controls, list rows), `rounded-xl` (cards/containers),
  `rounded-full` (avatars, chips, spinners). Don't reintroduce `rounded-2xl/3xl`
  churn — the modern model-page cards keep `rounded-2xl` and are the exception.
- Focus is one system: a visible `:focus-visible` indigo ring (globals.css) plus
  `focus-visible:shadow-focus` on interactive components.

## Components (`app/components/ui/`) — the UI kit

Radix-based (shadcn-style) primitives + compound abstractions, all themed to the
tokens above (not a parallel shadcn theme). `components.json` is configured so
`npx shadcn add <x>` drops new pieces here. One barrel: `@/app/components/ui`.
Specialized, few-use components go in `app/components/widgets/`.

**Primitives / compounds available:** Button, Input (+`inputBase`), Field
(label+control+error, ARIA-wired), Label, Textarea, Select, Checkbox, RadioGroup,
Switch, DateTimeInput, FileUpload, Card, Badge, Alert, Empty, Skeleton, Progress,
Separator, Avatar, Breadcrumb, Pagination, Tabs, Tooltip (+`SimpleTooltip`),
DropdownMenu, Dialog + **Modal** (`isOpen`/`setIsOpen`/`title`/`footer`), PageHeader,
Table.

Prefer these over bespoke markup:

- **`Button`** — variants `primary | secondary | destructive | outline | ghost | subtle`,
  sizes `sm | md | lg | icon`, `loading` prop with spinner. `onClick` accepts an event.
- **`Input`** — label + hint + error wired with `htmlFor`/`aria-describedby`/`aria-invalid`.
  Export `inputBase` to style bare `<input>`/`<select>` consistently.
- **`Card`** / `CardHeader` / `CardBody` — the canonical surface (border + `shadow-card`);
  `interactive` adds hover lift.
- **`Badge`** — static, purge-safe tones (`neutral | brand | success | warning | danger | info`).
  Replaces the old unsafe dynamic `bg-${color}` role classes.
- **`PageHeader`** — enforces the "every page has a title" rule (AGENTS.md), with
  optional subtitle and right-aligned `actions`.

## Shell

- **Sidebar** (`app/components/sidebar.tsx`): fixed 16rem rail (`bg-surface`,
  `border-line`), org header, grouped nav with an indigo active state + left accent
  bar, user footer. Mobile = slide-in drawer with a scrim. Role/permission logic
  unchanged.
- **Navbar** (`app/components/navbar.tsx`): sticky, translucent `bg-surface/85` +
  backdrop-blur, accessible notifications (with unread badge) and avatar.
- **Layout** (`app/(admin)/layout.tsx`): fixed rail + `lg:pl-64` content column.

## Patterns

- **Loading:** a centered `border-2 border-pes border-t-transparent rounded-full
  animate-spin` ring. Never plain "Loading…" text.
- **Empty/status:** a centered card with a title + one line of guidance + optional CTA.
- **Errors:** inline token alert (`bg-danger-50 border-danger-100 text-danger-700`,
  `role="alert"`), tied to the field where possible — never native `alert()`. Use the
  `notify` toast helper (`@/lib/toast`) for action outcomes.
- **Disabled controls** must state why on screen (AGENTS.md) — pair the disabled
  `Button` with a muted helper line.
- **Tables:** `bg-canvas` header with `text-xs uppercase tracking-wide text-muted`,
  `divide-line` rows, `tabular-nums` figures, wrapped in `overflow-x-auto`.
- **Page container:** `max-w-*` + `mx-auto` + `px-4 sm:px-6 py-6`, opened by `PageHeader`.

## Accessibility floor

WCAG AA contrast on text (use the token ramp, not `gray-400`); labelled inputs;
`aria-current` on active nav; visible keyboard focus everywhere; `role="radiogroup"`
/`aria-checked` on custom rating controls. Respects `prefers-reduced-motion`.

## State of adoption

Every critique-flagged dated page has been retrofitted onto this system, and the
deterministic design detector reports **0 UI findings**. Remaining follow-ups:
migrate the long tail of bespoke `<button>`s to `Button` opportunistically, and align
minor `gray-*`/`bg-white` usages to tokens as pages are touched (both cosmetic — the
current values are already AA and visually equivalent).
