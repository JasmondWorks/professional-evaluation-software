# Handoff: PES User Guide (`/help`)

## Overview
The official in-product Help & User Guide for PES — a single-page, role-aware
manual covering setup, roles, the appraisal / performance / stress cycles, the
fourteen models, troubleshooting, and reference appendices. It is designed to be
served at `/help` inside the product.

## About the design files
The files in this bundle are **design references authored in HTML**. They show
the intended look, copy and behaviour. Two ways to use them:

- **Ship as-is (fastest).** `pes-user-guide.standalone.html` is one
  self-contained file — no external fonts, scripts or network calls. Drop it in
  your static directory and route `/help` to it.
- **Rebuild natively (recommended long term).** Recreate the design in your app's
  existing environment (React/Vue/Next/whatever `/help` should live in) so the
  guide inherits your layout shell, auth and deploy pipeline. This README plus the
  source file is enough to do that without having been in the design conversation.

## Fidelity
**High fidelity.** Colours, type, spacing, shadows, radii and copy are final.
Recreate them exactly; the values are all listed under Design tokens below.

## Files in this bundle

| File | What it is |
|---|---|
| `pes-user-guide.standalone.html` | Fully inlined, offline-capable single file. Production-droppable. |
| `source/PES User Guide.dc.html` | The authored source: markup + a small vanilla-JS behaviour class. **This is the file to read when rebuilding.** |
| `source/support.js` | The runtime that renders the `.dc.html` source. Not needed if you rebuild natively. |
| `source/_ds/…/tokens/*.css` | The design tokens (colours, type, spacing, elevation, radius). Port these into your codebase's token layer. |

## Structure of the page
One scrolling document, two columns at ≥1040px:

- **Left, 296px:** sticky nav — logomark + wordmark, a search input, then the TOC
  link list. `position: sticky; top: 0; max-height: 100vh; overflow-y: auto`.
  White surface, 1px right divider, 24px 20px 48px padding.
- **Right, max 820px:** the document. 32px 48px 140px padding on desktop,
  24px 20px 96px on mobile.
- **Below 1040px:** single column; the nav is hidden and opens as a drawer from a
  "Contents" button in the top bar; it closes again when a link is tapped.

Sections, in order: Part 0 Start here · Part 1 Setting up an organization ·
Part 2 Building your organization · Part 3 Your role, day to day (3.1–3.7, one
chapter per role) · Part 4 The evaluation cycles (4.1 appraisal, 4.2 performance,
4.3 stress, 4.4 motivation) · Part 5 The mathematical models · Part 6 Goals,
recognition and records · Part 7 Maintenance model, work sampling and surveys ·
Part 8 Account and billing · Part 9 Troubleshooting · Appendix A role and
permission reference · Appendix B glossary · Appendix C to confirm with the
product team.

Each `<section>` carries three attributes the behaviour depends on:
`data-sec` (id used by the TOC), `data-roles` (space-separated role keys or
`all`), `data-title` (extra searchable text).

## Interactions & behaviour
All of it is progressive enhancement over static markup — the document is fully
readable with JS disabled.

1. **Role filter chips.** Keys: `all`, `employee`, `dept-admin`, `hod`,
   `unit-head`, `auditor`, `admin`, `super-admin`. Picking one sets
   `data-dim="true"` on every section whose `data-roles` does not match, which
   applies `opacity:.28; filter:saturate(.4)` — dimmed, never removed, so a reader
   can still scroll into it. The matching TOC link keeps `opacity:1`; others go to
   `.4`. Selected chip: `brand-600` fill, white label, no border. Unselected:
   white surface, `border-input` 1px, `text-strong-secondary` label. Pill radius,
   34px tall, `aria-pressed` reflects state.
2. **Search.** Filters the TOC only (not the body). Matches against
   `data-title + textContent`, case-insensitive; non-matching links get
   `display:none`; a "No section matches that search." row appears at zero hits.
3. **Scroll spy.** IntersectionObserver, `rootMargin: '-10% 0px -70% 0px'`. The
   topmost intersecting section's TOC link gets `background: brand-50`,
   `color: brand-900`, `font-weight: 600`.
4. **Theme toggle.** Light/dark, persisted in `localStorage` under
   `pes-guide-theme`. Dark mode redefines the token custom properties on
   `documentElement[data-theme="dark"]` — see the `[data-theme="dark"]` block in
   the source `<style>`; port it verbatim.
5. **Print.** A print stylesheet hides the TOC, top bar and filter card, expands
   the content to full width, starts major parts on fresh pages
   (`break-before: page` on `[data-print-break]`), un-dims filtered sections,
   prints `href` targets after internal links, and forces the pipeline stages to
   1pt black-on-white so they read in greyscale.

## Configurable options
Exposed as three props on the root component; keep the equivalents when rebuilding:
`defaultTheme` (`light` | `dark`), `defaultRole` (any role key, default `all`),
`showEditorNotes` (boolean — set false to hide the dashed editor's-note and
screenshot-placeholder blocks in a published build).

## Design tokens
Brand hue 232, slate indigo. Light mode:

