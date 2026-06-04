import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "12");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("breadverse"); // Changed from memeverse to breadverse
    
    let query: any = {};
    
    // Add filters if provided
    if (category && category !== "all") {
      query.category = category;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const totalCount = await db.collection("products").countDocuments(query);
    
    // Get paginated results
    const products = await db
      .collection("products") // Fixed typo: porducts → products
      .find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      products,
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("breadverse");

    const body = await req.json();

    // Validation for bakery products
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Create product with your new structure
    const product = {
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      category: body.category, // bread, pastry, cake, cookie, dessert
      image: Array.isArray(body.image) ? body.image : [body.image], // Handle single or multiple images
      available: body.available !== undefined ? body.available : true,
      featured: body.featured || false,
      popular: body.popular || false,
      rating: 0, // Start with 0 rating
      reviewCount: 0, // Start with 0 reviews
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate image URL format
    if (!product.image || product.image.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json(
      { 
        ...product,
        _id: result.insertedId.toString() // Convert ObjectId to string
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}