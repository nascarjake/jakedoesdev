"use client";

import { useEffect, useRef } from "react";

export function AmbientField({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animation = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    const particles = Array.from({ length: 82 }, (_, index) => ({
      x: ((index * 47) % 101) / 101,
      y: ((index * 73) % 97) / 97,
      z: 0.18 + ((index * 31) % 80) / 100,
      size: 0.4 + ((index * 13) % 17) / 10,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / width;
      pointerY = event.clientY / height;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const drift = time * 0.000012;
      particles.forEach((particle, index) => {
        const x =
          ((particle.x + drift * particle.z + 1) % 1) * width +
          (pointerX - 0.5) * particle.z * 26;
        const y =
          particle.y * height + (pointerY - 0.5) * particle.z * 18;
        const pulse = 0.55 + Math.sin(time * 0.001 + index) * 0.35;
        ctx.beginPath();
        ctx.fillStyle =
          index % 8 === 0
            ? `rgba(255, 159, 67, ${0.34 * pulse * intensity})`
            : `rgba(216, 255, 62, ${0.28 * pulse * intensity})`;
        ctx.arc(x, y, particle.size * particle.z, 0, Math.PI * 2);
        ctx.fill();
      });
      animation = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="ambient-field" aria-hidden="true" />;
}
