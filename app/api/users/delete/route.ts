import { NextResponse } from "next/server";
import prisma from "../../prisma.dev"; // adjust path
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Authorization header missing" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtDecode<{ org: string }>(token);
    const org = decoded.org;

    const body = await req.json();
    const { email, id } = body;

    if (!org) {
      return NextResponse.json(
        { success: false, message: "Your session has no organization — please log in again." },
        { status: 400 }
      );
    }
    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "A user id or email is required to delete." },
        { status: 400 }
      );
    }

    // Prefer the id (always available from the profile route); fall back to email.
    const where = id ? { org, id: Number(id) } : { org, email };

    // Fetch matching users first so we can report exactly what was removed.
    const result = await prisma.pesuser.findMany({ where });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No matching user found in your organization." },
        { status: 404 }
      );
    }

    await prisma.pesuser.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.length} user(s) successfully`,
      deleted: result,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
