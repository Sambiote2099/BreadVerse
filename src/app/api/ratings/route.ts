import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// GET: Get user's rating for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

     const token = await getToken({ 
          req: request as any, 
          secret: NEXTAUTH_SECRET 
        });
        const userId = token?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    const rating = await db.collection("ratings").findOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(userId)
    });
    
    return NextResponse.json({
      userRating: rating?.rating || null,
      hasRated: !!rating
    });
    
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    );
  }
}

// POST: Submit or update rating
export async function POST(request: Request) {
  try {
    const { productId, rating } = await request.json();
    
    if (!productId || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: "Valid product ID and rating (1-5) required" 
      }, { status: 400 });
    }

     const token = await getToken({ 
          req: request as any, 
          secret: NEXTAUTH_SECRET 
        });
        const userId = token?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Check if product exists
    const product = await db.collection("products").findOne({ 
      _id: new ObjectId(productId) 
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Check for existing rating
    const existingRating = await db.collection("ratings").findOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(userId)
    });
    
    if (existingRating) {
      // Update existing rating
      await db.collection("ratings").updateOne(
        { _id: existingRating._id },
        { $set: { rating, updatedAt: new Date() } }
      );
    } else {
      // Create new rating
      await db.collection("ratings").insertOne({
        productId: new ObjectId(productId),
        userId: new ObjectId(userId),
        rating,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Recalculate average rating
    const allRatings = await db.collection("ratings")
      .find({ productId: new ObjectId(productId) })
      .toArray();
    
    const totalRatings = allRatings.length;
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    // Update product with new average
    await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      { $set: { 
        rating: averageRating, 
        ratingCount: totalRatings,
        updatedAt: new Date()
      } }
    );
    
    return NextResponse.json({
      success: true,
      averageRating,
      userRating: rating,
      totalRatings,
      message: existingRating ? "Rating updated!" : "Rating submitted!"
    });
    
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

// DELETE: Remove user's rating
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{}> } // Change this to Promise<{}>
) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const token = await getToken({ 
      req: request as any, 
      secret: NEXTAUTH_SECRET 
    });
    const userId = token?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Delete user's rating
    const result = await db.collection("ratings").deleteOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(userId)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: "No rating found to delete" 
      }, { status: 404 });
    }
    
    // Recalculate average after deletion
    const remainingRatings = await db.collection("ratings")
      .find({ productId: new ObjectId(productId) })
      .toArray();
    
    const totalRatings = remainingRatings.length;
    const averageRating = totalRatings > 0 
      ? remainingRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;
    
    // Update product
    await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      { $set: { 
        rating: averageRating, 
        ratingCount: totalRatings,
        updatedAt: new Date()
      } }
    );
    
    return NextResponse.json({
      success: true,
      averageRating,
      totalRatings,
      message: "Rating removed successfully"
    });
    
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "Failed to delete rating" },
      { status: 500 }
    );
  }
}