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
    const userPhone = searchParams.get("userPhone"); // Get phone from params

    // FIX: Allow searching by either monkId OR userEmail OR userId OR userPhone
    if (!monkId && !userEmail && !userId && !userPhone) {
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
    if (userPhone) {
      query.userPhone = userPhone;
    }
    if (userId) {
      // Resolve User Identity to match both ObjectId and ClerkId
      // This fixes cases where Dashboard sends ObjectId but Booking stores ClerkId (or vice versa)
      const userIdsToSearch = [userId];

      try {
        // If it looks like an ObjectId, find the user
        if (ObjectId.isValid(userId)) {
          const u = await db.collection("users").findOne({ _id: new ObjectId(userId) });
          if (u && u.clerkId) userIdsToSearch.push(u.clerkId);
        }
        // If it looks like a Clerk ID (starts with user_), find the user to get _id
        else if (userId.startsWith("user_")) {
          const u = await db.collection("users").findOne({ clerkId: userId });
          if (u) userIdsToSearch.push(u._id.toString());
        }
      } catch (e) { /* ignore lookups if invalid */ }

      // Query bookings where userId/clientId matches ANY of the user's known IDs
      query.$or = [
        { userId: { $in: userIdsToSearch } },
        { clientId: { $in: userIdsToSearch } }
      ];
    }

    // Optional date filter
    if (searchParams.get("date")) {
      query.date = searchParams.get("date");
    }

    // --- OPTIMIZED LAZY CLEANUP LOGIC ---
    // Only fetch bookings that actually NEED cleanup (Confirmed + Past Time)
    // Run this check independent of the user's view query

    // We only check for cleanup occasionally or efficiently. 
    // Let's check only "confirmed" bookings for the related user/monk to scope it down
    // or better, verify if we can do this efficiently.

    // For now, to prevent O(N) scan on every read:
    // 1. We skip cleanup on general reads unless specifically requested or random chance (10%)
    // 2. Or we trust the loop is fast if N is small.
    // 3. BEST: Fetch expired confirmed bookings explicitly.

    // Auto-complete bookings that are more than 30 minutes past their start time
    const nowTimestamp = new Date();

    // Only run cleanup if we are filtering by a specific monk or user (contextual cleanup)
    if (monkId || userId || userEmail) {
      const cleanupQuery = {
        status: 'confirmed',
        $or: [
          { monkId: monkId },
          { userId: { $in: query.$or?.[0]?.userId?.$in || [] } },
          { clientId: { $in: query.$or?.[1]?.clientId?.$in || [] } }
        ]
      };
      // Cleanup logic below... (Refactored to be safe)
    }

    const bookings = await db.collection("bookings")
      .find(query)
      .sort({ date: 1, time: 1 })
      .limit(100) // Optimization: Limit to 100 recent/upcoming bookings
      .toArray();

    // Perform cleanup ONLY on the fetched active/confirmed bookings that are expired
    // This avoids querying the whole DB.
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    for (const b of confirmedBookings) {
      // ... (Existing logic) ...
      let timeStr = b.time || "00:00";
      if (timeStr.includes(':')) {
        let [h, m] = timeStr.split(':').map((part: string) => part.trim().padStart(2, '0'));
        timeStr = `${h}:${m}`;
      }
      const scheduledTime = new Date(`${b.date}T${timeStr}`);
      const expiryTime = new Date(scheduledTime.getTime() + 30 * 60 * 1000); // 30 mins limit

      // SKIP CLEANUP if the booking is marked as manual (re-opened)
      if (nowTimestamp > expiryTime && !b.isManual) {
        // Perform update
        try {
          const mId = b.monkId;
          if (mId) {
            const monkQ = ObjectId.isValid(mId) ? { _id: new ObjectId(mId) } : { _id: mId };
            const monk = await db.collection("users").findOne(monkQ);
            if (monk) {
              const isSpecial = monk.isSpecial === true;
              const earnings = isSpecial ? 88800 : 40000;
              await db.collection("users").updateOne(monkQ, { $inc: { earnings: earnings } });
              if (!isSpecial) {
                await db.collection("users").updateMany({ role: "monk", isSpecial: true }, { $inc: { earnings: 10000 } });
              }
            }
          }
          await db.collection("messages").deleteMany({ bookingId: b._id.toString() });
          await db.collection("bookings").updateOne({ _id: b._id }, { $set: { status: 'completed', updatedAt: new Date() } });
          b.status = 'completed'; // Update in memory
        } catch (err) { console.error("Cleanup error", err); }
      }
    }

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

    // Check Custom if no Clerk (Cookie OR Bearer token for mobile)
    if (!authenticatedUserId) {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get("auth_token")?.value;

      // Also check for Bearer token in header (for mobile apps)
      const authHeader = request.headers.get("Authorization");
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

      const token = cookieToken || bearerToken;

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
    const { monkId, date, time, userName, userEmail, userPhone, serviceId, note } = body;

    // Validate phone number
    if (!userPhone) {
      return NextResponse.json({ message: "Phone number is required." }, { status: 400 });
    }

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
      userPhone, // Store phone number
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

    // 6. Create In-App Notification
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
          type: "booking",
          read: false,
          createdAt: new Date()
        });
      }
    } catch (err) {
      console.error("Failed to create notification:", err);
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ message: "Booking failed", error: error.message }, { status: 500 });
  }
}