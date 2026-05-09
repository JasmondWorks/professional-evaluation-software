// lib/tabs.tsx
import { Home3, People, Setting4, Award, Teacher, ProfileCircle, DollarCircle, Setting3 } from "iconsax-react";

export const tabs = [
  { key: 1, name: "Dashboard", icon: <Home3 />, href: "/dashboard", role_access: ["super-admin", "admin", "lecturer", "industrial-engineer", "hod", "employee-w", "auditor"] },
  { key: 4, name: "Employee Database", icon: <People />, href: "/em-database", role_access: ["super-admin", "admin", "hod"] },
  { key: 5, name: "Goals", icon: <Setting4 />, href: "/goals", role_access: ["super-admin", "admin", "lecturer", "industrial-engineer", "hod", "employee-w"] },
  { key: 3, name: "Data Entry", icon: <Home3 />, href: "/data-entry", role_access: ["lecturer", "industrial-engineer", "hod", "employee-w", "auditor"] },
  { key: 6, name: "Assessment", icon: <Award />, href: "/assessment", role_access: ["super-admin", "admin"] },
  { key: 7, name: "Performance Review", icon: <Teacher />, href: "/performance", role_access: ["lecturer", "industrial-engineer", "hod", "employee-w"] },
  { key: 2, name: "Profile", icon: <ProfileCircle />, href: "/profile", role_access: ["lecturer", "industrial-engineer", "hod", "employee-w", "auditor"] },
  { key: 8, name: "Pricing", icon: <DollarCircle />, href: "/pricing", role_access: ["super-admin", "admin"] },
  { key: 9, name: "Maintenance Model", icon: <Setting3 />, href: "/maintenance", role_access: ["lecturer", "industrial-engineer", "hod", "employee-w", "super-admin", "admin"] },
];