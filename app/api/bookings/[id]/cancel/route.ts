import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { sendBookingCancellation } from "@/lib/mail";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!JWT_SECRET) return NextResponse.json({ message: 'Server config error' }, { status: 500 });

  try {
    // Authenticate
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

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find the booking
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return NextResponse.json({ message: "Захиалга олдсонгүй" }, { status: 404 });
    }

    // Authorization check — only the client or admin can cancel
    const isClient = booking.clientId === authenticatedUserId;
    const user = await db.collection("users").findOne({
      $or: [{ clerkId: authenticatedUserId }, { _id: ObjectId.isValid(authenticatedUserId) ? new ObjectId(authenticatedUserId) : null }]
    });
    const isAdmin = user?.role === 'admin';

    if (!isClient && !isAdmin) {
      return NextResponse.json({ message: "Зөвшөөрөлгүй" }, { status: 403 });
    }

    // Already cancelled or completed?
    if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
      return NextResponse.json({ message: `Захиалга аль хэдийн ${booking.status} байна` }, { status: 400 });
    }

    // 24-hour cancellation fee policy
    const [year, month, day] = (booking.date as string).split('-').map(Number);
    const [hours, minutes] = (booking.time as string).split(':').map(Number);
    const bookingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const feeApplied = hoursUntilBooking < 24 && hoursUntilBooking > 0;
    const feeAmount = feeApplied ? 10000 : 0; // 10,000₮ cancellation fee

    // Update booking status
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: authenticatedUserId,
          feeApplied,
          feeAmount,
          updatedAt: new Date()
        }
      }
    );

    // Fetch monk details for notification
    let monk = null;
    try {
      const monkQ = ObjectId.isValid(booking.monkId)
        ? { _id: new ObjectId(booking.monkId) }
        : { _id: booking.monkId };
      monk = await db.collection("users").findOne(monkQ);
    } catch { /* ignore */ }

    // Send cancellation emails to both sides
    try {
      const monkName = monk?.name?.mn || monk?.name?.en || 'Лам';
      const serviceName = booking.serviceName?.mn || booking.serviceName?.en || 'Засал';

      // To client
      if (booking.userEmail) {
        await sendBookingCancellation({
          to: booking.userEmail,
          toName: booking.clientName || 'Хэрэглэгч',
          monkName,
          serviceName,
          date: booking.date,
          time: booking.time,
          feeApplied,
          feeAmount,
          role: 'client'
        });
      }

      // To monk
      if (monk?.email) {
        await sendBookingCancellation({
          to: monk.email,
          toName: monkName,
          monkName,
          serviceName,
          date: booking.date,
          time: booking.time,
          feeApplied,
          feeAmount,
          role: 'monk',
          clientName: booking.clientName
        });
      }
    } catch (emailErr) {
      console.error("Cancellation email failed:", emailErr);
    }

    // In-app notification
    try {
      await db.collection("notifications").insertOne({
        userId: booking.clientId,
        title: { mn: "Захиалга цуцлагдлаа", en: "Booking Cancelled" },
        message: {
          mn: feeApplied ? `Таны захиалга цуцлагдлаа. Цуцлалтын хураамж: ${feeAmount.toLocaleString()}₮` : "Таны захиалга амжилттай цуцлагдлаа.",
          en: feeApplied ? `Your booking was cancelled. Cancellation fee: ₮${feeAmount.toLocaleString()}` : "Your booking has been successfully cancelled."
        },
        type: "booking",
        read: false,
        createdAt: new Date()
      });
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      status: 'cancelled',
      feeApplied,
      feeAmount,
      message: feeApplied
        ? `Захиалга цуцлагдлаа. Цуцлалтын хураамж ${feeAmount.toLocaleString()}₮ хэрэглэгдэнэ.`
        : "Захиалга амжилттай цуцлагдлаа."
    });

  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ message: "Цуцлах явцад алдаа гарлаа", error: error.message }, { status: 500 });
  }
}
