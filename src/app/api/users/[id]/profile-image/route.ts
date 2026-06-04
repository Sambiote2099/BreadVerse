import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt"; // Use NextAuth's getToken

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log("🖼️ Profile Image API - Update request for user ID:", id);
    console.log("🖼️ Profile Image API - Image URL:", body.imageUrl?.substring(0, 50) + "...");

    // Use NextAuth's getToken to verify authentication
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🖼️ Profile Image API - NextAuth token ID:", token?.id);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate user ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Check if user is updating their own profile
    if (token.id !== id) {
      console.log("❌ Profile Image API - Permission denied: Token ID", token.id, "vs requested ID", id);
      return NextResponse.json(
        { error: "Can only update your own profile" },
        { status: 403 }
      );
    }

    // Validate image URL
    if (!body.imageUrl || typeof body.imageUrl !== 'string') {
      return NextResponse.json(
        { error: "Valid image URL is required" },
        { status: 400 }
      );
    }

    // Optional: Validate URL format
    try {
      new URL(body.imageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid image URL format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    // Update user's profile image
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            img: body.imageUrl,
            profile_picture: body.imageUrl, // Update both fields for consistency
            updated_at: new Date()
          } 
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ Profile Image API - Successfully updated profile image");

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl: body.imageUrl
    });

  } catch (error) {
    console.error("❌ Error updating profile image:", error);
    
    // Handle invalid ObjectId
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}