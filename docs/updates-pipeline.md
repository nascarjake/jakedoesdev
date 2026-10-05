# Updates publishing pipeline

The updates page has a GitHub Pages static export and a Cloudflare Worker version. Both display only reviewed Markdown files in `content/updates/` whose frontmatter includes `published: true`. The hourly sync also writes a public `index.json` from those files, which the Worker version reads in the browser. Its built-in static posts remain a fallback if GitHub is unavailable.

## Flow

1. The local `npm run worklog:sync` command copies non-private summarized work-log entries into private D1 drafts. Each entry retains its project. New projects start excluded from publishing. The command never creates a public file or approves a draft.
2. An authenticated editor uses `/admin/updates/` to review entries by project, edit the project exclusion list, inspect the public page preview, and use **Approve & publish**.
3. The **Sync approved updates to GitHub Pages** workflow checks every 15 minutes. It runs when the Studio's selected cadence is due or a manual sync was requested. It requests the published-only API response, writes only its own `source: "admin-review"` files under `content/updates/`, commits them, and calls the Pages deployment workflow for that commit. GitHub does not start a new workflow from a commit made with `GITHUB_TOKEN`.
4. The Worker site reads the committed public index from GitHub after the sync. The GitHub Pages build also renders the approved Markdown at `/updates/` as static content.

The sync never touches hand-written posts. It includes published hand-written posts in the public index, and removes only its own `source: "admin-review"` files that no longer appear in the published API response. An explicit unpublish is reflected after the next sync and public index refresh.

## Required deployment configuration

The review API must be deployed before either sync can work. Deploy the Worker and run the `updates` migration using the existing Project Studio steps in [`project-studio-setup.md`](project-studio-setup.md). Then set the GitHub repository Actions variable `UPDATES_API_URL` to the public Worker URL ending in `/api/updates`. Use a dedicated Worker hostname if `jakedoesdev.com` points directly at GitHub Pages.

The GitHub Actions secret and Cloudflare Worker secret `UPDATES_SYNC_TOKEN` must contain the same random value so completed runs can update the control panel. The token must never appear in source or logs. A successful run with no newly approved updates makes no commit or deployment.

## Review and approve

Sign in through Cloudflare Access at `/admin/`, then choose **Update review** in the top bar. Review the **Projects & exclusions** list first. Excluded project entries stay private even if a weekly post is approved. Select a draft, assign every entry to a project, edit or remove anything that should not be public, inspect the **Page preview**, and click **Approve & publish**. For a new update, save it as a draft first. Review and approve each post separately; the work log's `publish: no` value never grants approval by itself.

The **Publish sync** panel shows the next scheduled check and latest completed run. It offers 15-minute, hourly, 6-hour, and daily cadences. **Request sync now** queues work for the next check (usually within 15 minutes); the GitHub link opens immediate manual dispatch. The Worker site reads the committed index, which GitHub may cache for a few minutes. **Unpublish** or changing a project exclusion is reflected after the next sync.

## Local draft schedule

The private work log is intentionally ignored by Git and cannot be read by GitHub Actions. Schedule this local command with the computer's task scheduler, using the Node binary and repository path on that computer:

```sh
/absolute/path/to/node /absolute/path/to/jakedoesdev/scripts/sync-worklog-review.mjs
```

Run `npm run worklog:sync -- --all` once to add older weeks to the private review queue. The normal daily command checks only the current week and exits cleanly when its ledger does not exist yet. Both commands need the verified `jakedoesdev-personal` Wrangler OAuth profile described in [`project-studio-setup.md`](project-studio-setup.md). They are idempotent: they add only new source summaries to unpublished weekly drafts and leave approved updates untouched.
