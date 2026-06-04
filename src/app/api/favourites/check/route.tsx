import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType') || 'product';
    
    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const token = await getToken({ 
  req: request as any, 
  secret: NEXTAUTH_SECRET 
});
const userId = token?.id;
    if (!userId) {
      return NextResponse.json({ isFavorite: false });
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    const favorite = await db.collection("favourites").findOne({
      itemId: new ObjectId(itemId),
      itemType,
      userId: new ObjectId(userId)
    });
    
    return NextResponse.json({
      isFavorite: !!favorite
    });
    
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json(
      { error: "Failed to check favorite" },
      { status: 500 }
    );
  }
}