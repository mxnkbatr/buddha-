import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { clerkClient } from "@clerk/nextjs/server";
import { adminGuard } from "@/lib/admin-utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, props: Props) {
  try {
    const { adminUser, db, errorResponse } = await adminGuard(request);
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const { id } = params;

    // Construct query to find the specific user
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { clerkId: id };
    }

    // 2. Fetch the user first to get the correct Clerk ID
    const userToDelete = await db.collection("users").findOne(query);

    if (!userToDelete) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    // 3. Delete from Clerk (if a clerkId exists)
    if (userToDelete.clerkId) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userToDelete.clerkId);
        console.log(`User ${userToDelete.clerkId} deleted from Clerk.`);
      } catch (clerkError: any) {
        // We log the error but allow the process to continue. 
        // This handles cases where the user was *already* deleted from Clerk manually.
        console.error("Clerk deletion failed (or user already missing):", clerkError.message || clerkError);
      }
    }

    // 4. Delete from MongoDB
    const result = await db.collection("users").deleteOne(query);

    // Optional: Delete their bookings to keep data clean
    // await db.collection("bookings").deleteMany({ monkId: userToDelete._id.toString() }); // If they were a monk
    // await db.collection("bookings").deleteMany({ userEmail: userToDelete.email }); // If they were a client

    return NextResponse.json({
      message: "User successfully deleted from Database and Clerk",
      dbResult: result
    });

  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, props: Props) {
  try {
    const { adminUser, db, errorResponse } = await adminGuard(request);
    if (errorResponse) return errorResponse;

    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    // Build query
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { clerkId: id };
    }

    // Allow updating these fields
    const allowedFields = ['name', 'phone', 'email', 'role', 'karma', 'totalMerits', 'earnings'];
    const updateData: any = { updatedAt: new Date() };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const result = await db.collection("users").updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      modifiedCount: result.modifiedCount,
    });

  } catch (error: any) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}