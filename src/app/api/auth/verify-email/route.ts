// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  console.log("🔐 ===== VERIFICATION API CALLED - POST =====");
  console.log("🔐 THIS IS THE NEW VERSION - YOU SHOULD SEE THIS LOG!");
  
  try {
    const body = await req.json();
    console.log("🔐 Request body:", JSON.stringify(body, null, 2));
    
    const { token } = body;
    
    if (!token) {
      console.log("❌ ERROR: No token provided");
      return NextResponse.json(
        { 
          error: "Verification token is required",
          success: false 
        },
        { status: 400 }
      );
    }
    
    console.log("🔐 Token:", token);
    console.log("🔐 Token length:", token.length);
    console.log("🔐 Token type:", typeof token);
    
    const client = await clientPromise;
    const db = client.db("breadverse");
    
    console.log("🔐 Searching for token in database...");
    
    // First, let's see ALL tokens in the database
    const allUsers = await db.collection("users")
      .find({ verification_token: { $exists: true } })
      .toArray();
    
    console.log("🔐 Total users with tokens:", allUsers.length);
    allUsers.forEach((user, i) => {
      console.log(`🔐 User ${i + 1}:`, {
        email: user.email,
        token: user.verification_token,
        tokenLength: user.verification_token?.length,
        verified: user.email_verified
      });
    });
    
    // Now search for the exact token
    const user = await db.collection("users").findOne({
      verification_token: token
    });
    
    if (!user) {
      console.log("❌ ERROR: No user found with token");
      console.log("❌ Token we looked for:", token);
      
      return NextResponse.json(
        { 
          error: "Invalid verification token",
          success: false,
          debug: {
            tokenProvided: token,
            tokenLength: token.length,
            usersInDB: allUsers.length
          }
        },
        { status: 400 }
      );
    }
    
    console.log("✅ SUCCESS: User found!");
    console.log("✅ User email:", user.email);
    console.log("✅ Token from DB:", user.verification_token);
    console.log("✅ Current verified status:", user.email_verified);
    
    // Check if expired
    if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
      console.log("❌ Token expired");
      return NextResponse.json(
        { 
          error: "Verification link has expired",
          success: false 
        },
        { status: 400 }
      );
    }
    
    // Check if already verified
    if (user.email_verified) {
      console.log("✅ Already verified");
      return NextResponse.json({
        success: true,
        message: "Email is already verified"
      });
    }
    
    // Verify the user
    console.log("🔐 Updating user to verified...");
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          email_verified: true,
          updated_at: new Date()
        },
        $unset: {
          verification_token: "",
          verification_expires: ""
        }
      }
    );
    
    console.log("✅ Update successful!");
    console.log("✅ Modified count:", result.modifiedCount);
    
    return NextResponse.json({
      success: true,
      message: "Email verified successfully!"
    });
    
  } catch (error) {
    console.error("❌ CATCH BLOCK ERROR:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log("🔐 Verification GET called");
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/verify-email?token=${token}`);
}