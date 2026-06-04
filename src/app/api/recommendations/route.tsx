import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb'; // Adjust the import path as needed

// Interface matching your document structure
interface Recommendation {
  _id?: ObjectId;
  url: string[];
  name: string;
  Description: string;
}

// GET - Fetch all recommendations
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB using your existing clientPromise
    const client = await clientPromise;
    const db = client.db(); // Uses the default database from connection string
    const collection = db.collection<Recommendation>('recommendations');

    // Optional: Handle query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Optional: Get specific document by ID
    const id = searchParams.get('id');
    if (id) {
      try {
        const recommendation = await collection.findOne({ 
          _id: new ObjectId(id) 
        });
        
        if (!recommendation) {
          return NextResponse.json(
            { success: false, error: 'Recommendation not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: recommendation
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid ID format' },
          { status: 400 }
        );
      }
    }

    // Fetch recommendations with pagination
    const recommendations = await collection
      .find({})
      .sort({ _id: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination metadata
    const total = await collection.countDocuments();

    return NextResponse.json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// POST - Insert a new recommendation
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.Description) {
      return NextResponse.json(
        { success: false, error: 'Name and Description are required' },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    if (body.url) {
      if (!Array.isArray(body.url)) {
        return NextResponse.json(
          { success: false, error: 'URLs must be an array' },
          { status: 400 }
        );
      }
      
      // Validate each URL is a string
      for (const url of body.url) {
        if (typeof url !== 'string') {
          return NextResponse.json(
            { success: false, error: 'All URLs must be strings' },
            { status: 400 }
          );
        }
      }
    }

    // Prepare the recommendation document
    const newRecommendation: Recommendation = {
      url: body.url || [],
      name: body.name.trim(),
      Description: body.Description.trim(),
    };

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Recommendation>('recommendations');

    // Insert the document
    const result = await collection.insertOne(newRecommendation);

    // Fetch the complete inserted document
    const insertedDoc = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      data: insertedDoc,
      message: 'Recommendation added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error inserting recommendation:', error);
    
    // Handle duplicate key errors or other MongoDB errors
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        { success: false, error: 'Duplicate entry found' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add recommendation' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing recommendation
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate at least one field to update
    if (!body.name && !body.Description && !body.url) {
      return NextResponse.json(
        { success: false, error: 'At least one field (name, Description, or url) is required for update' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Recommendation>('recommendations');

    // Prepare update object
    const updateData: Partial<Recommendation> = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.Description) updateData.Description = body.Description.trim();
    if (body.url !== undefined) {
      if (!Array.isArray(body.url)) {
        return NextResponse.json(
          { success: false, error: 'URLs must be an array' },
          { status: 400 }
        );
      }
      updateData.url = body.url;
    }

    // Update the document
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Recommendation updated successfully'
    });

  } catch (error) {
    console.error('Error updating recommendation:', error);
    
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a recommendation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Recommendation>('recommendations');

    // Delete the document
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting recommendation:', error);
    
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete recommendation' },
      { status: 500 }
    );
  }
}

// Optional: PATCH for partial updates
export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Use PUT for updates' },
    { status: 501 }
  );
}