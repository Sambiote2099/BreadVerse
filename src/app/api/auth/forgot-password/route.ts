// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

export async function POST(req: Request) {
  try {
    console.log("🔐 ===== FORGOT PASSWORD API CALLED =====");
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("🔐 Password reset requested for:", email);
    
    const client = await clientPromise;
    const db = client.db("breadverse");

    // Find user by email
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      console.log("🔐 User not found (but returning success for security)");
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link."
      });
    }

    // Check if user is using OAuth (no password)
    if (user.auth_provider && user.auth_provider !== "credentials") {
      console.log("🔐 User uses OAuth:", user.auth_provider);
      return NextResponse.json({
        success: false,
        error: `This account uses OAuth2.0 login. Please sign in with the corresponding services.`
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiry (1 hour from now)
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    
    // Store hashed token in database
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          reset_token_hash: resetTokenHash,
          reset_token_expires: resetTokenExpires,
          updated_at: new Date()
        }
      }
    );

    console.log("🔐 Reset token generated for:", user.email);
    
    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      user.name, 
      resetToken
    );
    
    if (!emailResult.success) {
      console.error("❌ Failed to send reset email");
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ Password reset email sent");
    
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
      previewUrl: emailResult.previewUrl
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}