CREATE TABLE IF NOT EXISTS ptdahl.intake_requests (
 id uuid PRIMARY KEY, owner_user_id text NOT NULL REFERENCES ptdahl.workspaces(owner_user_id) ON DELETE CASCADE,
 name text NOT NULL, email text NOT NULL, token_hash text NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 status text NOT NULL DEFAULT 'invited' CHECK(status IN ('invited','submitted')),
 answers jsonb NOT NULL DEFAULT '{}'::jsonb, revision integer NOT NULL DEFAULT 0,
 submitted_at timestamptz, program_id text, draft_error text
);
