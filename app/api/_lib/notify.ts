// Helpers for creating in-app notifications (the bell). Notifications are stored
// per user (user_id → pesuser.id) and scoped to an org. Best-effort: a failure
// to notify must never break the action that triggered it.

type Prisma = any;

async function insert(prisma: Prisma, org: string, userIds: number[], title: string, message: string) {
  const ids = Array.from(new Set(userIds.filter((n) => Number.isFinite(n))));
  if (ids.length === 0) return;
  try {
    await prisma.notifications.createMany({
      data: ids.map((id) => ({ user_id: id, org, title, message })),
    });
  } catch (err) {
    console.error("notify insert failed:", err);
  }
}

// Notify every staff member in an org (optionally restricted to certain roles).
export async function notifyOrgStaff(
  prisma: Prisma,
  org: string,
  title: string,
  message: string,
  opts?: { roles?: string[] },
) {
  try {
    const users = await prisma.pesuser.findMany({
      where: { org, ...(opts?.roles ? { role: { in: opts.roles } } : {}) },
      select: { id: true },
    });
    await insert(prisma, org, users.map((u: any) => u.id), title, message);
  } catch (err) {
    console.error("notifyOrgStaff failed:", err);
  }
}

// Notify the HOD(s) of a specific department.
export async function notifyDeptHod(prisma: Prisma, org: string, dept: string, title: string, message: string) {
  try {
    const heads = await prisma.pesuser.findMany({
      where: { org, dept, role: "hod" },
      select: { id: true },
    });
    await insert(prisma, org, heads.map((u: any) => u.id), title, message);
  } catch (err) {
    console.error("notifyDeptHod failed:", err);
  }
}

// Notify the faculty/division head(s) of a specific faculty.
export async function notifyFacultyHead(prisma: Prisma, org: string, faculty: string, title: string, message: string) {
  try {
    const heads = await prisma.pesuser.findMany({
      where: { org, faculty_college: faculty, role: "unit-head" },
      select: { id: true },
    });
    await insert(prisma, org, heads.map((u: any) => u.id), title, message);
  } catch (err) {
    console.error("notifyFacultyHead failed:", err);
  }
}
