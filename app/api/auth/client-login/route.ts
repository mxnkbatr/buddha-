import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod"; // Ensure this is set in .env

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json(); // identifier is phone

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
      );
    }

    // Format phone if needed, but assuming input is handled by frontend
    const phone = identifier.startsWith("+") ? identifier : `+${identifier.replace(/\s/g, '')}`; // Basic sanitation

    const { db } = await connectToDatabase();

    // Find user (search by phone)
    // We might want to support email login too if we allow email in signup
    let user = await db.collection<User>("users").findOne({
      $or: [
        { phone: identifier },
        { phone: phone }
      ]
    });

    if (!user) {
      // Fallback: Try regex on last 8 digits (Mongolian number length) to be robust against formatting +976 vs 89...
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 8) {
        const searchPattern = digits.slice(-8);
        user = await db.collection<User>("users").findOne({
          phone: { $regex: searchPattern }
        });
      }
    }

    if (!user) {
      return NextResponse.json({
        message: "User not found"
      }, { status: 404 });
    }

    // Verify Password
    if (!user.password) {
      // This user might be a Clerk user trying to login via custom form
      // or a legacy user.
      return NextResponse.json({ message: "Please log in with the correct method." }, { status: 409 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    // Create JWT
    const token = await new SignJWT({
      sub: user._id?.toString(),
      role: user.role,
      clerkId: user.clerkId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Long-lived session
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Client Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
