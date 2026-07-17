import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, shutdown } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, "..", "migrations");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("[migrate] DATABASE_URL not set — skipping migrations.");
    return;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const pool = getPool();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), "utf-8");
    console.log(`[migrate] applying ${f}`);
    await pool.query(sql);
  }
  await shutdown();
  console.log("[migrate] done");
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
