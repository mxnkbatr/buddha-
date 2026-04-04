import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { sendBookingNotification } from "@/lib/mail";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const { searchParams } = new URL(request.url);
    const monkId = searchParams.get("monkId");
    const userEmail = searchParams.get("userEmail");
    const userId = searchParams.get("userId");
    const userPhone = searchParams.get("userPhone");

    if (!monkId && !userEmail && !userId && !userPhone) {
      return NextResponse.json({ message: "Missing search parameter" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const query: any = {};

    if (monkId) query.monkId = monkId;
    if (userEmail) query.userEmail = userEmail;
    if (userPhone) query.userPhone = userPhone;
    
    if (userId) {
      const userIdsToSearch = [userId];
      try {
        if (ObjectId.isValid(userId)) {
          const u = await db.collection("users").findOne({ _id: new ObjectId(userId) });
          if (u && u.clerkId) userIdsToSearch.push(u.clerkId);
        } else if (userId.startsWith("user_")) {
          const u = await db.collection("users").findOne({ clerkId: userId });
          if (u) userIdsToSearch.push(u._id.toString());
        }
      } catch (e) {}
      query.$or = [{ userId: { $in: userIdsToSearch } }, { clientId: { $in: userIdsToSearch } }];
    }

    if (searchParams.get("date")) query.date = searchParams.get("date");

    const bookings = await db.collection("bookings")
      .find(query)
      .sort({ date: 1, time: 1 })
      .limit(100)
      .toArray();

    if (monkId && searchParams.get("date")) {
      return NextResponse.json(bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').map(b => b.time));
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    let authenticatedUserId = null;
    const { userId: clerkUserId } = await auth();
    authenticatedUserId = clerkUserId;

    if (!authenticatedUserId) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      const authHeader = request.headers.get("Authorization");
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      const effectiveToken = token || bearerToken;

      if (effectiveToken) {
        try {
          const { payload } = await jwtVerify(effectiveToken, new TextEncoder().encode(JWT_SECRET));
          authenticatedUserId = payload.sub as string;
        } catch (e) {}
      }
    }

    if (!authenticatedUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { monkId, date, time, userName, userEmail, userPhone, serviceId, note } = body;

    if (!userPhone) return NextResponse.json({ message: "Phone number is required." }, { status: 400 });

    const { db } = await connectToDatabase();

    // 1. past date check
    const [hours, minutes] = time.split(':').map(Number);
    const [year, month, day] = date.split('-').map(Number);
    const bookingDateOnly = new Date(year, month - 1, day);
    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly < todayDateOnly) return NextResponse.json({ message: "Cannot book dates in the past." }, { status: 400 });

    // 2. Atomic Slot Lock
    await db.collection('booking_locks').deleteMany({ expiresAt: { $lte: new Date() } });
    let lockId: any = null;
    try {
      const lockResult = await db.collection('booking_locks').insertOne({
        monkId, date, time, lockedAt: new Date(), lockedBy: authenticatedUserId, expiresAt: new Date(Date.now() + 30000)
      });
      lockId = lockResult.insertedId;
    } catch (lockErr: any) {
      if (lockErr.code === 11000) return NextResponse.json({ message: 'Энэ цаг дээр өөр хүн ажиллаж байна, дахин оролдоно уу' }, { status: 409 });
      throw lockErr;
    }

    const existing = await db.collection("bookings").findOne({ monkId, date, time, status: { $in: ['confirmed', 'pending'] } });
    if (existing) {
      if (lockId) await db.collection('booking_locks').deleteOne({ _id: lockId });
      return NextResponse.json({ message: 'Энэ цаг аль хэдийн захиалагдсан байна' }, { status: 409 });
    }

    // 3. Monk & Service Details
    const monkQuery = ObjectId.isValid(monkId) ? { _id: new ObjectId(monkId) } : { _id: monkId };
    const monk = await db.collection("users").findOne(monkQuery);
    let serviceName = "Spiritual Session";

    if (serviceId) {
      if (ObjectId.isValid(serviceId)) {
        const serviceDoc = await db.collection("services").findOne({ _id: new ObjectId(serviceId) });
        if (serviceDoc) serviceName = serviceDoc.title?.en || serviceDoc.title?.mn || serviceName;
      }
      if (serviceName === "Spiritual Session" && monk?.services) {
        const embedded = monk.services.find((s: any) => s.id === serviceId);
        if (embedded) serviceName = embedded.name?.en || embedded.name?.mn || serviceName;
      }
    }

    // 4. Save Booking
    const newBooking = {
      monkId, clientId: body.userId || authenticatedUserId, clientName: userName, serviceName: { en: serviceName, mn: serviceName },
      date, time, userEmail, userPhone, note, status: 'pending', createdAt: new Date()
    };
    const result = await db.collection("bookings").insertOne(newBooking);
    if (lockId) await db.collection('booking_locks').deleteOne({ _id: lockId });

    // 5. Notifications
    try {
      if (userEmail) {
        await sendBookingNotification({
          userEmail, userName, monkName: monk?.name?.en || monk?.name?.mn || "The Monk", serviceName, date, time
        });
      }
      if (monk?.email) {
        await sendBookingNotification({
          userEmail: monk.email, userName: `[Шинэ захиалга] ${userName}`, monkName: monk?.name?.mn || monk?.name?.en || 'Та', serviceName, date, time
        });
      }
    } catch (e) {}

    // In-App Notification
    try {
      const clientId = body.userId || authenticatedUserId;
      if (clientId) {
        await db.collection("notifications").insertOne({
          userId: clientId,
          title: { mn: "Захиалга илгээгдлээ", en: "Booking Requested" },
          message: { 
            mn: `${monk?.name?.mn || "Лам"}-д засал захиалах хүсэлт илгээгдлээ.`, 
            en: `Request sent to ${monk?.name?.en || "the Monk"} for a session.` 
          },
          type: "booking", read: false, createdAt: new Date()
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ message: "Booking failed", error: error.message }, { status: 500 });
  }
}