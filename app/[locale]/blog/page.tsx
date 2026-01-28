import React, { cache } from "react";
import { connectToDatabase } from "@/database/db";
import OverlayNavbar from "@/app/components/Navbar";
import BlogListClient from "../../components/BlogListClient";

// --- DATA FETCHING (SERVER SIDE + CACHED) ---
const getBlogs = cache(async () => {
    try {
        const { db } = await connectToDatabase();
        const blogs = await db.collection("blogs")
            .find({})
            .sort({ date: -1 })
            .toArray();

        // Serialize for client use
        return blogs.map(blog => ({
            ...blog,
            _id: blog._id.toString(),
            id: blog.id || blog._id.toString(),
            title: blog.title,
            content: blog.content,
            date: blog.date,
            cover: blog.cover,
            category: blog.category,
            authorName: blog.authorName
        }));
    } catch (error) {
        console.error("Failed to fetch blogs server-side:", error);
        return [];
    }
});

export default async function BlogPage() {
    const posts = await getBlogs();

    return (
        <>
            <OverlayNavbar />
            <BlogListClient initialPosts={posts} />
        </>
    );
}
