import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const PhilosophySection = dynamic(() => import("../components/Philosophy"));
const NirvanaComments = dynamic(() => import("../components/NirvanaComments"));

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
        <PhilosophySection />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center bg-gray-50/50 animate-pulse rounded-3xl mx-6 mb-20" />}>
        <NirvanaComments />
      </Suspense>
    </>
  );
}
