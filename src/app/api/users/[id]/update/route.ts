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
    
    console.log("🔐 Update API - Request for user ID:", id);
    console.log("🔐 Update API - Update data:", body);

    // Use NextAuth's getToken to verify authentication
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🔐 Update API - NextAuth token:", token?.id);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is updating their own profile
    if (token.id !== id) {
      console.log("❌ Update API - Permission denied: Token ID", token.id, "vs requested ID", id);
      return NextResponse.json(
        { error: "Can only update your own profile" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("breadverse");

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare update data (exclude sensitive/immutable fields)
    const updateData: any = {
      updated_at: new Date()
    };

    // Only update allowed fields if they're provided
    const allowedFields = ['name', 'phone', 'address', 'dob', 'about', 'profile_picture'];
    
    // Map frontend field names to database field names if needed
    const fieldMapping: Record<string, string> = {
      phoneNo: 'phone',
      doB: 'dob'
    };
    
    for (const [field, value] of Object.entries(body)) {
      const dbField = fieldMapping[field] || field;
      
      if (allowedFields.includes(dbField) && value !== undefined && value !== null) {
        updateData[dbField] = value;
      }
    }

    // Don't allow email updates via this endpoint (use separate email change flow)
    if (body.email && body.email !== existingUser.email) {
      return NextResponse.json(
        { error: "Email cannot be changed via profile update. Please use email change feature." },
        { status: 400 }
      );
    }

    console.log("🔐 Update API - Final update data:", updateData);

    // Update user in database
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get updated user to return
    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to fetch updated user" },
        { status: 500 }
      );
    }

    // Remove sensitive data
    const { password, emailVerificationToken, emailVerificationExpires, ...userWithoutPassword } = updatedUser;

    // Prepare response
    const responseData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      img: updatedUser.img || "",
      profile_picture: updatedUser.profile_picture || "",
      about: updatedUser.about || "",
      phone: updatedUser.phone || "",
      dob: updatedUser.dob || "",
      address: updatedUser.address || "",
      user_type: updatedUser.user_type || "user",
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
      // Include mapped fields for frontend compatibility
      phoneNo: updatedUser.phone || "",
      doB: updatedUser.dob || ""
    };

    console.log("✅ Update API - Successfully updated user:", updatedUser.email);

    return NextResponse.json({
      success: true,
      user: responseData,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("❌ Error updating user:", error);
    
    // Handle invalid ObjectId
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}