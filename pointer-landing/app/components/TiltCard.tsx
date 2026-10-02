"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

// ─── Config ──────────────────────────────────────────────────────────────
const PERSPECTIVE  = 1000;
const MAX_ROTATE   = 4;        // degrees
const SPRING_CONF  = { stiffness: 120, damping: 20 };

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;          // e.g. "16,185,129"
}

export default function TiltCard({
  children,
  className = "",
  glowColor = "16,185,129",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Raw mouse coords → spring-smoothed rotation
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(rawX, SPRING_CONF);
  const rotateY = useSpring(rawY, SPRING_CONF);

  // Beam border: light position follows cursor
  const beamX = useMotionValue(50);   // percent
  const beamY = useMotionValue(50);

  const beamGradient = useMotionTemplate`
    radial-gradient(
      600px circle at ${beamX}% ${beamY}%,
      rgba(${glowColor}, 0.14),
      transparent 70%
    )
  `;

  const borderGradient = useMotionTemplate`
    radial-gradient(
      400px circle at ${beamX}% ${beamY}%,
      rgba(${glowColor}, 0.35),
      rgba(255,255,255,0.06) 60%,
      transparent 80%
    )
  `;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    // Normalized -1 to 1
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);

    // Rotate (inverted for natural feel)
    rawX.set(-ny * MAX_ROTATE);
    rawY.set( nx * MAX_ROTATE);

    // Beam position as percentage
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    beamX.set(px);
    beamY.set(py);
  };

  const handleLeave = () => {
    rawX.set(0);
    rawY.set(0);
    beamX.set(50);
    beamY.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        perspective: PERSPECTIVE,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Beam border overlay (rendered behind content via absolute + z) */}
        <motion.div
          style={{ background: borderGradient }}
          className="absolute -inset-px rounded-2xl z-0 pointer-events-none"
        />

        {/* Inner glow overlay */}
        <motion.div
          style={{ background: beamGradient }}
          className="absolute inset-0 rounded-2xl z-[1] pointer-events-none opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300"
        />

        {/* Content */}
        <div
          className={`relative z-[2] rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden group/tilt ${className}`}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
