"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LiquidPageTransition() {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!transitioning) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none overflow-hidden h-1.5"
      aria-hidden="true"
    >
      <div className="w-full h-full bg-gradient-to-r from-orange-500 via-cyan-400 to-amber-500 animate-liquid-sweep shadow-[0_0_12px_#06b6d4]" />
      <style jsx>{`
        @keyframes liquidSweep {
          0% {
            transform: translateX(-100%) scaleX(0.2);
            opacity: 0.9;
          }
          50% {
            transform: translateX(0%) scaleX(1);
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scaleX(0.4);
            opacity: 0;
          }
        }
        .animate-liquid-sweep {
          animation: liquidSweep 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
