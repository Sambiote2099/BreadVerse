import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Use NextAuth's getToken
import clientPromise from "@/lib/mongodb";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// Helper types
interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}

// GET: Get user's cart
export async function GET(req: NextRequest) {
  try {
    // Use NextAuth's getToken to verify authentication
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🛒 Cart API - GET - Token:", token?.id ? "Present" : "Not present");
    
    // If no token (guest user), return empty cart
    if (!token) {
      console.log("🛒 Guest user - returning empty cart");
      return NextResponse.json({
        items: [],
        totalItems: 0,
        totalPrice: 0
      }, { status: 200 });
    }
    
    const userId = token.id;
    
    if (!userId) {
      console.log("🛒 Invalid token - returning empty cart");
      return NextResponse.json({
        items: [],
        totalItems: 0,
        totalPrice: 0
      }, { status: 200 });
    }
    
    console.log("🛒 Fetching cart for user:", userId);
    const client = await clientPromise;
    const db = client.db("breadverse");
    const cartsCollection = db.collection("cart");
    
    let cart = await cartsCollection.findOne({ userId });
    
    if (!cart) {
      console.log("🛒 Creating new cart for user:", userId);
      const newCart = {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await cartsCollection.insertOne(newCart);
      cart = { _id: result.insertedId, ...newCart };
    }
    
    console.log("🛒 Cart found for user:", userId, "items:", cart.items?.length);
    return NextResponse.json({
      items: cart.items || [],
      totalItems: cart.totalItems || 0,
      totalPrice: cart.totalPrice || 0
    });
    
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST: Add/Update item in cart
export async function POST(req: NextRequest) {
  try {
    // Use NextAuth's getToken
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🛒 Cart API - POST - Token:", token?.id ? "Present" : "Not present");
    
    // If no token (guest user), return empty response
    if (!token) {
      console.log("🛒 Guest user - cart modification not allowed via API");
      return NextResponse.json({ 
        message: "Please log in to save cart items" 
      }, { status: 401 });
    }
    
    const userId = token.id;
    
    if (!userId) {
      console.log("❌ Invalid token - no user ID");
      return NextResponse.json({ 
        message: "Invalid authentication" 
      }, { status: 401 });
    }
    
    const body = await req.json();
    const { item, quantity = 1 } = body;
    
    if (!item || !item.id) {
      return NextResponse.json(
        { error: "Item data is required" },
        { status: 400 }
      );
    }
    
    console.log("🛒 Adding to database cart for user:", userId, "item:", item.id);
    const client = await clientPromise;
    const db = client.db("breadverse");
    const cartsCollection = db.collection("cart");
    
    let cart = await cartsCollection.findOne({ userId });
    
    if (!cart) {
      console.log("🛒 Creating new cart for user:", userId);
      const newCart = {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await cartsCollection.insertOne(newCart);
      cart = { _id: result.insertedId, ...newCart };
    }
    
    const items = Array.isArray(cart.items) ? cart.items : [];
    const existingItemIndex = items.findIndex(
      (cartItem: CartItem) => cartItem.id === item.id
    );
    
    let updatedItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      console.log("🔄 Item exists, updating quantity");
      updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      console.log("➕ Item doesn't exist, adding new");
      updatedItems = [...items, { ...item, quantity }];
    }
    
    const totalItems = updatedItems.reduce(
      (sum: number, cartItem: CartItem) => sum + cartItem.quantity, 
      0
    );
    const totalPrice = updatedItems.reduce(
      (sum: number, cartItem: CartItem) => sum + (cartItem.price * cartItem.quantity), 
      0
    );
    
    console.log("💾 Updating cart in DB, total items:", totalItems);
    await cartsCollection.updateOne(
      { userId },
      {
        $set: {
          items: updatedItems,
          totalItems,
          totalPrice,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({
      items: updatedItems,
      totalItems,
      totalPrice,
      message: "Item added to cart"
    });
    
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// PUT: Update cart
export async function PUT(req: NextRequest) {
  try {
    // Use NextAuth's getToken
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🛒 Cart API - PUT - Token:", token?.id ? "Present" : "Not present");
    
    // If no token (guest user), return empty response
    if (!token) {
      console.log("🛒 Guest user - cart modification not allowed via API");
      return NextResponse.json({ 
        message: "Please log in to modify cart" 
      }, { status: 401 });
    }
    
    const userId = token.id;
    
    if (!userId) {
      console.log("❌ Invalid token - no user ID");
      return NextResponse.json({ 
        message: "Invalid authentication" 
      }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, itemId, quantity } = body;
    
    console.log("🛒 PUT cart action:", action, "itemId:", itemId, "quantity:", quantity);
    
    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("breadverse");
    const cartsCollection = db.collection("cart");
    
    const cart = await cartsCollection.findOne({ userId });
    
    if (!cart) {
      console.log("📭 No cart found for user, returning empty");
      return NextResponse.json(
        { items: [], totalItems: 0, totalPrice: 0 }
      );
    }
    
    const items = Array.isArray(cart.items) ? cart.items : [];
    let updatedItems = [...items] as CartItem[];
    
    switch (action) {
      case "updateQuantity":
        if (!itemId) {
          return NextResponse.json(
            { error: "itemId is required for updateQuantity" },
            { status: 400 }
          );
        }
        
        if (quantity <= 0) {
          console.log("🗑️ Removing item due to zero quantity");
          updatedItems = updatedItems.filter(item => item.id !== itemId);
        } else {
          const itemIndex = updatedItems.findIndex(item => item.id === itemId);
          if (itemIndex >= 0) {
            console.log("🔄 Updating quantity for item:", itemId, "to:", quantity);
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity };
          } else {
            console.log("⚠️ Item not found for update:", itemId);
          }
        }
        break;
        
      case "removeItem":
        if (!itemId) {
          return NextResponse.json(
            { error: "itemId is required for removeItem" },
            { status: 400 }
          );
        }
        console.log("🗑️ Removing item:", itemId);
        updatedItems = updatedItems.filter(item => item.id !== itemId);
        break;
        
      case "clearCart":
        console.log("🧹 Clearing entire cart");
        updatedItems = [];
        break;
        
      default:
        console.log("❌ Invalid action:", action);
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    const totalItems = updatedItems.reduce(
      (sum: number, cartItem: CartItem) => sum + cartItem.quantity, 
      0
    );
    const totalPrice = updatedItems.reduce(
      (sum: number, cartItem: CartItem) => sum + (cartItem.price * cartItem.quantity), 
      0
    );
    
    console.log("💾 Updating cart, new totals:", { totalItems, totalPrice });
    await cartsCollection.updateOne(
      { userId },
      {
        $set: {
          items: updatedItems,
          totalItems,
          totalPrice,
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({
      items: updatedItems,
      totalItems,
      totalPrice,
      message: "Cart updated successfully"
    });
    
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE: Clear cart
export async function DELETE(req: NextRequest) {
  try {
    // Use NextAuth's getToken
    const token = await getToken({ 
      req: req as any,
      secret: NEXTAUTH_SECRET 
    });
    
    console.log("🛒 Cart API - DELETE - Token:", token?.id ? "Present" : "Not present");
    
    // If no token (guest user), return empty response
    if (!token) {
      console.log("🛒 Guest user - cart modification not allowed via API");
      return NextResponse.json({ 
        message: "Please log in to clear cart" 
      }, { status: 401 });
    }
    
    const userId = token.id;
    
    if (!userId) {
      console.log("❌ Invalid token - no user ID");
      return NextResponse.json({ 
        message: "Invalid authentication" 
      }, { status: 401 });
    }
    
    console.log("🧹 Clearing database cart for user:", userId);
    const client = await clientPromise;
    const db = client.db("breadverse");
    const cartsCollection = db.collection("cart");
    
    await cartsCollection.updateOne(
      { userId },
      {
        $set: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: "Cart cleared successfully"
    });
    
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}