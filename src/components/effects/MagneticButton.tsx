"use client";

import React, { useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  strength?: number;
}

export default function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 24,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);

    setPosition({
      x: distanceX * strength,
      y: distanceY * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 ? "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.1s ease-out",
      }}
      className={`relative inline-flex items-center justify-center will-change-transform ${className}`}
    >
      {children}
    </button>
  );
}
