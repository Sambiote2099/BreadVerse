"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Update the component to accept introComplete prop
export default function AnimatedTextRightCopy({ text }: { text: string;}) {
  const textRef = useRef<HTMLDivElement>(null);
 

  useEffect(() => {
    // Only animate when introComplete is true and we haven't animated yet
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, { type: "chars" });

    const animation = gsap.from(split.chars, {
      x: 150,
      opacity: 1,
      duration: 1.8,
      ease: "expo.out",
      stagger: 0.2,
    });

    return () => {
      animation.kill();
      split.revert();
    };
  }, []); // Dependency on introComplete

  return (
    <div ref={textRef}>
      {text}
    </div>
  );
}
