import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";

// Force dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { db } = await connectToDatabase();

        // Default Service (constructed from user request)
        const defaultService = {
            id: "6963b7df41f9525a719b2956",
            type: "Monk Service",
            status: "active",
            price: 50000,
            duration: "30 min",
            image: "https://res.cloudinary.com/dc127wztz/image/upload/v1768142784/zdeuoervk6l84g8p0xve.jpg", // Using user provided URL this time if valid, or fallback logic
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
            quote: { mn: "Ирээдүйгээ өөрчлөх боломж", en: "Empower your destiny" },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if exists
        const exists = await db.collection("services").findOne({ id: defaultService.id });

        if (!exists) {
            await db.collection("services").insertOne(defaultService);
            return NextResponse.json({ success: true, message: "Added General Divination to global services." });
        } else {
            // Optional: Update it if it exists to ensure fields are correct
            await db.collection("services").updateOne({ id: defaultService.id }, { $set: defaultService });
            return NextResponse.json({ success: true, message: "Updated existing General Divination service." });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
