// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    // Find user
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate new token if expired or doesn't exist
    let verificationToken = user.verification_token;
    let verificationExpires = user.verification_expires;
    
    const isTokenExpired = !verificationExpires || new Date(verificationExpires) < new Date();
    
    if (!verificationToken || isTokenExpired) {
      verificationToken = uuidv4();
      verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            verification_token: verificationToken,
            verification_expires: verificationExpires,
            updated_at: new Date()
          }
        }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      previewUrl: emailResult.previewUrl
    });

  } catch (error) {
    console.error("❌ Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}