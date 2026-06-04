// File: /app/api/orders/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getToken } from "next-auth/jwt"; // Use getToken like your favourites API

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// Helper function to get user from token
async function getAuthUser(request: Request) {
  try {
    const token = await getToken({ 
      req: request as any, 
      secret: NEXTAUTH_SECRET 
    });
    return token;
  } catch (error) {
    return null;
  }
}

// GET - For fetching orders (admin sees all, users see their own, guests can't see any)
export async function GET(request: Request) {
  try {
    // Get the authenticated user (if any)
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to view orders" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const since = searchParams.get("since"); // ADD THIS LINE

    const client = await clientPromise;
    const db = client.db("breadverse");
    
    // Build query based on user role
    let query: any = {};
    
    if (authUser.role === "admin") {
      // Admin sees ALL orders - no filter
    } else {
      // Regular users only see their own orders
      query["customer.email"] = authUser.email;
    }
    
    // Add status filter if provided
    if (status && status !== "all") {
      query.status = status;
    }
    
    // ADD THIS - Add since filter if provided
    if (since) {
      const sinceDate = new Date(parseInt(since));
      query.created_at = { $gt: sinceDate };
    }
    
    // Get total count for pagination
    const totalCount = await db.collection("orders").countDocuments(query);
    
    // Get paginated results
    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ created_at: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - For creating orders (allows both guest and logged-in users)
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("breadverse");

    const body = await req.json();
    
    // Validation for orders
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      );
    }

    if (!body.customer_email || !body.customer_name) {
      return NextResponse.json(
        { error: "Customer information is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user (if any)
    const authUser = await getAuthUser(req);
    
    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Calculate total from items
    const totalAmount = body.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create order with your structure
    const order = {
      order_number: orderNumber,
      customer: {
        name: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone || "",
        user_id: authUser?.id || authUser?._id || null, // Will be null for guests
      },
      shipping_address: {
        street: body.shipping_address?.street || body.address || "",
        city: body.shipping_address?.city || body.city || "",
        state: body.shipping_address?.state || body.state || "",
        zip_code: body.shipping_address?.zip_code || body.zipCode || "",
        country: body.shipping_address?.country || body.country || "United States",
      },
      billing_address: body.billing_address || null,
      items: body.items.map((item: any) => ({
        product_id: item.id || item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        image: item.image || "",
        category: item.category || "",
      })),
      payment: {
        method: body.payment_method || "credit_card",
        status: "pending",
        amount: totalAmount,
        shipping_cost: body.shipping_cost || 0,
        tax: body.tax || 0,
        total: totalAmount + (body.shipping_cost || 0) + (body.tax || 0),
        card_last4: body.card_last4 || "",
      },
      status: "pending",
      notes: body.notes || "",
      created_at: new Date(),
      updated_at: new Date(),
      user_id: authUser?.id || authUser?._id || null, // Will be null for guests
      is_guest_order: !authUser, // Flag to identify guest orders
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      { 
        success: true,
        order: {
          ...order,
          _id: result.insertedId.toString(),
        },
        order_number: orderNumber,
        message: "Order created successfully"
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}