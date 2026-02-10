import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db"; // Assuming this path is correct
import { ObjectId } from "mongodb";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>; // This resolves to { id: string }
};

// --- GET Function ---
export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params; // This 'id' can be a MongoDB _id or a Clerk user_id

    const { db } = await connectToDatabase();

    // Build query to find user by _id or clerkId
    let query: any = {
      $or: [
        { clerkId: id }, // Try to match with Clerk User ID
        { _id: id }      // Try to match with MongoDB ObjectId (as string)
      ]
    };

    // If the provided ID is a valid MongoDB ObjectId string, also query by it
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

// --- PATCH Function ---
export async function PATCH(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params; // This 'id' can be a MongoDB _id or a Clerk user_id
    const body = await request.json();

    const { db } = await connectToDatabase();

    // 1. Build query to find user by _id or clerkId
    // We need to find the user in our database first to get their clerkId if it's not provided directly
    let query: any = {
      $or: [
        { clerkId: id }, // Try to match with Clerk User ID
        { _id: id }      // Try to match with MongoDB ObjectId (as string)
      ]
    };

    // If the provided ID is a valid MongoDB ObjectId string, also query by it
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // Exclude immutable fields from the body if they are present
    const { _id, clerkId, ...updateFields } = body;

    // Update the document in MongoDB
    // We use returnDocument: 'after' to get the updated user object immediately
    const result = await db.collection("users").findOneAndUpdate(
      query,
      { $set: updateFields },
      { upsert: false, returnDocument: 'after' }
    );

    let updatedUser = result;

    // --- Handle Case: User not found in DB ---
    if (!updatedUser) {
      // If the user wasn't found, we need to decide if we should create them.
      // We should ONLY create them if the provided 'id' is a valid Clerk User ID,
      // as this is how we typically associate external users.
      if (id.startsWith("user_")) {
        // Attempt to create a new user in our DB, linking it to the provided Clerk ID
        updatedUser = await db.collection("users").findOneAndUpdate(
          { clerkId: id }, // Use clerkId as the unique identifier for insertion
          {
            $set: {
              ...updateFields, // Apply any fields from the request body
              role: updateFields.role || "client", // Default role if not provided
              createdAt: new Date(),
              clerkId: id // This is the crucial Clerk User ID
            }
          },
          { upsert: true, returnDocument: 'after' } // Create if it doesn't exist and return the new document
        );
      } else {
        // If the ID is not a Clerk ID and the user doesn't exist, we can't proceed.
        return NextResponse.json({ message: "User not found and cannot upsert with invalid ID format." }, { status: 404 });
      }
    }

    // --- Sync to Clerk Metadata (ONLY if we have a valid Clerk ID) ---
    if (updatedUser && updatedUser.clerkId && updatedUser.clerkId.startsWith("user_")) {
      try {
        const client = await clerkClient();

        // Update user in Clerk
        await client.users.updateUser(updatedUser.clerkId, {
          publicMetadata: {
            role: updatedUser.role,
            monkStatus: updatedUser.monkStatus, // May be undefined, which is fine
          },
          unsafeMetadata: {
            phone: updatedUser.phone,
            name: updatedUser.name,
          },
        });

        // 3. Add Phone Number to Clerk as a Login Identifier (if provided)
        // This will attempt to create a phone number for the user.
        // If a phone number already exists for this user in Clerk, it will likely throw an error,
        // which we catch and log.
        if (updatedUser.phone) {
          try {
            await client.phoneNumbers.createPhoneNumber({
              userId: updatedUser.clerkId,
              phoneNumber: updatedUser.phone,
              verified: true, // Mark as verified for simplicity in this MVP
            });
            console.log(`Phone number ${updatedUser.phone} added for ${updatedUser.clerkId}`);
          } catch (phoneErr: any) {
            // Log the error but don't fail the whole PATCH request.
            // Common reasons for this error: phone number already exists for this user.
            console.log(`Note: Could not add phone number to Clerk for user ${updatedUser.clerkId} (might already exist or invalid format):`, phoneErr.errors || phoneErr.message);
          }
        }
      } catch (clerkErr: any) {
        console.error(`Error syncing user ${updatedUser.clerkId} to Clerk:`, clerkErr.errors || clerkErr.message);
        // We are catching Clerk errors here to prevent the entire API route from failing
        // if Clerk is temporarily unavailable or a specific user has an issue.
        // You might want to log this for monitoring.
      }
    } else if (updatedUser && !updatedUser.clerkId) {
        console.warn(`User ${updatedUser._id} updated in DB but has no clerkId. Clerk sync skipped.`);
    } else if (updatedUser && updatedUser.clerkId && !updatedUser.clerkId.startsWith("user_")) {
        console.warn(`User ${updatedUser._id} updated in DB with invalid clerkId format: ${updatedUser.clerkId}. Clerk sync skipped.`);
    }


    return NextResponse.json({ message: "User profile updated successfully", success: true });

  } catch (error: any) {
    console.error("User Update Internal Server Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}