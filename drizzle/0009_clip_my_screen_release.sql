-- Refresh only the existing Clip My Screen record; preserve newer editor changes.
UPDATE projects SET
  eyebrow = 'Screen replay · Mac + Windows',
  summary = 'Catch a bug, a great play, or a useful explanation after it happens. A free Mac and Windows replay tool with local clips, quick shortcuts, and a searchable library.',
  status = 'Open-source · Early release',
  highlights_json = '["Save the last 1, 5, or 15 minutes with a global shortcut.", "Keep a searchable local library with tags, favorites, trimming, and revocable sharing.", "Download a Mac DMG or Windows installer, with capture paused on first launch."]',
  scope = 'What if saving a screen moment did not require predicting it first, a subscription, or a cloud account?',
  ownership_json = '["Designed the desktop capture experience, local clip library, and explicit pause/resume controls.", "Built native Mac capture and cross-platform replay, export, and sharing workflows.", "Published open-source Mac and Windows builds with setup guides, screenshots, and automated checks."]',
  note = 'Screenshots show the real interface with illustrative demo media, not personal recordings. Early builds are ad-hoc signed on Mac and unsigned on Windows. Active-capture performance and audio sync still need real-device validation.',
  source_label = 'Download for Mac or Windows',
  source_url = 'https://jakedoesdev.com/clip-my-screen/',
  version = version + 1, updated_at = CURRENT_TIMESTAMP
WHERE id = 'clip-my-screen' AND version = 1 AND archived_at IS NULL;

INSERT INTO project_media (id, project_id, kind, url, caption, alt_text, mime_type, sort_order, autoplay, preload)
SELECT 'clip-my-screen-release-library', 'clip-my-screen', 'image', '/projects/clip-my-screen/library.webp', 'Searchable library with illustrative demo captures', 'Searchable library with illustrative demo captures', 'image/webp', 0, 0, 'auto'
WHERE EXISTS (SELECT 1 FROM projects WHERE id = 'clip-my-screen' AND source_url = 'https://jakedoesdev.com/clip-my-screen/')
ON CONFLICT(id) DO UPDATE SET url=excluded.url, caption=excluded.caption, alt_text=excluded.alt_text;

INSERT INTO project_media (id, project_id, kind, url, caption, alt_text, mime_type, sort_order, autoplay, preload)
SELECT 'clip-my-screen-release-dashboard', 'clip-my-screen', 'image', '/projects/clip-my-screen/dashboard.webp', 'Capture dashboard with recording explicitly paused', 'Capture dashboard with recording explicitly paused', 'image/webp', 1, 0, 'metadata'
WHERE EXISTS (SELECT 1 FROM projects WHERE id = 'clip-my-screen' AND source_url = 'https://jakedoesdev.com/clip-my-screen/')
ON CONFLICT(id) DO UPDATE SET url=excluded.url, caption=excluded.caption, alt_text=excluded.alt_text;

INSERT INTO project_media (id, project_id, kind, url, caption, alt_text, mime_type, sort_order, autoplay, preload)
SELECT 'clip-my-screen-release-settings', 'clip-my-screen', 'image', '/projects/clip-my-screen/settings.webp', 'Capture, display, and sharing settings', 'Capture, display, and sharing settings', 'image/webp', 2, 0, 'metadata'
WHERE EXISTS (SELECT 1 FROM projects WHERE id = 'clip-my-screen' AND source_url = 'https://jakedoesdev.com/clip-my-screen/')
ON CONFLICT(id) DO UPDATE SET url=excluded.url, caption=excluded.caption, alt_text=excluded.alt_text;
