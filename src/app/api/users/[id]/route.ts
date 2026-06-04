import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt"; // Import NextAuth's getToken

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("🔐 API: Fetching user profile for ID:", id);
    
    // Use NextAuth's getToken to verify authentication
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🔐 API: NextAuth token:", token);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    // Find the user by ID
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("🔐 API: Found user:", user.email);
    console.log("🔐 API: Token user ID:", token.id);
    console.log("🔐 API: Requested user ID:", id);
    
    // Check if user is viewing their own profile
    const isOwnProfile = token.id === id || token.email?.toLowerCase() === user.email?.toLowerCase();
    
    // Remove sensitive data - ALWAYS remove password
    const { password, emailVerificationToken, emailVerificationExpires, ...userData } = user;
    
    // Prepare response data
    const responseData: any = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      img: user.img || "",
      profile_picture: user.profile_picture || "",
      about: user.about || "",
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Only include sensitive info if it's their own profile
      ...(isOwnProfile && {
        user_type: user.user_type || "user",
        phone: user.phone || "",
        dob: user.dob || "",
        address: user.address || "",
        auth_provider: user.auth_provider || "credentials",
        email_verified: user.email_verified || false,
        github_id: user.github_id || null,
        google_id: user.google_id || null
      })
    };

    console.log("🔐 API: Returning data (isOwnProfile:", isOwnProfile, ")");
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("❌ Error fetching user:", error);
    
    // Handle invalid ObjectId
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Optional: Add PATCH/PUT for updating user profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    
    // Verify authentication
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is updating their own profile
    if (token.id !== id) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Define allowed fields that users can update
    const allowedUpdates = [
      'name', 'phone', 'dob', 'address', 'about', 'profile_picture'
    ];
    
    // Filter updates to only allowed fields
    const filteredUpdates: any = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    // Add updated timestamp
    filteredUpdates.updated_at = new Date();
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredUpdates }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch and return updated user
    const updatedUser = await db.collection("users").findOne({
      _id: new ObjectId(id)
    });
    
    const { password, ...userWithoutPassword } = updatedUser!;
    
    return NextResponse.json({
      ...userWithoutPassword,
      id: updatedUser!._id.toString()
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}