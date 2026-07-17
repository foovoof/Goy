import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./src/routes/api.js";
import { shutdown } from "./src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "512kb" }));
app.use(morgan("tiny"));

app.use(
  "/api",
  rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }),
  apiRouter,
);

app.get("/healthz", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.use((err, _req, res, _next) => {
  console.error("[server]", err);
  res.status(err.status || 500).json({ error: err.message || "internal_error" });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`[goy] listening on :${port}`);
});

function stop() {
  console.log("[goy] shutting down");
  server.close(async () => {
    await shutdown();
    process.exit(0);
  });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
