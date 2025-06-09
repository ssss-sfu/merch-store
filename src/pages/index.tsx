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
    defaultPosition: { x: "10%", y: "12%" },
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

// Helper Function for Random Properties ---
const getRandomFloatAnimation = () => {
  const floatAnimations = [
    "animate-float",
    "animate-float-alt",
    "animate-float-gentle",
    "animate-float-slow",
    "animate-float-fast",
  ];
  const randomAnimation =
    floatAnimations[Math.floor(Math.random() * floatAnimations.length)];
  const delayClasses = [
    "delay-random-1",
    "delay-random-2",
    "delay-random-3",
    "delay-random-4",
    "delay-random-5",
  ];
  const randomDelay =
    delayClasses[Math.floor(Math.random() * delayClasses.length)];
  return `${randomAnimation} ${randomDelay}`;
};

const getRandomFadeStyle = () => {
  const fadeDuration = (Math.random() * 1.2 + 0.3).toFixed(2);
  const fadeDelay = (Math.random() * 0.3).toFixed(2);
  const floatDuration = (4 + Math.random() * 4).toFixed(2);
  const opacityStart = (0.2 + Math.random() * 0.3).toFixed(2);
  const opacityEnd = (0.5 + Math.random() * 0.2).toFixed(2);
  return `--fade-duration: ${fadeDuration}s; --fade-delay: ${fadeDelay}s; --float-duration: ${floatDuration}s; --opacity-start: ${opacityStart}; --opacity-end: ${opacityEnd};`;
};

const getRandomPendulumProps = () => ({
  pendulumDamping: 0.98 + Math.random() * 0.01, // Higher damping for smoother motion (less jitter)
  pendulumStiffness: 0.002 + Math.random() * 0.003, // Lower stiffness for gentler swinging
});

interface SebIcon {
  id: string;
  baseName?: string;
  position: { x: number; y: number };
  size: number;
  animationClass: string;
  fadeStyle: string;
  initialRotation: number;
  pendulumDamping: number;
  pendulumStiffness: number;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [icons, setIcons] = useState<{
    default: SebIcon[];
    custom: SebIcon[];
  }>({ default: [], custom: [] });

