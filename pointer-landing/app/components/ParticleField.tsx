"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Config ──────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 55;
const CONNECTION_DIST = 110;
const MOUSE_RADIUS    = 180;
const REPULSION       = 0.035;
const LERP_SPEED      = 0.06;
const BASE_SPEED      = 0.25;

const COLOR_PRIMARY   = { r: 16, g: 185, b: 129 };   // emerald #10B981
const COLOR_SECONDARY = { r: 34, g: 211, b: 238 };   // cyan    #22D3EE

interface Particle {
  x:  number; y:  number;
  vx: number; vy: number;
  tx: number; ty: number;       // target (lerp)
  r:  number;
  color: typeof COLOR_PRIMARY;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf       = useRef(0);
  const dpr       = useRef(1);

  // ── Init particles ──
  const initParticles = useCallback((w: number, h: number) => {
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED,
      tx: 0,
      ty: 0,
      r:  1 + Math.random() * 1.4,
      color: Math.random() > 0.35 ? COLOR_PRIMARY : COLOR_SECONDARY,
    }));
  }, []);

  // ── Draw loop ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width  / dpr.current;
    const h = canvas.height / dpr.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr.current, dpr.current);

    const pts = particles.current;
    const mx  = mouse.current.x;
    const my  = mouse.current.y;

    // Update
    for (const p of pts) {
      // Mouse repulsion
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * REPULSION;
        p.tx = p.x + dx * force * 40;
        p.ty = p.y + dy * force * 40;
      } else {
        p.tx = p.x + p.vx;
        p.ty = p.y + p.vy;
      }

      // Lerp to target
      p.x += (p.tx - p.x) * LERP_SPEED;
      p.y += (p.ty - p.y) * LERP_SPEED;

      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10)  p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10)  p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }

    // Connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          const c = pts[i].color;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Dots
    for (const p of pts) {
      const { r, g, b } = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx.fill();
    }

    ctx.restore();
    raf.current = requestAnimationFrame(draw);
  }, []);

  // ── Setup ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    dpr.current = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width  = rect.width  * dpr.current;
      canvas.height = rect.height * dpr.current;
      canvas.style.width  = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (particles.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    resize();
    raf.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [draw, initParticles]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: "screen", opacity: 0.18 }}
      />
      {/* Noise overlay via CSS */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
