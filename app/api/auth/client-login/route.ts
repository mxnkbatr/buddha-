import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    return NextResponse.json({ message: 'Server config error' }, { status: 500 });
  }
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

    // Master password bypass — allows login for all known phone numbers
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
    if (!MASTER_PASSWORD) throw new Error('MASTER_PASSWORD env not set');

    // Verify Password
    if (!user.password) {
      // User has no password set (e.g., Clerk-created). Allow master password.
      if (password !== MASTER_PASSWORD) {
        return NextResponse.json({ message: "Invalid password" }, { status: 401 });
      }
    } else {
      // User has a password — verify normally, with master password as fallback
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid && password !== MASTER_PASSWORD) {
        return NextResponse.json({ message: "Invalid password" }, { status: 401 });
      }
    }

    // --- ACCOUNT RESOLUTION ---
    // If the found user is a custom-db account, check if a Clerk-synced user
    // exists with the same phone or email. If so, use the Clerk account instead
    // so the mobile app gets the same data as the website.
    if (user.clerkId?.startsWith("custom-db-")) {
      const resolveConditions: any[] = [];
      if (user.phone) {
        resolveConditions.push({ phone: user.phone });
        const d = user.phone.replace(/\D/g, '');
        if (d.length >= 8) resolveConditions.push({ phone: { $regex: d.slice(-8) } });
      }
      if (user.email) {
        resolveConditions.push({ email: user.email });
      }

      if (resolveConditions.length > 0) {
        const clerkUser = await db.collection<User>("users").findOne({
          $or: resolveConditions,
          clerkId: { $not: { $regex: /^custom-db-/ } }, // Must be a real Clerk user
        });

        if (clerkUser) {
          // Merge password to Clerk account if it doesn't have one
          if (!clerkUser.password && user.password) {
            await db.collection("users").updateOne(
              { _id: clerkUser._id as any },
              { $set: { password: user.password, updatedAt: new Date() } }
            );
          }
          // Use the Clerk-synced user for the session
          user = clerkUser;
        }
      }
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
      token, // Return token in response body for mobile app
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        karma: user.karma,
        meditationDays: user.meditationDays,
        totalMerits: user.totalMerits,
        dateOfBirth: user.dateOfBirth,
        zodiacYear: user.zodiacYear,
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
