import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const DESKTOP_OFFSET_X = 50;
const DESKTOP_OFFSET_Y = 50;
const SMOOTHING_FACTOR = 0.085;
const MOBILE_SMOOTHING_FACTOR = 0.15;
const MOBILE_BREAKPOINT = 768;

export default function SebCursor() {
  const [localMousePosition, setLocalMousePosition] = useState({
    x: -100,
    y: -100,
  });
  const [imagePosition, setImagePosition] = useState({ x: -100, y: -100 });
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cursorImage, setCursorImage] = useState("/seb-default.svg");

  const previousMouseXRef = useRef<number>(-100);

  // Initialize random cursor image on first load
  useEffect(() => {
    const sebIcons = [
      "/seb-default.svg",
      "/seb-coffee.svg",
      "/seb-confused.svg",
      "/seb-think.svg",
    ];

    const randomIcon = sebIcons[Math.floor(Math.random() * sebIcons.length)];
    setCursorImage(randomIcon!);
  }, []);

  useEffect(() => {
    let visibilityTimeout: NodeJS.Timeout;
    const showCursor = () => {
      if (!isVisible) {
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => setIsVisible(true), 10);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth: w, innerHeight: h } = window;
      const padTopX = w * 0.02,
        padBotX = w * 0.12;
      const padTopY = h * 0.02,
        padBotY = h * 0.12;

      setLocalMousePosition({
        x: Math.max(padTopX, Math.min(w - padBotX, clientX)),
        y: Math.max(padTopY, Math.min(h - padBotY, clientY)),
      });
      showCursor();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        if (!touch) return;

        const { clientX, clientY } = touch;
        const { innerWidth: w, innerHeight: h } = window;
        const padX = w * 0.05,
          padY = h * 0.05;

        setLocalMousePosition({
          x: Math.max(padX, Math.min(w - padX, clientX)),
          y: Math.max(padY, Math.min(h - padY, clientY)),
        });
        showCursor();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      clearTimeout(visibilityTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isVisible]);

  useEffect(() => {
    let animationFrame: number;
    let isAnimating = false;

    const followCursor = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      let targetX: number, targetY: number;
      const currentImageX = imagePosition.x;
      const currentImageY = imagePosition.y;
      let nextX: number, nextY: number;
      let nextRotation: number;

      if (isMobile) {
        targetX = localMousePosition.x + 30;
        targetY = localMousePosition.y + 30;
        nextX =
          currentImageX + (targetX - currentImageX) * MOBILE_SMOOTHING_FACTOR;
        nextY =
          currentImageY + (targetY - currentImageY) * MOBILE_SMOOTHING_FACTOR;

        const deltaX = targetX - nextX;
        const angle = Math.max(-10, Math.min(10, deltaX * 0.1));
        nextRotation = Math.abs(angle - rotation) > 0.01 ? angle : rotation;
      } else {
        targetX = localMousePosition.x + DESKTOP_OFFSET_X;
        targetY = localMousePosition.y + DESKTOP_OFFSET_Y;
        nextX = currentImageX + (targetX - currentImageX) * SMOOTHING_FACTOR;
        nextY = currentImageY + (targetY - currentImageY) * SMOOTHING_FACTOR;

        const deltaX = targetX - nextX;
        const deltaY = targetY - nextY;
        let angle = deltaX * 0.2 + (deltaY > 0 ? deltaY * 0.1 : 0);
        angle = Math.max(-17.5, Math.min(17.5, angle));
        nextRotation = Math.abs(angle - rotation) > 0.01 ? angle : rotation;
      }

      setImagePosition({ x: nextX, y: nextY });
      setRotation(nextRotation);

      if (localMousePosition.x > previousMouseXRef.current) {
        setIsFlipped(true);
      } else if (localMousePosition.x < previousMouseXRef.current) {
        setIsFlipped(false);
      }
      previousMouseXRef.current = localMousePosition.x;

      const distanceToTarget = Math.sqrt(
        Math.pow(targetX - nextX, 2) + Math.pow(targetY - nextY, 2),
      );

      isAnimating = distanceToTarget > 0.5;

      if (isAnimating) {
        animationFrame = requestAnimationFrame(followCursor);
      }
    };

    if (
      localMousePosition.x >= 0 &&
      localMousePosition.y >= 0 &&
      !isAnimating
    ) {
      isAnimating = true;
      animationFrame = requestAnimationFrame(followCursor);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [localMousePosition, rotation, imagePosition]);

  return (
    <Image
      src={cursorImage}
      width={60}
      height={60}
      alt="My cursor"
      className={`pointer-events-none fixed z-[1001] ${
        isVisible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-100`}
      style={{
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${
          isFlipped ? -1 : 1
        })`,
      }}
      priority
    />
  );
}
