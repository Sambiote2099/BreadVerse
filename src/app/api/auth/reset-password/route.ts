// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    console.log("🔐 ===== RESET PASSWORD API CALLED =====");
    
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    console.log("🔐 Reset password attempt with token");
    
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const client = await clientPromise;
    const db = client.db("breadverse");

    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      reset_token_hash: resetTokenHash,
      reset_token_expires: { $gt: new Date() }
    });

    if (!user) {
      console.log("❌ Invalid or expired reset token");
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    console.log("✅ Valid reset token for user:", user.email);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password and clear reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updated_at: new Date()
        },
        $unset: {
          reset_token_hash: "",
          reset_token_expires: ""
        }
      }
    );

    console.log("✅ Password reset successful for:", user.email);
    
    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now login with your new password."
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}