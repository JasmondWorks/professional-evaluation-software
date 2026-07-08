import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

async function getStats(org: string) {
  const [users, completedAppraisals, pendingAppraisals] = await Promise.all([
    prisma.pesuser.count({ where: { org: org } }),
    prisma.appraisal.count({ where: { org: org, pending: false } }),
    prisma.appraisal.count({ where: { org: org, pending: true } }),
  ]);

  return [users, completedAppraisals, pendingAppraisals];
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
  }

  let org;
  try {
    const decoded: any = jwtDecode(token);
    org = decoded?.org;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (org) {
    try {
      let userInfo = await getStats(org);
      return NextResponse.json(userInfo);
    } catch (err) {
      console.error(err);
      return NextResponse.json([]);
    }
  }
  NextResponse.redirect(new URL("/not-found", request.url));
}
