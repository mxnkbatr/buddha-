import { Suspense, cache } from "react";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import MonkShowcaseClient from "../components/MonkShowcaseClient";
import { connectToDatabase } from "@/database/db";
import { Monk } from "@/database/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import Footer from "../components/Footer";
const PhilosophySection = dynamic(() => import("../components/Philosophy"));
const NirvanaComments = dynamic(() => import("../components/NirvanaComments"));
const DivineBackground = dynamic(() => import("../components/DivineBackground"));
const DivineButton = dynamic(() => import("../components/DivineButton")); // Using dynamic import to avoid SSR mismatches with motion

// Fetch monks data server-side
const getMonks = cache(async () => {
  try {
    const { db } = await connectToDatabase();
    // Only fetch monks meant for the homepage
    const monks = await db.collection("users").find({ 
      role: "monk", 
      showOnHomepage: true 
    }).toArray() as unknown as Monk[];

    // Serialize for client component
    const serialized = monks.map(monk => ({
      ...monk,
      _id: monk._id?.toString() ?? ""
    }));

    // Sort: Priority by monkNumber, then isSpecial
    return serialized.sort((a, b) => {
      // If monkNumber exists, use it for explicit ordering
      if (a.monkNumber !== undefined && b.monkNumber !== undefined) {
        return a.monkNumber - b.monkNumber;
      }
      if (a.monkNumber !== undefined) return -1;
      if (b.monkNumber !== undefined) return 1;

      // Fallback to isSpecial
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

  // Show only featured monks on home page (up to 5)
  const featuredMonks = allMonks.slice(0, 5);
  const isDark = false
  return (
    <>
      <DivineBackground />
      <div className="relative z-10">
        <Hero />

        {/* Monk Cards Section - First 5 Only */}
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50/50 animate-pulse">
            <div className="text-2xl font-serif text-gray-400">Loading monks...</div>
          </div>
        }>
          <MonkShowcaseClient initialMonks={featuredMonks} />
          <div className="mt-16 md:mt-24 flex justify-center">
            <Link href="/mn/monks">
              <DivineButton variant="primary" icon={<ArrowUpRight size={20} />} className="shadow-2xl">
                Илүү үзэх
              </DivineButton>
            </Link>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
          <PhilosophySection />
        </Suspense>
        <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
          <NirvanaComments />
        </Suspense>
      </div>
    </>
  );
}
