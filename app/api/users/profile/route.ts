import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

export async function GET(request: Request) {
    try {
        let userId: string | null = null;

        // 1. Check Custom Cookie first
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        // Check for Bearer token in header (for mobile)
        const authHeader = request.headers.get("Authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

        const effectiveToken = token || bearerToken;

        if (effectiveToken) {
            try {
                // If it's a Clerk token, jwtVerify might fail if secret differs, but we assume custom auth here for simplicity or handle Clerk separately
                // Ideally we verify Clerk tokens using Clerk SDK, but for now let's try custom JWT verification
                try {
                    const { payload } = await jwtVerify(effectiveToken, new TextEncoder().encode(JWT_SECRET));
                    userId = payload.sub as string;
                } catch (e) {
                    // If custom verification fails, might be Clerk token, we rely on Clerk SDK below
                    console.log("Custom token verification failed, checking Clerk...");
                }
            } catch (e) {
                console.error("Invalid Token", e);
            }
        }

        // 2. Check Clerk if not found via custom token using currentUser() which handles Headers too
        if (!userId) {
            const clerkUser = await currentUser();
            if (clerkUser) {
                // We need to resolve the MongoDB _id from the Clerk ID
                const { db } = await connectToDatabase();
                const user = await db.collection("users").findOne({ clerkId: clerkUser.id });
                if (user) {
                    userId = user._id.toString();
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // don't return password
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);

    } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { firstName, lastName, dateOfBirth, zodiacYear } = await request.json();
        console.log("Profile Update Request:", { firstName, lastName, dateOfBirth, zodiacYear });

        if (!firstName || !lastName || !dateOfBirth || !zodiacYear) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        let userId: string | null = null;
        let authType: 'custom' | 'clerk' | null = null;

        // 1. Check Custom Cookie first
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        // Also check for Bearer token in header (for mobile apps)
        const authHeader = request.headers.get("Authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

        const effectiveToken = token || bearerToken;

        if (effectiveToken) {
            try {
                const { payload } = await jwtVerify(effectiveToken, new TextEncoder().encode(JWT_SECRET));
                userId = payload.sub as string;
                authType = 'custom';
            } catch (e) {
                console.error("Invalid Token", e);
            }
        }

        // 2. Check Clerk if not custom
        if (!userId) {
            const clerkUser = await currentUser();
            if (clerkUser) {
                // We need to resolve the MongoDB _id from the Clerk ID
                const { db } = await connectToDatabase();
                const user = await db.collection("users").findOne({ clerkId: clerkUser.id });
                if (user) {
                    userId = user._id.toString();
                    authType = 'clerk';
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { db } = await connectToDatabase();

        // Update the user
        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    zodiacYear,
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({ success: true, message: "Profile updated successfully" });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
