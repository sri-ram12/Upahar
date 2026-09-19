"use client";

import React, { useEffect, useRef, useState } from "react";

interface WaterDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  depth: number; // 0 = background (blurred), 0.5 = midground, 1 = foreground (crisp)
  isScatter?: boolean;
  angle?: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface StreamNode {
  x: number;
  y: number;
  thickness: number;
  alpha: number;
}

interface WaterEngineProps {
  intensity?: "high" | "medium" | "low" | "minimal";
  showStream?: boolean;
  className?: string;
}

export default function RealisticWaterEngine({
  intensity = "high",
  showStream = true,
  className = "",
}: WaterEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Accessibility check: disable if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || intensity === "minimal") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Size calculation
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    // Adaptive particle limits
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    let maxParticles = 75;
    if (intensity === "low" || isMobile) maxParticles = 20;
    else if (intensity === "medium" || isTablet) maxParticles = 40;

    const droplets: WaterDroplet[] = [];
    const splashes: SplashParticle[] = [];
    let streamNodes: StreamNode[] = [];

    // Mouse tracking
    const mouse = { x: -1000, y: -1000, active: false };

    // Stream progression phase (loops every ~4.5s)
    let streamPhase = 0;

    // Invisible collision surface (pedestal level)
    const collisionY = height * 0.76;

    // Helper: spawn a realistic water droplet
    const createDroplet = (
      customX?: number,
      customY?: number,
      customVx?: number,
      customVy?: number,
      depthTier?: number
    ): WaterDroplet => {
      const depth = depthTier !== undefined ? depthTier : Math.random();
      // Radius scales with depth: 1.2px (far) to 5.5px (near)
      const radius = 1.2 + depth * 4.2;
      const maxLife = 120 + Math.random() * 150;

      // Natural throw trajectory: enters from right-middle traveling left and slightly upward before falling
      const startX = customX ?? (width * 0.85 + (Math.random() - 0.5) * 60);
      const startY = customY ?? (height * 0.28 + (Math.random() - 0.5) * 40);

      const vx = customVx ?? -2.2 - Math.random() * 2.5 - depth * 1.2;
      const vy = customVy ?? -1.2 - Math.random() * 2.0;

      return {
        x: startX,
        y: startY,
        vx,
        vy,
        radius,
        alpha: 0,
        maxAlpha: 0.3 + depth * 0.6,
        life: 0,
        maxLife,
        depth,
        angle: Math.random() * Math.PI * 2,
      };
    };

    // Helper: spawn collision micro-splashes
    const triggerSplash = (x: number, y: number, count = 5) => {
      const actualCount = isMobile ? Math.min(3, count) : count;
      for (let i = 0; i < actualCount; i++) {
        const angle = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7; // upwards arc
        const speed = 1.2 + Math.random() * 2.8;
        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 0.8 + Math.random() * 1.5,
          alpha: 0.85,
          life: 0,
          maxLife: 25 + Math.random() * 20,
        });
      }
    };

    // Initialize initial droplet batch
    for (let i = 0; i < maxParticles; i++) {
      const d = createDroplet(
        Math.random() * width,
        Math.random() * (height * 0.8) + height * 0.1
      );
      d.life = Math.floor(Math.random() * d.maxLife);
      droplets.push(d);
    }

    // Resize Handler
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    // Mouse Interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // Click produces an immediate water throw burst & splash
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (clickX >= 0 && clickX <= rect.width && clickY >= 0 && clickY <= rect.height) {
        triggerSplash(clickX, clickY, isMobile ? 6 : 12);

        // Spawn a cluster of bursting droplets radiating outwards
        for (let i = 0; i < (isMobile ? 4 : 8); i++) {
          const angle = (i / 8) * Math.PI * 2;
          const speed = 2.5 + Math.random() * 3.0;
          droplets.push(
            createDroplet(
              clickX,
              clickY,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed - 1.5,
              0.8
            )
          );
        }
      }
    };

    // IntersectionObserver to pause when hero is off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // Main 60fps Render Loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      streamPhase += 0.025;

      // 1. RENDER ORGANIC WATER THROW STREAM (Continuous Fluid Arc)
      if (showStream && !isMobile) {
        const streamOriginX = width * 0.95;
        const streamOriginY = height * 0.22;
        const midArcX = width * 0.62 + Math.sin(streamPhase) * 25;
        const midArcY = height * 0.16 + Math.cos(streamPhase * 0.8) * 15;
        const endArcX = width * 0.38;
        const endArcY = height * 0.52;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(streamOriginX, streamOriginY);
        ctx.quadraticCurveTo(midArcX, midArcY, endArcX, endArcY);

        // Stream gradient with aqua translucency & specular sheen
        const streamGrad = ctx.createLinearGradient(
          streamOriginX,
          streamOriginY,
          endArcX,
          endArcY
        );
        streamGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        streamGrad.addColorStop(0.3, "rgba(165, 243, 252, 0.35)"); // cyan-200
        streamGrad.addColorStop(0.7, "rgba(6, 182, 212, 0.22)"); // cyan-500
        streamGrad.addColorStop(1, "rgba(6, 182, 212, 0.02)");

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = 14 + Math.sin(streamPhase * 1.5) * 3;
        ctx.lineCap = "round";
        ctx.filter = "blur(3px)";
        ctx.stroke();

        // High-gloss specular core inside stream
        ctx.beginPath();
        ctx.moveTo(streamOriginX, streamOriginY - 2);
        ctx.quadraticCurveTo(midArcX, midArcY - 2, endArcX, endArcY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 4;
        ctx.filter = "blur(1px)";
        ctx.stroke();
        ctx.restore();

        // Continuously spawn fresh droplets peeling off the stream arc
        if (Math.random() > 0.4 && droplets.length < maxParticles) {
          const t = 0.4 + Math.random() * 0.6; // emit from mid to end of arc
          const emitX = (1 - t) * (1 - t) * streamOriginX + 2 * (1 - t) * t * midArcX + t * t * endArcX;
          const emitY = (1 - t) * (1 - t) * streamOriginY + 2 * (1 - t) * t * midArcY + t * t * endArcY;
          droplets.push(
            createDroplet(
              emitX,
              emitY,
              -2.5 - Math.random() * 2.2,
              -0.5 + Math.random() * 1.5
            )
          );
        }
      }

      // 2. SORT AND RENDER DROPLETS (Back to Front for Depth Realism)
      droplets.sort((a, b) => a.depth - b.depth);

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.life++;

        // Life fade envelope
        if (d.life < 25) {
          d.alpha = (d.life / 25) * d.maxAlpha;
        } else if (d.life > d.maxLife - 35) {
          d.alpha = ((d.maxLife - d.life) / 35) * d.maxAlpha;
        }

        // Realistic Physics: Gravity + Aerodynamic Drag
        d.vy += 0.042; // Gravity pulling downward
        d.vx *= 0.992; // Drag
        d.vy *= 0.995;

        // Subtle turbulence noise
        d.x += d.vx + Math.sin(d.life * 0.08) * 0.35;
        d.y += d.vy;

        // Interactive mouse deflection
        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            d.vx += (dx / dist) * force * 0.45;
            d.vy += (dy / dist) * force * 0.45;
          }
        }

        // Check collision with invisible surface
        if (d.y >= collisionY && d.vy > 0 && Math.random() > 0.45) {
          triggerSplash(d.x, collisionY, Math.floor(d.radius * 1.5));
          // Reset droplet
          droplets[i] = createDroplet();
          continue;
        }

        // Draw Droplet with Realistic Specular Highlight & Aqua Refraction
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);

        // Depth Blur for Background Particles
        if (d.depth < 0.35) {
          ctx.filter = "blur(2px)";
        }

        // Water droplet radial gradient
        const grad = ctx.createRadialGradient(
          d.x - d.radius * 0.35,
          d.y - d.radius * 0.35,
          d.radius * 0.1,
          d.x,
          d.y,
          d.radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${d.alpha * 1.1})`);
        grad.addColorStop(0.35, `rgba(165, 243, 252, ${d.alpha * 0.9})`);
        grad.addColorStop(0.85, `rgba(6, 182, 212, ${d.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(8, 145, 178, ${d.alpha * 0.15})`);

        ctx.fillStyle = grad;

        // Foreground soft glow reflection
        if (d.depth > 0.7) {
          ctx.shadowColor = "rgba(6, 182, 212, 0.45)";
          ctx.shadowBlur = 6;
        }

        ctx.fill();

        // Pinpoint specular glint reflection on top-left crest
        if (d.depth > 0.4) {
          ctx.beginPath();
          ctx.arc(
            d.x - d.radius * 0.38,
            d.y - d.radius * 0.38,
            Math.max(0.6, d.radius * 0.28),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 1.2})`;
          ctx.fill();
        }

        ctx.restore();

        // Respawn when expired or off-screen
        if (
          d.life >= d.maxLife ||
          d.y > height + 40 ||
          d.x < -40 ||
          d.x > width + 60
        ) {
          droplets[i] = createDroplet();
        }
      }

      // 3. RENDER COLLISION MICRO-SPLASHES
      for (let j = splashes.length - 1; j >= 0; j--) {
        const s = splashes[j];
        s.life++;
        s.vy += 0.08; // Gravity on splashes
        s.x += s.vx;
        s.y += s.vy;
        s.alpha = (1 - s.life / s.maxLife) * 0.85;

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 243, 252, ${s.alpha})`;
        ctx.shadowColor = "rgba(6, 182, 212, 0.4)";
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.restore();

        if (s.life >= s.maxLife || s.alpha <= 0.02) {
          splashes.splice(j, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, [isClient, intensity, showStream]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
