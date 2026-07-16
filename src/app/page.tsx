import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PartnerHero } from "@/components/sections/partners/PartnerHero";
import { AboutTheraptly } from "@/components/sections/partners/AboutTheraptly";
import { HowItWorks } from "@/components/sections/partners/HowItWorks";
import { Earnings } from "@/components/sections/partners/Earnings";
import { Benefits } from "@/components/sections/partners/Benefits";
import { FoundingPartner } from "@/components/sections/partners/FoundingPartner";
import { ProgramFaq } from "@/components/sections/partners/ProgramFaq";
import { ApplyCta } from "@/components/sections/partners/ApplyCta";

export const metadata: Metadata = {
  title: "Partner Program — Theraptly",
  description:
    "Refer behavioral-health facilities to Theraptly and earn 20% of their first year plus 5% recurring. We handle the demo, onboarding, and support — you just make the introduction.",
};

export default function PartnersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main>
        <PartnerHero />
        <AboutTheraptly />
        <HowItWorks />
        <Earnings />
        <Benefits />
        <FoundingPartner />
        <ProgramFaq />
        <ApplyCta />
      </main>
      <Footer />
    </div>
  );
}
