# Guide screenshots

The user guide (`/help`) renders screenshots from this folder. The files are
not in the repository — they are captured from a running organization — so a
figure whose file is missing shows a labelled slot naming the file it wants and
the screen to capture, instead of a broken image. Drop a file in and it appears
on the next load, with no code change.

Expected files, and where to capture each:

| File | Capture |
|---|---|
| `handoff-period-open.png` | Data entry → Performance, as an organization admin |
| `handoff-staff-scoring.png` | Performance → My performance, as a member of staff |
| `auditor-accept-form.png` | The invitation link, before approval |
| `auditor-consent-profile.png` | Profile, signed in as an approved auditor |
| `auditor-queue.png` | Audit Queue, signed in as an approved auditor |

PNG, captured at a desktop width. The guide scales them to the content column
and prints them with the rest of the page.

To add a figure to a section, give that section a `figures` array in
`app/help/sections.ts` — see `GuideFigureSpec` in `app/help/GuideFigure.tsx`.
