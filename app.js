// Goy OSINT — الواجهة والمنطق
(function () {
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const els = {
    form:      $("#searchForm"),
    q:         $("#q"),
    type:      $("#typeSelect"),
    detected:  $("#detectedType"),
    results:   $("#results"),
    catsGrid:  $("#categoriesGrid"),
    favList:   $("#favoritesList"),
    histList:  $("#historyList"),
    clearHist: $("#clearHistory"),
    year:      $("#year"),
  };

  els.year.textContent = new Date().getFullYear();

  // ── التخزين ────────────────────────────
  const store = {
    favs: () => JSON.parse(localStorage.getItem("goy.favs") || "[]"),
    setFavs: v => localStorage.setItem("goy.favs", JSON.stringify(v)),
    hist: () => JSON.parse(localStorage.getItem("goy.hist") || "[]"),
    setHist: v => localStorage.setItem("goy.hist", JSON.stringify(v.slice(0, 50))),
  };

  // ── كشف نوع الاستعلام ─────────────────
  function detectType(q) {
    q = String(q || "").trim();
    if (!q) return "general";
    if (/^https?:\/\/\S+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(q)) return "image";
    if (/^https?:\/\/\S+\.(pdf|docx?|xlsx?|pptx?|txt|csv)(\?.*)?$/i.test(q)) return "document";
    if (/^[A-Fa-f0-9]{32}$/.test(q))  return "hash";
    if (/^[A-Fa-f0-9]{40}$/.test(q))  return "hash";
    if (/^[A-Fa-f0-9]{64}$/.test(q))  return "hash";
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(q)) return "bitcoin";
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) return "bitcoin";
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(q)) return "ip";
    if (/^[a-f0-9:]+:[a-f0-9:]+$/i.test(q) && q.includes(":")) return "ip";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) return "email";
    if (/^\+?[0-9][0-9\s\-().]{6,}$/.test(q) && /\d{6,}/.test(q.replace(/\D/g,""))) return "phone";
    if (/^@[A-Za-z0-9_.]{2,}$/.test(q)) return "username";
    if (/^[A-Za-z0-9._-]+\.[A-Za-z]{2,}$/.test(q)) return "domain";
    if (/^https?:\/\//i.test(q)) return "domain";
    if (/^[A-Za-z0-9_.-]{3,30}$/.test(q) && !/\s/.test(q)) return "username";
    return "person";
  }

  const TYPE_LABELS = {
    general:"عام", username:"اسم مستخدم", email:"بريد إلكتروني",
    phone:"رقم هاتف", domain:"نطاق", ip:"عنوان IP", person:"شخص",
    image:"رابط صورة", document:"رابط وثيقة", hash:"Hash", bitcoin:"عنوان محفظة",
  };

  // ── عرض التصنيفات ─────────────────────
  function renderCategories() {
    els.catsGrid.innerHTML = "";
    const cats = window.GOY_CATEGORIES;
    Object.keys(cats).forEach(key => {
      const count = window.GOY_TOOLS.filter(t => t.cat === key).length;
      const card = document.createElement("div");
      card.className = "cat-card";
      card.innerHTML = `
        <h4>${cats[key].icon} ${cats[key].title}</h4>
        <p>${count} أداة/مصدر</p>
        <span class="count">اضغط لعرض الأدوات</span>
      `;
      card.addEventListener("click", () => {
        const q = (els.q.value || "").trim() || "example";
        renderResultsFor(q, "general", { onlyCat: key });
        window.scrollTo({ top: els.results.offsetTop - 20, behavior: "smooth" });
      });
      els.catsGrid.appendChild(card);
    });
  }

  // ── بناء بطاقة أداة ───────────────────
  function toolCard(tool, q) {
    const href = tool.url(q);
    const favs = store.favs();
    const isFav = favs.includes(tool.name);
    const el = document.createElement("div");
    el.className = "tool";
    el.innerHTML = `
      <a class="tool-main" href="${href}" target="_blank" rel="noopener noreferrer">
        <span class="tool-name">${tool.name}</span>
        <span class="tool-desc">${tool.desc}</span>
      </a>
      <div class="actions">
        <button class="icon-btn ${isFav ? "fav-on" : ""}" title="مفضلة" aria-label="مفضلة">★</button>
      </div>
    `;
    el.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      const list = store.favs();
      const i = list.indexOf(tool.name);
      if (i === -1) list.push(tool.name); else list.splice(i, 1);
      store.setFavs(list);
      renderFavorites();
      const btn = e.currentTarget;
      btn.classList.toggle("fav-on");
    });
    return el;
  }

  // ── عرض النتائج ───────────────────────
  function renderResultsFor(q, type, opts = {}) {
    els.results.innerHTML = "";
    let tools = window.GOY_TOOLS;
    if (opts.onlyCat) {
      tools = tools.filter(t => t.cat === opts.onlyCat);
    } else if (type && type !== "general") {
      tools = tools.filter(t => t.types.includes(type) || t.types.includes("general"));
    }
    // تجميع حسب التصنيف
    const groups = {};
    tools.forEach(t => { (groups[t.cat] ||= []).push(t); });

    const catOrder = Object.keys(window.GOY_CATEGORIES);
    catOrder.forEach(cat => {
      const list = groups[cat];
      if (!list || !list.length) return;
      const meta = window.GOY_CATEGORIES[cat];
      const group = document.createElement("div");
      group.className = "result-group";
      group.innerHTML = `
        <h4>${meta.icon} ${meta.title} <span class="count">${list.length}</span></h4>
        <div class="tools"></div>
      `;
      const cont = group.querySelector(".tools");
      list.forEach(t => cont.appendChild(toolCard(t, q)));
      els.results.appendChild(group);
    });

    if (!els.results.children.length) {
      els.results.innerHTML = `<div class="result-group"><p class="muted">لا توجد أدوات مطابقة لهذا النوع.</p></div>`;
    }
  }

  // ── المفضلة ───────────────────────────
  function renderFavorites() {
    const favs = store.favs();
    els.favList.innerHTML = "";
    if (!favs.length) {
      els.favList.innerHTML = `<p class="muted">لا توجد مفضّلة بعد. اضغط ★ على أي أداة لإضافتها.</p>`;
      return;
    }
    const q = (els.q.value || "").trim() || "example";
    const tools = window.GOY_TOOLS.filter(t => favs.includes(t.name));
    const cont = document.createElement("div");
    cont.className = "tools";
    tools.forEach(t => cont.appendChild(toolCard(t, q)));
    els.favList.appendChild(cont);
  }

  // ── السجل ────────────────────────────
  function pushHistory(q, type) {
    const list = store.hist();
    list.unshift({ q, type, at: Date.now() });
    store.setHist(list);
    renderHistory();
  }

  function renderHistory() {
    const list = store.hist();
    els.histList.innerHTML = "";
    if (!list.length) {
      els.histList.innerHTML = `<p class="muted">لم تُجرِ أي بحث بعد.</p>`;
      return;
    }
    list.forEach((h, idx) => {
      const item = document.createElement("div");
      item.className = "history-item";
      const d = new Date(h.at);
      item.innerHTML = `
        <div>
          <div class="q">${escapeHtml(h.q)}</div>
          <div class="meta">${TYPE_LABELS[h.type] || h.type} · ${d.toLocaleString("ar")}</div>
        </div>
        <button data-idx="${idx}">إعادة</button>
      `;
      item.querySelector("button").addEventListener("click", () => {
        els.q.value = h.q;
        els.type.value = h.type;
        runSearch();
      });
      els.histList.appendChild(item);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  // ── تشغيل البحث ──────────────────────
  function runSearch() {
    const raw = els.q.value.trim();
    if (!raw) { els.detected.textContent = "اكتب استعلاماً للبدء."; return; }
    let type = els.type.value;
    if (type === "auto") type = detectType(raw);
    els.detected.innerHTML = `النوع المكتشف: <b>${TYPE_LABELS[type] || type}</b> — تم توليد الأدوات المناسبة.`;
    renderResultsFor(raw, type);
    pushHistory(raw, type);
    window.scrollTo({ top: els.results.offsetTop - 20, behavior: "smooth" });
  }

  // ── كشف حي أثناء الكتابة ─────────────
  els.q.addEventListener("input", () => {
    const v = els.q.value.trim();
    if (!v) { els.detected.textContent = ""; return; }
    const t = els.type.value === "auto" ? detectType(v) : els.type.value;
    els.detected.innerHTML = `التنبؤ: <b>${TYPE_LABELS[t] || t}</b>`;
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    runSearch();
  });

  els.clearHist.addEventListener("click", () => {
    store.setHist([]);
    renderHistory();
  });

  // ── التهيئة ──────────────────────────
  renderCategories();
  renderFavorites();
  renderHistory();
})();
