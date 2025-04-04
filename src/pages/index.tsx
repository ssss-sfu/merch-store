import Link from "next/link";
import Layout from "@/lib/components/Layout";
import Header from "@/lib/products/Header";
import { Button } from "~/lib/components/ui/button";
import DecoIcon from "~/lib/components/icons/home-icon";

import {
  Shapes,
  Cloud,
  Smile,
  Star,
  Circle,
  Heart,
  Sparkles,
  Triangle,
  Bot,
  Ghost,
  ChevronsLeftRight,
  MousePointer,
  Terminal,
  Square,
  Activity,
  Atom,
  Wand2,
  Key,
} from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <Header />
      <main className="relative -mt-28 flex flex-grow items-center justify-center overflow-hidden px-4">
        <DecoIcon
          icon={Cloud}
          size={55}
          className="top-[12%] left-[8%] -rotate-12"
          animationClass="animate-float-slow"
        />
        <DecoIcon
          icon={ChevronsLeftRight}
          size={30}
          className="top-[14%] right-[12%] rotate-12"
          animationClass="animate-rotate-fast"
        />
        <DecoIcon
          icon={Smile}
          size={45}
          className="top-[24%] right-[7%] rotate-[20deg]"
          animationClass="animate-pulse"
        />
        <DecoIcon
          icon={Star}
          size={30}
          className="top-[45%] right-[5%] rotate-[-15deg]"
          animationClass="animate-float-fast"
        />
        <DecoIcon
          icon={MousePointer}
          size={25}
          className="top-[58%] right-[8%] rotate-[30deg]"
          animationClass="animate-rotate-slow"
        />
        <DecoIcon
          icon={Sparkles}
          size={35}
          className="right-[10%] bottom-[25%] rotate-[15deg]"
          animationClass="animate-pulse-fast"
        />
        <DecoIcon
          icon={Ghost}
          size={50}
          className="right-[10%] bottom-[10%] -rotate-12"
          animationClass="animate-float"
        />
        <DecoIcon
          icon={Circle}
          size={18}
          className="right-[25%] bottom-[8%]"
          animationClass="animate-pulse-slow"
        />
        <DecoIcon
          icon={Square}
          size={22}
          className="bottom-[8%] left-[45%] rotate-[-10deg]"
          animationClass="animate-rotate"
        />
        <DecoIcon
          icon={Terminal}
          size={40}
          className="bottom-[10%] left-[30%]"
          animationClass="animate-float-slow"
        />
        <DecoIcon
          icon={Heart}
          size={35}
          className="bottom-[15%] left-[17%] -rotate-12"
          animationClass="animate-pulse"
        />
        <DecoIcon
          icon={Shapes}
          size={40}
          className="bottom-[28%] left-[7%] rotate-[25deg]"
          animationClass="animate-rotate-slow"
        />
        <DecoIcon
          icon={Triangle}
          size={28}
          className="top-[48%] left-[5%] rotate-[-20deg]"
          animationClass="animate-float-fast"
        />
        <DecoIcon
          icon={Bot}
          size={60}
          className="top-[35%] left-0 rotate-[-15deg] sm:left-[10%]"
          animationClass="animate-float"
        />
        <DecoIcon
          icon={Activity}
          size={30}
          className="top-[25%] left-[5%] rotate-[10deg]"
          animationClass="animate-pulse-fast"
        />
        <DecoIcon
          icon={Wand2}
          size={28}
          className="top-[60%] left-[13%] rotate-[-5deg]"
          animationClass="animate-rotate-fast"
        />
        <DecoIcon
          icon={Atom}
          size={35}
          className="bottom-[12%] left-[58%] rotate-[20deg]"
          animationClass="animate-float-slow"
        />
        <DecoIcon
          icon={Key}
          size={25}
          className="top-[35%] right-[8%] rotate-[-10deg]"
          animationClass="animate-pulse-slow"
        />

        <div className="relative z-20 flex w-max max-w-3xl flex-col items-center rounded-3xl text-center">
          <div className="bg-background/35 pointer-events-none absolute -z-1 h-[110%] w-[110%] blur-lg"></div>
          <h1 className="text-foreground mb-4 font-mono text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            SSSS Merch Store
          </h1>
          <p className="text-muted-foreground mb-8 text-base sm:text-xl">
            Brought to you by Seb&apos;s Goods™
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://www.sfussss.org/" target="__blank">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
