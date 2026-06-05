import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

function nowIso() {
  return new Date().toISOString();
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(t);
    const latency = Date.now() - start;
    return {
      ok: res.status >= 200 && res.status < 400,
      status_code: res.status,
      latency_ms: latency,
      error: null
    };
  } catch (e) {
    const latency = Date.now() - start;
    return {
      ok: false,
      status_code: null,
      latency_ms: latency,
      error: (e && e.message) ? e.message : String(e)
    };
  }
}

// Health check
app.get('/health', (c) => c.json({ ok: true, env: 'prod' }));

// Capabilities — PM2 logs disabled on Cloudflare
app.get('/api/capabilities', (c) => c.json({ pm2Logs: false }));

// List monitors with last check
app.get('/api/monitors', async (c) => {
  const db = c.env.DB;
  const { results: monitors } = await db.prepare('SELECT * FROM monitors ORDER BY created_at DESC').all();
  const out = [];
  for (const m of monitors) {
    const { results: lc } = await db.prepare('SELECT * FROM checks WHERE monitor_id = ? ORDER BY ts DESC LIMIT 1').bind(m.id).all();
    out.push({ ...m, lastCheck: lc[0] || null });
  }
  return c.json({ monitors: out });
});

// Get check history
app.get('/api/monitors/:id/checks', async (c) => {
  const db = c.env.DB;
  const id = Number(c.req.param('id'));
  const { results: mons } = await db.prepare('SELECT * FROM monitors WHERE id = ?').bind(id).all();
  if (!mons.length) return c.json({ error: 'not found' }, 404);
  const limit = Math.min(Number(c.req.query('limit') || 60), 500);
  const { results: checks } = await db.prepare('SELECT * FROM checks WHERE monitor_id = ? ORDER BY ts DESC LIMIT ?').bind(id, limit).all();
  return c.json({ monitor: mons[0], checks });
});

// Create monitor
app.post('/api/monitors', async (c) => {
  const db = c.env.DB;
  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid json' }, 400); }

  const { name, url, intervalSec, pm2Name } = body || {};
  if (!name || !url) return c.json({ error: { fieldErrors: { name: !name ? ['required'] : undefined, url: !url ? ['required'] : undefined } } }, 400);

  let parsedUrl;
  try { parsedUrl = new URL(url); } catch { return c.json({ error: { fieldErrors: { url: ['invalid url'] } } }, 400); }

  const interval = Number(intervalSec) || 60;
  if (interval < 10 || interval > 3600) return c.json({ error: { fieldErrors: { intervalSec: ['must be 10-3600'] } } }, 400);

  const safePm2Name = null;
  const ts = nowIso();
  const { meta } = await db.prepare(
    'INSERT INTO monitors(name,url,interval_sec,enabled,pm2_name,created_at) VALUES(?,?,?,?,?,?)'
  ).bind(name, parsedUrl.href, interval, 1, safePm2Name, ts).run();

  return c.json({ id: meta.last_row_id }, 201);
});

// Update monitor
app.patch('/api/monitors/:id', async (c) => {
  const db = c.env.DB;
  const id = Number(c.req.param('id'));
  const { results: mons } = await db.prepare('SELECT * FROM monitors WHERE id = ?').bind(id).all();
  if (!mons.length) return c.json({ error: 'not found' }, 404);
  const m = mons[0];

  let body;
  try { body = await c.req.json(); } catch { return c.json({ error: 'invalid json' }, 400); }

  const { pm2Name, url, name, intervalSec } = body || {};

  if (pm2Name !== undefined) {
    return c.json({ error: 'pm2 logs are disabled in prod' }, 403);
  }
  if (url !== undefined) {
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch { return c.json({ error: { fieldErrors: { url: ['invalid url'] } } }, 400); }
    await db.prepare('UPDATE monitors SET url = ? WHERE id = ?').bind(parsedUrl.href, id).run();
  }
  if (name !== undefined && name !== null) {
    if (!name) return c.json({ error: { fieldErrors: { name: ['required'] } } }, 400);
    await db.prepare('UPDATE monitors SET name = ? WHERE id = ?').bind(name, id).run();
  }
  if (intervalSec !== undefined && intervalSec !== null) {
    const interval = Number(intervalSec);
    if (interval < 10 || interval > 3600) return c.json({ error: { fieldErrors: { intervalSec: ['must be 10-3600'] } } }, 400);
    await db.prepare('UPDATE monitors SET interval_sec = ? WHERE id = ?').bind(interval, id).run();
  }
  return c.json({ ok: true });
});

// Delete monitor
app.delete('/api/monitors/:id', async (c) => {
  const db = c.env.DB;
  const id = Number(c.req.param('id'));
  const { meta } = await db.prepare('DELETE FROM monitors WHERE id = ?').bind(id).run();
  if (meta.changes === 0) return c.json({ error: 'not found' }, 404);
  return c.json({ ok: true });
});

// PM2 endpoints — disabled on Cloudflare
app.get('/api/pm2/apps', (c) => c.json({ error: 'not found' }, 404));
app.get('/api/pm2/apps/:name/logs', (c) => c.json({ error: 'not found' }, 404));

// Cron trigger handler
async function runHealthChecks(env) {
  const db = env.DB;
  const { results: monitors } = await db.prepare('SELECT * FROM monitors WHERE enabled = 1').all();
  const now = Date.now();

  for (const m of monitors) {
    const intervalMs = Math.max(10, (m.interval_sec || 60) * 1000);
    const { results: lastChecks } = await db.prepare(
      'SELECT ts FROM checks WHERE monitor_id = ? ORDER BY ts DESC LIMIT 1'
    ).bind(m.id).all();

    if (lastChecks.length) {
      const lastTs = new Date(lastChecks[0].ts).getTime();
      if (now - lastTs < intervalMs) continue;
    }

    const result = await checkUrl(m.url);
    await db.prepare(
      'INSERT INTO checks(monitor_id,ts,ok,status_code,latency_ms,error) VALUES(?,?,?,?,?,?)'
    ).bind(m.id, nowIso(), result.ok ? 1 : 0, result.status_code, result.latency_ms, result.error).run();
  }
}

export default {
  async fetch(request, env) {
    return app.fetch(request, env);
  },
  async scheduled(event, env) {
    await runHealthChecks(env);
  }
};
