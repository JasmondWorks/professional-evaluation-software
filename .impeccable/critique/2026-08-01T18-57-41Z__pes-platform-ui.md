---
target: whole platform UI
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-01T18-57-41Z
slug: pes-platform-ui
---
# PES Platform Critique (whole-app)

Method: dual-agent (A: design review · B: detector+evidence). Operate mode.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons on dashboard but bare "Loading…" text and emoji-string save messages elsewhere |
| 2 | Match System / Real World | 3 | Strong domain vocab in models; ambiguous sibling nav labels |
| 3 | User Control and Freedom | 2 | Ad-hoc back buttons, no breadcrumbs, no undo on saved calcs |
| 4 | Consistency and Standards | 1 | Three coexisting input/button/tab languages; no shared tokens |
| 5 | Error Prevention | 2 | Good model validators; NaN writes in data-entry; stray `~` bug in layout |
| 6 | Recognition Rather Than Recall | 2 | gray-400 nav labels; cross-model links rely on memory |
| 7 | Flexibility and Efficiency | 1 | Global search commented out; no shortcuts/bulk actions |
| 8 | Aesthetic and Minimalist | 2 | Debug labels + one-off widths shipped; 15.5px body + universal reset |
| 9 | Error Recovery | 2 | Native alert() still used; errors not tied to fields |
| 10 | Help and Documentation | 3 | Inline PDF guides + InfoPopover hints — genuine strength |
| **Total** | | **20/40** | **Acceptable (bottom) — significant work needed** |

## Design Specificity Verdict
Split personality: domain-authored model pages (personnel-utilization, staff-number, student-teacher) + mature em-database/Employee.tsx, wrapped in category-interchangeable admin chrome. Dead TailAdmin e-commerce components (app/components/ecommerce/*) confirm bought-template origin.

## Deterministic scan
45 detector findings (all warning): 25 border-accent-on-rounded, 9 ai-color-palette (indigo/purple), 7 side-tab, 2 gray-on-color, 1 gradient-text, 1 broken-image (false positive). Hotspot: evaluation/staff/sampling/sampling.tsx (9).
Token evidence: -pes-* used 444×, orng/grn ~dead (1 each); 96 raw hex (36 distinct), brand #322b80 hardcoded 36×; 194 raw <button> across 81 files vs shared Button used 1×; 6 competing border radii; Lato font commented out at root (admin only gets it); 50 console.log; aria-* only 5; no real dark mode.

## Priority Issues
- [P0] No design tokens; three coexisting form/button/tab languages. Extract model-page input + bg-pes button into shared components; add real tokens; retrofit dated pages.
- [P1] Shell is dated + identity-free while pages are modern. Redesign sidebar/navbar; delete dead ecommerce/ folder.
- [P2] Global search commented out across ~100 routes. Ship as command palette.
- [P3] Native alert() + emoji-string status instead of existing notify toast.
- [P3] Shipped debug/placeholder artifacts (debug class labels, stray ~, literal "signature").

## Persona Red Flags
Alex: no search, no shortcuts, no bulk actions, re-enter 15 params each visit.
Sam: gray-400 nav fails contrast; dynamic bg-${color} classes may not render; sliders lack aria-label; 15.5px body fights font scaling.
Jordan: four indistinguishable sibling nav items; no onboarding; safety net (InfoPopover) missing on dated pages.
