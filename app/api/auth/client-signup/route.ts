import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { phoneNumber, password, email } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({ phone: phoneNumber });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newUser: any = {
      clerkId: "custom-db-" + new ObjectId().toString(), // Placeholder ID
      phone: phoneNumber,
      password: hashedPassword,
      role: "seeker", // Default to seeker/client
      karma: 0,
      meditationDays: 0,
      totalMerits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (email) {
      newUser.email = email;
    }

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      { message: "User registered successfully", userId: result.insertedId },
      { status: 201 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Client Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
