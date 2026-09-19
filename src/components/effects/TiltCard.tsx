"use client";

import React, { useRef, useState } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 6,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rx = ((y - centerY) / centerY) * -maxTilt;
    const ry = ((x - centerX) / centerX) * maxTilt;

    setTilt({
      rx,
      ry,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${isHovered ? "8px" : "0px"})`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative"
      >
        {children}

        {/* Dynamic Specular Sheen Glare */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden mix-blend-overlay opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
