import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

export default function DraggableImage({
  src,
  alt,
  width,
  height,
  boundsRef,
  initialPosition,
  initialClassName = "",
  initialStyle,
  onPositionChange,
  onDragStart,
  onDragEnd,
  initialRotation = 0,
  rotationSensitivity = 8,
  maxRotation = 45,
  pendulumDamping = 0.98,
  pendulumStiffness = 0.008,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  boundsRef: React.RefObject<HTMLElement>;
  initialPosition: { x: number; y: number };
  initialClassName?: string;
  initialStyle?: string;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  initialRotation?: number;
  rotationSensitivity?: number;
  maxRotation?: number;
  pendulumDamping?: number;
  pendulumStiffness?: number;
}) {
  const [positionPercent, setPositionPercent] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(initialRotation);
  const rotationVelocityRef = useRef(0);
  const previousPositionRef = useRef(positionPercent);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStartOffsetPercent = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  const animatePendulum = useCallback(() => {
    const currentRotation = rotation;
    const currentVelocity = rotationVelocityRef.current;
    const stopThreshold = 0.05;

    let nextVelocity = currentVelocity * pendulumDamping;
    nextVelocity -= currentRotation * pendulumStiffness;

    const nextRotation = currentRotation + nextVelocity;

    rotationVelocityRef.current = nextVelocity;

    if (
      Math.abs(nextRotation) < stopThreshold &&
      Math.abs(nextVelocity) < stopThreshold
    ) {
      setRotation(0);
      rotationVelocityRef.current = 0;
      animationFrameRef.current = undefined;
    } else {
      setRotation(nextRotation);
      animationFrameRef.current = requestAnimationFrame(animatePendulum);
    }
  }, [rotation, pendulumDamping, pendulumStiffness]);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!boundsRef.current || !imageRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      rotationVelocityRef.current = 0;

      const bounds = boundsRef.current.getBoundingClientRect();

      const cursorXPercent = ((clientX - bounds.left) / bounds.width) * 100;
      const cursorYPercent = ((clientY - bounds.top) / bounds.height) * 100;

      dragStartOffsetPercent.current = {
        x: cursorXPercent - positionPercent.x,
        y: cursorYPercent - positionPercent.y,
      };

      setIsDragging(true);
      previousPositionRef.current = positionPercent;
      onDragStart?.();
    },
    [boundsRef, positionPercent, onDragStart],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !boundsRef.current || !imageRef.current) return;

      const bounds = boundsRef.current.getBoundingClientRect();
      const imageWidth = imageRef.current.offsetWidth;
      const imageHeight = imageRef.current.offsetHeight;

      const cursorXPercent = ((clientX - bounds.left) / bounds.width) * 100;
      const cursorYPercent = ((clientY - bounds.top) / bounds.height) * 100;

      const targetXPercent = cursorXPercent - dragStartOffsetPercent.current.x;
      const targetYPercent = cursorYPercent - dragStartOffsetPercent.current.y;

      const imageWidthPercent = (imageWidth / bounds.width) * 100;
      const imageHeightPercent = (imageHeight / bounds.height) * 100;
      const maxXPercent = 100 - imageWidthPercent;
      const maxYPercent = 100 - imageHeightPercent;

      const boundedX = Math.max(0, Math.min(targetXPercent, maxXPercent));
      const boundedY = Math.max(0, Math.min(targetYPercent, maxYPercent));

      const currentPos = { x: boundedX, y: boundedY };
      setPositionPercent(currentPos);

      const deltaX = currentPos.x - previousPositionRef.current.x;
      const currentRotationVelocity = deltaX * rotationSensitivity;
      rotationVelocityRef.current = currentRotationVelocity;
      const visualRotation = Math.max(
        -maxRotation,
        Math.min(maxRotation, currentRotationVelocity),
      );
      setRotation(visualRotation);

      previousPositionRef.current = currentPos;
    },
    [isDragging, boundsRef, rotationSensitivity, maxRotation],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    onPositionChange?.(positionPercent);
    onDragEnd?.();

    if (
      Math.abs(rotationVelocityRef.current) > 0.1 ||
      Math.abs(rotation) > 0.1
    ) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animatePendulum);
    } else {
      setRotation(0);
      rotationVelocityRef.current = 0;
    }
  }, [
    isDragging,
    onPositionChange,
    positionPercent,
    animatePendulum,
    rotation,
    onDragEnd,
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (!touch) return;
        handleStart(touch.clientX, touch.clientY);
      }
    },
    [handleStart],
  );

  return (
    <div
      ref={imageRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute touch-none will-change-transform select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} `}
      style={{
        left: `${positionPercent.x}%`,
        top: `${positionPercent.y}%`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`draggable-image ${initialClassName}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 1,
          ...(initialStyle ? { cssText: initialStyle } : {}),
        }}
        draggable={false}
        unoptimized
        priority
      />
    </div>
  );
}
