import { cache, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Hero from "../components/Hero";
import HomeSections from "../components/HomeSections";
import MonkShowcaseClient from "../components/MonkShowcaseClient";
import { connectToDatabase } from "@/database/db";
import { Monk } from "@/database/types";

const PhilosophySection = dynamic(() => import("../components/Philosophy"));
const NirvanaComments = dynamic(() => import("../components/NirvanaComments"));

const getMonks = cache(async () => {
  try {
    const { db } = await connectToDatabase();
    // Fetch all monks
    const monks = await db.collection("users").find({ role: "monk" }).toArray() as unknown as Monk[];
    
    return monks
      .map(m => ({ ...m, _id: m._id?.toString() ?? "" }))
      .sort((a, b) => {
        if (a.isSpecial && !b.isSpecial) return -1;
        if (!a.isSpecial && b.isSpecial) return 1;
        return 0;
      });
  } catch { return []; }
});

const getBlogs = cache(async () => {
    try {
        const { db } = await connectToDatabase();
        const blogs = await db.collection("blogs")
            .find({})
            .sort({ date: -1 })
            .limit(5)
            .toArray();

        return blogs.map(blog => ({
            _id: blog._id.toString(),
            id: blog.id || blog._id.toString(),
            title: blog.title || { mn: "", en: "" },
            content: blog.content || { mn: "", en: "" },
            date: blog.date ? new Date(blog.date).toISOString() : new Date().toISOString(),
            cover: blog.cover || "",
            category: blog.category || "Wisdom",
            authorName: blog.authorName || "Багш",
            authorId: blog.authorId ? blog.authorId.toString() : ""
        }));
    } catch { return []; }
});

// Skeleton loader
const MonksSkeleton = () => (
  <div className="px-4 pt-4 space-y-3">
    {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
  </div>
);

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const allMonks = await getMonks();
  
  // Find Buyantsog from DB (name contains Буянцог)
  const buyantsogMock = allMonks.find(m => m.name?.mn?.includes("Буянцог")) || {
    _id: "buyantsog",
    name: { mn: "Буянцог Гэва", en: "Buyantsog" },
    title: { mn: "Их багш", en: "Master" },
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    specialties: ["Засал", "Зөн билэг"],
    yearsOfExperience: 15,
    isAvailable: true,
    rating: 4.8,
    bio: { mn: "Олон жилийн туршлагатай засалч.", en: "Experienced healer." },
    quote: { mn: "Дотоод хүчээ мэдэр.", en: "Feel your inner strength." },
    services: [{ id: "1", name: { mn: "Засал", en: "Healing" }, price: 88800, duration: "1 hour" }]
  } as any;

  const featuredMonks = [buyantsogMock];
  const blogs = await getBlogs();

  return (
    <>
      <Hero />

      {/* Categories + Blog + Practitioners */}
      <HomeSections locale={locale} blogs={blogs} monks={allMonks} />

      {/* Monks Section */}
      <section className="bg-cream">
        <div className="px-5 pt-10 pb-4">
          <h2 className="text-[22px] font-black text-ink tracking-tight">Онцлох багш</h2>
        </div>

        <Suspense fallback={<MonksSkeleton />}>
          <MonkShowcaseClient initialMonks={featuredMonks} hideHeader={true} />
        </Suspense>
      </section>

      {/* Philosophy */}
      <Suspense fallback={<div className="h-64 skeleton mx-5 my-8 rounded-2xl" />}>
        <PhilosophySection />
      </Suspense>

      {/* Comments */}
      <Suspense fallback={<div className="h-64 skeleton mx-5 my-8 rounded-2xl" />}>
        <NirvanaComments />
      </Suspense>
    </>
  );
}
