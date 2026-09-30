# Updates publishing pipeline

The updates page is a GitHub Pages static export. It reads only reviewed Markdown files in `content/updates/` whose frontmatter includes `published: true`.

## Flow

1. The local `npm run worklog:sync` command copies only non-private, summarized work-log entries into a private D1 review draft. It never creates a public file or publishes a draft.
2. An authenticated editor reviews the draft in `/admin/updates/` and uses **Approve & publish**.
3. The hourly **Sync approved updates to GitHub Pages** GitHub Actions workflow requests the published-only API response, writes only its own `source: "admin-review"` files under `content/updates/`, commits them, and triggers the existing Pages deployment.
4. The next GitHub Pages build renders the approved post at `/updates/` without a browser API request.

The sync never touches hand-written posts. It removes only its own `source: "admin-review"` files that no longer appear in the published API response, so an explicit unpublish is reflected in the next static build.

## Required deployment configuration

The review API must be deployed before either sync can work. Deploy the Worker and run the `updates` migration using the existing Project Studio steps in [`project-studio-setup.md`](project-studio-setup.md). Then set the GitHub repository Actions variable `UPDATES_API_URL` to the public Worker URL ending in `/api/updates`. Use a dedicated Worker hostname if `jakedoesdev.com` points directly at GitHub Pages.

Run the new workflow manually once after that configuration. Scheduled runs occur at minute 17 of each hour. A successful run with no newly approved updates makes no commit.

## Local draft schedule

The private work log is intentionally ignored by Git and cannot be read by GitHub Actions. Schedule this local command with the computer's task scheduler, using the Node binary and repository path on that computer:

```sh
/absolute/path/to/node /absolute/path/to/jakedoesdev/scripts/sync-worklog-review.mjs
```

It needs the existing private Cloudflare API token configuration described in `scripts/sync-worklog-review.mjs`. The command is idempotent: it adds only new source summaries to an unpublished weekly draft and leaves approved updates untouched.
