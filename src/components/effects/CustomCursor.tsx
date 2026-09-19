"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouch || prefersReducedMotion) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = Boolean(
        target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest(".brand-card") ||
          target.closest("[role='button']")
      );

      setIsHoveringInteractive(isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Outer Gold Ring */}
      <div
        className="fixed rounded-full pointer-events-none transition-transform duration-150 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHoveringInteractive ? "46px" : "28px",
          height: isHoveringInteractive ? "46px" : "28px",
          border: isHoveringInteractive
            ? "1.5px solid rgba(212, 175, 55, 0.85)"
            : "1px solid rgba(197, 160, 89, 0.4)",
          backgroundColor: isHoveringInteractive
            ? "rgba(88, 13, 26, 0.08)"
            : "transparent",
        }}
      />

      {/* Inner Maroon Dot */}
      <div
        className="fixed rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHoveringInteractive ? "6px" : "4px",
          height: isHoveringInteractive ? "6px" : "4px",
          backgroundColor: isHoveringInteractive ? "#D4AF37" : "#580D1A",
          boxShadow: isHoveringInteractive
            ? "0 0 8px rgba(212, 175, 55, 0.7)"
            : "0 0 4px rgba(88, 13, 26, 0.4)",
        }}
      />
    </div>
  );
}
