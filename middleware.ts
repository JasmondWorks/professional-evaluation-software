// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tabs } from "./app/components/utils/tabs";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;

  // Skip public routes (login, signup, etc.)
  if (["/", "/signup/admin", "/dashboard"].includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the route exists in your tabs list
  const tab = tabs.find(t => t.href === pathname);

  if (tab && role && !tab.role_access.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/em-database",
    "/goals",
    "/data-entry",
    "/assessment",
    "/performance",
    "/profile",
    "/pricing",
    "/maintenance",
  ],
};
