"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MotionFlyerShowcaseProps {
  items: any[];
}

export default function MotionFlyerShowcase({ items }: MotionFlyerShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const topItems = items.filter(item => item.image).slice(0, 5);
  
  useEffect(() => {
    if (topItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topItems.length]);

  if (topItems.length === 0) return null;

  const currentItem = topItems[currentIndex];

  // Floating ingredients for background effect
  const ingredients = ["🌶️", "🌿", "🧅", "🧄", "🍅", "🍋"];

  return (
    <section className="relative w-full h-[80vh] sm:h-screen bg-[#110A0A] overflow-hidden flex items-center justify-center">
      
      {/* 1. AGGRESSIVE BACKGROUND TYPOGRAPHY (Pinterest Style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentItem.name}
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 0.08, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -100 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-[15vw] sm:text-[20vw] font-black text-[#DFC17B] uppercase leading-none whitespace-nowrap text-center"
          >
            {currentItem.name.split(" ")[0]}<br/>
            {currentItem.name.split(" ")[1] || "SPECIAL"}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* 2. RADIAL SPOTLIGHT */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15)_0%,rgba(17,10,10,1)_70%)] z-0" />

      {/* 3. FLOATING INGREDIENTS (Cinematic blur effect) */}
      {ingredients.map((emoji, idx) => (
        <motion.div
          key={`${currentIndex}-${idx}`}
          className="absolute z-10 text-3xl sm:text-5xl opacity-40 blur-[2px]"
          initial={{ 
            opacity: 0, 
            x: (Math.random() - 0.5) * 800, 
            y: (Math.random() - 0.5) * 800, 
            rotate: 0,
            scale: 0
          }}
          animate={{ 
            opacity: 0.4, 
            x: (Math.random() - 0.5) * 400, 
            y: (Math.random() - 0.5) * 400,
            rotate: 360,
            scale: 1
          }}
          transition={{ duration: 3.5, ease: "easeOut" }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* 4. MAIN FOREGROUND CONTENT */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Dynamic Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <span className="bg-[#580D1A] text-[#DFC17B] text-xs sm:text-sm font-black tracking-[0.3em] uppercase px-6 py-2 rounded-full border border-[#DFC17B]/30 shadow-[0_0_15px_rgba(223,193,123,0.3)]">
            Today&apos;s Hot Special
          </span>
        </motion.div>

        {/* Central Spinning Plate */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 90 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className="relative w-64 h-64 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] rounded-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] border-4 border-[#DFC17B]/20 overflow-hidden"
          >
            {/* Inner endless slow rotation for the food image */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="w-full h-full"
            >
              <Image
                src={currentItem.image}
                alt={currentItem.name}
                fill
                priority
                sizes="(max-width: 640px) 256px, (max-width: 768px) 384px, 450px"
                className="object-cover scale-110" // scale up slightly to hide borders during rotation
              />
            </motion.div>
            
            {/* High Impact Price Tag */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-[#D4AF37] text-[#110A0A] font-black text-2xl sm:text-4xl px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-2xl rotate-[-10deg] border-4 border-[#110A0A]"
            >
              ₹{currentItem.price}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Name & CTA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${currentItem.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="mt-8 sm:mt-12 flex flex-col items-center"
          >
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg mb-2">
              {currentItem.name}
            </h2>
            <p className="text-stone-300 max-w-lg mx-auto text-sm sm:text-base font-medium mb-6">
              {currentItem.description.substring(0, 80)}...
            </p>
            
            <Link 
              href={`/menu/${currentItem.id}`}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#b89547] rounded-full overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all"
            >
              <span className="relative z-10 text-[#110A0A] font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
                Order Now <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white/30 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </motion.div>
        </AnimatePresence>
        
      </div>
    </section>
  );
}
