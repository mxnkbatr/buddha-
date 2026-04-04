import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({ message: 'Server config error' }, { status: 500 });

  try {
    let authenticatedUserId: string | null = null;

    const { userId: clerkUserId } = await auth();
    authenticatedUserId = clerkUserId;

    if (!authenticatedUserId) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value
        || request.headers.get("Authorization")?.replace("Bearer ", "");
      if (token) {
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
          authenticatedUserId = payload.sub as string;
        } catch { /* invalid token */ }
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Verify monk role
    const user = await db.collection("users").findOne({
      $or: [
        { clerkId: authenticatedUserId },
        ...(ObjectId.isValid(authenticatedUserId) ? [{ _id: new ObjectId(authenticatedUserId) }] : [])
      ]
    });

    if (!user || (user.role !== "monk" && user.role !== "admin")) {
      return NextResponse.json({ message: "Зөвхөн лам хэрэглэгч цаг хааж болно" }, { status: 403 });
    }

    const { date, time } = await request.json();
    if (!date || !time) {
      return NextResponse.json({ message: "date and time are required" }, { status: 400 });
    }

    const blockBooking = {
      monkId: user._id.toString(),
      clientId: authenticatedUserId,
      clientName: "Хаасан цаг",
      serviceName: { mn: "Хаасан цаг", en: "Blocked Slot" },
      date,
      time,
      status: "blocked",
      userEmail: user.email || "",
      userPhone: user.phone || "",
      note: "Лам өөрсдөө хаасан",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(blockBooking);

    return NextResponse.json({ _id: result.insertedId, ...blockBooking });
  } catch (error: any) {
    console.error("Block slot error:", error);
    return NextResponse.json({ message: "Цаг хаах явцад алдаа гарлаа" }, { status: 500 });
  }
}
