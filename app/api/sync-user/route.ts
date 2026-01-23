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

    // Check if user exists first to protect ROLE changes
    const existingUser = await db.collection("users").findOne({ clerkId: user.id });

    const updateData: any = {
      clerkId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.imageUrl,
      // role: role, // REMOVED from default $set to prevent overwriting Admin/Monk with 'client'
      updatedAt: new Date(),
    };

    if (email) {
      updateData.email = email;
    }

    if (phone) {
      updateData.phone = phone;
    }

    // Upsert User
    // We use $set for fields we always want to sync (Profile info)
    // We use $setOnInsert for fields that should only be set once (Role, Karma, etc)
    const setOnInsert: any = {
      createdAt: new Date(),
      karma: 0,
      meditationDays: 0,
      totalMerits: 0,
    };

    // Only set role if user is new, otherwise respect DB role
    if (!existingUser) {
      setOnInsert.role = role;
    }

    await db.collection("users").updateOne(
      { clerkId: user.id },
      {
        $set: updateData,
        $setOnInsert: setOnInsert
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
