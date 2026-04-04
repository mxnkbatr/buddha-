import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return { id: payload.sub as string, type: 'custom' };
    } catch (e) {
      console.log("Custom token failed");
    }
  }
  const clerkUser = await currentUser();
  if (clerkUser) return { id: clerkUser.id, type: 'clerk' };
  return null;
}

export async function GET() {
  try {
    const session = await getUserId();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const notifications = await db.collection("notifications")
      .find({ userId: session.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ 
      notifications: notifications.map(n => ({
        ...n,
        _id: n._id.toString()
      }))
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getUserId();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notificationId, all } = await request.json();
    const { db } = await connectToDatabase();

    if (all) {
      await db.collection("notifications").updateMany(
        { userId: session.id, read: false },
        { $set: { read: true } }
      );
    } else if (notificationId) {
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(notificationId), userId: session.id },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
