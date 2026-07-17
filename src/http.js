import { request } from "undici";

const DEFAULT_TIMEOUT = Number(process.env.PROVIDER_TIMEOUT_MS || 12_000);

export async function fetchJson(url, opts = {}) {
  const { headers = {}, method = "GET", body, timeout = DEFAULT_TIMEOUT } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await request(url, {
      method,
      headers: {
        "user-agent": "goy-osint/1.0 (+https://github.com/foovoof/Goy)",
        accept: "application/json",
        ...headers,
      },
      body,
      signal: controller.signal,
      maxRedirections: 3,
    });
    const status = res.statusCode;
    const text = await res.body.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { status, data, ok: status >= 200 && status < 300 };
  } catch (err) {
    return { status: 0, data: null, ok: false, error: err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, opts = {}) {
  const { headers = {}, method = "GET", body, timeout = DEFAULT_TIMEOUT } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await request(url, {
      method,
      headers: {
        "user-agent": "goy-osint/1.0 (+https://github.com/foovoof/Goy)",
        accept: "text/plain,*/*",
        ...headers,
      },
      body,
      signal: controller.signal,
      maxRedirections: 3,
    });
    const status = res.statusCode;
    const text = await res.body.text();
    return { status, data: text, ok: status >= 200 && status < 300 };
  } catch (err) {
    return { status: 0, data: "", ok: false, error: err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}
