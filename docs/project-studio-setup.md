# Project Studio deployment

The public portfolio remains statically exportable for GitHub Pages, while the
Cloudflare Worker build adds D1 projects, R2 media, Workers AI, Browser Run,
and the private `/admin/` editor.

## 1. Create and deploy the Cloudflare resources

Wrangler can provision the named D1 database and R2 bucket from `wrangler.jsonc`.
Authenticate and deploy once to provision them, then apply the migrations:

```bash
npx wrangler login
npm run deploy:cloudflare
npm run db:migrate:remote
```

The production route is declared in `wrangler.jsonc`. Before relying on it,
make sure the apex `jakedoesdev.com` DNS records are **Proxied** in Cloudflare;
DNS-only records bypass Workers routes and continue directly to the origin.
Until that proxy switch, the GitHub Pages site continues to use its checked-in
catalog fallback.

The migrations create the content schema and import all 17 existing projects.
The D1 copy becomes the live source of truth; the checked-in TypeScript catalog
remains a read-only fallback for the GitHub Pages build and transient API errors.

## 2. Protect the editor with Cloudflare Access

In Cloudflare Zero Trust, create one **Self-hosted and private** Access
application named `Portfolio Project Studio`. Add two public hostnames to that
same application (using the portfolio hostname):

- `jakedoesdev.com` with path `/admin*`
- `jakedoesdev.com` with path `/api/admin/*`

Keeping both paths in one application gives them the same audience tag, which
the Worker validates for every admin request. Create an **Allow** policy using
the exact editor email address(es). If you do not use Google, GitHub, or another
identity provider, enable Cloudflare's one-time PIN login method first.

Copy these values:

- **Team domain** from Zero Trust > Settings, for example
  `your-team.cloudflareaccess.com`.
- **Application audience (AUD) tag** from the Access application's overview.
- The comma-separated editor email list, for example `you@example.com`.

### First deploy: supply the required secrets with the release

The Worker does not exist before its first release, so `wrangler secret put`
cannot be used yet. Create a local file named `.deploy-secrets` (it is ignored
by Git) with these three lines:

```dotenv
CF_ACCESS_TEAM_DOMAIN=your-team.cloudflareaccess.com
CF_ACCESS_AUD=your-access-application-audience-tag
ADMIN_EMAILS=you@example.com
```

Deploy once with that file, then remove the local file after Wrangler succeeds:

```bash
npx wrangler deploy --keep-vars --secrets-file .deploy-secrets
```

For later secret rotations, use the interactive commands so values never enter
shell history:

```bash
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
npx wrangler secret put CF_ACCESS_AUD
npx wrangler secret put ADMIN_EMAILS
```

`ADMIN_EMAILS` accepts a comma-separated list. The Worker validates the Access
JWT signature, issuer, audience, expiry, token type, and email allowlist on every
admin API request. Write requests also require a same-origin request and a custom
admin header.

## 3. Verify the production hostname

The Worker route `jakedoesdev.com/*` is managed from `wrangler.jsonc`. In
**DNS > Records**, keep every apex `A`/`AAAA` record set to **Proxied** so the
route can run before the GitHub Pages origin. The same static portfolio assets
are deployed with the Worker, while D1-backed projects and the secured editor
become live. GitHub remains the origin fallback if the Worker route is removed.

## 4. Local development

Copy `.dev.vars.example` to `.dev.vars` and fill in real Access values only if
you plan to send a real Access JWT through local development. The public D1 API
can run without those values:

```bash
npm run db:migrate:local
npm run dev
```

Workers AI and Browser Run use Cloudflare-hosted services and may incur usage
while developing. Test Browser Run Quick Actions with `npx wrangler dev
--remote`; without remote mode, URL enrichment still attempts the static page
read but cannot capture the browser-rendered screenshot locally. The editor
continues to work without calling either AI action.

## Editor behavior

- Save is optimistic: an older browser tab receives a conflict instead of
  overwriting newer work.
- Every successful update stores the previous version for restoration.
- Browser drafts autosave locally between server saves.
- Archiving is reversible in D1 and never deletes R2 objects.
- Uploaded media is capped at 25 MB per file. Videos are served with byte-range
  support, shown before images, muted for autoplay, and preloaded near viewport.
- Rich text is reduced to an allowlist before publication. External links must
  use HTTPS.
- AI output is always returned as a draft; it is never published automatically.
- “Inspect & enrich draft” follows a supplied public HTTPS link, extracts
  bounded page metadata and media candidates, asks AI to merge only supported
  facts into the current draft, and saves an optional Browser Run screenshot to
  R2. Redirects are revalidated and local, private, credentialed, IP-literal,
  and custom-port targets are rejected.
- Imported copy and media remain fully editable. Nothing is saved or published
  until the normal Save action is used, and duplicate media URLs are skipped.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run typecheck:worker
npm run build:pages
npm run build
npx wrangler deploy --dry-run
```
