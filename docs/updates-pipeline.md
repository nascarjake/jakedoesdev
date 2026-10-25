# Updates publishing pipeline

The updates page has a GitHub Pages static export and a Cloudflare Worker version. Both display only reviewed Markdown files in `content/updates/` whose frontmatter includes `published: true`. The hourly sync also writes a public `index.json` from those files, which the Worker version reads in the browser. Its built-in static posts remain a fallback if GitHub is unavailable.

## Flow

1. The local `npm run worklog:sync` command copies non-private summarized work-log entries into private D1 drafts. Each entry retains its project. New projects start excluded from publishing. The command never creates a public file or approves a draft.
2. An authenticated editor uses `/admin/updates/` to review entries by project, edit the project exclusion list, inspect the public page preview, and use **Approve & publish**.
3. The **Sync approved updates to GitHub Pages** workflow checks every 15 minutes. It runs when the Studio's selected cadence is due or a manual sync was requested. It requests the published-only API response, writes only its own `source: "admin-review"` files under `content/updates/`, commits them, and calls the Pages deployment workflow for that commit. GitHub does not start a new workflow from a commit made with `GITHUB_TOKEN`.
4. The Worker feed reads the committed public index from GitHub after the sync. Individual Worker post URLs render approved, non-excluded projects from D1. The GitHub Pages build renders the approved Markdown as static content.

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

## Verified folder identity and batch exclusions

Update Studio identities now come from actual workspace provenance. The worklog
helper resolves the real directory and Git common directory: subdirectories,
symlinks and linked worktrees share their underlying repository identity;
independent nested repositories stay separate. Non-Git folders require an
explicit containing workspace root. Labels and repository remotes never decide
identity. From the source workspace, append with `--workspace /actual/project`
when the command's current directory is not the project. Absolute paths remain
in the ignored local ledger only. The remote database receives an opaque ID and
an admin-only basename; public notes use a generic heading.

The canonical worklog directory is beside the helper, regardless of the command's
current directory. New entries preserve the original label and summary and add
folder provenance. Old entries without provenance are not assigned a folder.
`node scripts/sync-worklog-review.mjs --all --plan` creates a private local plan;
it does not write D1 or approve a post. Normal sync uses the named personal
Wrangler profile and the account verifier before CLI writes, inserts folders as
excluded and policy locked, and updates only an unpublished draft whose original
entries and source keys still match. Approved posts and corrupt history are
never rewritten by this sync.

`0009_update_folder_identity.sql` is additive and leaves raw project rows,
exclusion flags, entries, bullets and source keys intact. **Before remote
application**, export a full D1 backup into ignored local storage, retain the
original software revision and current identity/snapshot tables, and review a readable
mapping. Never put the backup, mapping, paths or client metadata in Git.
`node scripts/reconcile-update-folders.mjs <private-snapshot.json>
<verified-local-evidence.json>` backs up its input and writes a private plan only.
The snapshot contains `projects`, `updates`, and optional `folders` and `aliases`;
evidence comes from `parseLedger` and is reverified against the actual filesystem.
Every historical occurrence of an alias must have an exact source-key link and
matching text to the same verified folder. Otherwise the entire alias remains
unresolved. Names and text equality by themselves never authorize a mapping.
Excluded aliases propagate exclusion on first reconciliation. The plan includes
reverse SQL, but applying or reversing identity changes requires a fresh backup
and version checks within a D1 transaction; the planner does not execute SQL.
A metadata-only audit is sufficient to count unresolved records, never to approve
alias mappings or substitute for the full pre-application backup.

All new folders are policy locked and excluded until an explicit local publishing
policy review. Existing client/shared-work exclusions must never be converted to
personal eligibility. No eligibility allowlist has been inferred. Folder
provenance for legacy records and authorization for any new eligible folders are
separate outstanding decisions. Drop the snapshot and alias tables before the folder table
only when reversing the schema together with the old software revision; retained
raw records support recovery. Recheck exclusion effects before exposing the old
public API again.

The Projects & exclusions tab has one Save Changes action, pending-change count,
saving state, and success/error messages. A failed save retains all pending
values. Reload fetches current versions while retaining pending choices for
review. The API validates the complete batch and updates it with a single SQL
statement; stale versions, protected inclusion or unknown folders change no
rows. Old per-row creation/rename/save endpoints cannot bypass folder identity.

Historical published notes are preserved. The additive migration records the
exact reviewed payload of rows already marked published, inside the same private
D1 database. An unchanged row keeps its existing public labels and original
project exclusions even when its folder is unresolved. This exception cannot
approve a new draft, new entry, or edited payload. Future publication requires
verified provenance and eligible folders. Existing tracked Markdown, public
index, and the reviewed publishing sync remain intact. A software rollout never
approves new ledger content or changes historical visibility. An alias mapping
that would hide a historical note or broaden eligibility must remain unapplied
until its exact effect has been reviewed and approved.

Release from a clean commit only after the personal account/zone guard passes,
the backup and migration review are complete, and the schema is available.
Worker responses include `x-jakedoesdev-revision` from the build commit (with a
`-dirty` suffix for local builds). Compare that header on
`https://jakedoesdev.com/admin/updates/` and `/api/updates` with `git rev-parse HEAD`,
then verify authenticated batch saves and anonymous filtering. A successful
Pages workflow alone does not deploy this Worker or verify Update Studio.
