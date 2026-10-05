# Updates publishing pipeline

The updates page has a GitHub Pages static export and a Cloudflare Worker version. Both display only reviewed Markdown files in `content/updates/` whose frontmatter includes `published: true`. The hourly sync also writes a public `index.json` from those files, which the Worker version reads in the browser. Its built-in static posts remain a fallback if GitHub is unavailable.

## Flow

1. The local `npm run worklog:sync` command copies only non-private, summarized work-log entries into a private D1 review draft. It never creates a public file or publishes a draft.
2. An authenticated editor reviews the draft in `/admin/updates/` and uses **Approve & publish**.
3. The hourly **Sync approved updates to GitHub Pages** GitHub Actions workflow requests the published-only API response, writes only its own `source: "admin-review"` files under `content/updates/`, commits them, and calls the Pages deployment workflow for that commit. GitHub does not start a new workflow from a commit made with `GITHUB_TOKEN`.
4. The Worker site reads the committed public index from GitHub after the sync. The GitHub Pages build also renders the approved Markdown at `/updates/` as static content.

The sync never touches hand-written posts. It includes published hand-written posts in the public index, and removes only its own `source: "admin-review"` files that no longer appear in the published API response. An explicit unpublish is reflected after the next sync and public index refresh.

## Required deployment configuration

The review API must be deployed before either sync can work. Deploy the Worker and run the `updates` migration using the existing Project Studio steps in [`project-studio-setup.md`](project-studio-setup.md). Then set the GitHub repository Actions variable `UPDATES_API_URL` to the public Worker URL ending in `/api/updates`. Use a dedicated Worker hostname if `jakedoesdev.com` points directly at GitHub Pages.

Run the sync workflow manually once after that configuration. Scheduled runs occur at minute 17 of each hour. A successful run with no newly approved updates makes no commit or deployment.

## Review and approve

Sign in through Cloudflare Access at `/admin/`, then choose **Update review** in the top bar. The review queue is private. Select a draft, remove or rewrite anything that should not be public, and click **Approve & publish**. For a new update, save it as a draft first. Review and approve each post separately; the work log's `publish: no` value never grants approval by itself.

The hourly sync commits the approved public copy and deploys GitHub Pages. The Worker site reads the committed index, which GitHub may cache for a few minutes. **Unpublish** reverses this flow after the next sync.

## Local draft schedule

The private work log is intentionally ignored by Git and cannot be read by GitHub Actions. Schedule this local command with the computer's task scheduler, using the Node binary and repository path on that computer:

```sh
/absolute/path/to/node /absolute/path/to/jakedoesdev/scripts/sync-worklog-review.mjs
```

It needs the verified `jakedoesdev-personal` Wrangler OAuth profile described in [`project-studio-setup.md`](project-studio-setup.md). The command is idempotent: it adds only new source summaries to an unpublished weekly draft and leaves approved updates untouched.
