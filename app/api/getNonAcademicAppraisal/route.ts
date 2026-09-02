export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// Non-academic appraisal records, scoped to the caller's organization. The org was read with jwtDecode,
// which decodes without checking the signature, so a token written by hand named
// any org it liked and this returned that org's records.
export async function GET(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;
  if (!org) {
    return NextResponse.json(
      { error: "This account is not attached to an organization" },
      { status: 403 }
    );
  }

  try {
    
    const records = await prisma.non_academic_appraisal.findMany({
      where: {
        org,
      },
      orderBy: {
        created_at: "desc",
      }
    });

    return NextResponse.json(records, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching non-academic appraisal history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
