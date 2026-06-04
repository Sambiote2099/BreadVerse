import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    const existingUser = await db
      .collection("users")
      .findOne({ 
        email: body.email.toLowerCase().trim() 
      });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser ? "Email is already registered" : "Email is available"
    });

  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}