"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface ImageItem {
  _id: string;
  url: string[];
  name?: string;
  description?: string;
}

interface InfiniteMovingCardsProps {
  items: ImageItem[];
  direction?: "up" | "down";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  startOffset?: number;
}

export const InfiniteMovingCardsVertical = ({
  items,
  direction = "down",
  speed = "normal",
  pauseOnHover = true,
  className,
  startOffset = 0,
}: InfiniteMovingCardsProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const offsetRef = useRef(startOffset);

  // DECLARE FUNCTIONS FIRST
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "down") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "normal"
        );
      } else if (direction === "up") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "30s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "50s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "70s");
      }
    }
  };

  const applyOffset = () => {
    if (scrollerRef.current && offsetRef.current > 0) {
      const offsetPercentage = offsetRef.current % 100;
      scrollerRef.current.style.setProperty('--animation-offset', `${offsetPercentage}%`);
      const initialTransform = `translateY(-${offsetPercentage}%)`;
      scrollerRef.current.style.transform = initialTransform;
    }
  };

  const addAnimation = () => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Duplicate items for seamless vertical loop
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
      
      // Apply offset after animation starts
      setTimeout(() => {
        applyOffset();
      }, 1000);
    }
  };

  useEffect(() => {
    addAnimation();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller-vertical relative z-20 max-w-full h-[300px] sm:h-[420px] md:h-[500px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex flex-col w-full min-h-full flex-nowrap gap-4",
          start && "animate-scroll-down",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          transform: `translateY(-${offsetRef.current}%)`,
        }}
      >
        {items.map((item, idx) => (
          <li
  className="relative w-full max-w-full mx-auto shrink-0 rounded-2xl group"
  key={item._id + idx}
>
  <div className="relative h-36 sm:h-44 md:h-48 w-full overflow-hidden rounded-xl -rotate-1 hover:scale-102 transition-transform duration-700">
    
    {/* TEXT OVERLAY */}
    {(item.name || item.description) && (
      <div className="absolute top-2 left-2 z-10 max-w-[85%] rounded-lg group-hover:backdrop-blur-sm px-3 py-2 transition-all duration-700">
        {item.name && (
          <h3 className="text-sm font-bold text-white leading-tight">
            {item.name}
          </h3>
        )}
        {item.description && (
          <p className="text-xs text-white/90 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    )}

    {/* First image */}
    <div className="absolute inset-0">
      <Image
        src={item.url[0] || "/placeholder.jpg"}
        alt={item.name || "Bakery image"}
        fill
        className="object-cover transition-all duration-1000 group-hover:opacity-0"
        sizes="(max-width: 768px) 100vw, 400px"
        priority={idx < 2}
      />
    </div>

    {/* Second image on hover */}
    {item.url[1] && (
      <div className="absolute inset-0">
        <Image
          src={item.url[1]}
          alt={item.name || "Bakery image"}
          fill
          className="object-cover transition-all duration-1000 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
    )}
  </div>
</li>

        ))}
      </ul>
    </div>
  );
};