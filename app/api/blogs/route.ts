import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";

export async function GET(request: Request) {
    try {
        const { db } = await connectToDatabase();

        // Fetch all blogs, sorted by date (newest first)
        const blogs = await db.collection("blogs")
            .find({})
            .sort({ date: -1 })
            .toArray();

        // Serialize _id
        const serializedBlogs = blogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            id: blog.id || blog._id.toString()
        }));

        return NextResponse.json(serializedBlogs);

    } catch (error: any) {
        console.error("Failed to fetch blogs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
