import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { phoneNumber, password, email, firstName, lastName, dateOfBirth, zodiacYear } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists by phone OR email (could be a Clerk-synced user)
    const searchConditions: any[] = [{ phone: phoneNumber }];
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length >= 8) {
      searchConditions.push({ phone: { $regex: digits.slice(-8) } });
    }
    if (email) {
      searchConditions.push({ email: email });
    }

    const existingUser = await db.collection<User>("users").findOne({ $or: searchConditions });

    if (existingUser) {
      if (existingUser.password) {
        return NextResponse.json(
          { message: "User with this phone number already exists" },
          { status: 409 }
        );
      }

      // User exists (e.g., Clerk-synced) but has no password — link accounts by adding password
      await db.collection("users").updateOne(
        { _id: existingUser._id as any },
        {
          $set: {
            password: hashedPassword,
            phone: phoneNumber,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(zodiacYear && { zodiacYear }),
            ...(email && { email }),
            updatedAt: new Date(),
          }
        }
      );

      return NextResponse.json(
        { message: "Account linked successfully", userId: existingUser._id },
        { status: 200 }
      );
    }

    // No existing user — create a new one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newUser: any = {
      clerkId: "custom-db-" + new ObjectId().toString(),
      phone: phoneNumber,
      firstName: firstName || "",
      lastName: lastName || "",
      dateOfBirth: dateOfBirth || null,
      zodiacYear: zodiacYear || null,
      password: hashedPassword,
      role: "seeker",
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
