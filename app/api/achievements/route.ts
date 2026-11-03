// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { authorize, tokenFromRequest } from "../_lib/authGuard";

// A person's own awards. The name came from the body, so anyone could read
// anyone's record by guessing it.
export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});
  if (!auth.ok) return auth.response;

  try {
    const name = auth.user.name ? String(auth.user.name) : null;
    if (!name) {
      return NextResponse.json({ error: "No name on this account" }, { status: 403 });
    }

    // Name alone matched across every organization on PES: two staff members
    // who share a name — and these are real names, so that is not rare — each
    // saw the other's records as their own. Scoped to the caller's org as well.
    const orgId = (auth.user as any)?.orgId;
    if (!orgId) {
      return NextResponse.json({ error: "Your account has no organization." }, { status: 400 });
    }
    const mine = { name, org_id: orgId };

    const [first, second, hall, badges] = await Promise.all([
      prisma.first_book_of_record.findMany({ where: mine }),
      prisma.second_book_of_record.findMany({ where: mine }),
      prisma.hall_of_fame.findMany({ where: mine }),
      prisma.badges.findMany({ where: mine }),
    ]);

    // Map sources to URLs
    const mapWithUrl = (items: any[], type: string) => {
      return items.map(item => {
        let url = "";
        switch (type) {
          case "first_book":
            url = "/book-of-record";
            break;
          case "second_book":
            url = "/book-of-record/second";
            break;
          case "hall_of_fame":
            url = "/hall-of-fame";
            break;
          case "badges":
            url = `/reward/badges/${name}`;
            break;
        }
        return { ...item, source: type, url };
      });
    };

    const results = [
      ...mapWithUrl(first, "first_book"),
      ...mapWithUrl(second, "second_book"),
      ...mapWithUrl(hall, "hall_of_fame"),
      ...mapWithUrl(badges, "badges")
    ];

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Error fetching achievements:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

