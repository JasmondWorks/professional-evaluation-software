# RentVault Design System

RentVault is a **peer-to-peer lending platform with on-chain collateral**. People
lend physical items (cameras, tools, instruments, equipment) to borrowers; a smart
contract locks the borrower's collateral, and if the item isn't returned on time
the contract **executes a penalty automatically** — the lender never has to chase
anyone. The brand promise: *"Lend anything. Fear nothing."*

Built for the Nigerian market — currency is the Naira (**₦**), identity is
verified by **BVN / NIN**, and the system is **light-mode only**, brand hue **232
(slate indigo)** throughout.

Two journeys:

- **Lender** — registers, verifies identity, then manages items, agreements,
  borrowers, locked collateral, and the on-chain activity log from a dashboard.
- **Borrower** — discovers a rental by scanning the lender's QR, verifies identity,
  reviews and signs the agreement, funds the refundable collateral via Paystack,
  and gets a live confirmation. Mobile-first web (no account required to start).

This project is the design system powering RentVault: color, type, spacing,
elevation, the component primitives, and high-fidelity UI kits for both the
lender (web) and borrower (mobile) journeys.

---

## Sources

No external codebase, Figma file, or slide deck was provided. This system is
authored from the written brand + UI specification supplied with the project
brief (the "Universal UI Design System" + RentVault brand constants, plus the
**Journey A — Lender** screen specs, A-01 through A-04). If a RentVault codebase
or Figma file exists, link it here so a future reader can reconcile this system
against the source of truth.

- Codebase: _none provided_
- Figma: _none provided_
- Brand spec: provided inline (brand hue 232, Inter, Naira, BVN/NIN, on-chain collateral)

---

## CONTENT FUNDAMENTALS

How RentVault writes.

**Voice.** Calm authority. Institutional, serious, reassuring — this product
holds people's money and property on-chain, so copy never hypes and never panics.
The headline *"Lend anything. Fear nothing."* sets the tone: short, declarative,
confident. The restraint is the message.

**Person.** Address the user as **you**. Refer to RentVault / the chain as the
quiet machinery behind the scenes ("The contract executes the penalty
automatically"). Confirmations are matter-of-fact: "Identity verified. Your
account is active."

**Casing.** Sentence case everywhere — buttons, headings, menu items. The only
uppercase is the `label` type role (form labels, table headers, stat-card labels,
nav labels), tracked at +0.04em. Never Title Case headings.

**Buttons describe outcomes, not actions.** "Create lender account," "Verify and
open dashboard," "View agreement" — never "Submit," "OK," "Continue" alone.
Forward motion often carries a trailing arrow ("Continue to verification →").

**Numbers are first-class.** Naira amounts, collateral totals, counts, and
overdue days are always tabular-nums and usually the loudest thing on a card.
Currency shows the ₦ symbol with grouped thousands (`₦420,000`). Dates are
`Friday, 19 June 2026` in greetings, `19 Jun 2026` in dense contexts. Wallet
addresses and tx hashes render truncated in a monospace stack.

**State language is a fixed vocabulary** mapped to the semantic colors:
**Active / Returned / Verified** (success, green), **Pending / Overdue /
Expiring** (warning, amber), **Penalty / Disputed / Failed** (danger, red),
**Pending** as a brand-tinted neutral where it means "awaiting borrower." Reuse
these exact words; don't invent synonyms per screen.

**Tone examples.**
- Splash headline: "Lend anything. Fear nothing."
- Splash body: "Smart contracts hold your collateral. Penalties execute automatically. You never have to chase anyone."
- Overdue banner: "Tunde Bakare has not returned the Canon EOS R6 — 2 days overdue. A penalty of ₦10,000 has been auto-deducted."
- Verify success: "Identity verified. Your account is active. Redirecting to your dashboard…"
- Privacy caption: "Your BVN is only used to verify your identity. It is never stored in plain text."

**No emoji.** None. Status is carried by Lucide icons + a label word. No
exclamation-mark hype, no marketing adjectives in product UI.

---

## VISUAL FOUNDATIONS

The look is **quiet, institutional, trustworthy** — fintech restraint with a
single slate-indigo accent and generous white space.

**Color.** One brand hue: **232 (slate indigo)**. Brand color appears only on
interactive things — buttons, links, selected option cards, the active-nav
accent, stat-card top accents. Neutrals carry a faint 6–14% trace of hue 232 so
grays feel crafted, not generic. Semantic color (green / amber / red) means
**state**, never decoration. Text on any tint uses that tint's own 900 stop
(`brand-900` on `brand-50`, `warning-900` on `warning-50`), never `neutral-900`
on a colored background.

**Type.** Inter, **weights 400 and 600 only** — no 300/500/700/800 anywhere.
600 is reserved for headings, key numbers, and CTA labels; everything else is
400. Antialiased globally; all numerics use tabular-nums. Scale: display 28 →
title 22 → subtitle 18 → body-lg 16 → body 14 → label 12 (uppercase, tracked) →
caption 12 → micro 11. A monospace stack is used only for wallet addresses and
tx hashes.

**Spacing.** Strict 4px grid (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64).
Grouping is done with **distance, not boxes**: ~8px apart = same group, ~32px
apart = separate groups. A heading always has more space above than below
(e.g. 32 above / 8–12 below) so it binds to the content it introduces.

**Backgrounds.** Flat. Page background is `neutral-50`; surfaces are pure white.
No gradients, no photographic hero washes, no patterns, no splash illustration —
the auth screens are deliberately bare. The restraint signals seriousness.

**Elevation & cards.** A card **is** its shadow: white surface, `shadow-2`, 10px
radius, **no border**. Never a border and a shadow on the same element. Shadows
are tinted with the brand hue at very low opacity, never pure black. One sanctioned
exception, used on dashboard stat cards: a 2px brand/semantic **top-edge accent
line** that color-codes the metric (treated like the allowed sticky-bar top edge).
Three shadow levels: subtle panels (1), cards & dropdowns (2), modals & drawers (3).

**Borders are rationed.** Only: input fields, dividers between data-list rows
(never wrapping the group), the focus ring, the 3px left accent on alert banners,
the top edge of sticky bars + stat-card accents, and the 1.5px `brand-500`
selected state on option cards (with a `brand-50` tint).

**Corners.** Buttons & inputs 6px, cards/modals/dropdowns 10px, large feature &
auth cards 16px, pill (9999px) for badges and chips only. Checkboxes 4px.

**Animation.** Restrained. Cards lift `shadow-2` → `shadow-3` over ~200ms on
hover; option-card inputs slide down on select; short ease-outs (~150–200ms) on
color, shadow, opacity. No bounce, no infinite loops, no parallax. Motion
confirms a state change; it never decorates.

**Hover / press.** Hover darkens brand fills one stop (600 → 700) or lifts a
card's shadow; ghost/secondary hovers shift to a faint tint (`brand-50` /
`neutral-200`). No scale-down press state — feedback is the color/shadow shift
plus the 2px `brand-500` focus ring with a 3px `brand-50` halo.

