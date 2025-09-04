import AppHero from "@/components/blocks/app-hero";
import Header2 from "@/components/blocks/header-2";
import Feature3 from "@/components/blocks/feature-3";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      <Header2 />
      <AppHero />
      <Feature3/>
      <FooterSection/>
    </div>
  );
}
