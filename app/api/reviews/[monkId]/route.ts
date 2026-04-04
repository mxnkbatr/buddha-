import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";

type Props = {
    params: Promise<{ monkId: string }>;
};

export async function GET(request: Request, props: Props) {
    try {
        const { monkId } = await props.params;

        if (!monkId) {
            return NextResponse.json({ message: "Monk ID is required" }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const query = ObjectId.isValid(monkId) 
            ? { monkId: new ObjectId(monkId) } 
            : { monkId: monkId };

        const reviews = await db.collection("reviews")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0";

        return NextResponse.json({
            reviews,
            stats: {
                averageRating: Number(averageRating),
                totalReviews: reviews.length
            }
        });

    } catch (error: any) {
        console.error("GET Reviews error:", error);
        return NextResponse.json({ message: "Internal Error", error: error.message }, { status: 500 });
    }
}
