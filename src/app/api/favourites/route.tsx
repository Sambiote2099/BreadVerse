import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// GET: Get user's favourites (both products and gift boxes)
export async function GET(request: Request) {
  try {
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
    
    // Get user's favorite item IDs
    const favourites = await db.collection("favourites").find({
      userId: new ObjectId(userId)
    }).toArray();
    
    // Separate products and gift boxes
    const productIds = favourites
      .filter(fav => fav.itemType === 'product')
      .map(fav => fav.itemId);
    
    const giftBoxIds = favourites
      .filter(fav => fav.itemType === 'gift_box')
      .map(fav => fav.itemId);
    
    // Fetch products and gift boxes in parallel
    const [products, giftBoxes] = await Promise.all([
      productIds.length > 0 
        ? db.collection("products").find({
            _id: { $in: productIds }
          }).toArray()
        : [],
      
      giftBoxIds.length > 0 
        ? db.collection("gift_boxes").find({
            _id: { $in: giftBoxIds }
          }).toArray()
        : []
    ]);
    
    // Combine and format results
    const allFavourites = [
      ...products.map(product => ({
        ...product,
        _id: product._id.toString(),
        itemType: 'product'
      })),
      ...giftBoxes.map(giftBox => ({
        ...giftBox,
        _id: giftBox._id.toString(),
        itemType: 'gift_box'
      }))
    ];
    
    return NextResponse.json({
      favourites: allFavourites
    });
    
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favourites" },
      { status: 500 }
    );
  }
}

// POST: Add/Remove favorite
export async function POST(request: Request) {
  try {
    const { itemId, itemType, action } = await request.json(); // itemType: 'product' or 'gift_box'
    
    if (!itemId || !itemType || !action) {
      return NextResponse.json({ 
        error: "Item ID, type, and action required" 
      }, { status: 400 });
    }

    if (!['product', 'gift_box'].includes(itemType)) {
      return NextResponse.json({ 
        error: "Invalid item type. Use 'product' or 'gift_box'" 
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
    
    // Check if item exists in the appropriate collection
    const collection = itemType === 'product' ? "products" : "gift_boxes";
    const item = await db.collection(collection).findOne({ 
      _id: new ObjectId(itemId) 
    });
    
    if (!item) {
      return NextResponse.json({ 
        error: `${itemType.replace('_', ' ')} not found` 
      }, { status: 404 });
    }
    
    if (action === 'add') {
      // Check if already favorited
      const existing = await db.collection("favourites").findOne({
        itemId: new ObjectId(itemId),
        itemType,
        userId: new ObjectId(userId)
      });
      
      if (!existing) {
        await db.collection("favourites").insertOne({
          itemId: new ObjectId(itemId),
          itemType,
          userId: new ObjectId(userId),
          createdAt: new Date()
        });
      }
      
      return NextResponse.json({
        success: true,
        message: `${itemType.replace('_', ' ')} added to favourites`,
        isFavorite: true
      });
      
    } else if (action === 'remove') {
      await db.collection("favourites").deleteOne({
        itemId: new ObjectId(itemId),
        itemType,
        userId: new ObjectId(userId)
      });
      
      return NextResponse.json({
        success: true,
        message: `${itemType.replace('_', ' ')} removed from favourites`,
        isFavorite: false
      });
    } else {
      return NextResponse.json({ 
        error: "Invalid action" 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Error updating favorite:", error);
    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a favorite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{}> } // Change this to Promise<{}>
) {
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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    const result = await db.collection("favourites").deleteOne({
      itemId: new ObjectId(itemId),
      itemType,
      userId: new ObjectId(userId)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: "Favorite not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Favorite removed"
    });
    
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}