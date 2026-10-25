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

## Cloudflare account boundary

- This project deploys only to the personal Cloudflare account pinned in
  `wrangler.jsonc` (`01f53095bb8f6eec6d75040c4232602a`). The account owns
  `jakedoesdev.com`. Do not use an employer or client Cloudflare login here.
- The project pins Node.js `22.22.3` in `.nvmrc` and Wrangler `4.141.0` in
  `package.json`. Use `npm run cloudflare:version` to check the resolved local
  tools. Cloudflare deploy, remote D1 migration, and worklog sync scripts select
  that installed runtime; do not use `npx` or a global Wrangler for this project.
- Use the named Wrangler OAuth profile `personal` and the project
  scripts `npm run deploy:cloudflare` and `npm run db:migrate:remote`. They verify
  the login and target before a remote change. Bind that profile to this project
  directory so `whoami` cannot use a different default profile. The read-only
  `profile` mode verifies identity with `whoami --json`, D1 access with
  `d1 list --profile personal`, and active zone ownership through a read-only
  Cloudflare API request using the bound profile's supported `auth token --json`
  output. OAuth credentials stay in memory; token-command logs are discarded.
  Ambient API tokens and API keys are rejected. The project launcher selects this mode
  explicitly. A separate `api-token` mode is planned but not implemented. The
  deploy verifier fails closed on an unverified account, database, or zone.
  The worklog REST writer is disabled
  until a separately reviewed mode exists. Do not rely on Wrangler's default
  login for this project.
- If the profile is missing or the identity check fails, stop and have the
  owner sign into the personal account. Never substitute credentials from
  another Cloudflare account.
