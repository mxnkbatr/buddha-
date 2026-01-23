import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

export async function GET() {
  try {
    // 1. Check Custom Cookie first
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        const userId = payload.sub as string;

        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (user) {
          return NextResponse.json({
            user: {
              ...user,
              id: user._id, // normalizing ID
              isAuthenticated: true,
              authType: 'custom'
            }
          });
        }
      } catch (e) {
        console.error("Invalid Token", e);
        // Token invalid, continue to Clerk check
      }
    }

    // 2. Check Clerk
    // This might throw/redirect if not protected, but in an API route it usually returns null
    const clerkUser = await currentUser();

    if (clerkUser) {
        // Fetch full profile from DB if needed, or just return Clerk data
        // Ideally we sync-ed, so we can fetch from DB using clerkId
        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne({ clerkId: clerkUser.id });

        return NextResponse.json({
            user: {
                ...(user || {}), // Merge DB data
                id: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress,
                avatar: clerkUser.imageUrl,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                isAuthenticated: true,
                authType: 'clerk'
            }
        });
    }

    return NextResponse.json({ user: null });

  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
