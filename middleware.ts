// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tabs } from "./app/components/utils/tabs";
import { resolveEffectiveRole } from "./app/components/utils/roles";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  // Skip public routes (login, signup, etc.)
  if (["/", "/signup/admin", "/dashboard"].includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the route exists in your tabs list
  const tab = tabs.find(t => pathname === t.href || pathname.startsWith(t.href + "/"));

  // Gate on the EFFECTIVE role so custom roles (which appear in no allow-list)
  // aren't blanket-redirected to /unauthorized — they map to the baseline
  // employee surface, matching the sidebar's access logic.
  const effectiveRole = role ? resolveEffectiveRole(role) : null;

  if (tab && effectiveRole && !tab.role_access.includes(effectiveRole)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/em-database/:path*",
    "/goals/:path*",
    "/data-entry/:path*",
    "/assessment/:path*",
    "/performance/:path*",
    "/profile/:path*",
    "/pricing/:path*",
    "/maintenance/:path*",
  ],
};
