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

const palettes = [
  { sky: ["#4bb5e8", "#a2e4ee"], land: "#72a849", accent: "#3d824b", name: "MEADOW RUN" },
  { sky: ["#f58c58", "#ffd276"], land: "#a98548", accent: "#5e8247", name: "GOLDEN HOUR" },
  { sky: ["#25375e", "#7896bb"], land: "#4d7058", accent: "#294c51", name: "MOONLIT MARSH" },
];

type ArcadeScreenProps = {
  selected: string;
  running: boolean;
  restartKey: number;
  onGameOver: (score: number) => void;
};

type Obstacle = { x: number; type: "log" | "crow" | "crate"; passed: boolean };

export function ArcadeScreen({ selected, running, restartKey, onGameOver }: ArcadeScreenProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const gameOver = useRef(onGameOver);
  gameOver.current = onGameOver;

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const drawing = ctx as CanvasRenderingContext2D;
    const state = { y: 0, velocity: 0, duck: false, elapsed: 0, score: 0, grains: 0, spawnAt: 1.1, obstacles: [] as Obstacle[], last: 0, ended: false };
    const ground = 248;
    const px = 5;
    const gooseX = 70;
    const gooseW = 27 * px;
    let frame = 0;

    function jump() {
      if (!running || state.ended || state.y < -1) return;
      state.velocity = -590;
      state.duck = false;
    }
    function keyDown(event: KeyboardEvent) {
      if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") jump();
      if (event.code === "ArrowDown" || event.code === "KeyS") state.duck = true;
    }
    function keyUp(event: KeyboardEvent) {
      if (event.code === "ArrowDown" || event.code === "KeyS") state.duck = false;
    }
    function pointerDown(event: PointerEvent) {
      if (event.button === 0) jump();
    }
    element.addEventListener("keydown", keyDown);
    element.addEventListener("keyup", keyUp);
    element.addEventListener("pointerdown", pointerDown);
    element.focus({ preventScroll: true });

    function draw(now: number) {
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.04) : 0;
      state.last = now;
      if (running && !state.ended) {
        state.elapsed += dt;
        state.score = Math.floor(state.elapsed * 10) + state.grains * 50;
        state.velocity += 1550 * dt;
        state.y = Math.min(0, state.y + state.velocity * dt);
        if (state.y === 0) state.velocity = 0;
        state.spawnAt -= dt;
        if (state.spawnAt <= 0) {
          const roll = Math.random();
          state.obstacles.push({ x: 660, type: roll < 0.38 ? "log" : roll < 0.68 ? "crow" : "crate", passed: false });
          state.spawnAt = Math.max(0.78, 1.42 - state.elapsed / 95) + Math.random() * 0.5;
        }
      }

      const level = Math.min(2, Math.floor(state.elapsed / 22));
      const palette = palettes[level];
      drawing.clearRect(0, 0, 640, 290);
      const sky = drawing.createLinearGradient(0, 0, 0, 290);
      sky.addColorStop(0, palette.sky[0]);
      sky.addColorStop(1, palette.sky[1]);
      drawing.fillStyle = sky;
      drawing.fillRect(0, 0, 640, 290);

      // Clouds and distant trees drift at a slower pace than the course.
      drawing.fillStyle = "#fffce8";
      for (let i = 0; i < 3; i++) {
        const x = ((i * 245 + 640 - (state.elapsed * 12) % 800) % 800) - 70;
        drawing.fillRect(x, 58 + (i % 2) * 23, 54, 8);
        drawing.fillRect(x + 9, 51 + (i % 2) * 23, 33, 8);
      }
      for (let i = 0; i < 9; i++) {
        const x = ((i * 97 - state.elapsed * 35) % 760 + 760) % 760 - 60;
        drawing.fillStyle = i % 2 ? palette.accent : "#4b9051";
        drawing.fillRect(x + 14, 171, 10, 30);
        drawing.fillRect(x + 7, 183, 24, 24);
        drawing.fillRect(x, 194, 38, 18);
      }
      drawing.fillStyle = palette.land;
      drawing.fillRect(0, ground, 640, 42);
      drawing.fillStyle = "#b5d76a";
      drawing.fillRect(0, ground, 640, 8);
      drawing.fillStyle = "#527d45";
      for (let x = -14 - ((state.elapsed * 165) % 22); x < 640; x += 22) drawing.fillRect(x, ground + 22 + (x % 3) * 2, 11, 3);

      if (running && !state.ended) {
        const speed = 260 + Math.min(150, state.elapsed * 2.5);
        for (const obstacle of state.obstacles) obstacle.x -= speed * dt;
      }
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x > -80);
      for (const obstacle of state.obstacles) {
        const isCrow = obstacle.type === "crow";
        const y = isCrow ? 181 + Math.sin(state.elapsed * 5 + obstacle.x) * 4 : ground - (obstacle.type === "crate" ? 42 : 28);
        const w = obstacle.type === "crate" ? 34 : 42;
        const h = isCrow ? 20 : obstacle.type === "crate" ? 42 : 28;
        drawing.fillStyle = isCrow ? "#263247" : obstacle.type === "crate" ? "#8c512d" : "#735039";
        drawing.fillRect(obstacle.x, y, w, h);
        if (!isCrow) {
          drawing.fillStyle = "#bf8750";
          drawing.fillRect(obstacle.x + 5, y + 5, w - 10, 5);
          drawing.fillRect(obstacle.x + 7, y + 15, w - 14, 4);
        } else {
          drawing.fillStyle = "#d7d5ca";
          drawing.fillRect(obstacle.x + 9, y + 5, 4, 4);
          drawing.fillRect(obstacle.x + 30, y + 5, 4, 4);
        }
        const gooseTop = state.duck && state.y === 0 ? ground - 46 : ground - 25 * px + state.y;
        const gooseBottom = ground + state.y;
        const overlaps = obstacle.x < gooseX + gooseW - 15 && obstacle.x + w > gooseX + 10;
        const vertical = gooseBottom > y + 4 && gooseTop < y + h - 2;
        if (running && !state.ended && overlaps && vertical) {
          state.ended = true;
          gameOver.current(state.score);
        }
        if (!obstacle.passed && obstacle.x + w < gooseX) {
          obstacle.passed = true;
          state.grains += 1;
          state.score = Math.floor(state.elapsed * 10) + state.grains * 50;
        }
      }

      const paletteColors: Record<string, string> = { k: "#172228", w: "#fffef0", s: "#dedfd4", o: "#f49b28" };
      drawing.save();
      if (state.duck && state.y === 0) drawing.translate(0, 36);
      goose.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== ".") {
          drawing.fillStyle = paletteColors[pixel];
          drawing.fillRect(gooseX + x * px, ground - 25 * px + state.y + y * px, px, px);
        }
      }));
      drawing.restore();

      drawing.fillStyle = "#153641";
      drawing.font = "bold 17px monospace";
      drawing.textAlign = "left";
      drawing.fillText(palette.name, 16, 26);
      drawing.textAlign = "right";
      drawing.fillText(`SCORE ${String(state.score).padStart(5, "0")}`, 622, 26);
      drawing.textAlign = "left";
      drawing.font = "bold 13px monospace";
      drawing.fillText(`GRAIN ${String(state.grains).padStart(2, "0")}`, 16, 48);
      if (!running || state.ended) {
        drawing.fillStyle = "#062033bd";
        drawing.fillRect(0, 82, 640, 92);
        drawing.fillStyle = "#fff7df";
        drawing.textAlign = "center";
        drawing.font = "bold 25px monospace";
        drawing.fillText(state.ended ? "HONK! RUN OVER" : "READY, GOOSE?", 320, 119);
        drawing.font = "bold 13px monospace";
        drawing.fillText(state.ended ? "PRESS PLAY TO TAKE ANOTHER RUN" : "PRESS PLAY · SPACE / ↑ TO JUMP · ↓ TO DUCK", 320, 148);
      }
      if (running && !state.ended) frame = requestAnimationFrame(draw);
    }

    draw(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("keydown", keyDown);
      element.removeEventListener("keyup", keyUp);
      element.removeEventListener("pointerdown", pointerDown);
    };
  }, [selected, running, restartKey]);

  return <canvas ref={canvas} width={640} height={290} className="arcade-pixel-canvas" tabIndex={0} role="application" aria-label="Goose Run mini-game. Press Space or Up to jump, Down to duck, or tap the screen." />;
}
