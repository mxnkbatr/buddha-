import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { monkId, rating, comment, bookingId } = await request.json();

        if (!monkId || !rating || !comment) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // 1. Verify that the user has a completed booking with this monk
        // This is a security check to prevent fake reviews
        const completedBooking = await db.collection("bookings").findOne({
            monkId: ObjectId.isValid(monkId) ? new ObjectId(monkId) : monkId,
            userId: user.id,
            status: "completed"
        });

        if (!completedBooking && user.publicMetadata.role !== "admin") {
            return NextResponse.json({ 
                message: "You can only review monks after completing a booking with them." 
            }, { status: 403 });
        }

        // 2. Insert the review
        const newReview = {
            monkId: ObjectId.isValid(monkId) ? new ObjectId(monkId) : monkId,
            userId: user.id,
            userName: user.firstName || "Guest",
            userAvatar: user.imageUrl,
            rating: Number(rating),
            comment,
            bookingId: bookingId && ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : bookingId,
            createdAt: new Date()
        };

        const result = await db.collection("reviews").insertOne(newReview);

        return NextResponse.json({ 
            success: true, 
            reviewId: result.insertedId 
        });

    } catch (error: any) {
        console.error("Review creation error:", error);
        return NextResponse.json({ message: "Internal Error", error: error.message }, { status: 500 });
    }
}
