import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev"; // adjust path as needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      org,
      actual_staff,
      optimal_staff,
      low_threshold,
      moderate_threshold,
      pr_value,
      rating,
    } = body;

    // Basic validation
    if (
      !org ||
      !actual_staff ||
      !optimal_staff ||
      pr_value === undefined ||
      !rating
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO personnel_redundancy 
      (org, actual_staff, optimal_staff, low_threshold, moderate_threshold, pr_value, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await prisma.$queryRawUnsafe(query, org, actual_staff, optimal_staff, low_threshold, moderate_threshold, pr_value, rating);

    return NextResponse.json({ success: true, message: "Record saved successfully" });
  } catch (err: any) {
    console.error("Error saving redundancy:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