  useEffect(() => {
    let initialDefaultIcons: SebIcon[] = [];
    let initialCustomIcons: SebIcon[] = [];
    let savedPositions: Record<string, { x: number; y: number }> = {};

    try {
      const savedPositionsRaw = localStorage.getItem("iconPositions");
      if (savedPositionsRaw) {
        savedPositions = JSON.parse(savedPositionsRaw) as Record<
          string,
          { x: number; y: number }
        >;
      }

      const savedCustomIconsRaw = localStorage.getItem("customIcons");
      if (savedCustomIconsRaw) {
        const parsedCustom = JSON.parse(savedCustomIconsRaw) as SebIcon[];
        initialCustomIcons = parsedCustom.map((icon) => ({
          ...icon,
          position: savedPositions[icon.id] ?? icon.position,
          animationClass:
            icon.animationClass || `${getRandomFloatAnimation()} fade-in`,
          fadeStyle: icon.fadeStyle || getRandomFadeStyle(),
          initialRotation: icon.initialRotation ?? Math.random() * 20 - 10,
          pendulumDamping:
            icon.pendulumDamping ?? getRandomPendulumProps().pendulumDamping,
          pendulumStiffness:
            icon.pendulumStiffness ??
            getRandomPendulumProps().pendulumStiffness,
        }));
      }

      initialDefaultIcons = sebConfigurations.map((config, index) => {
        const imageIndex = index % availableSebBaseNames.length;
        const baseName = availableSebBaseNames[imageIndex];
        const id = `seb-${baseName}-${config.idSuffix}`;
        const defaultPos = {
          x: parseInt(config.defaultPosition.x),
          y: parseInt(config.defaultPosition.y),
        };
        const randomProps = getRandomPendulumProps();

        return {
          id,
          baseName,
          position: savedPositions[id] ?? defaultPos,
          size: config.size,
          animationClass: `${config.initialClassName} fade-in`,
          fadeStyle: getRandomFadeStyle(),
          initialRotation: 0,
          pendulumDamping: randomProps.pendulumDamping,
          pendulumStiffness: randomProps.pendulumStiffness,
        };
      });
    } catch (error) {
      console.error("Failed to load icon data from localStorage:", error);
      initialDefaultIcons = sebConfigurations.map((config, index) => {
        const imageIndex = index % availableSebBaseNames.length;
        const baseName = availableSebBaseNames[imageIndex];
        const id = `seb-${baseName}-${config.idSuffix}`;
        const randomProps = getRandomPendulumProps();
        return {
          id,
          baseName,
          position: {
            x: parseInt(config.defaultPosition.x),
            y: parseInt(config.defaultPosition.y),
          },
          size: config.size,
          animationClass: `${config.initialClassName} fade-in`,
          fadeStyle: getRandomFadeStyle(),
          initialRotation: 0,
          pendulumDamping: randomProps.pendulumDamping,
          pendulumStiffness: randomProps.pendulumStiffness,
        };
      });
      initialCustomIcons = [];
      localStorage.removeItem("iconPositions");
      localStorage.removeItem("customIcons");
    }

    setIcons({ default: initialDefaultIcons, custom: initialCustomIcons });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("customIcons", JSON.stringify(icons.custom));

      const allPositions: Record<string, { x: number; y: number }> = {};
      [...icons.default, ...icons.custom].forEach((icon) => {
        if (icon && typeof icon.id === "string" && icon.position) {
          allPositions[icon.id] = icon.position;
        } else {
          console.warn("Skipping invalid icon data during save:", icon);
        }
      });
      localStorage.setItem("iconPositions", JSON.stringify(allPositions));
    } catch (error) {
      console.error("Failed to save icon data to localStorage:", error);
    }
  }, [icons, isHydrated]);

  const handlePositionChange = (
    id: string,
    newPosition: { x: number; y: number },
  ) => {
    setIcons((prev) => {
      const nextDefault = [...prev.default];
      const nextCustom = [...prev.custom];

      const defaultIndex = nextDefault.findIndex((icon) => icon.id === id);
      if (defaultIndex > -1) {
        nextDefault[defaultIndex] = {
          ...nextDefault[defaultIndex],
          position: newPosition,
        } as SebIcon;
        return { default: nextDefault, custom: nextCustom };
      }

      const customIndex = nextCustom.findIndex((icon) => icon.id === id);
      if (customIndex > -1) {
        nextCustom[customIndex] = {
          ...nextCustom[customIndex],
          position: newPosition,
        } as SebIcon;
        return { default: nextDefault, custom: nextCustom };
      }

      console.warn(`Icon with id ${id} not found for position update.`);
      return prev;
    });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || (e.target as HTMLElement).closest(".draggable-image")) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const randomBaseName =
      availableSebBaseNames[
        Math.floor(Math.random() * availableSebBaseNames.length)
      ];
    const randomSize = 40 + Math.floor(Math.random() * 30);
    const newId = `custom-seb-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const randomProps = getRandomPendulumProps();

    const newIcon: SebIcon = {
      id: newId,
      baseName: randomBaseName,
      position: { x, y },
      size: randomSize,
      animationClass: `${getRandomFloatAnimation()} fade-in`,
      fadeStyle: getRandomFadeStyle(),
      initialRotation: Math.random() * 20 - 10,
      pendulumDamping: randomProps.pendulumDamping,
      pendulumStiffness: randomProps.pendulumStiffness,
    };

    setIcons((prev) => ({
      ...prev,
      custom: [...prev.custom, newIcon],
    }));
  };

  return (
    <main className="relative flex h-[100dvh] w-full flex-grow items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center"
        onClick={handleContainerClick}
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {isHydrated &&
          icons.default.map((icon) => (
            <DraggableImage
              key={icon.id}
              src={`/images/seb-${icon.baseName}.svg`}
              alt={`Draggable Seb ${icon.baseName} Icon`}
              width={icon.size}
              height={icon.size}
              boundsRef={containerRef}
              initialPosition={icon.position}
              initialRotation={icon.initialRotation}
              initialClassName={icon.animationClass}
              initialStyle={icon.fadeStyle}
              pendulumDamping={icon.pendulumDamping}
              pendulumStiffness={icon.pendulumStiffness}
              onPositionChange={(newPos) =>
                handlePositionChange(icon.id, newPos)
              }
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            />
          ))}

        {isHydrated &&
          icons.custom.map((icon) => (
            <DraggableImage
              key={icon.id}
              src={`/images/seb-${icon.baseName}.svg`}
              alt={`Custom Seb ${icon.baseName} Icon`}
              width={icon.size}
              height={icon.size}
              boundsRef={containerRef}
              initialPosition={icon.position}
              initialRotation={icon.initialRotation}
              initialClassName={icon.animationClass}
              initialStyle={icon.fadeStyle}
              pendulumDamping={icon.pendulumDamping}
              pendulumStiffness={icon.pendulumStiffness}
              onPositionChange={(newPos) =>
                handlePositionChange(icon.id, newPos)
              }
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            />
          ))}

        {/* Items in the center  */}
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
