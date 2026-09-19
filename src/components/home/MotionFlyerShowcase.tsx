"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

interface MotionFlyerShowcaseProps {
  items: any[];
}

export default function MotionFlyerShowcase({ items }: MotionFlyerShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const topItems = items.filter(item => item.imageUrl).slice(0, 4);
  if (topItems.length === 0) return null;

  // Parallax transformations for background text and elements
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [0, 25]);
  
  return (
    <section 
      ref={containerRef}
      className="relative py-24 sm:py-32 bg-[#2B070E] overflow-hidden flex items-center justify-center min-h-screen"
    >
      {/* Background Decorative Typography */}
      <motion.div 
        style={{ y: yBg }}
        className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
      >
        <span className="text-[20vw] font-black text-white whitespace-nowrap tracking-tighter">
          OPEN NOW
        </span>
      </motion.div>

      {/* Decorative Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        <div className="text-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight mb-4 drop-shadow-xl">
              Fresh & <span className="text-[#DFC17B]">Hot</span>
            </h2>
            <p className="text-stone-300 text-lg sm:text-2xl font-medium tracking-wide uppercase">
              Now Serving
            </p>
          </motion.div>
        </div>

        <div className="relative w-full h-[600px] sm:h-[700px] flex items-center justify-center">
          {topItems.map((item, index) => {
            // Calculate dynamic floating animations mimicking flyer motion
            const isLeft = index % 2 === 0;
            const xOffset = isLeft ? -150 - (index * 40) : 150 + (index * 40);
            const yOffset = index * 80 - 150;
            const scaleOffset = 1 - (index * 0.1);
            const zIndexOffset = 10 - index;

            return (
              <motion.div
                key={item.id}
                className="absolute origin-center"
                style={{ 
                  zIndex: zIndexOffset,
                  rotate: isLeft ? rotateLeft : rotateRight
                }}
                initial={{ 
                  opacity: 0, 
                  x: isLeft ? -200 : 200,
                  y: yOffset,
                  scale: 0.5 
                }}
                whileInView={{ 
                  opacity: 1, 
                  x: xOffset,
                  y: yOffset,
                  scale: scaleOffset 
                }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 70,
                  damping: 15
                }}
                whileHover={{ 
                  scale: scaleOffset + 0.1,
                  rotate: isLeft ? -5 : 5,
                  zIndex: 20
                }}
              >
                <Link href={`/menu/${item.id}`} className="block relative group">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#DFC17B]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 192px, 320px"
                    />
                    
                    {/* Hover Overlay with Name */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-md">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Floating Price Tag */}
                  <motion.div 
                    className="absolute -top-4 -right-4 bg-[#DFC17B] text-[#2B070E] font-black text-sm sm:text-lg px-4 py-2 rounded-full shadow-lg transform rotate-12"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  >
                    ₹{item.price}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}

          {/* Central CTA Element */}
          <motion.div
            className="absolute z-30"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <Link 
              href="/menu"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#DFC17B] to-[#b89547] flex flex-col items-center justify-center text-[#2B070E] shadow-[0_0_40px_rgba(223,193,123,0.4)] border-4 border-white/20 transition-transform"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-1">Explore</span>
              <span className="text-xl sm:text-2xl font-black uppercase">Menu</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
