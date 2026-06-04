import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db("breadverse");

    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
    
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db("breadverse");

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Allowed status values
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Get current order first to preserve existing data
    const currentOrder = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Prepare the update
    const updateDoc: any = {
      $set: {
        status: body.status,
        updated_at: new Date()
      },
      $push: {
        status_history: {
          status: body.status,
          changed_at: new Date(),
          notes: body.notes || "",
          changed_by: body.changed_by || "system"
        }
      }
    };

    // Add optional fields to $set if provided
    if (body.tracking_number !== undefined) updateDoc.$set.tracking_number = body.tracking_number;
    if (body.shipped_date !== undefined) updateDoc.$set.shipped_date = body.shipped_date;
    if (body.delivered_date !== undefined) updateDoc.$set.delivered_date = body.delivered_date;
    
    // Update payment status if provided
    if (body.payment_status) {
      updateDoc.$set["payment.status"] = body.payment_status;
    }

    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );

    // Get the updated order to return
    const updatedOrder = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    });
    
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db("breadverse");

    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}