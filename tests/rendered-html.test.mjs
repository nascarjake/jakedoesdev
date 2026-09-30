import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { projectMedia, ezformsClients } from "../app/data/project-media.ts";
import { projects } from "../app/data/portfolio.ts";
import { SLICE_COUNT, CONTOUR_POINTS, sliceHeights, contourPoint, specimenRadius, reconstructionData } from "../app/lib/biopsy-model.ts";

test("project media exports all eleven supplied images and five client logos", () => {
  let count = 0;
  for (const media of Object.values(projectMedia)) {
    for (const shot of media.shots) { assert.ok(existsSync(new URL(`../out${shot.src}`, import.meta.url)), shot.src); count++; }
    if (media.video) assert.match(media.video, /^[a-zA-Z0-9_-]{11}$/);
    if (media.website) assert.match(media.website, /^https:\/\//);
  }
  assert.equal(count, 11);
  assert.equal(ezformsClients.length, 5);
  for (const client of ezformsClients) assert.ok(existsSync(new URL(`../out/projects/clients/${client.image}`, import.meta.url)));
  assert.equal(projectMedia.callsmart.shots.length, 0);
  assert.match(projectMedia.callsmart.note, /ProfitRhino/);
  assert.match(projectMedia['dm-auto-leasing'].note, /no longer on Google Play/);
});

test("synthetic reconstruction uses exactly seven matching closed contours inside the specimen", () => {
  assert.equal(SLICE_COUNT, 7);
  assert.equal(sliceHeights.length, 7);
  assert.equal(sliceHeights[3], 0);
  const { positions, indices } = reconstructionData();
  assert.equal(positions.length / 3, SLICE_COUNT * CONTOUR_POINTS + 2);
  assert.ok(positions.every(Number.isFinite));
  const edges = new Map();
  for (let i = 0; i < indices.length; i += 3) {
    for (let e = 0; e < 3; e++) {
      const a = indices[i + e], b = indices[i + (e + 1) % 3];
      assert.ok(a >= 0 && a < positions.length / 3);
      const key = [a, b].sort((x, y) => x - y).join('-');
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  assert.ok([...edges.values()].every(count => count === 2), 'closed watertight surface');
  for (let s = 0; s < SLICE_COUNT; s++) for (let p = 0; p < CONTOUR_POINTS; p++) {
    const v = contourPoint(s, p), offset = (s * CONTOUR_POINTS + p) * 3;
    assert.deepEqual(positions.slice(offset, offset + 3), [v.x, v.y, v.z]);
    const angle = Math.atan2(v.z / 0.76, v.x);
    assert.ok(Math.hypot(v.x, v.z / 0.76) < specimenRadius(v.y, angle), 'region remains inside specimen');
  }
});

function render(path = "index.html") {
  return readFileSync(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("the exported homepage opens the Goose Games arcade", () => {
  const html = render();
  assert.match(html, /ARCADE MODE/);
  assert.match(html, /Goose Games Arcade/);
  assert.match(html, /aria-pressed="true" aria-label="Select Goose Games"/);
  assert.match(html, /https:\/\/goosegames.dev/);
  assert.match(html, /discord.gg\/6BJTUpDSsE/);
  assert.doesNotMatch(html, /DRAG TO ORBIT|SEE COOL STUFF/);
  assert.match(html, /10 SEC DEMO/);
  assert.match(html.replace(/<!--.*?-->/g, ""), /11 REAL GAMES/);
  assert.doesNotMatch(html, /Orbital Drift|Signal Runner|Concept cartridges/);
});

test("the arcade exports every real game and its generated cover", () => {
  const html = render("arcade/index.html");
  for (const [id, title] of [
    ["orbital-smash", "Orbital Smash"],
    ["revo", "REVO"],
    ["downbeat", "Downbeat"],
    ["dye-day", "Dye Day!"],
    ["daho", "DAHO"],
    ["rack-ruin", "Rack &amp; Ruin"],
    ["pinfall", "Pinfall"],
    ["netrunner", "Netrunner"],
    ["rift-riot", "Rift Riot"],
    ["millionaire", "Millionaire"],
    ["fortune-quest", "Fortune Quest"],
  ]) {
    assert.ok(html.includes(title), title);
    assert.ok(
      existsSync(new URL(`../out/arcade/${id}-cover.webp`, import.meta.url)),
      id,
    );
  }
  for (const [id, count] of [
    ["pinfall", 1],
    ["rack-ruin", 3],
    ["revo", 1],
    ["downbeat", 2],
    ["netrunner", 2],
    ["rift-riot", 4],
    ["millionaire", 1],
  ]) {
    for (let i = 1; i <= count; i++)
      assert.ok(
        existsSync(
          new URL(`../out/arcade/screenshots/${id}-${i}.webp`, import.meta.url),
        ),
      );
  }
  assert.match(html, /https:\/\/orbitalsmash.com/);
  assert.match(html, /https:\/\/nascarjake.github.io\/measure-web\/downbeat\//);
  assert.match(html, /https:\/\/nascarjake.github.io\/trivia\//);
  assert.match(html, /https:\/\/tyedye.jakedoesdev.com/);
  assert.doesNotMatch(html, /<iframe|<video/);
});

test("Dye Day follows Downbeat in the cartridge and library order", async () => {
  const { arcadeGames, arcadeCartridges } = await import('../app/data/arcade.ts');
  for (const games of [arcadeGames, arcadeCartridges]) {
    const downbeat = games.findIndex(game => game.id === 'downbeat');
    assert.equal(games[downbeat + 1].id, 'dye-day');
    assert.equal(games[downbeat + 1].embedUrl, 'https://tyedye.jakedoesdev.com');
  }
  assert.equal(arcadeGames.length, 11);
});

test("contact is available inside the site without an email application", () => {
  const html = render();
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /<dialog/);
  assert.match(html, /Jacob’s email address/);
  assert.match(html, /Copy email/);
  assert.match(html, /Close contact panel/);
});

test("the full project archive is available without client JavaScript", () => {
  const html = render("universe/index.html");
  assert.match(html, /THE COMPLETE COLLECTION/);
  assert.match(html, /Search the complete project archive/);
  for (const project of [
    "Ignite Dialogue",
    "Eternus Engine Tools",
    "DAHO",
    "FoodTronix Mobile POS",
  ]) {
    assert.ok(html.includes(project), `${project} is rendered`);
  }
  assert.match(html, /\/universe\/#traxo/);
});

test("every project has a fuller public build record", () => {
  assert.equal(projects.length, 20);
  for (const project of projects) {
    assert.ok(project.dossier.scope.length > 45, `${project.title} has scope`);
    assert.equal(project.dossier.ownership.length, 3, `${project.title} has ownership`);
    assert.equal(project.dossier.systems.length, 3, `${project.title} has systems`);
  }
  assert.match(projects.find(project => project.id === "tumor-identifier").dossier.note, /synthetic geometry/);
  assert.match(projects.find(project => project.id === "tradelab").dossier.note, /not financial advice/);
});

test("every public route exports the shared accessible workbench", () => {
  for (const route of [
    "index.html",
    "arcade/index.html",
    "universe/index.html",
    "resume/index.html",
    "updates/index.html",
    "404.html",
  ]) {
    const html = render(route);
    assert.match(html, /Skip to content/, route);
    assert.match(html, /id="main-content"/, route);
    assert.match(html, /aria-label="Main navigation"/, route);
    assert.match(html, /og-workbench.png/, route);
    assert.doesNotMatch(html, /\.worklog\//, route);
  }
});

test("the Pages artifact carries the production custom domain", () => {
  assert.equal(
    readFileSync(new URL("../out/CNAME", import.meta.url), "utf8").trim(),
    "jakedoesdev.com",
  );
});

test("résumé content and source export remain available", () => {
  const html = render("resume/index.html");
  assert.match(html, /Builder by trade/);
  assert.match(html, /Print \/ save PDF/);
  assert.match(html, /Nerd Kingdom/);
  assert.match(html, /Game &amp; Simulation Programming/);
  assert.match(html, /Source résumé/);
});

test("notes publish only the reviewed public content source", () => {
  const source = readFileSync(
    new URL("../app/lib/updates.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /frontmatter.published !== "true"/);
  assert.match(source, /"content", "updates"/);
  assert.doesNotMatch(source, /\.worklog/);
});

test("the static updates page has no runtime publishing dependency", () => {
  const source = readFileSync(
    new URL("../app/components/UpdatesFeed.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /fetch\(|\/api\/updates/);
  assert.doesNotMatch(source, /"use client"/);
});
