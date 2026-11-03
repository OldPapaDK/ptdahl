CREATE TABLE IF NOT EXISTS ptdahl.program_access (
 id uuid PRIMARY KEY,
 owner_user_id text NOT NULL REFERENCES ptdahl.workspaces(owner_user_id) ON DELETE CASCADE,
 program_id text NOT NULL,
 email text NOT NULL,
 snapshot jsonb NOT NULL,
 token_hash text NOT NULL,
 expires_at timestamptz NOT NULL,
 accepted_user_id text,
 accepted_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_user_id,program_id,email)
);
CREATE TABLE IF NOT EXISTS ptdahl.client_progress (
 access_id uuid PRIMARY KEY REFERENCES ptdahl.program_access(id) ON DELETE CASCADE,
 data jsonb NOT NULL DEFAULT '{}'::jsonb,
 revision integer NOT NULL DEFAULT 0
);
