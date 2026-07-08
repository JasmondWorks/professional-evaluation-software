import { NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path
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
    const { email } = body;

    if (!org || !email) {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    // Fetch matching users first so we can report exactly what was removed.
    const result = await prisma.pesuser.findMany({ where: { org, email } });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user found with that org/email" },
        { status: 404 }
      );
    }

    await prisma.pesuser.deleteMany({ where: { org, email } });

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
