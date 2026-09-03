import { useState } from "react";
import "@/landing.css";
import CampaignVideoIntro from "@/components/lucera/CampaignVideoIntro";
import FloatingHeader from "@/components/lucera/FloatingHeader";
import Hero from "@/components/lucera/Hero";
import Introduction from "@/components/lucera/Introduction";
import HowItWorks from "@/components/lucera/HowItWorks";
import WhatYouCanAsk from "@/components/lucera/WhatYouCanAsk";
import WhatLuceraIs from "@/components/lucera/WhatLuceraIs";
import PurposeStory from "@/components/lucera/PurposeStory";
import MedicalAdvisors from "@/components/lucera/MedicalAdvisors";
import Founders from "@/components/lucera/Founders";
import Publications from "@/components/lucera/Publications";
import Pricing from "@/components/lucera/Pricing";
import PortalLogin from "@/components/lucera/PortalLogin";
import FinalCTA from "@/components/lucera/FinalCTA";
import Footer from "@/components/lucera/Footer";

export default function Home() {
  const [introOpen, setIntroOpen] = useState(true);

  const enter = () => {
    setIntroOpen(false);
  };

  const replay = () => setIntroOpen(true);

  return (
    <div className="lucera-lp bg-lucera-cream">
      <CampaignVideoIntro open={introOpen} onEnter={enter} />
      <FloatingHeader />
      <main>
        <Hero onReplayVideo={replay} />
        <Introduction />
        <HowItWorks />
        <WhatYouCanAsk />
        <WhatLuceraIs />
        <PurposeStory />
        <MedicalAdvisors />
        <Founders />
        <Publications />
        <Pricing />
        <PortalLogin />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}