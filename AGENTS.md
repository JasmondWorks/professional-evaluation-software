# AGENTS.md — Working conventions for this project

Guidance for AI agents (and humans) contributing to the PES (Professional
Evaluation Software) codebase. Keep this file short and additive.

## UI / UX constraints

### Disabled controls must always explain themselves
A button (or any control) that is disabled MUST tell the user **why**, right next
to it — never leave a bare greyed-out control with no context. Use one of:

- an **info icon** with a tooltip/title, and/or
- a short **message card** or inline helper line beside/under the control
  stating the reason and, ideally, what to do to enable it.

This applies especially where the reason is non-obvious (a workflow gate, a
missing prerequisite, a permission, an empty queue). Examples in this repo:
- "Run ANOVA & Generate Report" — blocked until a setting is computed, theme/
  feeling data is collected, and all submissions are approved (shows the reason).
- "Approve entire division" — when nothing is awaiting approval, show a card
  saying so rather than a silent disabled button.

Rule of thumb: **if a user could reasonably ask "why can't I click this?", the
answer must already be on the screen.**

## Data / correctness constraints

- **Organization isolation:** every query is scoped by `org`. No data may leak
  between organizations. Staff counts/listings must be identical for all users
  of the same org and consistent across every page (single source of truth =
  the `pesuser` roster, org-scoped).
- **Stress evaluation:** never mix cycles — scope Form 5 data to the effective
  settings cycle. Faculty stress = mean of its departments; organization stress
  = mean of its faculties. See project memory `stress-eval-rules`.
