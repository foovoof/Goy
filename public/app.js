const $ = (id) => document.getElementById(id);

async function api(path, opts) {
  const res = await fetch(path, {
    ...opts,
    headers: { "content-type": "application/json", ...(opts?.headers || {}) },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

async function refreshProviders() {
  try {
    const { enabled } = await api("/api/providers");
    $("providers").textContent = `المصادر المفعّلة: ${enabled.join(" · ")}`;
  } catch {}
}

async function refreshJobs() {
  try {
    const { jobs } = await api("/api/jobs");
    $("jobs").innerHTML = jobs
      .map(
        (j) => `<li class="job">
          <span class="status-${j.status}">[${j.status}]</span>
          <b>${escape(j.query)}</b> <small>(${j.query_type})</small>
          — <a href="#${j.id}">فتح</a>
        </li>`,
      )
      .join("");
  } catch {}
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function pollJob(jobId) {
  $("status").hidden = false;
  $("graph").hidden = false;

  while (true) {
    const job = await api(`/api/job/${jobId}`);
    $("statusBody").textContent = JSON.stringify(job, null, 2);

    const graph = await api(`/api/graph/${jobId}`);
    renderGraph(graph);

    if (job.status === "completed" || job.status === "failed") {
      refreshJobs();
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

function renderGraph(g) {
  const byType = {};
  for (const n of g.nodes) byType[n.type] = (byType[n.type] || 0) + 1;
  $("graphSummary").innerHTML = `
    <span>الحالة: <b class="status-${g.job.status}">${g.job.status}</b></span>
    <span>العُقد: <b>${g.nodes.length}</b></span>
    <span>الوصلات: <b>${g.edges.length}</b></span>
    <span>الاكتشافات: <b>${g.findings.length}</b></span>
    <span>أنواع: <b>${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}</b></span>
  `;
  $("nodes").innerHTML = g.nodes
    .map((n) => `<li class="node"><span class="type">${n.type}</span>${escape(n.value)} <small>(d=${n.depth})</small></li>`)
    .join("");
  $("findings").innerHTML = g.findings
    .slice()
    .reverse()
    .slice(0, 100)
    .map((f) => {
      const preview = JSON.stringify(f.payload).slice(0, 160);
      return `<li class="finding"><span class="prov">${f.provider}</span><span class="kind">${f.kind}</span>${escape(preview)}</li>`;
    })
    .join("");
}

$("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = $("query").value.trim();
  const depth = Number($("depth").value);
  if (!query) return;
  const { jobId } = await api("/api/search", { method: "POST", body: JSON.stringify({ query, depth }) });
  location.hash = jobId;
  pollJob(jobId);
});

window.addEventListener("hashchange", () => {
  const id = location.hash.replace(/^#/, "");
  if (id) pollJob(id);
});

refreshProviders();
refreshJobs();
if (location.hash) pollJob(location.hash.replace(/^#/, ""));
