import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { sendBookingNotification } from "@/lib/mail";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

// Force dynamic to prevent caching issues (users not seeing new bookings)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monkId = searchParams.get("monkId");
    const userEmail = searchParams.get("userEmail"); // Get email from params
    const userId = searchParams.get("userId"); // Get custom userId from params

    // FIX: Allow searching by either monkId OR userEmail OR userId
    if (!monkId && !userEmail && !userId) {
      return NextResponse.json({ message: "Missing search parameter" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Build query dynamically
    const query: any = {};

    if (monkId) {
      query.monkId = monkId;
    }
    if (userEmail) {
      query.userEmail = userEmail;
    }
    if (userId) {
      // userId could be clientId in bookings collection
      query.$or = [
        { userId: userId },
        { clientId: userId }
      ];
    }

    // Optional date filter
    if (searchParams.get("date")) {
      query.date = searchParams.get("date");
    }

    const bookings = await db.collection("bookings")
      .find(query)
      .sort({ date: 1, time: 1 })
      .toArray();

    // --- LAZY CLEANUP LOGIC ---
    // Auto-complete bookings that are more than 30 minutes past their start time
    const nowTimestamp = new Date();
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    for (const b of confirmedBookings) {
      let timeStr = b.time || "00:00";
      if (timeStr.includes(':')) {
        let [h, m] = timeStr.split(':').map((part: string) => part.trim().padStart(2, '0'));
        timeStr = `${h}:${m}`;
      }
      const scheduledTime = new Date(`${b.date}T${timeStr}`);
      const expiryTime = new Date(scheduledTime.getTime() + 30 * 60 * 1000); // 30 mins limit

      if (nowTimestamp > expiryTime) {
        console.log(`Auto-completing expired booking: ${b._id}`);
        try {
          // 1. Calculate Earnings
          const monkId = b.monkId;
          if (monkId) {
            const monkQuery = ObjectId.isValid(monkId) ? { _id: new ObjectId(monkId) } : { _id: monkId };
            const monk = await db.collection("users").findOne(monkQuery);

            if (monk) {
              const isSpecial = monk.isSpecial === true;
              const earningsAmount = isSpecial ? 88800 : 40000;

              await db.collection("users").updateOne(
                monkQuery,
                { $inc: { earnings: earningsAmount } }
              );

              // Special Commission
              if (!isSpecial) {
                await db.collection("users").updateMany(
                  { role: "monk", isSpecial: true },
                  { $inc: { earnings: 10000 } }
                );
              }
            }
          }

          // 2. Delete Chat History
          await db.collection("messages").deleteMany({ bookingId: b._id.toString() });

          // 3. Update Booking Status
          // Re-connect verify update
          await db.collection("bookings").updateOne(
            { _id: b._id },
            { $set: { status: 'completed', updatedAt: new Date() } }
          );

          // Update local object so UI reflects it immediately
          b.status = 'completed';
        } catch (err) {
          console.error(`Failed to auto-complete booking ${b._id}:`, err);
        }
      }
    }

    // If requesting specific monk and date, just return the times array for easy checking
    if (monkId && searchParams.get("date")) {
      return NextResponse.json(bookings.filter(b => b.status !== 'rejected' && b.status !== 'cancelled').map(b => b.time));
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate (Clerk OR Custom)
    let authenticatedUserId = null;

    // Check Clerk
    const { userId: clerkUserId } = await auth();
    authenticatedUserId = clerkUserId;

    // Check Custom if no Clerk
    if (!authenticatedUserId) {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth_token")?.value;
      if (token) {
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
          authenticatedUserId = payload.sub as string;
        } catch (e) { /* invalid token */ }
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { monkId, date, time, userName, userEmail, serviceId, note } = body;

    const { db } = await connectToDatabase();

    // 1. Validate that the booking time is not in the past
    const [hours, minutes] = time.split(':').map(Number);
    // Parse the date string (YYYY-MM-DD) and set local hours/minutes
    const [year, month, day] = date.split('-').map(Number);
    const bookingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const now = new Date();
    // Allow a small buffer (e.g. 5 minutes) or just check dates. 
    // Strict minute comparison often fails due to server/client clock drift.
    // Let's just block dates strictly prior to Today.
    // For Today's slots, we rely on the UI to not show past slots, or we do a loose check.

    // Check if date is strictly in the past (Yesterday or before)
    const bookingDateOnly = new Date(year, month - 1, day);
    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly < todayDateOnly) {
      console.error("Booking Rejected: Date is in past", { bookingDateOnly, todayDateOnly });
      return NextResponse.json({ message: "Cannot book dates in the past." }, { status: 400 });
    }

    // If it *is* today, check time with a buffer
    if (bookingDateOnly.getTime() === todayDateOnly.getTime()) {
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      // If booking hour is less than current hour, reject
      if (hours < currentHours) {
        console.error("Booking Rejected: Time is past", { time, now: now.toLocaleTimeString() });
        return NextResponse.json({ message: "Time slot has passed." }, { status: 400 });
      }
    }

    // 2. Check Availability
    // We check if a slot is taken for this specific Monk
    const existing = await db.collection("bookings").findOne({
      monkId,
      date,
      time,
      status: { $nin: ["rejected", "cancelled"] } // If previous was rejected or cancelled, slot is free
    });

    if (existing) {
      return NextResponse.json({ message: "Slot already taken" }, { status: 409 });
    }

    // 3. Fetch Monk & Service Details (For the Email Notification)
    let monk = null;
    const monkQuery = ObjectId.isValid(monkId) ? { _id: new ObjectId(monkId) } : { _id: monkId };
    monk = await db.collection("users").findOne(monkQuery);

    let serviceName = "Spiritual Session";

    if (serviceId) {
      // Check standard services collection (uses ObjectId)
      if (ObjectId.isValid(serviceId)) {
        const serviceDoc = await db.collection("services").findOne({ _id: new ObjectId(serviceId) });
        if (serviceDoc) {
          serviceName = serviceDoc.title?.en || serviceDoc.title?.mn || serviceName;
        }
      }

      // If not found, check inside the monk's profile (uses UUID strings)
      if (serviceName === "Spiritual Session" && monk && monk.services) {
        const embedded = monk.services.find((s: any) => s.id === serviceId);
        if (embedded) {
          serviceName = embedded.name?.en || embedded.name?.mn || serviceName;
        }
      }
    }

    // 4. Save Booking
    const newBooking = {
      monkId,
      clientId: body.userId || authenticatedUserId,
      clientName: userName,
      serviceName: { en: serviceName, mn: serviceName },
      date,
      time,
      userEmail,
      note,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection("bookings").insertOne(newBooking);

    // 5. Send Email
    // Wrapped in try/catch so booking succeeds even if email fails
    try {
      if (userEmail) {
        await sendBookingNotification({
          userEmail,
          userName,
          monkName: monk?.name?.en || monk?.name?.mn || "The Monk",
          serviceName: serviceName,
          date,
          time
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ message: "Booking failed", error: error.message }, { status: 500 });
  }
}