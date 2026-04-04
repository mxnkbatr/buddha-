import { cache, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
    const monks = await db.collection("users")
      .find({ role: "monk", isAvailable: { $ne: false } })
      .toArray() as unknown as Monk[];
    return monks
      .map(m => ({ ...m, _id: m._id?.toString() ?? "" }))
      .sort((a, b) => {
        if (a.isSpecial && !b.isSpecial) return -1;
        if (!a.isSpecial && b.isSpecial) return 1;
        if (a.monkNumber !== undefined && b.monkNumber !== undefined) return a.monkNumber - b.monkNumber;
        return 0;
      });
  } catch { return []; }
});

const getBlogs = cache(async () => {
  try {
    const { db } = await connectToDatabase();
    const blogs = await db.collection("blogs").find({}).sort({ date: -1 }).limit(5).toArray();
    return blogs.map(blog => ({
      _id: blog._id.toString(),
      id: blog.id || blog._id.toString(),
      title: blog.title || { mn: "", en: "" },
      date: blog.date ? new Date(blog.date).toISOString() : new Date().toISOString(),
      cover: blog.cover || "",
      category: blog.category || "Wisdom",
      authorName: blog.authorName || "Багш",
    }));
  } catch { return []; }
});

const MonksSkeleton = () => (
  <div className="px-4 pt-2 space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-[84px] rounded-2xl skeleton" />)}
  </div>
);

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const allMonks = await getMonks();
  const blogs = await getBlogs();
  const featuredMonks = allMonks.slice(0, 3);

  return (
    <>
      <Hero />
      <HomeSections locale={locale} blogs={blogs} monks={allMonks} />
      <section className="bg-cream">
        <div className="px-5 pt-8 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold mb-1">Онцлох</p>
          <h2 className="text-[20px] font-black text-ink tracking-tight">Шилдэг багш нар</h2>
        </div>
        <Suspense fallback={<MonksSkeleton />}>
          <MonkShowcaseClient initialMonks={featuredMonks} hideHeader={true} />
        </Suspense>
        <div className="flex justify-center py-6">
          <Link href={`/${locale}/monks`}>
            <button className="btn-primary text-[13px] px-8">Бүгдийг харах →</button>
          </Link>
        </div>
      </section>
      <Suspense fallback={<div className="h-48 skeleton mx-5 my-6 rounded-2xl" />}>
        <PhilosophySection />
      </Suspense>
      <Suspense fallback={<div className="h-48 skeleton mx-5 my-6 rounded-2xl" />}>
        <NirvanaComments />
      </Suspense>
    </>
  );
}
