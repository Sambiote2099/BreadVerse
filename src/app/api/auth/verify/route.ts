// /app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "123456";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "No token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return NextResponse.json({
      authenticated: true,
      user: decoded
    });

  } catch (error) {
    return NextResponse.json(
      { 
        authenticated: false, 
        message: "Invalid token",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 401 }
    );
  }
}