- Brand: 50 `hsl(232,80%,96%)` · 100 `hsl(232,70%,91%)` · 500 `hsl(232,60%,55%)` ·
  600 `hsl(232,58%,47%)` · 700 `hsl(232,58%,39%)` · 900 `hsl(232,62%,18%)`
- Neutral: 50 `hsl(232,14%,98%)` · 100 `hsl(232,12%,95%)` · 200 `hsl(232,10%,90%)` ·
  300 `hsl(232,8%,82%)` · 400 `hsl(232,6%,62%)` · 500 `hsl(232,6%,48%)` ·
  700 `hsl(232,6%,28%)` · 900 `hsl(232,8%,12%)`
- Success 50/600/900 `hsl(152,70%,95%)` / `hsl(152,58%,32%)` / `hsl(152,65%,12%)`
- Warning 50/600/900 `hsl(38,90%,95%)` / `hsl(38,85%,38%)` / `hsl(38,88%,14%)`
- Danger 50/500/600/900 `hsl(4,80%,96%)` / `hsl(4,74%,54%)` / `hsl(4,72%,42%)` / `hsl(4,78%,14%)`
- Page background `neutral-50`; card surface `#ffffff`; divider `neutral-200`;
  input border `neutral-300`; link `brand-600`, hover `brand-700`.
- Text on a tint always uses that tint's own 900 stop.

Type: Inter, **weights 400 and 600 only**, antialiased, tabular numerals.
Page title 34/1.15/-0.8px 600 · part heading 28/1.2/-0.5px 600 · sub-chapter
22/1.25/-0.3px 600 · sub-head 18/1.3/-0.2px 600 · lead body 16–17/1.65 400 ·
body 14–15/1.65 400 · label 12/1.4 600 uppercase +0.04em · caption 13/1.5 400.
Body text is capped at `66ch` with `text-wrap: pretty`.

Spacing: 4px grid — 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64. Headings take
more space above than below (32 above, 8–12 below). Parts are separated by 72px,
sub-chapters by 56px.

Radius: 6px buttons and inputs · 10px cards, tables and callout right edge ·
9999px chips and stage numerals.

Elevation (never combined with a border on the same element):
- `shadow-1` `0 1px 2px hsla(232,30%,15%,.06), 0 1px 4px hsla(232,30%,15%,.04)`
- `shadow-2` `0 2px 8px hsla(232,30%,15%,.08), 0 4px 16px hsla(232,30%,15%,.06)`
- `shadow-3` `0 8px 24px hsla(232,30%,15%,.10), 0 16px 48px hsla(232,30%,15%,.08)`

## Component patterns to build once and reuse
- **Card** — white surface, `shadow-2`, 10px radius, 18px padding, no border.
  Variant: 2px top-edge accent line in `brand-600` or a semantic colour.
- **Callout** — 3px left border + matching 50-tint background, `0 8px 8px 0`
  radius, 14px 16px padding, an uppercase 12px label then 14/1.6 body, all in the
  tint's 900 colour. Four kinds: *Who can do this* (brand), *Before you start*
  (brand), *Watch out* (warning), *Admin only* (danger).
- **Table** — wrapped in `overflow-x: auto` inside a shadow-2 card so tables
  scroll in their own container and never make the page scroll sideways. Give the
  table a `min-width`. Header cells are the 12px uppercase label role; rows are
  divided by 1px `neutral-200`, with no divider on the last row.
- **Pipeline stage** (appraisal, seven stages) — a vertical stack of shadow-1
  cards, each with a 24px `brand-600` numeral circle absolutely positioned at
  left 16, top 14, and 52px left padding; a 2px × 14px `brand-100` connector sits
  between consecutive stages. Stage 5 (auditor) uses the warning tint, stage 7
  (approved) the success tint. Each card shows the stage name and, beneath it, the
  party it is waiting on.
- **Stage chips** (performance, five stages) — pill chips separated by `→`
  characters, wrapping on narrow screens.
- **Role chapter grid** — four equal cards on a
  `repeat(auto-fit, minmax(240px,1fr))` grid: what you can see · what you must do ·
  what is waiting on you · what you cannot do and why.
- **Editor's note / screenshot placeholder** — 1px dashed `neutral-300`, 8px
  radius, 13/1.6 `text-secondary`. Hidden when `showEditorNotes` is false.

## Assets
None external. The only graphic is an inline Lucide `shield-check` SVG
(1.5px stroke, `brand-600`) beside the wordmark, and inline `→` glyphs in the
stage chips. No fonts are fetched over the network in the standalone build.

## Accessibility
`<nav aria-label="Table of contents">`, `<main>`, a real h1 → h2 → h3 → h4
hierarchy, `role="group"` on the chip set with `aria-pressed` per chip,
`aria-expanded` on the drawer button, connectors marked `aria-hidden`, and
keyboard-reachable TOC, chips and toggles. Contrast targets WCAG AA in both
themes.

## Content accuracy — please read before editing
The guide deliberately invents nothing: no screenshots, shortcuts, button
labels, URLs, error messages, support contacts, prices or SLAs beyond what the
product team supplied. Fourteen open questions are collected in **Appendix C**,
and two editor's notes plus one screenshot placeholder are marked inline. When
those are answered, move the answer into the body and delete its Appendix C
entry — don't leave both.
