import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { clerkClient } from "@clerk/nextjs/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;

    const { db } = await connectToDatabase();

    // Build query to find user by _id or clerkId
    let query: any = {
      $or: [
        { clerkId: id },
        { _id: id }
      ]
    };

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    const user = await db.collection("users").findOne(query);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("User Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const { db } = await connectToDatabase();

    // 1. Build query to find user by _id or clerkId
    let query: any = {
      $or: [
        { clerkId: id },
        { _id: id }
      ]
    };

    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // Exclude immutable fields
    const { _id, clerkId, ...updateFields } = body;

    // We return the updated document to get the correct Clerk ID if we didn't have it
    const result = await db.collection("users").findOneAndUpdate(
        query,
        { $set: updateFields },
        { upsert: false, returnDocument: 'after' } 
    );

    let updatedUser = result;

    if (!updatedUser) {
        // Handle Upsert Logic for new Client (if applicable)
        // Note: findOneAndUpdate with upsert=false returns null if not found.
        
        // If we want to support creation via PATCH for clients:
        const upsertResult = await db.collection("users").findOneAndUpdate(
            { clerkId: id }, // Assume id is clerkId
            { 
                $set: { 
                    ...updateFields, 
                    role: "client", 
                    createdAt: new Date(),
                    clerkId: id 
                } 
            },
            { upsert: true, returnDocument: 'after' }
        );
        updatedUser = upsertResult;
    }

    // 2. Sync to Clerk Metadata
    if (updatedUser && updatedUser.clerkId) {
        const client = await clerkClient();
        await client.users.updateUser(updatedUser.clerkId, {
            publicMetadata: {
                role: updatedUser.role,
                monkStatus: updatedUser.monkStatus, // Might be undefined for clients, which is fine
            },
            unsafeMetadata: {
                phone: updatedUser.phone,
                name: updatedUser.name
            }
        });

        // 3. Add Phone Number as Login Identifier (Auto-Verified for MVP)
        if (updatedUser.phone) {
            try {
                await client.phoneNumbers.createPhoneNumber({
                    userId: updatedUser.clerkId,
                    phoneNumber: updatedUser.phone,
                    verified: true 
                });
            } catch (e) {
                console.log("Note: Could not add phone number to Clerk (might already exist):", e);
            }
        }
    }

    return NextResponse.json({ message: "User profile updated", success: true });

  } catch (error: any) {
    console.error("User Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
