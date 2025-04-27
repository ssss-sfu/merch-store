import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "~/lib/components/ui/button";
import DraggableImage from "@/lib/components/DraggableImage";

const availableSebBaseNames = [
  "happy",
  "coffee",
  "think",
  "heart",
  "confused",
  "cry",
  "default",
  "laugh",
  "xd",
];

const sebConfigurations = [
  {
    idSuffix: "pos1",
    size: 55,
    initialClassName: "animate-float delay-0",
    defaultPosition: { x: "10%", y: "10%" },
  },
  {
    idSuffix: "pos2",
    size: 45,
    initialClassName: "animate-float delay-300",
    defaultPosition: { x: "85%", y: "20%" },
  },
  {
    idSuffix: "pos3",
    size: 50,
    initialClassName: "animate-float delay-[600ms]",
    defaultPosition: { x: "90%", y: "40%" },
  },
  {
    idSuffix: "pos4",
    size: 60,
    initialClassName: "animate-float delay-[900ms]",
    defaultPosition: { x: "85%", y: "50%" },
  },
  {
    idSuffix: "pos5",
    size: 55,
    initialClassName: "animate-float",
    defaultPosition: { x: "80%", y: "60%" },
  },
  {
    idSuffix: "pos6",
    size: 50,
    initialClassName: "animate-float",
    defaultPosition: { x: "80%", y: "85%" },
  },
  {
    idSuffix: "pos7",
    size: 48,
    initialClassName: "animate-float",
    defaultPosition: { x: "65%", y: "90%" },
  },
  {
    idSuffix: "pos8",
    size: 52,
    initialClassName: "animate-float",
    defaultPosition: { x: "45%", y: "90%" },
  },
  {
    idSuffix: "pos9",
    size: 50,
    initialClassName: "animate-float",
    defaultPosition: { x: "30%", y: "85%" },
  },
  {
    idSuffix: "pos10",
    size: 45,
    initialClassName: "animate-float",
    defaultPosition: { x: "20%", y: "80%" },
  },
  {
    idSuffix: "pos11",
    size: 55,
    initialClassName: "animate-float",
    defaultPosition: { x: "12%", y: "62%" },
  },
  {
    idSuffix: "pos12",
    size: 48,
    initialClassName: "animate-float",
    defaultPosition: { x: "8%", y: "45%" },
  },
  {
    idSuffix: "pos13",
    size: 60,
    initialClassName: "animate-float",
    defaultPosition: { x: "15%", y: "30%" },
  },
  {
    idSuffix: "pos14",
    size: 50,
    initialClassName: "animate-float",
    defaultPosition: { x: "10%", y: "22%" },
  },
  {
    idSuffix: "pos15",
    size: 48,
    initialClassName: "animate-float delay-[1400ms]",
    defaultPosition: { x: "18%", y: "55%" },
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [iconPositions, setIconPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("iconPositions");
      if (saved) {
        try {
          return JSON.parse(saved) as Record<string, { x: number; y: number }>;
        } catch {
          console.error("Failed to parse iconPositions from localStorage.");
          return {};
        }
      }
    }
    return {};
  });

  const handlePositionChange = (
    key: string,
    newPosition: { x: number; y: number },
  ) => {
    setIconPositions((prev) => {
      const updated = { ...prev, [key]: newPosition };
      localStorage.setItem("iconPositions", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <main className="relative flex h-[100dvh] w-full flex-grow items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center"
      >
        {isHydrated &&
          sebConfigurations.map((config, index) => {
            const imageIndex = index % availableSebBaseNames.length;
            const baseName = availableSebBaseNames[imageIndex];
            const imageSrc = `/images/seb-${baseName}.svg`;
            const key = `seb-${baseName}-${config.idSuffix}`;

            const savedPosition = iconPositions[key];
            const defaultX = parseInt(config.defaultPosition.x);
            const defaultY = parseInt(config.defaultPosition.y);

            const initialPosition = savedPosition ?? {
              x: defaultX,
              y: defaultY,
            };

            return (
              <DraggableImage
                key={key}
                src={imageSrc}
                alt={`Draggable Seb ${baseName} Icon`}
                initialRotation={0}
                width={config.size}
                height={config.size}
                boundsRef={containerRef}
                initialPosition={initialPosition}
                initialClassName={config.initialClassName}
                onPositionChange={(newPos) => handlePositionChange(key, newPos)}
              />
            );
          })}

        <div className="pointer-events-none relative z-20 flex w-max max-w-3xl flex-col items-center rounded-3xl text-center">
          <div className="bg-background/35 pointer-events-none absolute -inset-4 -z-10 blur-lg sm:-inset-6"></div>
          <h1 className="text-foreground pointer-events-auto mb-3 font-mono text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            SSSS Merch Store
          </h1>
          <p className="text-muted-foreground pointer-events-auto mb-6 text-base sm:text-xl">
            Brought to you by Seb&apos;s Goods™
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="pointer-events-auto">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="pointer-events-auto"
            >
              <Link href="https://www.sfussss.org/" target="__blank">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
