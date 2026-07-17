CREATE TABLE IF NOT EXISTS jobs (
  id            TEXT PRIMARY KEY,
  query         TEXT NOT NULL,
  query_type    TEXT NOT NULL,
  depth         INTEGER NOT NULL DEFAULT 3,
  status        TEXT NOT NULL DEFAULT 'queued',
  progress      JSONB NOT NULL DEFAULT '{}'::jsonb,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nodes (
  id            BIGSERIAL PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  value         TEXT NOT NULL,
  depth         INTEGER NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, type, value)
);
CREATE INDEX IF NOT EXISTS nodes_job_idx ON nodes(job_id);

CREATE TABLE IF NOT EXISTS edges (
  id            BIGSERIAL PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  source_id     BIGINT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id     BIGINT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation      TEXT NOT NULL,
  provider      TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, source_id, target_id, relation, provider)
);
CREATE INDEX IF NOT EXISTS edges_job_idx ON edges(job_id);

CREATE TABLE IF NOT EXISTS findings (
  id            BIGSERIAL PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  node_id       BIGINT REFERENCES nodes(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  kind          TEXT NOT NULL,
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS findings_job_idx ON findings(job_id);
