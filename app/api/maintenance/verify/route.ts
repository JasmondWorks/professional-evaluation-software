import { NextResponse } from "next/server";
import prisma from "../../prisma.dev";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // ✅ Extract token
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // ✅ Get request body
    const { reference } = await req.json();
    const org = decoded?.org;

    if (!reference || !org) {
      return NextResponse.json(
        { message: "Missing reference or org in token" },
        { status: 400 }
      );
    }

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { message: "Paystack secret not configured" },
        { status: 500 }
      );
    }

    // ✅ Verify payment with Paystack
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );

    const data = await res.json();

    if (!res.ok || data?.data?.status !== "success") {
      return NextResponse.json(
        { message: "Payment not successful", data },
        { status: 400 }
      );
    }

    // ✅ Use org from token (safer than trusting request)
    const normalized = String(decoded.org || org).trim();

    let affected = 0;

    // 1) exact match
    const exact = await prisma.$executeRaw`
      UPDATE "org"
      SET "maintenance_model" = true
      WHERE LOWER("name") = LOWER(${normalized})
    `;
    affected += Number(exact);

    // 2) partial match
    if (affected === 0) {
      const partial = await prisma.$executeRaw`
        UPDATE "org"
        SET "maintenance_model" = true
        WHERE "name" ILIKE ${`%${normalized}%`}
      `;
      affected += Number(partial);
    }

    // 3) fallback to metadata
    if (affected === 0 && data?.data?.metadata?.org) {
      const metaOrg = String(data.data.metadata.org).trim();

      const metaExact = await prisma.$executeRaw`
        UPDATE "org"
        SET "maintenance_model" = true
        WHERE LOWER("name") = LOWER(${metaOrg})
      `;
      affected += Number(metaExact);

      if (affected === 0) {
        const metaPartial = await prisma.$executeRaw`
          UPDATE "org"
          SET "maintenance_model" = true
          WHERE "name" ILIKE ${`%${metaOrg}%`}
        `;
        affected += Number(metaPartial);
      }
    }

    if (affected === 0) {
      console.warn("No org matched", {
        org: normalized,
        metadata: data?.data?.metadata,
      });

      return NextResponse.json(
        {
          message: "Organization not found",
        },
        { status: 404 }
      );
    }

    // ✅ Re-sign new JWT
    const { iat, exp, ...safeUser } = decoded;

    const newPayload = {
      ...safeUser,
      maintenance_model: true,
    };

    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET || 'fallback-secret-change-in-production');

    return NextResponse.json({
      message: "Payment verified and maintenance_model activated",
      matchedCount: affected,
      access_token: newToken, // 🔥 return new token
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { message: err?.message || "Verification error" },
      { status: 500 }
    );
  }
}