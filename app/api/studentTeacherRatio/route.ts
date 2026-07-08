import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma.dev";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }
    
    const decoded = jwtDecode<{ org: string, user_id: string, dept: string }>(token);
    
    const record = await prisma.student_teacher_ratio.create({
      data: {
        org: decoded.org,
        dept: decoded.dept,
        optimalK: body.optimalK,
        totalStaffNeeded: body.totalStaffNeeded,
        supervisoryStaff: body.supervisoryStaff,
        managementLevel1: body.managementLevel1,
        managementLevel2: body.managementLevel2,
        topManagement: body.topManagement,
        lecturers: body.lecturers,
        seniorLecturers: body.seniorLecturers,
        professors: body.professors,
        efficiencyValue: body.efficiencyValue,
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    console.error("Error saving student-teacher ratio:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
