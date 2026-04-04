import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
        }

        // 1. Verify Master Password
        if (password !== "Gevabal") {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // 2. Lookup User by Email or Phone
        const client = await clerkClient();
        const isEmail = email.includes("@");

        let userList;
        let debugIdentifier = email;
        let phone = "";

        if (isEmail) {
            userList = await client.users.getUserList({ emailAddress: [email], limit: 1 });
        } else {
            // Handle phone number
            // If it's a Mongolian number (8 digits), add +976 prefix
            // Otherwise, ensure it has a + prefix
            phone = email.replace(/\s/g, '');
            if (/^\d{8}$/.test(phone)) {
                phone = `+976${phone}`;
            } else if (!phone.startsWith("+")) {
                phone = `+${phone}`;
            }

            debugIdentifier = phone;
            userList = await client.users.getUserList({ phoneNumber: [phone], limit: 1 });

            // FALLBACK: If not found by verified phone, search in metadata (unsafeMetadata.phone)
            if (userList.data.length === 0) {
                const allUsers = await client.users.getUserList({ limit: 100 });

                const rawPhone = email.replace(/\s/g, '');
                const formattedPhone = phone;

                const foundUser = allUsers.data.find(u =>
                    (u.unsafeMetadata?.phone as string)?.includes(rawPhone) ||
                    (u.publicMetadata?.phone as string)?.includes(rawPhone) ||
                    (u.unsafeMetadata?.phone as string) === formattedPhone
                );

                if (foundUser) {
                    userList = { data: [foundUser], totalCount: 1 };
                }
            }
        }

        // --- 3. CLERK USER FOUND ---
        if (userList.data.length > 0) {
            const user = userList.data[0];
            const signInToken = await client.signInTokens.createSignInToken({
                userId: user.id,
                expiresInSeconds: 60
            });
            return NextResponse.json({ token: signInToken.token, status: "success", type: "clerk" });
        }

        // --- 4. CLERK FAILED -> TRY CUSTOM DB ---
        // If not found in Clerk, check MongoDB for Custom Users
        const { db } = await connectToDatabase();
        let customUser: User | null = null;

        if (isEmail) {
            customUser = await db.collection<User>("users").findOne({ email: email });
        } else {
            // Identifier is phone
            // Try formatted phone first
            customUser = await db.collection<User>("users").findOne({ phone: phone });

            // If not found, try fallback regex search like client-login
            if (!customUser) {
                const digits = phone.replace(/\D/g, '');
                if (digits.length >= 8) {
                    const searchPattern = digits.slice(-8);
                    customUser = await db.collection<User>("users").findOne({
                        phone: { $regex: searchPattern }
                    });
                }
            }
        }

        if (customUser) {
            // Generate JWT for Custom User
            const token = await new SignJWT({
                sub: customUser._id?.toString(),
                role: customUser.role,
                clerkId: customUser.clerkId
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

            return NextResponse.json({ status: "success", type: "custom" });
        }

        return NextResponse.json({ message: "User not found" }, { status: 404 });

    } catch (error: any) {
        console.error("Master Login Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
