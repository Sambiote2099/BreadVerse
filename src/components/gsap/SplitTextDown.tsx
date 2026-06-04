"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function AnimatedTextDown({ text }: { text: string }) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // split the text into characters
    const split = new SplitText(textRef.current, { type: "chars" });

    // animate the characters
    const animation = gsap.from(split.chars, {
      y: -150,
      opacity: 1,
      duration: 2,
      ease: "power4.out",
      stagger: 0.22,
    });

    // cleanup on unmount
    return () => {
      animation.kill();
      split.revert();
    };
  }, []);

  return (
    <div
      ref={textRef}
     
    >
      {text}
    </div>
  );
}
