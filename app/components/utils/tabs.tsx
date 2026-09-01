// lib/tabs.tsx
import { Home3, People, Setting4, Award, Teacher, ProfileCircle, DollarCircle, Setting3 } from "iconsax-react";

export const tabs = [
  { key: 1, name: "Dashboard", icon: <Home3 />, href: "/dashboard", role_access: ["super-admin", "admin", "lecturer", "industrial-engineer", "hod", "unit-head", "employee-w", "auditor"] },
  { key: 4, name: "Employee Database", icon: <People />, href: "/em-database", role_access: ["super-admin", "admin", "hod", "unit-head"] },
  { key: 5, name: "Goals", icon: <Setting4 />, href: "/goals", role_access: ["super-admin", "admin", "lecturer", "industrial-engineer", "hod", "unit-head", "employee-w"] },
  { key: 3, name: "Data Entry", icon: <Home3 />, href: "/data-entry", role_access: ["lecturer", "industrial-engineer", "hod", "dept-admin", "unit-head", "employee-w", "auditor"] },
  { key: 6, name: "Assessment", icon: <Award />, href: "/assessment", role_access: ["super-admin", "admin"] },
  { key: 7, name: "Performance Review", icon: <Teacher />, href: "/performance", role_access: ["lecturer", "industrial-engineer", "hod", "unit-head", "employee-w"] },
  { key: 2, name: "Profile", icon: <ProfileCircle />, href: "/profile", role_access: ["lecturer", "industrial-engineer", "hod", "dept-admin", "unit-head", "employee-w", "auditor"] },
  { key: 8, name: "Pricing", icon: <DollarCircle />, href: "/pricing", role_access: ["super-admin", "admin"] },
  // Appraisal data entry belongs to staff and departments, never to the
  // organization admin, whose part is in Models > Staff appraisal.
  { key: 31, name: "Appraisal forms", icon: <Home3 />, href: "/appraisal", role_access: ["lecturer", "industrial-engineer", "hod", "dept-admin", "unit-head", "employee-w", "auditor"] },
  // Target templates sit under /appraisal but belong to the other side of the
  // wall: the organization admin and Estab./Personnel set the scheme, staff are
  // measured against it. Listed after the tab above and matched by longest href
  // in middleware.ts, so it wins over the broader /appraisal rule.
  { key: 32, name: "Appraisal templates", icon: <Home3 />, href: "/appraisal/templates", role_access: ["super-admin", "admin"] },
  // The performance model's three role-specific screens. Data entry itself sits
  // under Data Entry; these are the review, the random head-scoring task and the
  // auditor's queue.
  { key: 32, name: "Performance review", icon: <Teacher />, href: "/performance/review", role_access: ["hod", "unit-head"] },
  { key: 33, name: "Score your head", icon: <Award />, href: "/performance/score-head", role_access: ["lecturer", "industrial-engineer", "dept-admin", "employee-w"] },
  { key: 34, name: "Performance auditing", icon: <Award />, href: "/performance/auditor", role_access: ["auditor"] },
  // The models are the organization admin's to run. The industrial/production
  // engineer reaches them only for data entry, and only where the admin has
  // switched a model on — which is a database setting, so the per-model half of
  // the check happens in the model routes rather than here.
  { key: 10, name: "Models", icon: <Setting3 />, href: "/models", role_access: ["super-admin", "admin", "industrial-engineer"] },
  { key: 12, name: "Model Access", icon: <Setting3 />, href: "/model-access", role_access: ["super-admin", "admin"] },
  // Every role in the organization, on purpose. The unit group head runs the
  // maintenance model and cannot be waiting on the organization admin to press
  // Conduct or Save for them (client, 1 September). Custom roles resolve to
  // employee-w, which is on this list, so they reach it too.
  { key: 9, name: "Maintenance Model", icon: <Setting3 />, href: "/maintenance", role_access: ["lecturer", "industrial-engineer", "hod", "unit-head", "dept-admin", "employee-w", "auditor", "super-admin", "admin"] },
];