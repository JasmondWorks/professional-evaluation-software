// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findRouteRule } from "./app/lib/roleAccess";
import { resolveEffectiveRole } from "./app/components/utils/roles";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  // Skip public routes (login, signup, etc.) — see PUBLIC_ROUTES in
  // roleAccess.ts for the full list; only the ones actually covered by the
  // matcher below need repeating here.
  if (["/", "/signup/admin", "/dashboard"].includes(pathname)) {
    return NextResponse.next();
  }

  // Longest matching route wins, so a narrow rule (e.g. "/data-entry/students")
  // always beats a broader one it sits inside (e.g. "/data-entry") — see
  // findRouteRule in roleAccess.ts.
  const rule = findRouteRule(pathname);

  // Gate on the EFFECTIVE role so custom roles (which appear in no allow-list)
  // aren't blanket-redirected to /unauthorized — they map to the baseline
  // employee surface, matching the sidebar's access logic.
  const effectiveRole = role ? resolveEffectiveRole(role) : null;

  if (rule && effectiveRole && !rule.roles.includes(effectiveRole)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/em-database/:path*",
    "/organization/:path*",
    "/organizations/:path*",
    "/admin/auditors/:path*",
    "/goals/:path*",
    "/data-entry/:path*",
    "/appraisal/:path*",
    "/completed-appraisals/:path*",
    "/assessment/:path*",
    "/performance/:path*",
    "/evaluation/:path*",
    "/profile/:path*",
    "/change-password/:path*",
    "/pricing/:path*",
    "/maintenance/:path*",
    "/maintenance-payment/:path*",
    "/models/:path*",
    "/model-access/:path*",
    "/my-awards/:path*",
  ],
};
