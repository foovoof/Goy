// Recursive OSINT engine — BFS across providers, persists nodes/edges/findings.
import PQueue from "p-queue";
import { detect, extractIndicators } from "./normalize.js";
import { providersFor } from "./providers/index.js";
import { query, withTransaction } from "./db.js";

const MAX_DEPTH_HARD = 5;
const MAX_NODES_HARD = 500;

async function upsertNode(client, jobId, type, value, depth, metadata = {}) {
  const res = await client.query(
    `INSERT INTO nodes (job_id, type, value, depth, metadata)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (job_id, type, value)
     DO UPDATE SET depth = LEAST(nodes.depth, EXCLUDED.depth)
     RETURNING id, (xmax = 0) AS inserted, depth`,
    [jobId, type, value, depth, metadata],
  );
  return res.rows[0];
}

async function upsertEdge(client, jobId, sourceId, targetId, relation, provider, metadata = {}) {
  await client.query(
    `INSERT INTO edges (job_id, source_id, target_id, relation, provider, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [jobId, sourceId, targetId, relation, provider, metadata],
  );
}

async function insertFinding(client, jobId, nodeId, provider, kind, payload) {
  await client.query(
    `INSERT INTO findings (job_id, node_id, provider, kind, payload)
     VALUES ($1, $2, $3, $4, $5)`,
    [jobId, nodeId, provider, kind, payload],
  );
}

async function updateJob(jobId, patch) {
  const fields = [];
  const vals = [jobId];
  let i = 2;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = $${i++}`);
    vals.push(v);
  }
  fields.push(`updated_at = NOW()`);
  await query(`UPDATE jobs SET ${fields.join(", ")} WHERE id = $1`, vals);
}

export async function runJob(jobId) {
  const jobRes = await query(`SELECT id, query, query_type, depth FROM jobs WHERE id = $1`, [jobId]);
  const job = jobRes.rows[0];
  if (!job) throw new Error(`job ${jobId} not found`);

  const maxDepth = Math.min(job.depth ?? 3, MAX_DEPTH_HARD, Number(process.env.MAX_DEPTH || 3));
  const maxNodes = Math.min(MAX_NODES_HARD, Number(process.env.MAX_NODES || 200));

  await updateJob(jobId, { status: "running" });

  const queue = new PQueue({ concurrency: 5 });
  const seen = new Set();
  let nodeCount = 0;
  const progress = { visited: 0, providers_run: 0, edges: 0, current: null };

  async function seed() {
    const first = { type: job.query_type, value: job.query };
    if (first.type === "text") {
      const found = extractIndicators(job.query);
      if (!found.length) throw new Error("no indicators found in text query");
      for (const ind of found) await enqueue(ind, 0, null);
    } else {
      await enqueue(first, 0, null);
    }
  }

  async function enqueue(indicator, depth, parentNodeId) {
    const key = `${indicator.type}:${indicator.value}`;
    if (seen.has(key)) {
      if (parentNodeId != null) {
        // Still record the edge to previously-seen node.
        await withTransaction(async (client) => {
          const existing = await client.query(
            `SELECT id FROM nodes WHERE job_id = $1 AND type = $2 AND value = $3`,
            [jobId, indicator.type, indicator.value],
          );
          if (existing.rows[0]) {
            await upsertEdge(client, jobId, parentNodeId, existing.rows[0].id, "seen_again", "engine", {});
          }
        });
      }
      return;
    }
    seen.add(key);
    if (nodeCount >= maxNodes) return;
    nodeCount++;

    let nodeId;
    await withTransaction(async (client) => {
      const upserted = await upsertNode(client, jobId, indicator.type, indicator.value, depth);
      nodeId = upserted.id;
      if (parentNodeId != null) {
        await upsertEdge(client, jobId, parentNodeId, nodeId, "derived_from", "engine", {});
      }
    });

    if (depth >= maxDepth) return;

    const providers = providersFor(indicator.type);
    for (const provider of providers) {
      queue.add(() => runProvider(provider, indicator, nodeId, depth));
    }
  }

  async function runProvider(provider, indicator, nodeId, depth) {
    progress.current = `${provider.name}(${indicator.type}:${indicator.value})`;
    progress.providers_run++;
    await updateJob(jobId, { progress });
    let result;
    try {
      result = await provider.run(indicator);
    } catch (err) {
      console.error(`[engine] provider ${provider.name} failed on ${indicator.value}:`, err.message);
      return;
    }
    if (!result) return;

    await withTransaction(async (client) => {
      if (result.finding) {
        await insertFinding(client, jobId, nodeId, provider.name, result.finding.kind, result.finding.payload || {});
      }
    });

    const newIndicators = [];
    if (Array.isArray(result.edges)) {
      for (const edge of result.edges) {
        const norm = detect(edge.target.value);
        if (norm.type === "text") continue;
        const target = { type: edge.target.type || norm.type, value: norm.value };
        newIndicators.push({ target, relation: edge.relation, provider: provider.name });
      }
    }

    // Also extract indicators from the finding payload for maximum pivot coverage.
    if (result.finding?.payload) {
      const extra = extractIndicators(result.finding.payload);
      for (const ind of extra) {
        if (ind.type === indicator.type && ind.value === indicator.value) continue;
        newIndicators.push({ target: ind, relation: "mentioned_in", provider: provider.name });
      }
    }

    for (const { target, relation, provider: prov } of newIndicators) {
      const targetKey = `${target.type}:${target.value}`;
      let targetId;
      await withTransaction(async (client) => {
        const upserted = await upsertNode(client, jobId, target.type, target.value, depth + 1);
        targetId = upserted.id;
        await upsertEdge(client, jobId, nodeId, targetId, relation, prov, {});
        progress.edges++;
      });
      if (!seen.has(targetKey)) {
        await enqueue(target, depth + 1, null);
      }
    }
    progress.visited = seen.size;
  }

  try {
    await seed();
    await queue.onIdle();
    await updateJob(jobId, { status: "completed", progress });
  } catch (err) {
    console.error(`[engine] job ${jobId} failed:`, err);
    await updateJob(jobId, { status: "failed", error: err.message || String(err), progress });
  }
}
