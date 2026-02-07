import { Suspense, cache } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import MonkShowcaseClient from "../components/MonkShowcaseClient";
import { connectToDatabase } from "@/database/db";
import { Monk } from "@/database/types";

const PhilosophySection = dynamic(() => import("../components/Philosophy"));
const NirvanaComments = dynamic(() => import("../components/NirvanaComments"));

// Fetch monks data server-side
const getMonks = cache(async () => {
  try {
    const { db } = await connectToDatabase();
    const monks = await db.collection("users").find({ role: "monk" }).toArray() as unknown as Monk[];

    // Serialize for client component
    const serialized = monks.map(monk => ({
      ...monk,
      _id: monk._id?.toString() ?? ""
    }));

    // Sort: Special monks first
    return serialized.sort((a, b) => {
      if (a.isSpecial && !b.isSpecial) return -1;
      if (!a.isSpecial && b.isSpecial) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Failed to fetch monks:", error);
    return [];
  }
});

export default async function Home() {
  const allMonks = await getMonks();

  // Show only first 5 monks on home page
  const featuredMonks = allMonks.slice(0, 5);

  return (
    <>
      <Hero />

      {/* Monk Cards Section - First 5 Only */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 animate-pulse">
          <div className="text-2xl font-serif text-gray-400">Loading monks...</div>
        </div>
      }>
        <MonkShowcaseClient initialMonks={featuredMonks} />
      </Suspense>

      <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
        <PhilosophySection />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
        <NirvanaComments />
      </Suspense>
    </>
  );
}
