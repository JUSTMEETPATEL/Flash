import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/home/Hero";
import { BentoGrid } from "@/components/home/BentoGrid";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <Hero />
      <BentoGrid />
      <Footer />
    </main>
  );
}
