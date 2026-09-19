"use client";

import React, { useEffect, useRef } from "react";

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  depth: number; // 0 (background blur) to 1 (foreground crisp)
  hasReflection: boolean;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
}

export default function WaterSprinkleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Accessibility check: disable if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    // Device performance adjustment
    const isMobile = width < 768;
    const maxDroplets = isMobile ? 12 : 32;

    const droplets: Droplet[] = [];
    const splashes: SplashParticle[] = [];

    // Mouse coordinates tracking
    const mouse = { x: -1000, y: -1000, active: false };

    const createDroplet = (customX?: number, customY?: number): Droplet => {
      const depth = Math.random();
      const radius = 1.2 + depth * 2.6; // 1.2px to 3.8px
      const maxLife = 140 + Math.random() * 160;

      return {
        x: customX ?? Math.random() * width,
        y: customY ?? (Math.random() * (height * 0.7) + height * 0.2),
        vx: (Math.random() - 0.5) * 0.9,
        vy: -0.6 - Math.random() * 1.4, // Initial upward drift like mist/sprinkler
        radius,
        alpha: 0,
        maxAlpha: 0.25 + depth * 0.45,
        life: 0,
        maxLife,
        depth,
        hasReflection: depth > 0.6,
      };
    };

    const createSplash = (x: number, y: number) => {
      const count = isMobile ? 3 : 5;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 1.8;
        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          radius: 0.8 + Math.random() * 1.2,
          alpha: 0.6,
          life: 0,
        });
      }
    };

    // Initialize initial batch
    for (let i = 0; i < maxDroplets; i++) {
      droplets.push(createDroplet());
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (clickX >= 0 && clickX <= rect.width && clickY >= 0 && clickY <= rect.height) {
        createSplash(clickX, clickY);

        // Add a couple of instant droplets branching outward from click
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const d = createDroplet(clickX, clickY);
          d.vx = Math.cos(angle) * 2;
          d.vy = Math.sin(angle) * 2;
          droplets.push(d);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw main droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.life++;

        // Smooth fade-in and fade-out envelope
        if (d.life < 30) {
          d.alpha = (d.life / 30) * d.maxAlpha;
        } else if (d.life > d.maxLife - 40) {
          d.alpha = ((d.maxLife - d.life) / 40) * d.maxAlpha;
        }

        // Natural physics: gentle upward drift turns downward via gravity
        d.vy += 0.012; // Gravity
        d.x += d.vx;
        d.y += d.vy;

        // Interactive mouse deflection: gentle repellent force
        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const force = (90 - dist) / 90;
            d.vx += (dx / dist) * force * 0.25;
            d.vy += (dy / dist) * force * 0.25;
          }
        }

        // Render droplet with aqua sheen & reflection
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);

        // Water droplet gradient (aqua highlight to cyan body)
        const grad = ctx.createRadialGradient(
          d.x - d.radius * 0.3,
          d.y - d.radius * 0.3,
          d.radius * 0.1,
          d.x,
          d.y,
          d.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${d.alpha * 1.1})`);
        grad.addColorStop(0.4, `rgba(165, 243, 252, ${d.alpha * 0.9})`); // cyan-200
        grad.addColorStop(1, `rgba(6, 182, 212, ${d.alpha * 0.3})`); // cyan-500
        ctx.fillStyle = grad;

        // Subtle soft shadow for depth
        if (d.depth > 0.5) {
          ctx.shadowColor = "rgba(6, 182, 212, 0.35)";
          ctx.shadowBlur = 4;
        }
        ctx.fill();

        // Tiny specular reflection highlight
        if (d.hasReflection) {
          ctx.beginPath();
          ctx.arc(
            d.x - d.radius * 0.35,
            d.y - d.radius * 0.35,
            d.radius * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.9})`;
          ctx.fill();
        }
        ctx.restore();

        // Respawn when life expires or moves offscreen
        if (d.life >= d.maxLife || d.y > height + 20 || d.x < -20 || d.x > width + 20) {
          if (d.y >= height - 40 && Math.random() > 0.7) {
            createSplash(d.x, height - 10);
          }
          droplets[i] = createDroplet();
        }
      }

      // 2. Update and draw tiny splash particles
      for (let j = splashes.length - 1; j >= 0; j--) {
        const s = splashes[j];
        s.life++;
        s.vy += 0.05; // gravity on splash
        s.x += s.vx;
        s.y += s.vy;
        s.alpha *= 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 243, 252, ${s.alpha})`;
        ctx.fill();
        ctx.restore();

        if (s.alpha < 0.05 || s.life > 35) {
          splashes.splice(j, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
}
