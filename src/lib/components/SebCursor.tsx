import { useEffect, useState } from "react";
import Image from "next/image";

export default function SebCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const desktopOffsetX = 50; // X offset from cursor
  const desktopOffsetY = 50; // Y offset down from cursor
  const smoothingFactor = 0.075; // Lower = smoother/slower
  const mobileSmoothingFactor = 0.15; // Mobile smoothing
  const mobileBreakpoint = 768;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Cursor is offset from the mouse position, padding is adjusted for window
      const paddingTopX = windowWidth * 0.02; // Less padding at top-left
      const paddingBottomX = windowWidth * 0.12; // More padding at bottom-right
      const paddingTopY = windowHeight * 0.02; // Less padding at top
      const paddingBottomY = windowHeight * 0.12; // More padding at bottom

      const boundedX = Math.max(
        paddingTopX,
        Math.min(windowWidth - paddingBottomX, event.clientX),
      );
      const boundedY = Math.max(
        paddingTopY,
        Math.min(windowHeight - paddingBottomY, event.clientY),
      );

      setMousePosition({ x: boundedX, y: boundedY });
      if (!isVisible) setIsVisible(true);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const paddingX = windowWidth * 0.05;
        const paddingY = windowHeight * 0.05;

        const boundedX = Math.max(
          paddingX,
          Math.min(windowWidth - paddingX, touch?.clientX ?? 0),
        );
        const boundedY = Math.max(
          paddingY,
          Math.min(windowHeight - paddingY, touch?.clientX ?? 0),
        );

        setMousePosition({ x: boundedX, y: boundedY });
        if (!isVisible) setIsVisible(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isVisible]);

  useEffect(() => {
    let animationFrame: number;

    const followCursor = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;

      if (isMobile) {
        const targetX = mousePosition.x + 30;
        const targetY = mousePosition.y + 30;

        setImagePosition((prev) => {
          const nextX = prev.x + (targetX - prev.x) * mobileSmoothingFactor;
          const nextY = prev.y + (targetY - prev.y) * mobileSmoothingFactor;
          return { x: nextX, y: nextY };
        });

        setRotation((prevRotation) => {
          const deltaX = targetX - imagePosition.x;
          const angle = deltaX * 0.1;
          const limitedRotation = Math.max(-10, Math.min(10, angle));

          return Math.abs(limitedRotation - prevRotation) > 0.01
            ? limitedRotation
            : prevRotation;
        });
      } else {
        const targetX = mousePosition.x + desktopOffsetX;
        const targetY = mousePosition.y + desktopOffsetY;

        setImagePosition((prev) => {
          const nextX = prev.x + (targetX - prev.x) * smoothingFactor;
          const nextY = prev.y + (targetY - prev.y) * smoothingFactor;
          return { x: nextX, y: nextY };
        });

        setRotation((prevRotation) => {
          const deltaX = targetX - imagePosition.x;
          const deltaY = targetY - imagePosition.y;

          let angle = deltaX * 0.2;

          if (deltaY > 0) {
            angle += deltaY * 0.1;
          }

          const limitedRotation = Math.max(-17.5, Math.min(17.5, angle));

          return Math.abs(limitedRotation - prevRotation) > 0.01
            ? limitedRotation
            : prevRotation;
        });
      }

      animationFrame = requestAnimationFrame(followCursor);
    };

    animationFrame = requestAnimationFrame(followCursor);
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePosition]);

  return (
    <Image
      src={"/happy-seb-head-b.svg"}
      width={60}
      height={60}
      alt="Seb head following cursor"
      className={`pointer-events-none fixed ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      style={{
        left: `${imagePosition.x}px`,
        top: `${imagePosition.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: 1000,
      }}
      priority
    />
  );
}
