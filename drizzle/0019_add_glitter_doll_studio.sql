-- Publish the supplied Spawn game without changing existing catalogue records.
INSERT INTO games (
  id, sort_order, title, genre, tagline, description, cover_url, cover_alt,
  play_url, availability, published, featured, version
)
VALUES (
  'glitter-doll-studio',
  (SELECT COALESCE(MIN(sort_order), 0) - 1 FROM games),
  'Glitter Doll Studio',
  'Dress-up studio',
  'Dress up. Shine bright.',
  'Dress three dolls from a sparkly wardrobe, then send them down the runway and into the photo studio.',
  'https://jakedoesdev.com/arcade/glitter-doll-studio-cover.webp',
  'Glitter Doll Studio cover with three dolls in pink, teal, and lavender sparkly dresses in a boutique studio.',
  'https://www.spawn.co/@theflying314/glitter-doll-studio/play?c=1qa7jtd',
  'playable', 1, 0, 1
)
ON CONFLICT(id) DO NOTHING;
