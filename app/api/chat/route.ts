import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { Message } from "@/database/types";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

// Helper to get authenticated user from Clerk or Custom JWT
async function getAuthenticatedUser(request?: Request | NextRequest) {
  // 1. Try Clerk
  const clerkUser = await currentUser();
  if (clerkUser) {
    return {
      id: clerkUser.id,
      fullName: clerkUser.fullName,
      role: clerkUser.publicMetadata.role as string,
      isClerk: true
    };
  }

  // 2. Try Custom JWT (Cookie OR Bearer token for mobile)
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("auth_token")?.value;

  // Also check Bearer token in header (for mobile apps)
  const authHeader = request?.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  const token = cookieToken || bearerToken;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const { db } = await connectToDatabase();
      const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });

      if (dbUser) {
        return {
          id: dbUser._id.toString(),
          fullName: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : (dbUser.phone || "User"),
          role: dbUser.role,
          isClerk: false
        };
      }
    } catch (e) {
      // Invalid token
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // 1. Fetch Booking to check permissions
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }

    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Authorization Check
    // Handle both Clerk ID and Custom ID (ObjectId string)
    const isClient = booking.clientId === user.id || booking.userId === user.id; // Support legacy userId
    const isAdmin = user.role === "admin";

    let isMonk = false;
    if (booking.monkId) {
      try {
        const monkId = ObjectId.isValid(booking.monkId) ? new ObjectId(booking.monkId) : booking.monkId;
        const monkProfile = await db.collection("users").findOne({ _id: monkId });

        if (monkProfile) {
          // Check if current user matches monk's Clerk ID or DB ID
          if (monkProfile.clerkId === user.id || monkProfile._id.toString() === user.id) {
            isMonk = true;
          }
        }
      } catch (e) {
        console.error("Error fetching monk for chat auth", e);
      }
    }

    if (!isClient && !isMonk && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await db
      .collection<Message>("messages")
      .find({ bookingId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, text, senderName: bodySenderName } = await req.json();

    if (!bookingId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // 1. Fetch Booking
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. CHECK STATUS: Prevent chat if completed or cancelled
    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return NextResponse.json({ error: "Chat is closed for this booking" }, { status: 403 });
    }

    // 3. Authorization Check
    const isClient = booking.clientId === user.id || booking.userId === user.id;
    const isAdmin = user.role === "admin";
    let isMonk = false;

    if (booking.monkId) {
      const monkId = ObjectId.isValid(booking.monkId) ? new ObjectId(booking.monkId) : booking.monkId;
      const monkProfile = await db.collection("users").findOne({ _id: monkId });
      if (monkProfile && (monkProfile.clerkId === user.id || monkProfile._id.toString() === user.id)) {
        isMonk = true;
      }
    }

    if (!isClient && !isMonk && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Construct Message with Verified Sender
    const senderName = user.fullName || bodySenderName || "User";

    const message: Message = {
      bookingId,
      senderId: user.id, // Enforce authenticated user ID
      senderName,
      text,
      createdAt: new Date(),
    };

    const result = await db.collection<Message>("messages").insertOne(message);

    return NextResponse.json({ ...message, _id: result.insertedId });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
