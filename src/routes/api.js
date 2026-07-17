import express from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { detect } from "../normalize.js";
import { query } from "../db.js";
import { runJob } from "../engine.js";
import { enabledProviders } from "../providers/index.js";

export const apiRouter = express.Router();

const searchSchema = z.object({
  query: z.string().min(1).max(2000),
  depth: z.number().int().min(1).max(5).optional(),
});

apiRouter.post("/search", async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { query: q, depth = Number(process.env.MAX_DEPTH || 3) } = parsed.data;
  const detected = detect(q);
  const jobId = crypto.randomUUID();

  await query(
    `INSERT INTO jobs (id, query, query_type, depth, status) VALUES ($1, $2, $3, $4, 'queued')`,
    [jobId, detected.value || q, detected.type, depth],
  );

  // Fire and forget
  runJob(jobId).catch((err) => console.error("[api] runJob failed:", err));

  res.json({ jobId, type: detected.type, value: detected.value, depth });
});

apiRouter.get("/job/:id", async (req, res) => {
  const { rows } = await query(
    `SELECT id, query, query_type, depth, status, progress, error, created_at, updated_at
     FROM jobs WHERE id = $1`,
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: "job not found" });
  res.json(rows[0]);
});

apiRouter.get("/graph/:id", async (req, res) => {
  const { rows: jobRows } = await query(`SELECT id, status FROM jobs WHERE id = $1`, [req.params.id]);
  if (!jobRows[0]) return res.status(404).json({ error: "job not found" });

  const { rows: nodes } = await query(
    `SELECT id, type, value, depth, metadata FROM nodes WHERE job_id = $1 ORDER BY depth, id`,
    [req.params.id],
  );
  const { rows: edges } = await query(
    `SELECT source_id, target_id, relation, provider FROM edges WHERE job_id = $1`,
    [req.params.id],
  );
  const { rows: findings } = await query(
    `SELECT node_id, provider, kind, payload, created_at
     FROM findings WHERE job_id = $1 ORDER BY created_at`,
    [req.params.id],
  );
  res.json({ job: jobRows[0], nodes, edges, findings });
});

apiRouter.get("/jobs", async (_req, res) => {
  const { rows } = await query(
    `SELECT id, query, query_type, status, created_at, updated_at
     FROM jobs ORDER BY created_at DESC LIMIT 50`,
  );
  res.json({ jobs: rows });
});

apiRouter.get("/providers", (_req, res) => {
  res.json({ enabled: enabledProviders() });
});
