import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Clerk metadata can be used to pass the phone number collected on sign-up
    const role = user.unsafeMetadata?.role as string || "client";
    const phone = user.unsafeMetadata?.phone as string || user.phoneNumbers?.[0]?.phoneNumber || "";
    
    // Safely get email if it exists
    const email = user.emailAddresses?.[0]?.emailAddress;

    const updateData: any = {
      clerkId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.imageUrl,
      role: role,
      updatedAt: new Date(),
    };

    if (email) {
      updateData.email = email;
    }

    // Only update phone if it's not empty, to avoid overwriting with empty string on subsequent syncs if metadata is lost
    if (phone) {
        updateData.phone = phone;
    }

    // Upsert User
    await db.collection("users").updateOne(
      { clerkId: user.id },
      {
        $set: updateData,
        $setOnInsert: {
          createdAt: new Date(),
          karma: 0,
          meditationDays: 0,
          totalMerits: 0,
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
