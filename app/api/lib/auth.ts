import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authorizeRole(req: NextRequest, roles: string[]) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (!roles.includes(decoded.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return decoded;
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
}
