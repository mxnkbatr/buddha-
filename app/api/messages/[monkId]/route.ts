import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuth } from "@clerk/nextjs/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to get authenticated user
async function getAuthenticatedUser(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Check Authorization header for custom JWT (Mobile app)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      if (!JWT_SECRET) return null; // Let the main route throw a 500
      const token = authHeader.split(" ")[1];
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        
        if (payload && payload.sub) {
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
          if (dbUser) return { user: dbUser, db };
        }
      } catch (e) {
        console.log("Custom JWT verification failed in messages API:", e);
      }
    }
    
    // Check Clerk 
    const { userId: clerkId } = getAuth(request as any);
    if (clerkId) {
      const dbUser = await db.collection("users").findOne({ clerkId });
      if (dbUser) return { user: dbUser, db };
    }
    
    // Fallback: userId query param
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (userId) {
       let dbUser = null;
       try {
         dbUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
       } catch {
         dbUser = await db.collection("users").findOne({ clerkId: userId });
       }
       if (dbUser) return { user: dbUser, db };
    }
    
    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ monkId: string }> }) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { user, db } = auth;
    const { monkId } = await params;
    const currentUserId = user._id.toString();
    
    // Determine the participants
    // The chat is between currentUserId and monkId
    // Or if the current user IS the monk, between monkId (which is the client) and currentUserId (monk)
    
    const participant1 = currentUserId;
    const participant2 = monkId;
    
    const messages = await db.collection("direct_messages")
      .find({
        $or: [
          { senderId: participant1, receiverId: participant2 },
          { senderId: participant2, receiverId: participant1 }
        ]
      })
      .sort({ createdAt: 1 }) // Chronological order
      .toArray();
      
    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ message: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ monkId: string }> }) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { user, db } = auth;
    const { monkId } = await params;
    const receiverId = monkId; // Can be a client ID if a monk is sending it
    const senderId = user._id.toString();
    
    const body = await request.json();
    const { text, imageUrl } = body;
    
    if (!text && !imageUrl) {
      return NextResponse.json({ message: "Message content cannot be empty" }, { status: 400 });
    }

    // Identify the sender display name
    // Support MN/EN or first/last
    const senderName = user.name?.mn || user.name?.en || user.name || user.firstName || "User";

    const newMessage = {
      _id: new ObjectId(),
      senderId,
      receiverId,
      senderName,
      text: text || "",
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      read: false
    };

    await db.collection("direct_messages").insertOne(newMessage);

    // TRIGGER PUSH NOTIFICATION
    try {
      const { pushTriggers } = await import("@/lib/pushService");
      // senderName is already defined around line 117
      await pushTriggers.newMessage(
        receiverId,
        senderName.toString(),
        text || "Sent an image",
        senderId
      );
    } catch (pushErr) {
      console.error("Push Notification for message failed:", pushErr);
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("POST Message Error:", error);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}
