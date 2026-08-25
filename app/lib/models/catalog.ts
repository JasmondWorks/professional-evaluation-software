// The mathematical models, as one list.
//
// The models page, the admin's access screen and the server-side guard all read
// from here, so a model cannot exist in the navigation without existing in the
// access controls — which is how the whole surface was open to every staff member
// in the first place.

export type ModelKey =
  | 'appraisal'
  | 'performance'
  | 'motivation'
  | 'stress'
  | 'org-structure'
  | 'personnel-redundancy'
  | 'personnel-utilization'
  | 'productivity-index'
  | 'redundancy-index'
  | 'staff-number'
  | 'student-teacher'
  | 'utility-index'
  | 'maintenance';

export type ModelDefinition = {
  key: ModelKey;
  label: string;
  description: string;
  /** The route the model lives at, used to map a request path back to a key. */
  path: string;
};

export const MODEL_CATALOG: ModelDefinition[] = [
  {
    key: 'appraisal',
    label: 'Appraisal',
    description: 'Score staff against the target for their position or grade, then release grades.',
    path: '/models/appraisal',
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'Competence, integrity, compatibility and use of resources, against the RTP target.',
    path: '/models/performance',
  },
  {
    key: 'motivation',
    label: 'Motivation',
    description: 'Measure and compare employee motivation levels.',
    path: '/models/motivation',
  },
  {
    key: 'stress',
    label: 'Stress',
    description: 'Workplace stress factors and emotional fatigue.',
    path: '/models/stress',
  },
  {
    key: 'org-structure',
    label: 'Organization structure',
    description: 'Reporting hierarchies and span of control. Needs personnel utilization first.',
    path: '/models/org-structure',
  },
  {
    key: 'personnel-utilization',
    label: 'Personnel utilization',
    description: 'The H index from lambda and mu. Feeds the organization structure model.',
    path: '/models/personnel-utilization',
  },
  {
    key: 'personnel-redundancy',
    label: 'Personnel redundancy',
    description: 'Potential staff redundancy levels based on load.',
    path: '/models/personnel-redundancy',
  },
  {
    key: 'productivity-index',
    label: 'Productivity index',
    description: 'Organizational productivity and output rates.',
    path: '/models/productivity-index',
  },
  {
    key: 'redundancy-index',
    label: 'Redundancy index',
    description: 'Redundancy thresholds across departments.',
    path: '/models/redundancy-index',
  },
  {
    key: 'staff-number',
    label: 'Staff number',
    description: 'Optimal staffing requirements and capacities.',
    path: '/models/staff-number',
  },
  {
    key: 'student-teacher',
    label: 'Student teacher ratio',
    description: 'Student-to-teacher ratios and classroom distribution.',
    path: '/models/student-teacher',
  },
  {
    key: 'utility-index',
    label: 'Utility index',
    description: 'Institutional utility and value delivery.',
    path: '/models/utility-index',
  },
  {
    key: 'maintenance',
    label: 'Maintenance model',
    description: 'Predictive maintenance intervals for equipment.',
    path: '/maintenance',
  },
];

export const MODEL_KEYS = MODEL_CATALOG.map((m) => m.key);

export function isModelKey(value: unknown): value is ModelKey {
  return typeof value === 'string' && (MODEL_KEYS as string[]).includes(value);
}

export function modelByKey(key: string): ModelDefinition | undefined {
  return MODEL_CATALOG.find((m) => m.key === key);
}

/** The model a request path belongs to, longest path first so
 *  /models/student-teacher/robust resolves to student-teacher rather than to
 *  nothing. Returns null for a path that is not a model. */
export function modelForPath(pathname: string): ModelDefinition | null {
  const match = [...MODEL_CATALOG]
    .sort((a, b) => b.path.length - a.path.length)
    .find((m) => pathname === m.path || pathname.startsWith(m.path + '/'));
  return match ?? null;
}

// Roles that reach the models at all.
//
// The organization admin runs them. The industrial/production engineer enters
// data into whichever ones the admin has enabled — the client was explicit that
// this role saves data and never runs an evaluation. Nobody else has any business
// on these pages; before this, every staff member did.
export const MODEL_ADMIN_ROLES = ['super-admin', 'admin'];
export const MODEL_DATA_ENTRY_ROLE = 'industrial-engineer';
export const MODEL_ROLES = [...MODEL_ADMIN_ROLES, MODEL_DATA_ENTRY_ROLE];
