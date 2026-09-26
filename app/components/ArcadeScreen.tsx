"use client";

import { useEffect, useRef } from "react";

const goose = [
  ".............kkkk.........",
  "............kwwwwk........",
  "...........kwwwwwkk.......",
  "...........kwwkwwwkoo.....",
  "...........kwwwwwkooo.....",
  "...........kwwwwkook......",
  "...........kwwwkk.........",
  "...........kwwwk..........",
  "...........kwwwk..........",
  "..........kwwwwk..........",
  ".........kwwwwwk..........",
  "..k.....kwwwwwwk..........",
  "..kk...kwwwwwwwk..........",
  "..kwkkkwwwwwwwwk..........",
  "..kwwwwwwwwwwwwk..........",
  "..kwwwwsssswwwwk..........",
  "...kwwsssssswwwk..........",
  "...kwwsssssswwwk..........",
  "....kwwwwwwwwwk...........",
  ".....kwwwwwwwk............",
  "......kkkkkkk.............",
  ".......ok..ok.............",
  ".......ok..ok.............",
  "......ook..ook............",
  ".....ooook.ooook..........",
];

export function ArcadeScreen({
  selected,
  running,
  honks,
}: {
  selected: string;
  running: boolean;
  honks: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    const ctx = context;
    let frame = 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    function cloud(x: number, y: number, scale = 1) {
      ctx.fillStyle = "#fffef0";
      [
        [0, 12, 65, 9],
        [8, 5, 42, 8],
        [22, 0, 15, 7],
        [52, 8, 7, 7],
      ].forEach(([a, b, w, h]) =>
        ctx.fillRect(x + a * scale, y + b * scale, w * scale, h * scale),
      );
    }
    function tree(x: number, y: number, scale = 1, color = "#368146") {
      ctx.fillStyle = color;
      [
        [20, 0, 8, 12],
        [14, 10, 20, 13],
        [8, 21, 32, 15],
        [3, 32, 42, 13],
        [0, 43, 49, 15],
      ].forEach(([a, b, w, h]) =>
        ctx.fillRect(x + a * scale, y + b * scale, w * scale, h * scale),
      );
      ctx.fillStyle = "#7d6643";
      ctx.fillRect(x + 21 * scale, y + 56 * scale, 7 * scale, 17 * scale);
    }
    function draw(now: number) {
      const t = running && !reduced ? (now - start) / 1000 : 0;
      ctx.clearRect(0, 0, 640, 290);
      const sky = ctx.createLinearGradient(0, 0, 0, 290);
      sky.addColorStop(0, selected === "goose" ? "#59b9ee" : "#0c1738");
      sky.addColorStop(1, selected === "goose" ? "#8ddaf1" : "#291e54");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 640, 290);
      if (selected === "goose") {
        cloud(20 - ((t * 4) % 90), 62, 0.75);
        cloud(297 - ((t * 3) % 40), 61, 1.05);
        cloud(527 - ((t * 2) % 45), 70, 0.9);
        tree(-15, 160, 1.6);
        tree(550, 164, 1.45);
        tree(328, 197, 0.9, "#4d9b4c");
        tree(96, 209, 0.65, "#6db049");
        ctx.fillStyle = "#6fa847";
        ctx.fillRect(0, 253, 640, 37);
        ctx.fillStyle = "#8fbb53";
        ctx.fillRect(0, 249, 640, 11);
        ctx.fillStyle = "#4f803d";
        ctx.fillRect(0, 275, 640, 15);
        for (let x = 0; x < 640; x += 11) {
          ctx.fillStyle = x % 3 ? "#a3ca5d" : "#d0d680";
          ctx.fillRect(x, 252 + (x % 7), 5, 4);
          ctx.fillStyle = "#6e5341";
          ctx.fillRect(x, 285 + (x % 4), 7, 5);
        }
        ctx.fillStyle = "#66412c";
        ctx.fillRect(492, 198, 11, 68);
        ctx.fillRect(421, 142, 144, 86);
        ctx.fillStyle = "#a96e40";
        ctx.fillRect(424, 145, 139, 78);
        ctx.fillStyle = "#c08a53";
        ctx.fillRect(430, 151, 125, 65);
        ctx.strokeStyle = "#835432";
        ctx.lineWidth = 3;
        ctx.strokeRect(435, 157, 115, 53);
        ctx.fillStyle = "#271e20";
        ctx.font = "bold 19px monospace";
        ctx.textAlign = "center";
        ctx.fillText("HONK", 492, 179);
        ctx.fillText("BIGGER", 492, 201);
        const px = 7;
        const gx = 148 + Math.sin(t * 1.7) * 29;
        const gy = 82 - (running ? Math.abs(Math.sin(t * 4)) * 12 : 0);
        goose.forEach((row, y) =>
          [...row].forEach((pixel, x) => {
            if (pixel !== ".") {
              ctx.fillStyle = (
                {
                  k: "#172228",
                  w: "#fffef0",
                  s: "#dedfd4",
                  o: "#f49b28",
                } as Record<string, string>
              )[pixel];
              ctx.fillRect(
                Math.round(gx + x * px),
                Math.round(gy + y * px),
                px,
                px,
              );
            }
          }),
        );
        for (let n = 0; n < 3; n++) {
          const x = 20 + n * 32;
          ctx.fillStyle = "#522329";
          ctx.beginPath();
          ctx.moveTo(x, 22);
          ctx.lineTo(x + 5, 16);
          ctx.lineTo(x + 12, 16);
          ctx.lineTo(x + 16, 21);
          ctx.lineTo(x + 21, 16);
          ctx.lineTo(x + 28, 16);
          ctx.lineTo(x + 32, 22);
          ctx.lineTo(x + 30, 30);
          ctx.lineTo(x + 16, 43);
          ctx.lineTo(x + 2, 30);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#f34736";
          ctx.beginPath();
          ctx.moveTo(x + 4, 23);
          ctx.lineTo(x + 8, 20);
          ctx.lineTo(x + 13, 20);
          ctx.lineTo(x + 16, 26);
          ctx.lineTo(x + 21, 20);
          ctx.lineTo(x + 27, 21);
          ctx.lineTo(x + 27, 29);
          ctx.lineTo(x + 16, 38);
          ctx.lineTo(x + 5, 28);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#ffb18c";
          ctx.fillRect(x + 8, 22, 5, 4);
        }
        ctx.fillStyle = "#173b43";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "right";
        ctx.fillText(
          `SCORE ${String(420 + honks * 10 + Math.floor(t) * 5).padStart(5, "0")}`,
          619,
          31,
        );
      } else if (selected === "orbital") {
        for (let i = 0; i < 55; i++) {
          ctx.fillStyle = i % 3 ? "#7ea7dc" : "#ffb6eb";
          ctx.fillRect(
            (i * 113 + t * ((i % 4) + 1) * 8) % 640,
            (i * 71) % 290,
            2,
            2,
          );
        }
        ctx.save();
        ctx.translate(320, 155);
        ctx.rotate(-0.35 + t * 0.12);
        ctx.strokeStyle = "#43bfff";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#476fff";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, 175, 47, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        const planet = ctx.createLinearGradient(-90, -70, 70, 70);
        planet.addColorStop(0, "#ff9870");
        planet.addColorStop(0.25, "#845aaa");
        planet.addColorStop(0.5, "#205486");
        planet.addColorStop(1, "#071f3c");
        ctx.fillStyle = planet;
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#54dfff";
        ctx.beginPath();
        ctx.ellipse(0, 0, 175, 47, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      } else {
        for (let i = 0; i < 15; i++) {
          const x = i * 57 - ((t * 33) % 57) - 40;
          const h = 80 + ((i * 41) % 120);
          ctx.fillStyle = i % 2 ? "#11264c" : "#163763";
          ctx.fillRect(x, 255 - h, 45, h);
          for (let y = 264 - h; y < 246; y += 16) {
            ctx.fillStyle = (i + y) % 3 ? "#28a9c5" : "#e766b4";
            ctx.fillRect(x + 7, y, 6, 8);
            ctx.fillRect(x + 23, y, 6, 8);
          }
        }
        ctx.fillStyle = "#18263b";
        ctx.fillRect(0, 253, 640, 37);
        ctx.fillStyle = "#f265a6";
        ctx.fillRect(0, 253, 640, 3);
        ctx.save();
        ctx.translate(295, 167 + (running ? Math.sin(t * 10) * 4 : 0));
        ctx.fillStyle = "#121828";
        ctx.strokeStyle = "#f27a80";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -23, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#111929";
        ctx.beginPath();
        ctx.moveTo(-3, -8);
        ctx.lineTo(-13, 29);
        ctx.moveTo(-5, 3);
        ctx.lineTo(18, 13);
        ctx.lineTo(35, -6);
        ctx.moveTo(-10, 28);
        ctx.lineTo(-32, 49 + Math.sin(t * 9) * 13);
        ctx.lineTo(-47, 72);
        ctx.moveTo(-8, 29);
        ctx.lineTo(18, 42 - Math.sin(t * 9) * 13);
        ctx.lineTo(38, 35);
        ctx.stroke();
        ctx.restore();
      }
      if (selected !== "goose") {
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#f6ecd6";
        ctx.textAlign = "left";
        ctx.fillText("VISUAL DEMO", 17, 25);
        ctx.textAlign = "right";
        ctx.fillText(running ? "PLAYING" : "PRESS DEMO", 622, 25);
      }
      if (running && !reduced) frame = requestAnimationFrame(draw);
    }
    draw(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [selected, running, honks]);
  return (
    <canvas
      ref={canvas}
      width={640}
      height={290}
      className="arcade-pixel-canvas"
      role="img"
      aria-label={
        selected === "goose"
          ? `Pixel-art goose in a sunny field. Score ${420 + honks * 10}.`
          : `${selected === "orbital" ? "Orbital Drift" : "Signal Runner"} visual animation demo.`
      }
    />
  );
}
