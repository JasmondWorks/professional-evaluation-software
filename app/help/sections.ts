// The user guide's content, section by section.
//
// The copy, headings and inline styling are the design bundle's
// ("Appraisal pipeline design component (1)/PES User Guide.dc.html") carried
// across verbatim — it is a finished document, and retyping it as JSX would
// only introduce drift. The page renders each section's markup inside a
// wrapper it controls, which is what the role filter, the search and the
// scroll spy act on.
//
// The one section that is NOT from the bundle is `plans`, in PlansSection.tsx:
// it is generated from the billing catalogue and the entitlement matrix so the
// published table cannot disagree with what the software enforces.

export type GuideSection = {
  id: string;
  /** Roles this section applies to; ["all"] shows for every filter. */
  roles: string[];
  /** The label used in the contents list. */
  title: string;
  /** Start a new page here when printed. */
  printBreak?: boolean;
  /** Rendered markup, or null for a section the page composes itself. */
  html: string | null;
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "p0",
    roles: ["all"],
    title: "Start here \u2014 what PES does and how work flows",
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 0</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Start here</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 16px;max-width:66ch;text-wrap:pretty">PES turns your workforce data into evaluation decisions you can defend. Staff record their own work, their department checks it, the head of department counter-scores it, and the organization's administrator runs the evaluation and releases the results. Behind that workflow sit fourteen mathematical models that do the actual arithmetic — staffing levels, utilization, stress, productivity — so a decision is never just an opinion.</p>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 24px;max-width:66ch;text-wrap:pretty">Everything you see is scoped to your organization. Data never crosses from one organization to another.</p>

      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin:0 0 32px">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:16px;border-top:2px solid var(--brand-600)">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 6px">Step one</div>
          <div style="font-size:15px;font-weight:600;margin:0 0 4px">Staff record</div>
          <div style="font-size:13px;line-height:1.5;color:var(--text-secondary)">Forms, goals, stress instrument, model data entry.</div>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:16px;border-top:2px solid var(--brand-600)">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 6px">Step two</div>
          <div style="font-size:15px;font-weight:600;margin:0 0 4px">Department verifies</div>
          <div style="font-size:13px;line-height:1.5;color:var(--text-secondary)">The departmental administrator checks, the head counter-scores.</div>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:16px;border-top:2px solid var(--brand-600)">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 6px">Step three</div>
          <div style="font-size:15px;font-weight:600;margin:0 0 4px">Establishment releases</div>
          <div style="font-size:13px;line-height:1.5;color:var(--text-secondary)">The organization admin runs the evaluation and releases results.</div>
        </div>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">Find your role</h3>
      <p style="font-size:15px;line-height:1.6;color:var(--text-secondary);margin:0 0 16px">Your organization may display a different name for your role — a custom role such as "Paginator" always sits on top of one of these presets, and the preset is what decides what you can see.</p>
      <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">
        <a href="#p3-employee" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Employee</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Academic or non-academic staff →</span></a>
        <a href="#p3-deptadmin" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Departmental Administrator</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Forms 8 and 9, departmental checks →</span></a>
        <a href="#p3-hod" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Department Lead (HOD)</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Counter-scoring and approval →</span></a>
        <a href="#p3-unithead" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Faculty / Division Head</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Above the HODs →</span></a>
        <a href="#p3-auditor" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Auditor</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Contested appraisals, final say →</span></a>
        <a href="#p3-admin" style="display:block;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px;color:inherit"><span style="display:block;font-size:15px;font-weight:600;color:var(--text-primary);margin:0 0 2px">Organization Admin</span><span style="display:block;font-size:13px;color:var(--text-secondary)">Establishment, Personnel, HR →</span></a>
      </div>`,
  },
  {
    id: "p1",
    roles: ["admin", "super-admin"],
    title: "Setting up an organization \u2014 plan, payment, signup",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 1 · Admin and Super Admin</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Setting up an organization</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch;text-wrap:pretty">An organization is created by buying a plan, not by being invited. The person who completes signup becomes the organization's first administrator in the same step.</p>

      <div style="display:flex;gap:12px;border-left:3px solid var(--brand-600);background:var(--brand-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 24px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-900);margin:0 0 4px">Before you start</div><div style="font-size:14px;line-height:1.6;color:var(--brand-900)">Have the email address of the person who will administer PES day to day. It is collected during signup and becomes the first administrator's own login — not a shared departmental mailbox.</div></div>
      </div>

      <ol style="margin:0 0 24px;padding:0 0 0 20px;font-size:15px;line-height:1.75;color:var(--text-strong-secondary)">
        <li style="margin:0 0 10px"><strong style="font-weight:600;color:var(--text-primary)">Open Pricing.</strong> Choose a product category — public, company or academic — and a plan: basic, standard or premium.</li>
        <li style="margin:0 0 10px"><strong style="font-weight:600;color:var(--text-primary)">Pay.</strong> Payment is taken through Paystack or PayPal.</li>
        <li style="margin:0 0 10px"><strong style="font-weight:600;color:var(--text-primary)">Complete signup.</strong> This creates the organization and its first administrator together.</li>
        <li style="margin:0 0 10px"><strong style="font-weight:600;color:var(--text-primary)">Fill in the organization profile</strong> — name, details and logo.</li>
        <li><strong style="font-weight:600;color:var(--text-primary)">Check what your plan includes.</strong> The combination of category and plan determines which of the fourteen models your organization has at all.</li>
      </ol>

      <div style="display:flex;gap:12px;border-left:3px solid var(--warning-600);background:var(--warning-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 20px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-900);margin:0 0 4px">Watch out</div><div style="font-size:14px;line-height:1.6;color:var(--warning-900)">Category × plan decides which models exist for your organization. Model Access (Part 2) then decides which of those models each role can reach. If a model is absent for your whole organization, no permission setting will bring it back — that is a plan question, not a permissions question.</div></div>
      </div>

      <div data-editor-note style="border:1px dashed var(--border-input);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.6;color:var(--text-secondary);margin:0 0 8px"><strong style="font-weight:600">Screenshot placeholder —</strong> the Pricing screen showing the three product categories and the three plan tiers, with one plan selected.</div>`,
  },
  {
    id: 'plans',
    roles: ['all'],
    title: 'Plans — what each institution type and tier includes',
    html: null,
  },
  {
    id: "p2",
    roles: ["admin", "super-admin"],
    title: "Building your organization \u2014 employees, roles, permissions, hierarchy, model access",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 2 · Admin</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Building your organization inside PES</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 24px;max-width:66ch;text-wrap:pretty">Do these in order. Each step depends on the one before it: you cannot assign a role to someone who is not in the Employee Database, and you cannot build a reporting hierarchy before the roles exist.</p>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">Adding employees</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">The Employee Database is the single source of truth for your staff roster. Add people one at a time, or upload them in bulk.</p>
      <div style="display:flex;gap:12px;border-left:3px solid var(--warning-600);background:var(--warning-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 24px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-900);margin:0 0 4px">Watch out</div><div style="font-size:14px;line-height:1.6;color:var(--warning-900)">Every page that shows a staff count reads this one roster, so the counts must agree everywhere. If two pages disagree, the roster is the thing to check first.</div></div>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">Roles: presets and custom roles</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">PES has a fixed set of preset roles. You may create custom roles with your own names, but every custom role must be mapped onto a preset. The preset decides what the person can see; the custom name is only what is displayed.</p>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);margin:0 0 24px">
        <table style="width:100%;min-width:640px;border-collapse:collapse;font-size:14px">
          <thead><tr>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Shown in the app as</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Preset key</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Who this is in real life</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Super Admin</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">super-admin</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Platform tier. Sees all organizations. Not assignable as a base role.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Admin</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">admin</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">The organization administrator — Establishment, Personnel or HR. Enters no scores.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Department Lead (HOD)</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">hod</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Head of department. Reviews, counter-scores and approves their department.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Departmental Administrator</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">dept-admin</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">The non-academic officer who records Forms 8 and 9 and prints the blank forms.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Faculty / Division Head</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">unit-head</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Dean or divisional head. Sits above the HODs.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Employee — Academic</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">lecturer</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Academic staff. Fills their own forms.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Employee — Non-Academic</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">industrial-engineer</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Non-academic staff, and the data-entry role for the models. Enters model data; never runs an evaluation.</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Employee (baseline)</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">employee-w</td><td style="padding:12px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Fallback surface for anyone whose role is not recognised.</td></tr>
            <tr><td style="padding:12px 16px;font-weight:600">Auditor</td><td style="padding:12px 16px;color:var(--text-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px">auditor</td><td style="padding:12px 16px;color:var(--text-strong-secondary)">External appraisal auditor. Decides contested appraisals; the decision is final.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">Permissions and their scopes</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">Fine-grained access is controlled by permissions, not by the role name. Each is a simple on/off; some carry a scope. A scope only means anything when its parent capability is granted.</p>
      <div style="display:grid;gap:8px;margin:0 0 20px">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px"><div style="font-size:15px;font-weight:600;margin:0 0 2px">Manage User Roles</div><div style="font-size:13px;color:var(--text-secondary)">No scope. Create roles, map them to presets, assign them.</div></div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px"><div style="font-size:15px;font-weight:600;margin:0 0 2px">Access Employee Data</div><div style="font-size:13px;color:var(--text-secondary)">Scope: all employees · subordinates · selected employees.</div></div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px"><div style="font-size:15px;font-weight:600;margin:0 0 2px">Define Performance Metrics</div><div style="font-size:13px;color:var(--text-secondary)">Scope: all · subordinates · selected. Required for Staff Determination.</div></div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px"><div style="font-size:15px;font-weight:600;margin:0 0 2px">Access Reporting Hierarchy</div><div style="font-size:13px;color:var(--text-secondary)">No scope.</div></div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px"><div style="font-size:15px;font-weight:600;margin:0 0 2px">Manage Performance Reviews</div><div style="font-size:13px;color:var(--text-secondary)">Scope: all · subordinates · selected. Required for Assessment.</div></div>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">The reporting hierarchy</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 24px;max-width:66ch">Assign each employee their manager, their head of department and their faculty head. Management levels run upward, with level 1 being the first level above supervisory staff. The hierarchy is what makes the "subordinates" permission scope mean something, so build it before you rely on that scope.</p>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">Model Access</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">The Models tab is not earned by role alone. On the Model Access screen you decide, per role and per model, which models are visible. The server enforces the same rule, so a blocked model cannot be reached by typing its address.</p>
      <div style="display:flex;gap:12px;border-left:3px solid var(--danger-500);background:var(--danger-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 24px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--danger-900);margin:0 0 4px">Admin only</div><div style="font-size:14px;line-height:1.6;color:var(--danger-900)">Model Access is visible to Admin and Super Admin only. Non-academic employees see exactly the models you switch on for them here, and nothing else.</div></div>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px">The two stress-visibility toggles</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">Two read toggles are set per person: <strong style="font-weight:600;color:var(--text-primary)">view department stress</strong> and <strong style="font-weight:600;color:var(--text-primary)">view faculty stress</strong>. They decide whether that staff member may see their own department's or faculty's aggregated stress results. Nothing else grants that access.</p>`,
  },
  {
    id: "p3",
    roles: ["all"],
    title: "Your role, day to day",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 3</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Your role, day to day</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0;max-width:66ch;text-wrap:pretty">One short chapter per role. Each answers the same four questions: what you can see, what you must do, what is waiting on you, and what you cannot do and why.</p>`,
  },
  {
    id: "p3-employee",
    roles: ["employee"],
    title: "3.1 Employee \u2014 academic and non-academic staff",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.1 Employee — academic and non-academic</h3>
      <div style="display:flex;gap:12px;border-left:3px solid var(--brand-600);background:var(--brand-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 20px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-900);margin:0 0 4px">Who can do this</div><div style="font-size:14px;line-height:1.6;color:var(--brand-900)">Employee — Academic, Employee — Non-Academic, and the baseline Employee role.</div></div>
      </div>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Dashboard, Goals, Data Entry, Performance Review, My Awards and Profile. Non-academic staff also see Staff Determination when they have Define Performance Metrics, and the Models the admin has switched on for them.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Fill in your own appraisal and performance entries, set and update your goals, and complete the stress instrument in Data Entry when a cycle is open. Non-academic staff also enter model data.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">An appraisal at <em>being filled in</em>, and an appraisal at <em>awaiting the member of staff</em> — where you accept the head's adjusted score or contest it and send it to the auditor. Performance entries reach the same accept-or-contest step.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You cannot run an evaluation or release results — that is Establishment's job. You cannot see other people's scores. You can only see department or faculty stress results if your administrator has switched on the matching toggle for you.</p>
        </div>
      </div>`,
  },
  {
    id: "p3-deptadmin",
    roles: ["dept-admin"],
    title: "3.2 Departmental Administrator \u2014 Forms 8 and 9",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.2 Departmental Administrator</h3>
      <div style="display:flex;gap:12px;border-left:3px solid var(--warning-600);background:var(--warning-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 20px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-900);margin:0 0 4px">Watch out</div><div style="font-size:14px;line-height:1.6;color:var(--warning-900)">You are deliberately a different person from the head of department. The HOD's counter-score has to be independent of the appraisee's own score; if one person did both jobs, the accept-or-contest step and the auditor referral would mean nothing.</div></div>
      </div>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Dashboard, Data Entry, Performance Review, My Awards and Profile. You do not see the Goals tab.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Print the blank forms for your department, record Forms 8 and 9, and verify submitted appraisals against the paper originals before they reach the head of department.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Every appraisal at <em>being filled in</em> (jointly with the member of staff) and every appraisal at <em>awaiting departmental verification</em>. Nothing moves to the HOD until you have verified it.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You cannot counter-score, approve, run an evaluation or release results. Your role is to attest that what is in PES matches the paper record — nothing further.</p>
        </div>
      </div>`,
  },
  {
    id: "p3-hod",
    roles: ["hod"],
    title: "3.3 Department Lead HOD \u2014 counter-scoring and approval",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.3 Department Lead (HOD)</h3>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Your own staff-level tabs, plus the Employee Database when you have Access Employee Data. Your view of other people's records follows the scope on that permission — usually subordinates.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Review each verified appraisal in your department and enter your counter-score. Counter-score your department's performance results. Approve stress entries for your department — there is an approve-entire-division action when you need it.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Everything at <em>awaiting the head of department</em>, plus unapproved stress entries in the open cycle. You are also appraised yourself, and scored on performance by a randomly drawn sample of your own staff.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You cannot record Forms 8 and 9 — that belongs to the departmental administrator, so your counter-score stays independent. You cannot overturn an auditor's decision, run the evaluation, or release results.</p>
        </div>
      </div>`,
  },
  {
    id: "p3-unithead",
    roles: ["unit-head"],
    title: "3.4 Faculty or Division Head",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.4 Faculty / Division Head</h3>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">The staff-level tabs, plus the Employee Database when you have Access Employee Data. You sit above the heads of department in the reporting hierarchy, so a "subordinates" scope reaches their departments.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Approve appraisals that have been reviewed by the HOD, before they go to Establishment. Counter-score performance results for the departments under you.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Appraisals at <em>reviewed, awaiting approval</em>. You are also scored on performance by a randomly drawn sample of your own staff.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You cannot skip the HOD's review, and you cannot run the evaluation or release results. Faculty-level stress figures are means of departmental means — you cannot recompute them from individuals.</p>
        </div>
      </div>`,
  },
  {
    id: "p3-auditor",
    roles: ["auditor"],
    title: "3.5 Auditor \u2014 contested appraisals",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.5 Auditor</h3>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">The cases referred to you, and the auditor survey. You do not see the Goals tab, and you are outside the departmental hierarchy by design.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Decide contested appraisals and contested performance entries. Your decision is final and returns the record to the workflow.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Everything at <em>with the appraisal auditor</em>. Nothing else in the workflow can move past that stage while a case sits with you.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You do not fill in appraisals, set goals, or administer the organization. Independence is the whole point of the role.</p>
        </div>
      </div>`,
  },
  {
    id: "p3-admin",
    roles: ["admin"],
    title: "3.6 Organization Admin \u2014 Establishment, Personnel, HR",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.6 Organization Admin</h3>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin:0 0 20px">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Employee Database, Goals, Model Access, Assessment, Staff Determination, all Models, Pricing — and Maintenance Model if your organization has it enabled. You do not have the staff-level Data Entry tab.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Open the period, keep the roster and hierarchy accurate, set Model Access and the stress toggles, run the evaluation once approvals are in, and release the results.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Appraisals at <em>approved</em>, waiting to be evaluated and released. Escalated disagreements — see the tolerance band below — surface to you and to nobody else.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">You enter no scores at all. Scores come from the appraisee, the departmental administrator's records and the head's counter-score; if Establishment could also score, the evaluation would no longer be independent of the office that releases it.</p>
        </div>
      </div>
      <div style="display:flex;gap:12px;border-left:3px solid var(--danger-500);background:var(--danger-50);border-radius:0 8px 8px 0;padding:14px 16px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--danger-900);margin:0 0 4px">Admin only — the tolerance band</div><div style="font-size:14px;line-height:1.6;color:var(--danger-900)">There is a tolerance band of 10 between a staff member's self-score and the head's counter-score. Where the gap exceeds it, the disagreement is escalated. This runs in the background: neither the staff member nor the head sees the flag. It surfaces only to you.</div></div>
      </div>`,
  },
  {
    id: "p3-superadmin",
    roles: ["super-admin"],
    title: "3.7 Super Admin \u2014 platform tier",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">3.7 Super Admin</h3>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you can see</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Everything an Admin sees, plus All Organizations — the only tab that crosses organization boundaries.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you must do</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Platform-tier administration across organizations.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What is waiting on you</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Nothing in the departmental workflow routes to you. The evaluation queue belongs to each organization's own Admin.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">What you cannot do, and why</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Super Admin is not assignable as a base role for a custom role. Organization data stays scoped to its organization.</p>
        </div>
      </div>`,
  },
  {
    id: "p4",
    roles: ["all"],
    title: "The evaluation cycles",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 4</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">The evaluation cycles</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0;max-width:66ch;text-wrap:pretty">Four cycles run through PES. Each stage below names who it is waiting on — that is how the app itself talks about progress, and it is the fastest way to answer "why is this stuck?"</p>`,
  },
  {
    id: "p4-appraisal",
    roles: ["all"],
    title: "4.1 Appraisal \u2014 the seven stages",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">4.1 Appraisal</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch">An appraisal session moves through seven stages, in order.</p>

      <div style="display:flex;flex-direction:column;gap:0;margin:0 0 24px">
        <div data-pipe-stage style="position:relative;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--brand-600);color:var(--text-on-brand);font-size:12px;font-weight:600">1</span>
          <div style="font-size:15px;font-weight:600">Being filled in</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:2px 0 0">Waiting on the member of staff and the departmental administrator.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--brand-600);color:var(--text-on-brand);font-size:12px;font-weight:600">2</span>
          <div style="font-size:15px;font-weight:600">Awaiting departmental verification</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:2px 0 0">Waiting on the departmental administrator, who checks Forms 8 and 9 against the paper originals.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--brand-600);color:var(--text-on-brand);font-size:12px;font-weight:600">3</span>
          <div style="font-size:15px;font-weight:600">Awaiting the head of department</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:2px 0 0">Waiting on the HOD, who reviews each score and counter-scores.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--brand-600);color:var(--text-on-brand);font-size:12px;font-weight:600">4</span>
          <div style="font-size:15px;font-weight:600">Awaiting the member of staff</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:2px 0 0">Waiting on the appraisee, who accepts the adjusted score or contests it.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--warning-50);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--warning-600);color:#fff;font-size:12px;font-weight:600">5</span>
          <div style="font-size:15px;font-weight:600;color:var(--warning-900)">With the appraisal auditor</div>
          <div style="font-size:13px;color:var(--warning-900);margin:2px 0 0">Only if contested. Waiting on the external auditor, whose decision is final.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--brand-600);color:var(--text-on-brand);font-size:12px;font-weight:600">6</span>
          <div style="font-size:15px;font-weight:600">Reviewed, awaiting approval</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:2px 0 0">Waiting on the Dean, then Establishment / Personnel.</div>
        </div>
        <div aria-hidden="true" style="width:2px;height:14px;background:var(--brand-100);margin:0 0 0 27px"></div>
        <div data-pipe-stage style="position:relative;background:var(--success-50);border-radius:10px;box-shadow:var(--shadow-1);padding:14px 16px 14px 52px">
          <span style="position:absolute;left:16px;top:14px;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:var(--success-600);color:#fff;font-size:12px;font-weight:600">7</span>
          <div style="font-size:15px;font-weight:600;color:var(--success-900)">Approved</div>
          <div style="font-size:13px;color:var(--success-900);margin:2px 0 0">Establishment / Personnel run the evaluation and release results.</div>
        </div>
      </div>

      <div style="display:flex;gap:12px;border-left:3px solid var(--warning-600);background:var(--warning-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 16px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-900);margin:0 0 4px">Watch out — two things people get wrong</div><div style="font-size:14px;line-height:1.6;color:var(--warning-900)">First: the organization admin enters nothing. Their job is to open the period, run the evaluation and release results. Second: the departmental administrator and the head of department are two different people, so the counter-score stays independent of the appraisee's own score.</div></div>
      </div>`,
  },
  {
    id: "p4-performance",
    roles: ["all"],
    title: "4.2 Performance \u2014 five stages and the classification table",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">4.2 Performance</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 16px;max-width:66ch">Performance entries follow a shorter version of the same shape. The model scores competence, integrity, compatibility and use of resources against the RTP target.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 24px">
        <span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:9999px;background:var(--brand-50);color:var(--brand-900);font-size:13px;font-weight:600">1 Being filled in</span>
        <span aria-hidden="true" style="color:var(--neutral-400)">→</span>
        <span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:9999px;background:var(--brand-50);color:var(--brand-900);font-size:13px;font-weight:600">2 Submitted</span>
        <span aria-hidden="true" style="color:var(--neutral-400)">→</span>
        <span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:9999px;background:var(--brand-50);color:var(--brand-900);font-size:13px;font-weight:600">3 Awaiting the member of staff</span>
        <span aria-hidden="true" style="color:var(--neutral-400)">→</span>
        <span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:9999px;background:var(--warning-50);color:var(--warning-900);font-size:13px;font-weight:600">4 Referred to auditor</span>
        <span aria-hidden="true" style="color:var(--neutral-400)">→</span>
        <span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:9999px;background:var(--success-50);color:var(--success-900);font-size:13px;font-weight:600">5 Evaluated</span>
      </div>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch">Heads — both HODs and faculty heads — counter-score their department's performance results, and are themselves scored by a randomly drawn sample of their own staff.</p>

      <h4 style="font-size:15px;font-weight:600;margin:24px 0 8px">Classification, read off the raw overall percentage</h4>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2)">
        <table style="width:100%;min-width:420px;border-collapse:collapse;font-size:14px">
          <thead><tr>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Score</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Class</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Descriptive</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">91–100</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">1st Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Very Outstanding</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">81–90</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">2nd Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Excellent</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">66–80</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">3rd Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Very Good</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">50–65</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">4th Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Good</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">41–49</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">5th Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Fair</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-variant-numeric:tabular-nums">21–40</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">6th Class</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Poor</td></tr>
            <tr><td style="padding:11px 16px;font-variant-numeric:tabular-nums">0–20</td><td style="padding:11px 16px;font-weight:600">7th Class</td><td style="padding:11px 16px;color:var(--text-strong-secondary)">Very Poor</td></tr>
          </tbody>
        </table>
      </div>`,
  },
  {
    id: "p4-stress",
    roles: ["all"],
    title: "4.3 Stress \u2014 cycles and the two-level aggregation rule",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">4.3 Stress</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 16px;max-width:66ch">Stress evaluation runs in cycles governed by an effective settings cycle. Staff complete the stress instrument as a data-entry form; heads approve their department, with an approve-entire-division action available.</p>
      <div style="display:flex;gap:12px;border-left:3px solid var(--warning-600);background:var(--warning-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 20px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-900);margin:0 0 4px">Watch out</div><div style="font-size:14px;line-height:1.6;color:var(--warning-900)">Data must never mix across cycles. This is the single most common source of confusion: a figure that looks wrong is usually a figure from a different cycle. Check which cycle you are looking at before you check anything else.</div></div>
      </div>
      <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px;margin:0 0 20px;border-top:2px solid var(--brand-600)">
        <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);margin:0 0 8px">The aggregation rule</div>
        <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Faculty stress is the mean of its departments. Organization stress is the mean of its faculties.</p>
        <p style="font-size:14px;line-height:1.6;color:var(--text-secondary);margin:0">It is <strong style="font-weight:600;color:var(--text-primary)">not</strong> a mean of all individuals — a large department does not outweigh a small one at faculty level.</p>
      </div>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0;max-width:66ch">Whether a staff member can see department- or faculty-level stress results is controlled by the two per-person toggles the administrator sets.</p>`,
  },
  {
    id: "p4-motivation",
    roles: ["all"],
    title: "4.4 Motivation",
    html: `<h3 style="font-size:22px;font-weight:600;letter-spacing:-.3px;margin:0 0 12px">4.4 Motivation</h3>
      <p style="font-size:15px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 12px;max-width:66ch">The motivation model measures and compares employee motivation levels, and feeds the recognition surfaces described in Part 6 — motivation schemes and motivation awards.</p>
      <div data-editor-note style="border:1px dashed var(--border-input);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.6;color:var(--text-secondary)"><strong style="font-weight:600">Editor's note —</strong> the stage-by-stage workflow for motivation, if it has one distinct from ordinary model runs, is not documented in the source brief. Listed in Appendix C.</div>`,
  },
  {
    id: "p5",
    roles: ["all"],
    title: "The mathematical models \u2014 fourteen models and their prerequisites",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 5</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">The mathematical models</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch;text-wrap:pretty">Fourteen models. Each has a parameter form, validators tied to named equations, inline guidance, a result card and a history view. Which models your organization has depends on its product category and plan; which of those you can reach depends on Model Access.</p>

      <div style="display:flex;gap:12px;border-left:3px solid var(--brand-600);background:var(--brand-50);border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 24px">
        <div><div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-900);margin:0 0 4px">Who can do this</div><div style="font-size:14px;line-height:1.6;color:var(--brand-900)">Admin and Super Admin can reach the Models tab at all times. Employee — Non-Academic is the data-entry role: they enter model data and can open only the models the administrator has switched on, and they never run an evaluation.</div></div>
      </div>

      <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px;margin:0 0 28px;border-top:2px solid var(--warning-600)">
        <div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--warning-600);margin:0 0 10px">The one dependency you must not miss</div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px">
          <span style="display:inline-flex;align-items:center;height:34px;padding:0 14px;border-radius:6px;background:var(--brand-600);color:var(--text-on-brand);font-size:14px;font-weight:600">Personnel utilization</span>
          <span aria-hidden="true" style="color:var(--neutral-400);font-size:16px">→ feeds →</span>
          <span style="display:inline-flex;align-items:center;height:34px;padding:0 14px;border-radius:6px;background:var(--brand-50);color:var(--brand-900);font-size:14px;font-weight:600">Organization structure</span>
        </div>
        <p style="font-size:14px;line-height:1.6;color:var(--text-strong-secondary);margin:12px 0 0">Run personnel utilization first. The organization structure model cannot produce span-of-control results without the H index it produces.</p>
      </div>

      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:0 0 12px">Which model answers which question</h3>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);margin:0 0 24px">
        <table style="width:100%;min-width:600px;border-collapse:collapse;font-size:14px">
          <thead><tr>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Model</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">The question it answers</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Run it after</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Appraisal</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">How did each member of staff score against the target for their position or grade?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Approvals are in</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Performance</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">How do competence, integrity, compatibility and use of resources measure against the RTP target?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Motivation</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">How motivated are our people, and how do groups compare?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Stress</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Which workplace stress factors and what emotional fatigue are our staff carrying?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Cycle is open</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Organization structure</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Are our reporting hierarchies and spans of control sound?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--danger-600);font-weight:600">Personnel utilization</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Personnel utilization</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What is the H index, given lambda and mu?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Personnel redundancy</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Where does load suggest potential staff redundancy?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Productivity index</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What is our productivity and output rate?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Redundancy index</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What are the redundancy thresholds across departments?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Staff number</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">How many staff do we actually need, and what capacity do they have?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Student–teacher ratio</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What are our student-to-teacher ratios and how are classrooms distributed?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Utility index</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What utility and value is the institution delivering?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Future requirements</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">What staff, students or output should we expect in future?</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Recorded runs exist</td></tr>
            <tr><td style="padding:11px 16px;font-weight:600">Maintenance model</td><td style="padding:11px 16px;color:var(--text-strong-secondary)">When should each piece of equipment next be maintained?</td><td style="padding:11px 16px;color:var(--text-secondary)">Model enabled</td></tr>
          </tbody>
        </table>
      </div>

      <div data-editor-note style="border:1px dashed var(--border-input);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.6;color:var(--text-secondary)"><strong style="font-weight:600">Editor's note —</strong> several models are currently write-only: a run is saved, but there is not yet a screen to retrieve or report on the results. This guide does not name which, because the list was not supplied. See Appendix C.</div>`,
  },
  {
    id: "p6",
    roles: ["all"],
    title: "Goals, recognition and records \u2014 awards, Hall of Fame, Book of Records",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 6</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Goals, recognition and records</h2>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Goals</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Staff set and track their own goals. Everyone has the Goals tab except the Auditor and the Departmental Administrator.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Motivation schemes and awards</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Schemes define what is recognised; motivation awards are granted to named people under them.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">My Awards</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Your own awards, with their certificates and badges. Awards belong to the person, so staff take them with them.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Hall of Fame and Book of Records</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">The organization's standing record of recognised people and achievements.</p>
        </div>
      </div>`,
  },
  {
    id: "p7",
    roles: ["all"],
    title: "Maintenance model, work sampling and surveys",
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 7</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Maintenance model, work sampling and surveys</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch">The Maintenance Model tab appears only when your organization has the maintenance model enabled. It predicts maintenance intervals for equipment, and keeps a run history and a maintenance plan.</p>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Work sampling</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Studies, the positions being sampled, and the observations recorded against them.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Surveys</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Staff survey responses and auditor survey responses are recorded separately.</p>
        </div>
      </div>`,
  },
  {
    id: "p8",
    roles: ["all"],
    title: "Account and billing \u2014 profile, password, subscription",
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 8</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">Account and billing</h2>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Profile</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Your personal details and profile image, and where you change your password. There is a forgotten-password route if you cannot sign in. Staff-level roles have this tab.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:15px;font-weight:600;margin:0 0 6px">Pricing, subscriptions and renewals</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0">Plans, renewals and subscription events sit under Pricing, which is visible to Admin and Super Admin only. Your plan and product category determine which models your organization has.</p>
        </div>
      </div>`,
  },
  {
    id: "p9",
    roles: ["all"],
    title: "Troubleshooting \u2014 a tab is missing, a model is greyed out, my appraisal is stuck",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Part 9</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 20px">Troubleshooting</h2>

      <div style="display:grid;gap:12px">
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"A tab is missing from my sidebar."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">A tab appears only if your role is listed for it <em>and</em> any permission it requires is granted. Employee Database needs Access Employee Data; Assessment needs Manage Performance Reviews; Staff Determination needs Define Performance Metrics.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> your organization administrator, on the roles and permissions screen.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"A model is greyed out, or the Models tab is empty."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Two different causes. Either your organization's product category and plan do not include that model at all, or the administrator has not switched it on for your role in Model Access. Typing the address will not get you in — the server applies the same rule.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> the administrator — Model Access for the second case, the plan for the first.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"I can't enter a score."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Check the stage first: each stage accepts input from one party only. Then check the role — the organization admin enters no scores at all, and the departmental administrator records Forms 8 and 9 but never counter-scores.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> whoever the stage is waiting on. See <a href="#p4-appraisal">4.1</a>.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"My appraisal is stuck."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Read the stage name — it names the party being waited on. <em>Awaiting departmental verification</em> is with your departmental administrator; <em>awaiting the head of department</em> is with your HOD; <em>with the appraisal auditor</em> is out of the department entirely; <em>approved</em> is with Establishment, waiting for the evaluation to be run and released.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> the party the stage names.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"The numbers changed between two pages."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Staff counts everywhere read the Employee Database, so they must agree; if they do not, the roster has changed between the two views. For stress figures, the usual cause is different cycles — data never mixes across cycles. Remember too that faculty stress is the mean of departmental means, not of individuals, so it will not match an average you compute by hand.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> the administrator, for the roster; for stress, confirm the cycle first.</p>
        </div>
        <div style="background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:18px">
          <div style="font-size:16px;font-weight:600;margin:0 0 8px">"I can't see my department's stress results."</div>
          <p style="font-size:14px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 8px">Department- and faculty-level stress visibility is a per-person toggle, not a role and not a permission. If yours is off, no other setting will show you those results.</p>
          <p style="font-size:13px;color:var(--text-secondary);margin:0"><strong style="font-weight:600;color:var(--text-primary)">Who fixes it:</strong> your organization administrator, using the two stress-visibility toggles.</p>
        </div>
      </div>`,
  },
  {
    id: "appA",
    roles: ["all"],
    title: "Appendix A \u2014 role and permission reference, navigation table",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Appendix A</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 16px">Role and permission reference</h2>
      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:0 0 12px">Who sees which tab</h3>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);margin:0 0 24px">
        <table style="width:100%;min-width:660px;border-collapse:collapse;font-size:14px">
          <thead><tr>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Group · Tab</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Roles</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Permission required</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Dashboard</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Everyone</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Organization · Employee Database</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Admin, HOD, Faculty Head</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Access Employee Data</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Organization · All Organizations</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Super Admin</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Organization · Goals</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Everyone except Auditor and Departmental Administrator</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Organization · Model Access</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Admin, Super Admin</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Data Entry</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">All staff-level roles (not Admin / Super Admin)</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Assessment</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Admin, Super Admin</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Manage Performance Reviews</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Staff Determination</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Admin, Super Admin, Employee — Non-Academic</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Define Performance Metrics</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Performance Review</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Staff-level roles</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Models</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Admin and Super Admin always; Employee — Non-Academic only for switched-on models</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">Model Access setting</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · My Awards</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">All staff-level roles</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Evaluate · Maintenance Model</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Shown only when the organization has the maintenance model enabled</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Account · Profile</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">Staff-level roles</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">—</td></tr>
            <tr><td style="padding:11px 16px;font-weight:600">Account · Pricing</td><td style="padding:11px 16px;color:var(--text-strong-secondary)">Admin, Super Admin</td><td style="padding:11px 16px;color:var(--text-secondary)">—</td></tr>
          </tbody>
        </table>
      </div>
      <h3 style="font-size:18px;font-weight:600;letter-spacing:-.2px;margin:0 0 12px">Permissions and scopes</h3>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2)">
        <table style="width:100%;min-width:460px;border-collapse:collapse;font-size:14px">
          <thead><tr>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Permission</th>
            <th style="text-align:left;padding:12px 16px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-secondary);border-bottom:1px solid var(--border-divider)">Scope</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Manage User Roles</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">None</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Access Employee Data</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">All employees · Subordinates · Selected employees</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Define Performance Metrics</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-strong-secondary)">All · Subordinates · Selected</td></tr>
            <tr><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);font-weight:600">Access Reporting Hierarchy</td><td style="padding:11px 16px;border-bottom:1px solid var(--border-divider);color:var(--text-secondary)">None</td></tr>
            <tr><td style="padding:11px 16px;font-weight:600">Manage Performance Reviews</td><td style="padding:11px 16px;color:var(--text-strong-secondary)">All · Subordinates · Selected</td></tr>
          </tbody>
        </table>
      </div>`,
  },
  {
    id: "appB",
    roles: ["all"],
    title: "Appendix B \u2014 glossary: H index, lambda, mu, RTP target, tolerance band",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Appendix B</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 16px">Glossary</h2>
      <dl style="margin:0;background:var(--surface-card);border-radius:10px;box-shadow:var(--shadow-2);padding:4px 18px">
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">H index</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The personnel-utilization result, computed from lambda and mu. Required input for the organization structure model.</dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Lambda (λ)</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">Arrival-side input to personnel utilization, from queuing theory. <em>Definition to confirm — see Appendix C.</em></dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Mu (μ)</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">Service-side input to personnel utilization, from queuing theory. <em>Definition to confirm — see Appendix C.</em></dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">RTP target</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The target the performance model scores against, across competence, integrity, compatibility and use of resources.</dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Tolerance band</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">A band of 10 between a staff member's self-score and the head's counter-score. A wider gap escalates the disagreement, visible to the organization admin only.</dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Cycle</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The period governing stress evaluation, set by an effective settings cycle. Data never mixes across cycles.</dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Appraisal period</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The window the organization admin opens for an appraisal session, and closes by running the evaluation and releasing results.</dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Forms 8 and 9</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The paper appraisal forms the departmental administrator records in PES and verifies against the originals. <em>Their exact contents are not documented here — see Appendix C.</em></dd></div>
        <div style="padding:14px 0;border-bottom:1px solid var(--border-divider)"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Management level</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">A rung in the reporting hierarchy. Level 1 is the first level above supervisory staff.</dd></div>
        <div style="padding:14px 0"><dt style="font-size:15px;font-weight:600;margin:0 0 3px">Base role</dt><dd style="margin:0;font-size:14px;line-height:1.6;color:var(--text-strong-secondary)">The preset a custom role is mapped onto. The base role decides access; the custom name is only a label.</dd></div>
      </dl>`,
  },
  {
    id: "appC",
    roles: ["all"],
    title: "Appendix C \u2014 to confirm with the product team",
    printBreak: true,
    html: `<div style="font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-600);margin:0 0 8px">Appendix C</div>
      <h2 style="font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.5px;margin:0 0 12px">To confirm with the product team</h2>
      <p style="font-size:16px;line-height:1.65;color:var(--text-strong-secondary);margin:0 0 20px;max-width:66ch">Everything below was not settled by the source material. Nothing in the body of this guide asserts an answer to any of it.</p>
      <ol style="margin:0;padding:0 0 0 20px;font-size:15px;line-height:1.75;color:var(--text-strong-secondary)">
        <li style="margin:0 0 10px">Which of the fourteen models are currently write-only — saved but with no retrieval or reporting screen. The guide describes no reporting for any model until this list exists.</li>
        <li style="margin:0 0 10px">The exact contents of Forms 8 and 9, and what the departmental administrator checks line by line.</li>
        <li style="margin:0 0 10px">Precise definitions of lambda and mu as PES collects them, and the units expected on the personnel-utilization form.</li>
        <li style="margin:0 0 10px">Whether motivation has its own stage-by-stage workflow, or is only run as a model.</li>
        <li style="margin:0 0 10px">Who draws the random staff sample that scores a head on performance, when it is drawn, and how large it is.</li>
        <li style="margin:0 0 10px">Whether the Dean's approval and Establishment's approval are two distinct actions inside stage 6, or one.</li>
        <li style="margin:0 0 10px">Whether performance entries can be contested by the head as well as by the member of staff.</li>
        <li style="margin:0 0 10px">Whether an appraisal can be sent back to an earlier stage, and by whom.</li>
        <li style="margin:0 0 10px">Who may create and administer motivation schemes and grant awards.</li>
        <li style="margin:0 0 10px">Which roles can see Work Sampling and Surveys, and where they sit in the sidebar.</li>
        <li style="margin:0 0 10px">Whether Maintenance Model requires a permission in addition to being enabled for the organization.</li>
        <li style="margin:0 0 10px">Exactly which models each product category and plan combination includes.</li>
        <li style="margin:0 0 10px">Whether the Employee (baseline) role can complete an appraisal, or only view.</li>
        <li>Where a user goes for help inside the product — no support contact route was supplied, so none is stated anywhere in this guide.</li>
      </ol>`,
  },
];
