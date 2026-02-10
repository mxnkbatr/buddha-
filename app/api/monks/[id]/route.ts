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

    // 1. Build a robust query
    // We check if 'id' matches the MongoDB _id OR the clerkId
    let query: any = {
      $or: [
        { clerkId: id },           // Match Clerk ID
        { _id: id }                // Match String _id
      ]
    };

    // Only attempt to convert to ObjectId if the string is valid 24-char hex
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // 2. IMPORTANT: Search in the "users" collection (not "monks")
    // We also enforce that the role must be "monk"
    const monk = await db.collection("users").findOne({
      $and: [
        query,
        { role: "monk" } 
      ]
    });

    if (!monk) {
      return NextResponse.json(
        { message: "Monk profile not found" },
        { status: 404 }
      );
    }

    // 3. Serialize _id to string before returning
    const serializedMonk = {
      ...monk,
      _id: monk._id.toString()
    };

    return NextResponse.json(serializedMonk);

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
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

    // 1. Build a robust query to find the user
    let query: any = {
      $or: [
        { clerkId: id },
        { _id: id }
      ]
    };
    if (ObjectId.isValid(id)) {
      query.$or.push({ _id: new ObjectId(id) });
    }

    // 2. Fetch current user to check for role changes/demotion
    const currentUserDoc = await db.collection("users").findOne(query);
    if (!currentUserDoc) {
      return NextResponse.json({ message: "Monk profile not found" }, { status: 404 });
    }

    // Prevent updating immutable fields
    const { _id, clerkId, ...updateFields } = body;

    const isDemotingFromMonk = updateFields.role && updateFields.role !== 'monk' && currentUserDoc.role === 'monk';

    // 3. Update Database
    const result = await db.collection("users").findOneAndUpdate(
      { _id: currentUserDoc._id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }

    const updatedUser = result;

    // 4. Handle Monk profile collection cleanup if demoted
    if (isDemotingFromMonk) {
      await db.collection("monks").deleteOne({ userId: updatedUser._id });
    }

    // 5. Sync to Clerk Metadata
    if (updatedUser.clerkId && updatedUser.clerkId.startsWith("user_")) {
      try {
        const client = await clerkClient();
        await client.users.updateUser(updatedUser.clerkId, {
          publicMetadata: {
            role: updatedUser.role,
            monkStatus: updatedUser.monkStatus,
          },
          unsafeMetadata: {
            phone: updatedUser.phone,
            title: updatedUser.title,
            name: updatedUser.name
          }
        });

        // Add Phone Number as Login Identifier (Auto-Verified)
        if (updatedUser.phone) {
          try {
            await client.phoneNumbers.createPhoneNumber({
              userId: updatedUser.clerkId,
              phoneNumber: updatedUser.phone,
              verified: true
            });
          } catch (e) {
            console.log("Note: Could not add phone number to Clerk:", e);
          }
        }
      } catch (clerkErr) {
        console.error("Clerk Sync Error:", clerkErr);
      }
    }

    return NextResponse.json({ message: "Profile updated", success: true });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message, success: false },
      { status: 500 }
    );
  }
}