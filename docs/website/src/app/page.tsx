import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      {/* Feature grid and other sections would go here */}
    </main>
  );
}
