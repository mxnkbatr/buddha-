import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";

// Force dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { db } = await connectToDatabase();

        // 1. Find all Monks
        const monks = await db.collection("users").find({ role: "monk" }).toArray();
        let updatedCount = 0;
        const updatedNames = [];

        // Default Service (constructed from user request)
        const defaultService = {
            id: "6963b7df41f9525a719b2956",
            type: "Monk Service",
            status: "active",
            price: 50000,
            duration: "30 min",
            image: "https://res.cloudinary.com/dc127wztz/image/upload/v1737667618/zdeuoervk6l84g8p0xve.jpg", // Fixed reliable cloud image if possible, or use user's string
            // User provided "Object" for these, implying multi-lang support
            title: {
                mn: "Зурхай / Мэргэ",
                en: "General Divination"
            },
            desc: {
                mn: "Таны асуусан асуултанд хариулж, зөвлөгөө өгөх үйлчилгээ.",
                en: "General guidance and divination service providing answers to your questions."
            },
            name: { mn: "Зурхай", en: "Divination" },
            subtitle: { mn: "Онлайн уулзалт", en: "Online Session" },
            quote: { mn: "Ирээдүйгээ өөрчлөх боломж", en: "Empower your destiny" }
        };

        // 2. Iterate and Update if serviceless
        for (const monk of monks) {
            // Check if services array is missing or empty
            if (!monk.services || !Array.isArray(monk.services) || monk.services.length === 0) {

                await db.collection("users").updateOne(
                    { _id: monk._id },
                    { $set: { services: [defaultService] } }
                );

                updatedCount++;
                updatedNames.push(monk.name?.mn || monk.firstName || monk._id);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updatedCount} monks with default services.`,
            monks: updatedNames
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
