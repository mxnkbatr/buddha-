import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuth } from "@clerk/nextjs/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthenticatedUser(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      if (!JWT_SECRET) return null;
      const token = authHeader.split(" ")[1];
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        
        if (payload && payload.sub) {
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
          if (dbUser) return { user: dbUser, db };
        }
      } catch (e) {}
    }
    
    const { userId: clerkId } = getAuth(request as any);
    if (clerkId) {
      const dbUser = await db.collection("users").findOne({ clerkId });
      if (dbUser) return { user: dbUser, db };
    }
    
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
    return null;
  }
}

// Get recent conversations for the current user
export async function GET(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { user, db } = auth;
    const currentUserId = user._id.toString();
    
    // Find all messages where the user is either sender or receiver
    const messages = await db.collection("direct_messages")
      .find({
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
      
    // Group by conversation partner to get the latest message per partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      // The partner is the 'other' person
      const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, msg);
      }
    });
    
    const recentConversations = Array.from(conversationsMap.entries()).map(([partnerId, lastMessage]) => {
      return {
        partnerId,
        lastMessage
      };
    });
    
    // Optional: Fetch partner profiles (name, image) to enrich the response
    const partnerIds = recentConversations.map(c => {
        try {
            return new ObjectId(c.partnerId);
        } catch {
            return null; // Ignore invalid object ids (like if it's a clerkId string somehow in older data)
        }
    }).filter((id): id is ObjectId => id !== null);

    const partners = await db.collection("users")
      .find({ _id: { $in: partnerIds } })
      .project({ name: 1, firstName: 1, lastName: 1, image: 1, role: 1, isSpecial: 1, avatar: 1 })
      .toArray();
      
    const enrichedConversations = recentConversations.map(conv => {
      const partnerData = partners.find(p => p._id.toString() === conv.partnerId);
      
      let displayName = "User";
      if (partnerData) {
         if (partnerData.name && typeof partnerData.name === 'object') {
             displayName = partnerData.name.mn || partnerData.name.en || displayName;
         } else if (partnerData.name) {
             displayName = partnerData.name;
         } else if (partnerData.firstName) {
             displayName = partnerData.firstName;
         }
      }
      
      return {
        ...conv,
        partner: partnerData ? {
          _id: partnerData._id.toString(),
          name: displayName,
          image: partnerData.image || partnerData.avatar || null,
          role: partnerData.role,
          isSpecial: partnerData.isSpecial
        } : null
      };
    });

    return NextResponse.json(enrichedConversations);
  } catch (error) {
    console.error("GET Recent Conversations Error:", error);
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
