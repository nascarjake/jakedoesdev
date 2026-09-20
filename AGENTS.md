# Public portfolio and publishing rules

This is a public GitHub Pages site. Treat every tracked file, generated static
asset, commit, and deployed page as public.

- `.worklog/` is local-only source material. Do not stage, commit, render, or
  copy it into a public file unless the user explicitly asks to promote a
  reviewed weekly post.
- Public weekly posts live in `content/updates/`. A post is published only when
  its frontmatter contains `published: true`.
- Use the personal `weekly-worklog` skill after substantive work when it is
  available. Keep entries abstract by default for client, employer, and NDA
  work; never record credentials, private URLs, customer names, unreleased
  features, internal metrics, or proprietary implementation detail.
- Keep the static build compatible with GitHub Pages: no server-only routes,
  request headers, cookies, database dependencies, or runtime secrets in public
  pages.
- Run `npm run build:pages` before declaring public-site changes ready.
