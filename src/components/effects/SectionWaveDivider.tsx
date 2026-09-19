import React from "react";

interface SectionWaveDividerProps {
  fillColor?: string;
  crestColor?: string;
  bgColor?: string;
  reverse?: boolean;
  className?: string;
}

export default function SectionWaveDivider({
  fillColor = "#fffdfa",
  crestColor = "rgba(6, 182, 212, 0.15)",
  bgColor = "transparent",
  reverse = false,
  className = "",
}: SectionWaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none pointer-events-none -my-1 ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    >
      <svg
        className={`relative block w-full h-8 sm:h-12 lg:h-16 ${
          reverse ? "rotate-180" : ""
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        {/* Harmonic fluid crest accent */}
        <path
          d="M0,20 C180,100 380,-20 540,65 C700,150 920,20 1200,50 L1200,120 L0,120 Z"
          fill={crestColor}
        />
        {/* Main liquid curve body */}
        <path
          d="M0,35 C150,95 360,-10 510,70 C660,150 910,15 1200,45 L1200,120 L0,120 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}
