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
    const query = session.type === 'clerk' ? { clerkId: session.id } : { _id: new ObjectId(session.id) };
    const user = await db.collection("users").findOne(query);

    if (!user || !user.wishlist) return NextResponse.json({ wishlist: [] });

    // Fetch monk details for the wishlist
    const monks = await db.collection("users")
      .find({ _id: { $in: user.wishlist.map((id: string) => new ObjectId(id)) } })
      .toArray();

    return NextResponse.json({ 
      wishlist: monks.map(m => ({
        ...m,
        _id: m._id.toString()
      }))
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const session = await getUserId();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { monkId } = await request.json();
    if (!monkId) return NextResponse.json({ error: "Monk ID required" }, { status: 400 });

    const { db } = await connectToDatabase();
    const query = session.type === 'clerk' ? { clerkId: session.id } : { _id: new ObjectId(session.id) };
    const user = await db.collection("users").findOne(query);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = user.wishlist || [];
    const exists = wishlist.includes(monkId);

    const update = exists 
      ? { $pull: { wishlist: monkId } }
      : { $addToSet: { wishlist: monkId } };

    await db.collection("users").updateOne(query, update);

    return NextResponse.json({ 
      success: true, 
      action: exists ? "removed" : "added",
      wishlist: exists ? wishlist.filter((id: string) => id !== monkId) : [...wishlist, monkId]
    });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
