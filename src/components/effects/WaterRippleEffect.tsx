"use client";

import React, { useState } from "react";

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface WaterRippleProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function WaterRippleEffect({
  children,
  className = "",
  onClick,
}: WaterRippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, size, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer select-none ${className}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
          className="absolute rounded-full bg-cyan-400/25 pointer-events-none animate-ripple-expand"
        />
      ))}
      <style jsx>{`
        @keyframes rippleExpand {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-ripple-expand {
          animation: rippleExpand 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
