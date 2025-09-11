import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  blur: number;
}

// inspired of classic hollow knight main menu <https://hollowknight.fandom.com/wiki/Menu_Styles_(Hollow_Knight)?file=Menu_Theme_Classic_Current.png>
export const SilkParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setup = () => {
      dprRef.current = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dprRef.current);
      canvas.height = Math.floor(window.innerHeight * dprRef.current);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      makeParticles();
    };

    const makeParticles = () => {
      const area = window.innerWidth * window.innerHeight;
      const count = Math.max(10, Math.floor(area / 30000));
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random(); // 0 near, 1 far
        const size = 0.9 + (1 - depth) * 3.4;               // some larger bokeh
        const vx = 0.03 + (1 - depth) * 0.12;               // left -> right
        const vy = (Math.random() - 0.5) * 0.04;            // slight vertical drift
        const blur = 6 + depth * 10;                        // heavier blur
        arr.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx,
          vy,
          size,
          baseAlpha: 0.35 + Math.random() * 0.4,            // subtle
          twinkleSpeed: 0.15 + Math.random() * 0.35,
          twinklePhase: Math.random() * Math.PI * 2,
          blur,
        });
      }
      particlesRef.current = arr;
    };

    const drawBokeh = (p: Particle, alpha: number) => {
      // bright core, soft halo with slight blue tint
      const rOuter = p.size * 2.4;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rOuter);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.7})`);
      grad.addColorStop(1, `rgba(170,190,255,0)`);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = p.blur;
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rOuter, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawTrail = (p: Particle, alpha: number) => {
      // faint motion blur to the left
      const steps = 3;
      for (let k = 1; k <= steps; k++) {
        const f = (steps - k + 1) / (steps + 1);
        const x = p.x - p.vx * 12 * k;
        const y = p.y - p.vy * 12 * k;
        const r = p.size * (0.8 * f);
        const a = alpha * 0.35 * f;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(1, `rgba(170,190,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x > window.innerWidth + 10) {
          p.x = -10;
          p.y = Math.random() * window.innerHeight;
        }
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;

        const twinkle = 0.5 + 0.5 * Math.sin(p.twinklePhase + t * 0.001 * p.twinkleSpeed);
        const alpha = p.baseAlpha * (0.7 + 0.3 * twinkle);

        drawTrail(p, alpha);
        drawBokeh(p, alpha);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    setup();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-35"
      style={{ zIndex: 1 }}
    />
  );
};
