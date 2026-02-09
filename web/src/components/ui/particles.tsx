'use client';

import { useEffect, useState } from 'react';

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function Particles({ count = 20 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  const particles = Array.from({ length: count }, (_, i) => {
    const r = (offset: number) => seededRandom(i * 7 + offset + count * 13);
    return {
      id: i,
      size: r(0) * 4 + 2,
      x: r(1) * 100,
      y: r(2) * 100,
      delay: r(3) * 6,
      duration: r(4) * 4 + 4,
      opacity: r(5) * 0.3 + 0.1,
      color: r(6) > 0.5 ? '#3b82f6' : '#f97316',
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
