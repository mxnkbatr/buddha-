import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuth } from "@clerk/nextjs/server";
import * as jose from 'jose';

// Helper to get authenticated user
async function getAuthenticatedUser(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Check Authorization header for custom JWT (Mobile app)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        const { payload } = await jose.jwtVerify(token, secret);
        
        if (payload && payload.sub) {
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
          if (dbUser) return { user: dbUser, db };
        }
      } catch (e) {
        console.log("Custom JWT verification failed in conversations API:", e);
      }
    }
    
    // Check Clerk 
    const { userId: clerkId } = getAuth(request as any);
    if (clerkId) {
      const dbUser = await db.collection("users").findOne({ clerkId });
      if (dbUser) return { user: dbUser, db };
    }
    
    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { user, db } = auth;
    const currentUserId = user._id.toString();
    
    // Find all unique pairs in direct_messages where currentUserId is a participant
    const messages = await db.collection("direct_messages")
      .find({
        $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
      })
      .sort({ createdAt: -1 })
      .toArray();

    const conversationsMap = new Map();

    for (const msg of messages) {
      const otherId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          otherId,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: 0 // Simplification: we'd need a more complex query for real unread count
        });
      }
      
      if (msg.receiverId === currentUserId && !msg.read) {
        conversationsMap.get(otherId).unreadCount++;
      }
    }

    const conversationList = Array.from(conversationsMap.values());

    // Fetch details for each "otherId"
    const enrichedConversations = await Promise.all(
      conversationList.map(async (conv) => {
        try {
          // Check if otherId is a monk
          const otherUser = await db.collection("users").findOne({ _id: new ObjectId(conv.otherId) });
          return {
            ...conv,
            otherName: otherUser?.name?.mn || otherUser?.name?.en || otherUser?.firstName || "Unknown User",
            otherImage: otherUser?.image || otherUser?.avatar || "/default-monk.jpg",
            isMonk: otherUser?.role === "monk"
          };
        } catch (e) {
          return {
            ...conv,
            otherName: "Unknown User",
            otherImage: "/default-monk.jpg",
            isMonk: false
          };
        }
      })
    );

    return NextResponse.json(enrichedConversations);
  } catch (error) {
    console.error("GET Conversations Error:", error);
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
