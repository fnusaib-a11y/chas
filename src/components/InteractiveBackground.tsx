/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseTime: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export default function InteractiveBackground({ isDark, theme = 'default' }: { isDark: boolean; theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Keep interaction states inside refs to avoid re-running the heavy canvas loop setup
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });
  const sparksRef = useRef<Spark[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    // Device Pixel Ratio for Retina displays
    const dpr = window.devicePixelRatio || 1;

    // Set canvas sizes based on container size
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize particles when resized to fit screen
      initParticles();
    };

    // Color helpers based on theme
    const getThemeColors = () => {
      if (theme === 'gaming') {
        return [
          'rgba(16, 185, 129, ', // emerald
          'rgba(5, 150, 105, ',  // dark emerald
          'rgba(52, 211, 153, ', // light emerald
          'rgba(139, 92, 246, '  // purple
        ];
      }
      if (theme === 'shopping') {
        return [
          'rgba(249, 115, 22, ', // orange
          'rgba(245, 158, 11, ', // amber
          'rgba(16, 185, 129, ', // emerald
          'rgba(14, 165, 233, '  // sky
        ];
      }
      // Default & dark theme (Cash / Finance theme)
      if (isDark) {
        return [
          'rgba(52, 211, 153, ', // emerald-400
          'rgba(251, 191, 36, ', // amber-400
          'rgba(59, 130, 246, ', // blue-500
          'rgba(167, 139, 250, ' // purple-400
        ];
      } else {
        return [
          'rgba(16, 185, 129, ', // emerald-500
          'rgba(217, 119, 6, ',  // amber-600
          'rgba(37, 99, 235, ',  // blue-600
          'rgba(124, 58, 237, '  // violet-600
        ];
      }
    };

    // Initialize the background floating particles
    const initParticles = () => {
      const colors = getThemeColors();
      const numParticles = Math.min(22, Math.floor((width * height) / 18000) + 10);
      const list: Particle[] = [];

      for (let i = 0; i < numParticles; i++) {
        const radius = Math.random() * 5 + 3;
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.4 + 0.15,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseTime: Math.random() * Math.PI * 2
        });
      }
      particlesRef.current = list;
    };

    // Create a resize observer to watch container size
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Trigger initial resize
    resizeCanvas();

    // Trigger explosive sparks at a coordinate
    const spawnSparks = (x: number, y: number, colorPrefix: string) => {
      const sparks = sparksRef.current;
      const count = Math.floor(Math.random() * 8) + 8;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.8;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2 + 1,
          color: colorPrefix,
          alpha: 1.0,
          life: 0,
          maxLife: Math.floor(Math.random() * 30) + 20
        });
      }
    };

    // Mouse & Touch events handlers
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
      mouseRef.current.active = true;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const colors = getThemeColors();
      const randColor = colors[Math.floor(Math.random() * colors.length)];

      // Spawn Ripple
      ripplesRef.current.push({
        x,
        y,
        radius: 2,
        maxRadius: Math.random() * 60 + 50,
        alpha: 0.85,
        speed: 2.2,
        color: randColor
      });

      // Spawn Sparks
      spawnSparks(x, y, randColor);
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    // Add listeners to parent container to capture movements
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('touchstart', handlePointerMove);
      container.addEventListener('touchmove', handlePointerMove);
      container.addEventListener('mousedown', handlePointerDown);
      container.addEventListener('touchend', handlePointerLeave);
      container.addEventListener('mouseleave', handlePointerLeave);
    }

    // MAIN ANIMATION LOOP
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear with solid transparent color to prevent trace lines or preserve faint trails depending on background
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const sparks = sparksRef.current;
      const ripples = ripplesRef.current;
      const mouse = mouseRef.current;

      // Ease mouse coordinates for smooth lag-trailing effect
      if (mouse.active) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.12;
          mouse.y += (mouse.targetY - mouse.y) * 0.12;
        }
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Update & Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha = Math.max(0, 0.85 * (1 - r.radius / r.maxRadius));

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Subtly filled inner glow
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${r.color}${r.alpha * 0.08})`;
        ctx.fill();
      }

      // Update & Draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04; // gravity drift
        s.life++;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        if (s.life >= s.maxLife || s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha * 0.95})`;
        ctx.fill();
      }

      // Update & Draw Main Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseTime += p.pulseSpeed;

        // Bounce off bounds gracefully
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Attract toward mouse if mouse is nearby
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const force = (130 - dist) / 130;
            p.x += (dx / dist) * force * 0.6;
            p.y += (dy / dist) * force * 0.6;
          }
        }

        // Pulse radius slightly over time
        const pulseRadius = p.radius + Math.sin(p.pulseTime) * 1.5;

        // Draw soft ambient glowing radial gradients for each bubble
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseRadius * 2.8);
        const baseAlpha = p.alpha;
        
        grad.addColorStop(0, `${p.color}${baseAlpha})`);
        grad.addColorStop(0.3, `${p.color}${baseAlpha * 0.5})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw faint connection network lines (constellation effect)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connection limit based on screen height
          const maxDist = Math.min(width * 0.35, 125);
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Draw dual-color gradients for network strings
            const lineGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            lineGrad.addColorStop(0, `${p1.color}${lineAlpha})`);
            lineGrad.addColorStop(1, `${p2.color}${lineAlpha})`);
            
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    // Start rendering frame loop
    requestRef.current = requestAnimationFrame(animate);

    // Complete cleanup on component unmount
    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (container) {
        container.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('touchstart', handlePointerMove);
        container.removeEventListener('touchmove', handlePointerMove);
        container.removeEventListener('mousedown', handlePointerDown);
        container.removeEventListener('touchend', handlePointerLeave);
        container.removeEventListener('mouseleave', handlePointerLeave);
      }
    };
  }, [isDark, theme]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden"
    >
      <canvas 
        ref={canvasRef} 
        className="block absolute inset-0 w-full h-full mix-blend-normal opacity-70 dark:opacity-80" 
      />
    </div>
  );
}
