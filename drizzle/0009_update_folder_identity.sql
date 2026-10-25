-- Additive only: original project rows, exclusions, entries and source keys
-- remain intact. Export D1 to an ignored local backup before applying.
CREATE TABLE update_folders (
  id text PRIMARY KEY NOT NULL CHECK (id GLOB 'folder-*' AND length(id) = 71),
  name text NOT NULL,
  excluded integer DEFAULT 1 NOT NULL CHECK (excluded IN (0,1)),
  policy_locked integer DEFAULT 1 NOT NULL CHECK (policy_locked IN (0,1)),
  version integer DEFAULT 1 NOT NULL,
  updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK (policy_locked = 0 OR excluded = 1)
);
--> statement-breakpoint
CREATE TABLE update_project_folder_aliases (
  alias_id text PRIMARY KEY NOT NULL REFERENCES update_projects(id),
  folder_id text NOT NULL REFERENCES update_folders(id)
);
--> statement-breakpoint
CREATE INDEX update_project_folder_idx ON update_project_folder_aliases(folder_id);
