import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb"; // Ensure ObjectId is imported

async function checkPermission() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Allow Admins OR Special Monks
    const { db } = await connectToDatabase();
    const dbUser = await db.collection("users").findOne({ clerkId: user.id });

    if (!dbUser) throw new Error("User not found");

    const isSpecialMonk = dbUser.role === 'monk' && dbUser.isSpecial === true;
    const isAdmin = dbUser.role === 'admin';

    if (!isSpecialMonk && !isAdmin) {
        throw new Error("Unauthorized: Special Monk status required");
    }

    return { user: dbUser, db };
}

export async function POST(req: Request) {
    try {
        const { user, db } = await checkPermission();
        const body = await req.json();
        const { type, ...data } = body;

        const newId = crypto.randomUUID();
        const today = new Date().toISOString().split("T")[0];

        let collection = "";
        let doc: any = {};

        // Map common fields
        const common = {
            id: newId,
            authorId: user._id, // Track who created it
            authorName: user.name?.mn || user.name?.en || user.firstName,
            addedAt: new Date(),
        };

        switch (type) {
            case "blog":
                collection = "blogs";
                doc = {
                    ...common,
                    title: { mn: data.titleMn, en: data.titleEn },
                    content: { mn: data.contentMn, en: data.contentEn },
                    category: "General",
                    date: data.date || today,
                    cover: data.imageUrl || "/default-blog.jpg",
                };
                break;

            default:
                throw new Error("Invalid content type");
        }

        await db.collection(collection).insertOne(doc);
        return NextResponse.json({ success: true, id: newId });

    } catch (error: any) {
        console.error("Content Create Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { user, db } = await checkPermission();
        const body = await req.json();
        const { id, type, ...data } = body;

        let collection = "";

        switch (type) {
            case "blog":
                collection = "blogs";
                break;
            default:
                throw new Error("Invalid content type");
        }

        // Build update object
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.titleMn) updateData["title.mn"] = data.titleMn;
        if (data.titleEn) updateData["title.en"] = data.titleEn;
        if (data.contentMn) updateData["content.mn"] = data.contentMn;
        if (data.contentEn) updateData["content.en"] = data.contentEn;
        if (data.date) updateData["date"] = data.date;
        if (data.imageUrl) updateData["cover"] = data.imageUrl;

        // Query setup: Enforce ownership unless admin
        const query: any = { id: id };
        if (user.role !== 'admin') {
            query.authorId = user._id;
        }

        const result = await db.collection(collection).updateOne(
            query,
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Content Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { user, db } = await checkPermission();
        const { id, type } = await req.json();

        // Map type to collection name
        const collectionMap: any = {
            blog: "blogs"
        };

        if (!collectionMap[type]) throw new Error("Invalid type");

        // Only allow deleting own content unless admin
        const query: any = { id: id };
        if (user.role !== 'admin') {
            query.authorId = user._id; // Enforce ownership
        }

        const result = await db.collection(collectionMap[type]).deleteOne(query);

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
