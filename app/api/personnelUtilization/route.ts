import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      org,
      params,
      kmin,
      kmax,
      result,
      violations
    } = body;

    console.log({ org, params, kmin, kmax, result, violations });

    if (!org || !params || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const query = `
      INSERT INTO personnel_utilization (
        org, b, w, p0, t1, t2, t3, t4, s0, g, d, y, alpha,
        lambda, mu, j, kmin, kmax, kstar, hstar,
        constraints_ok, violations
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      )
      RETURNING *;
    `;

    const saved = await prisma.$queryRawUnsafe(
      query,
      org,
      params.B,
      params.W,
      params.P0,
      params.t1,
      params.t2,
      params.t3,
      params.t4,
      params.S0,
      params.G,
      params.D,
      params.Y,
      params.alpha,
      params.lambda,
      params.mu,
      params.J,
      kmin,
      kmax,
      result.Kstar,
      result.Hstar,
      !violations || violations.length === 0,
      violations && violations.length > 0 ? violations : []
    );

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Error saving personnel utilization data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
