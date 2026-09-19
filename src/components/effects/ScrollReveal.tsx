"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Accessibility check: disable if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return "translate3d(0, 28px, 0) scale(0.98)";
      case "down":
        return "translate3d(0, -28px, 0) scale(0.98)";
      case "left":
        return "translate3d(28px, 0, 0)";
      case "right":
        return "translate3d(-28px, 0, 0)";
      default:
        return "none";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transition: `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