**Transparency & blur.** Only for scrims behind modals/drawers. No frosted glass,
no translucent chrome.

**Layout.** Web: `neutral-50` page, 240px white sidebar with a 1px right divider,
64px white topbar with a 1px bottom divider, 40px content padding. Auth screens:
centered single column, ~400–480px, 24px gutters, 64px vertical breathing room.

---

## ICONOGRAPHY

**Family: Lucide, 1.5px stroke, never filled, never mixed with another set.**
Lucide is loaded from CDN (`lucide@latest`) in cards and kits — no local sprite
was provided. If you vendor icons, drop the SVGs in `assets/icons/` and keep the
1.5px outline style.

**Sizes.** 14px inline with caption/micro + timeline nodes, 16px inside inputs,
20px for nav + action buttons + row icons, 22–24px for stat-card + category
icons, 48px for the splash shield + empty states.

**Rules.** Icon-to-label gap is always 8px; the icon aligns to cap-height, not
baseline. An icon must replace a word or reinforce meaning — decorative icons are
removed. **No emoji, no unicode glyphs as icons.**

Common icons: `shield` / `shield-check` (collateral, protection, the logomark),
`package` (items), `file-text` (agreements), `users` (borrowers), `activity`
(chain log), `zap` (penalty / chain connected), `clock` (overdue / pending),
`alert-triangle` (overdue / warning), `credit-card` (BVN), `id-card` (NIN),
`bell`, `settings`, `layout-dashboard`, `camera`. The RentVault logomark is a
**shield** in `brand-600` beside the wordmark.

---

## INDEX

Root manifest.

- **`styles.css`** — global entry point; `@import`s every token + font file.
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `elevation.css`,
  `radius.css`, `fonts.css`, `base.css`.
- **`assets/`** — `rentvault-logo.svg` (lockup), `rentvault-mark.svg` (shield mark).
- **`guidelines/`** — foundation specimen cards (Colors, Type, Spacing,
  Elevation, Radius, Brand) shown in the Design System tab.
- **`components/core/`** — reusable primitives: `Button`, `IconButton`, `Input`,
  `Select`, `Checkbox`, `Switch`, `Card`, `Badge`, `Avatar`, `Tabs`,
  `AlertBanner`, `Stepper`, `StatCard`, `ListRow`, `EmptyState`. Each has
  `.jsx` + `.d.ts` + `.prompt.md`, plus one `@dsCard` HTML.
- **`ui_kits/web/`** — Lender journey recreation, wired as a click-through in
  `index.html`: splash (A-01), create account (A-02), identity verification
  (A-03), dashboard home (A-04), list an item (A-05), new agreement 3-step flow
  (A-06), QR awaiting borrower (A-07), and active agreement detail (A-08), plus
  the confirm-return modal (A-09) and penalty-executed screen (A-10).
- **`ui_kits/mobile/`** — Borrower journey recreation (mobile-first, in a phone
  frame), wired as a click-through in `index.html`: QR scan landing (B-01),
  identity verification (B-02), agreement review & sign (B-03), fund collateral
  /Paystack (B-04), and collateral-funded confirmation (B-05).
- **`SKILL.md`** — Agent-Skill wrapper for downloading + reuse.

Generated by the compiler (do not edit): `_ds_bundle.js`, `_ds_manifest.json`,
`_adherence.oxlintrc.json`.
