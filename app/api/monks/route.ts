import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { Monk } from "@/database/types";

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();

    if (!data.clerkId) {
      return NextResponse.json({ message: "Missing clerkId." }, { status: 400 });
    }

    const { _id, ...updateFields } = data;

    // IMPORTANT: Set role directly to "monk" and remove monkStatus
    const result = await db.collection("users").updateOne(
      { clerkId: data.clerkId },
      {
        $set: {
          ...updateFields,
          role: "monk", // Now directly set to monk
          monkStatus: "approved", // Optional, but helps ensure state is consistent if old data had it
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          karma: 0,
          meditationDays: 0,
          totalMerits: 0,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Monk profile saved.", result }); // Updated message
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to save profile.", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    // Fetch from 'users' collection where role is 'monk'
    // Projection: Select only necessary fields for the list view to reduce payload size
    const monks = await db.collection("users").find(
      { role: "monk" }, 
      { 
        projection: { 
           _id: 1, 
           name: 1, 
           title: 1, 
           image: 1, 
           specialties: 1, 
           isSpecial: 1, 
           yearsOfExperience: 1,
           bio: 1 // Maybe truncate bio in frontend or separate detail view? Keep for now.
        } 
      }
    ).toArray() as unknown as Monk[];

    // Serialize _id to string to avoid serialization issues in Next.js response
    let serializedMonks = monks.map(monk => ({
      ...monk,
      _id: monk._id?.toString() ?? ""
    }));

    // SORTING: Special monks (Admin designated) first
    serializedMonks.sort((a, b) => {
      const isASpecial = a.isSpecial === true;
      const isBSpecial = b.isSpecial === true;

      if (isASpecial && !isBSpecial) return -1;
      if (!isASpecial && isBSpecial) return 1;
      return 0;
    });

    return NextResponse.json(serializedMonks);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch monks.", error: error.message },
      { status: 500 }
    );
  }
}