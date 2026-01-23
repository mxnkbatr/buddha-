import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

const PhilosophySection = dynamic(() => import("./components/Philosophy"));
const NirvanaComments = dynamic(() => import("./components/NirvanaComments"));

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PhilosophySection />
      <NirvanaComments />
    </>
  );
}
