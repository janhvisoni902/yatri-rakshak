import TouristHero from "@/components/blocks/tourist-hero";
import Header2 from "@/components/blocks/header-2";
import SafetyFeatures from "@/components/blocks/safety-features";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      <Header2 />
      <TouristHero />
      <SafetyFeatures/>
      <FooterSection/>
    </div>
  );
}
