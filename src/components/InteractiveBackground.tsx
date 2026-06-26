/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Ant {
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  speed: number;
  size: number;
  color: string;
  legsPhase: number;
  legsSpeed: number;
  state: 'wandering' | 'toFood' | 'carryingFood';
  hasCrumb: boolean;
  crumbColor?: string;
  turnTimer: number;
}

interface FoodDrop {
  x: number;
  y: number;
  radius: number;
  crumbsLeft: number;
  color: string;
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

  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const sparksRef = useRef<Spark[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const antsRef = useRef<Ant[]>([]);
  const foodsRef = useRef<FoodDrop[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

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

      initAnts();
    };

    // Beautiful Glowing Theme Colors
    const getThemeColors = () => {
      if (theme === 'gaming') {
        return {
          ant: isDark ? 'rgba(16, 185, 129, ' : 'rgba(5, 150, 105, ', // emerald
          food: 'rgba(139, 92, 246, ', // purple
          accent: 'rgba(52, 211, 153, ' // light emerald
        };
      }
      if (theme === 'shopping') {
        return {
          ant: 'rgba(249, 115, 22, ', // orange
          food: 'rgba(16, 185, 129, ', // emerald
          accent: 'rgba(245, 158, 11, ' // amber
        };
      }
      // Default (Cash / Finance theme)
      return {
        ant: isDark ? 'rgba(251, 191, 36, ' : 'rgba(180, 83, 9, ', // gold/amber
        food: 'rgba(52, 211, 153, ', // emerald/green
        accent: 'rgba(59, 130, 246, ' // blue
      };
    };

    // Initialize the crawling ants
    const initAnts = () => {
      const colors = getThemeColors();
      const numAnts = Math.min(25, Math.floor((width * height) / 16000) + 12);
      const list: Ant[] = [];

      for (let i = 0; i < numAnts; i++) {
        const size = Math.random() * 2 + 3.5; // ant size multiplier
        const angle = Math.random() * Math.PI * 2;
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          angle,
          targetAngle: angle,
          speed: Math.random() * 0.4 + 0.6,
          size,
          color: colors.ant,
          legsPhase: Math.random() * Math.PI * 2,
          legsSpeed: Math.random() * 0.15 + 0.2,
          state: 'wandering',
          hasCrumb: false,
          turnTimer: Math.floor(Math.random() * 50) + 30
        });
      }
      antsRef.current = list;
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    resizeCanvas();

