CREATE TABLE update_projects (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  excluded integer DEFAULT 1 NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE updates ADD COLUMN entries_json text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
CREATE TABLE update_sync_control (
  id integer PRIMARY KEY CHECK (id = 1),
  interval_minutes integer DEFAULT 60 NOT NULL,
  last_synced_at integer DEFAULT 0 NOT NULL,
  manual_requested_at integer DEFAULT 0 NOT NULL,
  last_run_url text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO update_sync_control (id) VALUES (1);
