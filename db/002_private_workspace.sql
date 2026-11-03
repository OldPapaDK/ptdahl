BEGIN;
CREATE SCHEMA IF NOT EXISTS ptdahl;
CREATE TABLE IF NOT EXISTS ptdahl.workspaces (
 owner_user_id text PRIMARY KEY,
 revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
 data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