    // Spawn sparks (sugar crystals flying around)
    const spawnSparks = (x: number, y: number, colorPrefix: string) => {
      const sparks = sparksRef.current;
      const count = Math.floor(Math.random() * 6) + 6;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.6;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 1.5 + 0.8,
          color: colorPrefix,
          alpha: 1.0,
          life: 0,
          maxLife: Math.floor(Math.random() * 25) + 15
        });
      }
    };

    // Click to drop sweet food / sugar drops
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

      // Add a food drop (sugar crystal)
      foodsRef.current.push({
        x,
        y,
        radius: Math.random() * 4 + 6,
        crumbsLeft: Math.floor(Math.random() * 8) + 12,
        color: colors.food
      });

      // Spawn beautiful ripple
      ripplesRef.current.push({
        x,
        y,
        radius: 2,
        maxRadius: 40,
        alpha: 0.6,
        speed: 1.5,
        color: colors.food
      });

      // Spawn sparkling food crumbs
      spawnSparks(x, y, colors.food);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handlePointerDown);
      container.addEventListener('touchstart', handlePointerDown);
    }

    // DRAW ANT HELPERS
    const drawAnt = (ant: Ant) => {
      ctx.save();
      ctx.translate(ant.x, ant.y);
      ctx.rotate(ant.angle);

      const s = ant.size;
      const baseAlpha = isDark ? 0.45 : 0.6;
      const col = `${ant.color}${baseAlpha})`;

      // 1. Draw 6 wiggling legs extending from thorax
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8;
      
      const wiggle = Math.sin(ant.legsPhase) * 0.35;
      
      // Left legs
      ctx.beginPath();
      // Front leg
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.5, -s * 0.9 - wiggle);
      ctx.lineTo(s * 1.0, -s * 1.2 - wiggle);
      // Middle leg
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -s * 0.8 + wiggle);
      ctx.lineTo(-s * 0.3, -s * 1.1 + wiggle);
      // Back leg
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.5, -s * 0.9 - wiggle);
      ctx.lineTo(-s * 1.1, -s * 1.3 - wiggle);

      // Right legs
      // Front leg
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.5, s * 0.9 + wiggle);
      ctx.lineTo(s * 1.0, s * 1.2 + wiggle);
      // Middle leg
      ctx.moveTo(0, 0);
      ctx.lineTo(0, s * 0.8 - wiggle);
      ctx.lineTo(-s * 0.3, s * 1.1 - wiggle);
      // Back leg
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.5, s * 0.9 + wiggle);
      ctx.lineTo(-s * 1.1, s * 1.3 + wiggle);
      ctx.stroke();

      // 2. Draw antennae on head
      ctx.beginPath();
      ctx.moveTo(s * 1.1, -s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, -s * 0.5, s * 1.8, -s * 0.3);
      ctx.moveTo(s * 1.1, s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, s * 0.5, s * 1.8, s * 0.3);
      ctx.stroke();

      // 3. Draw abdomen (Back body oval)
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(-s * 0.9, 0, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw thorax (Middle body circle)
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 5. Draw head (Front body circle)
      ctx.beginPath();
      ctx.arc(s * 0.8, 0, s * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw carried glowing sugar crumb if ant has one
      if (ant.hasCrumb && ant.crumbColor) {
        ctx.fillStyle = `${ant.crumbColor}0.95)`;
        ctx.shadowColor = ant.crumbColor + '1.0)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(s * 1.3, 0, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      ctx.restore();
    };

    // MAIN ANIMATION FRAME LOOP
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clean background
      ctx.clearRect(0, 0, width, height);

      const sparks = sparksRef.current;
      const ripples = ripplesRef.current;
      const ants = antsRef.current;
      const foods = foodsRef.current;

      // Draw & Update Ripples (Sugar drop ripple effects)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha = Math.max(0, 0.6 * (1 - r.radius / r.maxRadius));

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw & Update Sparks (Glowing sugar crystals)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.02; // soft gravity drift
        s.life++;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        if (s.life >= s.maxLife || s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha * 0.8})`;
        ctx.fill();
      }

      // Draw & Update Foods (Sweet drops)
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        if (f.crumbsLeft <= 0) {
          foods.splice(i, 1);
          continue;
        }

        // Draw sweet sugar cluster
        ctx.save();
        ctx.shadowColor = f.color + '0.5)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = `${f.color}${isDark ? '0.4' : '0.65'})`;
        
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius + 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw multiple glowing inner sugar granules
        ctx.fillStyle = '#FFFFFF';
        const numGranules = Math.min(5, Math.ceil(f.crumbsLeft / 2));
        for (let g = 0; g < numGranules; g++) {
          const goffX = Math.sin(g * 12 + f.crumbsLeft) * (f.radius * 0.4);
          const goffY = Math.cos(g * 12 + f.crumbsLeft) * (f.radius * 0.4);
          ctx.beginPath();
          ctx.arc(f.x + goffX, f.y + goffY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Update & Draw Ants
      ants.forEach((ant) => {
        ant.legsPhase += ant.legsSpeed;

        // ANT BRAIN STATE MACHINE
        if (foods.length > 0 && ant.state !== 'carryingFood') {
          // Sense closest food drop
          let closestFood: FoodDrop | null = null;
          let minDist = 250; // sensing radius

          foods.forEach((f) => {
            const dx = f.x - ant.x;
            const dy = f.y - ant.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              closestFood = f;
            }
          });

          if (closestFood) {
            ant.state = 'toFood';
            // Head directly to food
            const targetX = (closestFood as FoodDrop).x;
            const targetY = (closestFood as FoodDrop).y;
            const dx = targetX - ant.x;
            const dy = targetY - ant.y;
            ant.targetAngle = Math.atan2(dy, dx);

            // Reached food? Eating action!
            if (minDist < 10) {
              (closestFood as FoodDrop).crumbsLeft--;
              ant.hasCrumb = true;
              ant.crumbColor = (closestFood as FoodDrop).color;
              ant.state = 'carryingFood';
              ant.targetAngle = ant.angle + Math.PI + (Math.random() - 0.5) * 1.5; // turn around
            }
          } else {
            ant.state = 'wandering';
          }
        }

        // Wandering / Random walking logic
        if (ant.state === 'wandering' || ant.state === 'carryingFood') {
          ant.turnTimer--;
          if (ant.turnTimer <= 0) {
            // Pick a new target direction
            ant.targetAngle = ant.angle + (Math.random() - 0.5) * 1.8;
            ant.turnTimer = Math.floor(Math.random() * 80) + 40;
          }

          // If carrying food, eventually drop it off screen or absorb it
          if (ant.hasCrumb && Math.random() < 0.001) {
            ant.hasCrumb = false;
          }
        }

        // Steer angle smoothly toward targetAngle
        let angleDiff = ant.targetAngle - ant.angle;
        // Normalize angle difference to -PI to PI
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        ant.angle += angleDiff * 0.12;

        // Move ant along its angle
        const speedMultiplier = ant.state === 'toFood' ? 1.4 : ant.hasCrumb ? 0.75 : 1.0;
        ant.x += Math.cos(ant.angle) * ant.speed * speedMultiplier;
        ant.y += Math.sin(ant.angle) * ant.speed * speedMultiplier;

        // Avoid offscreen borders by steering back
        const margin = 30;
        if (ant.x < margin) {
          ant.targetAngle = 0 + (Math.random() - 0.5) * 0.5;
          ant.turnTimer = 40;
        } else if (ant.x > width - margin) {
          ant.targetAngle = Math.PI + (Math.random() - 0.5) * 0.5;
          ant.turnTimer = 40;
        }

        if (ant.y < margin) {
          ant.targetAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          ant.turnTimer = 40;
        } else if (ant.y > height - margin) {
          ant.targetAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          ant.turnTimer = 40;
        }

        // Wrap around as fallback if completely out of bounds
        if (ant.x < -20) ant.x = width + 10;
        if (ant.x > width + 20) ant.x = -10;
        if (ant.y < -20) ant.y = height + 10;
        if (ant.y > height + 20) ant.y = -10;

        // Draw ant on canvas
        drawAnt(ant);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (container) {
        container.removeEventListener('mousedown', handlePointerDown);
        container.removeEventListener('touchstart', handlePointerDown);
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
