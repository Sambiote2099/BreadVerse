"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

// Update the component to accept introComplete prop
export default function AnimatedTextUp({ text, introComplete }: { text: string;introComplete?: boolean;}) {
  const textRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Only animate when introComplete is true and we haven't animated yet
    if (!textRef.current || !introComplete || hasAnimatedRef.current) return;

    const split = new SplitText(textRef.current, { type: "chars" });

    const animation = gsap.from(split.chars, {
      y: 150,
      opacity: 1,
      duration: 1.8,
      ease: "power4.inOut",
      stagger: 0.2,
    });

    hasAnimatedRef.current = true;

    return () => {
      animation.kill();
      split.revert();
    };
  }, [introComplete]); // Dependency on introComplete

  return (
    <div ref={textRef}>
      {text}
    </div>
  );
}
