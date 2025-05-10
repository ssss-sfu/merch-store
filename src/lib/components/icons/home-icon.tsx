import React, { useEffect, useState } from "react";
import { type LucideProps } from "lucide-react";

interface DecoIconProps {
  icon: React.ElementType<LucideProps>;
  className: string;
  size?: number;
  animationClass?: string;
  colorClass?: string;
}

const DecoIcon: React.FC<DecoIconProps> = ({
  icon: Icon,
  className,
  size = 32,
  animationClass = "animate-float",
  colorClass: initialColorClass,
}) => {
  const [randomDelay, setRandomDelay] = useState("0s");
  const [finalColorClass, setFinalColorClass] = useState("text-foreground");
  const [opacity, setOpacity] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [isClicked, setIsClicked] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const delay = (Math.random() * 1.5 + 0.2).toFixed(2) + "s";
    setRandomDelay(delay);

    if (!initialColorClass) {
      const colors = [
        "text-foreground",
        "text-primary",
        "text-blue-400",
        "text-green-400",
        "text-yellow-400",
        "text-red-400",
        "text-purple-400",
        "text-pink-400",
        "text-orange-400",
      ];
      const randomColor =
        colors[Math.floor(Math.random() * colors.length)] ??
        "text-foreground/80";
      setFinalColorClass(randomColor);
    } else {
      setFinalColorClass(initialColorClass);
    }

    const randomOpacity = Math.random() * 0.4 + 0.6;
    setOpacity(randomOpacity);

    const randomStrokeWidth = Math.random() * 0.5 + 1.25;
    setStrokeWidth(randomStrokeWidth);
  }, [initialColorClass]);

  const handleClick = () => {
    setIsClicked(true);
    setFillOpacity(1);
    setScale(1.3);

    setTimeout(() => {
      setFillOpacity(0);
      setScale(1);
      setTimeout(() => setIsClicked(false), 500);
    }, 1000);
  };

  return (
    <div
      className={`absolute opacity-0 ${finalColorClass} ${className} cursor-pointer`}
      style={{
        animation: `fadeIn 0.4s ${randomDelay} ease-out forwards`,
      }}
      onClick={handleClick}
      aria-hidden="true"
    >
      <div
        className={`${animationClass} transition-all duration-500`}
        style={{
          animationDelay: `calc(${randomDelay} + 0.4s)`,
          opacity: opacity,
          transform: `scale(${scale})`,
        }}
      >
        <Icon
          size={size}
          strokeWidth={strokeWidth}
          className={isClicked ? "transition-all duration-500" : ""}
          style={{
            fill: "currentColor",
            fillOpacity: fillOpacity,
            transition: "fill-opacity 500ms ease-out",
          }}
        />
      </div>
    </div>
  );
};

export default DecoIcon;
