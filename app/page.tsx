import AppHero from "@/components/mvpblocks/app-hero";
import Header2 from "@/components/mvpblocks/header-2";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      <Header2 />
      <AppHero />
    </div>
  );
}
