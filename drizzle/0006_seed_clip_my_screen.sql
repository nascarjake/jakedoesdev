INSERT INTO projects (
  id, sort_order, title, eyebrow, summary, story_html, role, year,
  stack_json, signal, accent, category, mode, status, highlights_json,
  scope, ownership_json, systems_json, note, source_label, source_url,
  published, featured, version
) VALUES (
  'clip-my-screen', 22, 'Clip My Screen', 'Open-source instant replay',
  'A local desktop clip tool with a rolling 15-minute replay buffer, global shortcuts, display selection, a searchable capture library, and share links.',
  '', 'Creator · Product Engineer', '2026',
  '["Electron","Node.js","Swift","FFmpeg"]', 'CMS', 'amber',
  'Creative Tools', 'lab', 'Open-source desktop app',
  '["Built an always-ready replay buffer with 1-, 5-, and 15-minute saves.","Added display selection, screenshots, long recordings, and simple clip editing.","Packages portable Windows and Apple Silicon and Intel Mac releases."]',
  'A self-hosted screen capture and sharing app for saving recent moments without a subscription.',
  '["Designed and implemented the desktop capture and clip library experience.","Built local replay capture, display selection, keyboard shortcuts, and private share links.","Set up cross-platform desktop packaging and public releases."]',
  '["Electron and Node.js local service","ScreenCaptureKit on macOS and FFmpeg capture on Windows","GitHub Actions release builds"]',
  NULL, 'View source and downloads', 'https://github.com/nascarjake/clip-my-screen',
  1, 0, 1
) ON CONFLICT(id) DO NOTHING;
