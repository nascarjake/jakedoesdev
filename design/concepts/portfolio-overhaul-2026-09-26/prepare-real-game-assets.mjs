// One-time local asset preparation. Input manifest is supplied on stdin; private
// attachment paths are never included in the public build.
import sharp from "sharp";
import fs from "node:fs";
const manifest = JSON.parse(fs.readFileSync(0, "utf8"));
async function main() {
  fs.mkdirSync("public/arcade/screenshots", { recursive: true });
  for (const item of manifest.covers) {
    await sharp(item.path)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 87 })
      .toFile(`public/arcade/${item.id}-cover.webp`);
  }
  for (const item of manifest.screenshots) {
    await sharp(item.path)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(`public/arcade/screenshots/${item.id}.webp`);
  }
  const tiles = await Promise.all(
    manifest.covers.map(async (item) => ({
      input: await sharp(item.path).resize(200, 300).toBuffer(),
    })),
  );
  await sharp({
    create: { width: 1000, height: 600, channels: 3, background: "#071423" },
  })
    .composite(
      tiles.map((tile, i) => ({
        ...tile,
        left: (i % 5) * 200,
        top: Math.floor(i / 5) * 300,
      })),
    )
    .png()
    .toFile("/tmp/arcade-cover-review.png");
  console.log(
    `Prepared ${manifest.covers.length} covers and ${manifest.screenshots.length} screenshots.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
