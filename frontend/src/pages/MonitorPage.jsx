import { useEffect, useMemo, useRef, useState } from "react";
import { Link as ExternalLink, Plus, RefreshCw, Trash2, Terminal, X, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import { addMonitor, deleteMonitor, getCapabilities, getChecks, getPm2Logs, listMonitors } from "../api";
import { Badge } from "@/components/ui/badge";

const PUBLIC_HOST = "192.168.31.176";

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function urlForOpening(rawUrl) {
  try {
    const u = new URL(String(rawUrl));
    // Replace localhost-ish hostnames so the link works from other devices on the LAN.
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(u.hostname)) {
      u.hostname = PUBLIC_HOST;
    }
    return u.toString();
  } catch {
    return String(rawUrl || "");
  }
}

function StatusPip({ ok }) {
  return (
    <span
      className={clsx(
        "inline-block h-2.5 w-2.5 rounded-full",
        ok ? "bg-emerald-500" : "bg-rose-500"
      )}
      title={ok ? "Up" : "Down"}
    />
  );
}

function HistoryDots({ checks }) {
  const dots = (checks || []).slice(0, 30);
  return (
    <div className="flex flex-wrap gap-1">
      {dots.map((c) => (
        <span
          key={c.id}
          className={clsx(
            "h-2.5 w-2.5 rounded-sm",
            c.ok ? "bg-emerald-500/80" : "bg-rose-500/80"
          )}
          title={`${c.ts} • ${c.ok ? "UP" : "DOWN"}${c.status_code ? ` • ${c.status_code}` : ""}${c.latency_ms != null ? ` • ${c.latency_ms}ms` : ""}`}
        />
      ))}
      {!dots.length ? <span className="text-xs text-neutral-500">No checks yet</span> : null}
    </div>
  );
}

function LatencyChart({ checks, height = 160 }) {
  // checks come newest-first; we want oldest->newest for a left-to-right chart
  const pts = (checks || [])
    .slice(0, 120)
    .filter((c) => c.latency_ms != null)
    .slice()
    .reverse();

  const width = 560;
  const pad = 12;

  const values = pts.map((c) => Number(c.latency_ms || 0));
  const rawMax = values.length ? Math.max(...values) : 50;
  // Smart scaling: round up to nearest nice number with 20% headroom
  const niceMax = (() => {
    const withPadding = rawMax * 1.25;
    if (withPadding <= 10) return 10;
    if (withPadding <= 25) return 25;
    if (withPadding <= 50) return 50;
    if (withPadding <= 100) return 100;
    if (withPadding <= 250) return 250;
    if (withPadding <= 500) return 500;
    return Math.ceil(withPadding / 100) * 100;
  })();
  const max = niceMax;
  const min = 0;

  // Generate 5 Y-axis ticks (0, 25%, 50%, 75%, 100%)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * max));

  const toX = (i) => {
    if (pts.length <= 1) return pad;
    return pad + (i * (width - pad * 2)) / (pts.length - 1);
  };
  const toY = (v) => {
    const t = (v - min) / (max - min);
    return pad + (1 - t) * (height - pad * 2);
  };

  const baseY = height - pad;

  const segments = [];
  for (let i = 0; i < pts.length; i++) {
    const ok = pts[i].ok === 1;
    const last = segments[segments.length - 1];
    if (!last || last.ok !== ok) segments.push({ ok, start: i, end: i });
    else last.end = i;
  }

  function linePathForRange(a, b) {
    const start = Math.max(0, a - 1);
    return pts
      .slice(start, b + 1)
      .map((c, idx) => {
        const i = start + idx;
        const x = toX(i);
        const y = toY(Number(c.latency_ms || 0));
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  function areaPathForRange(a, b) {
    const start = Math.max(0, a - 1);
    const slice = pts.slice(start, b + 1);
    if (!slice.length) return "";

    const top = slice
      .map((c, idx) => {
        const i = start + idx;
        const x = toX(i);
        const y = toY(Number(c.latency_ms || 0));
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

    const endX = toX(start + slice.length - 1);
    const startX = toX(start);
    return `${top} L ${endX.toFixed(2)} ${baseY.toFixed(2)} L ${startX.toFixed(2)} ${baseY.toFixed(2)} Z`;
  }

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const firstLabel = pts.length ? fmtTime(pts[0].ts) : "";
  const midLabel = pts.length ? fmtTime(pts[Math.floor((pts.length - 1) / 2)].ts) : "";
  const lastLabel = pts.length ? fmtTime(pts[pts.length - 1].ts) : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-neutral-200">Response time</div>
        <div className="text-[11px] text-neutral-500">Recent</div>
      </div>

      {pts.length < 2 ? (
        <div className="mt-3 text-xs text-neutral-500">Not enough data yet.</div>
      ) : (
        <div className="mt-2 flex gap-3">
          {/* Y-axis labels */}
          <div className="flex w-14 flex-col justify-between text-[10px] text-neutral-500 tabular-nums">
            <div>{max}ms</div>
            <div>{yTicks[3]}ms</div>
            <div>{yTicks[2]}ms</div>
            <div>{yTicks[1]}ms</div>
            <div>0ms</div>
          </div>

          <div className="min-w-0 flex-1">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="block h-[160px] w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Response time chart"
            >
              {/* horizontal guide lines at each tick */}
              {yTicks.map((tick, i) => (
                <line
                  key={i}
                  x1={pad}
                  y1={toY(tick)}
                  x2={width - pad}
                  y2={toY(tick)}
                  stroke={i === 0 ? "#333" : "#222"}
                  strokeWidth="1"
                />
              ))}

              {/* area + line segments */}
              {segments.map((s) => (
                <g key={`${s.ok ? "up" : "down"}-${s.start}-${s.end}`}>
                  <path
                    d={areaPathForRange(s.start, s.end)}
                    fill={s.ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}
                    stroke="none"
                  />
                  <path
                    d={linePathForRange(s.start, s.end)}
                    fill="none"
                    stroke={s.ok ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {pts.length >= 2 ? (
        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
          <span>{firstLabel}</span>
          <span>{midLabel}</span>
          <span>{lastLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

function StatRow({ label, sublabel, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-neutral-200">{label}</div>
        {sublabel ? <div className="text-xs text-neutral-500">{sublabel}</div> : null}
      </div>
      <div className="shrink-0 text-sm font-semibold text-neutral-100 tabular-nums">{value}</div>
    </div>
  );
}

function MonitorStats({ checks }) {
  const stats = useMemo(() => {
    const rows = checks || [];
    const last = rows[0] || null;
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();

    function inWindow(ms) {
      return rows.filter((c) => {
        const t = new Date(c.ts).getTime();
        return Number.isFinite(t) && now - t <= ms;
      });
    }

    function avgLatency(list) {
      const xs = list.filter((c) => c.latency_ms != null).map((c) => Number(c.latency_ms));
      if (!xs.length) return null;
      return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
    }

    function uptimePct(list) {
      if (!list.length) return null;
      const ok = list.filter((c) => c.ok === 1).length;
      return (ok / list.length) * 100;
    }

    const w24 = inWindow(24 * 60 * 60 * 1000);
    const w30d = inWindow(30 * 24 * 60 * 60 * 1000);

    return {
      currentMs: last?.latency_ms != null ? Number(last.latency_ms) : null,
      avg24: avgLatency(w24),
      up24: uptimePct(w24),
      up30: uptimePct(w30d)
    };
  }, [checks]);

  const fmtPct = (v) => (v == null ? "—" : `${v.toFixed(1)}%`);

  return (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="grid gap-4">
        <StatRow label="Response" sublabel="(Current)" value={stats.currentMs != null ? `${stats.currentMs} ms` : "—"} />
        <StatRow label="Avg. Response" sublabel="(24-hour)" value={stats.avg24 != null ? `${stats.avg24} ms` : "—"} />
        <StatRow label="Uptime" sublabel="(24-hour)" value={fmtPct(stats.up24)} />
        <StatRow label="Uptime" sublabel="(30-day)" value={fmtPct(stats.up30)} />
      </div>
    </div>
  );
}

function LogsModal({ open, onClose, pm2Name, enabled }) {
  const [tab, setTab] = useState("out");
  const [lines, setLines] = useState(200);
  const [auto, setAuto] = useState(true);
  const [data, setData] = useState({ out: [], err: [] });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [expandedKey, setExpandedKey] = useState("");
  const scrollRef = useRef(null);

  function parseMaybeJson(line) {
    try {
      const s = String(line || "").trim();
      if (!s) return null;
      if (s[0] !== "{" && s[0] !== "[") return null;
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  function fmtTs(msOrIso) {
    try {
      // fastify logger uses epoch ms in "time"
      const d = typeof msOrIso === "number" ? new Date(msOrIso) : new Date(msOrIso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  }

  function statusTone(code) {
    if (code == null) return "bg-neutral-800/50 text-neutral-300 border-neutral-700";
    if (code >= 200 && code < 400) return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    if (code >= 400 && code < 500) return "bg-amber-500/15 text-amber-200 border-amber-500/30";
    return "bg-rose-500/15 text-rose-200 border-rose-500/30";
  }

  function jsonSyntaxHighlight(json) {
    const esc = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return esc.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g,
      (m, key, _a, str, _b, boolNull) => {
        if (key) return `<span class="text-amber-200">${m}</span>`;
        if (str) return `<span class="text-emerald-200">${m}</span>`;
        if (boolNull) return `<span class="text-fuchsia-200">${m}</span>`;
        return `<span class="text-sky-200">${m}</span>`;
      }
    );
  }

  async function refresh() {
    if (!pm2Name) return;
    setLoading(true);
    setErr("");
    try {
      const d = await getPm2Logs(pm2Name, lines);
      setData({ out: d.out || [], err: d.err || [] });
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setExpandedKey("");
    refresh();
    if (!auto) return;
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pm2Name, lines, auto]);

  const active = tab === "out" ? data.out : data.err;

  const rows = useMemo(() => {
    const linesArr = Array.isArray(active) ? active : [];

    // Merge fastify "incoming request" + "request completed" by reqId
    const byReqId = new Map();
    const order = [];

    function ensure(id) {
      if (!byReqId.has(id)) {
        byReqId.set(id, { reqId: id, firstIndex: Infinity });
        order.push(id);
      }
      return byReqId.get(id);
    }

    const out = [];

    for (let i = 0; i < linesArr.length; i++) {
      const raw = linesArr[i];
      const obj = parseMaybeJson(raw);
      const rid = obj?.reqId;

      if (!obj || !rid) {
        out.push({ kind: "raw", key: `${tab}:raw:${i}`, raw: String(raw) });
        continue;
      }

      const row = ensure(rid);
      row.firstIndex = Math.min(row.firstIndex, i);

      if (obj.req) {
        row.inTime = obj.time ?? row.inTime;
        row.method = obj.req.method ?? row.method;
        row.url = obj.req.url ?? row.url;
      }

      if (obj.res || obj.responseTime != null) {
        row.doneTime = obj.time ?? row.doneTime;
        row.status = obj.res?.statusCode ?? row.status;
        row.responseTime = obj.responseTime ?? row.responseTime;
      }

      // keep latest messages (optional)
      row.msg = obj.msg ?? row.msg;
    }

    // Build display rows one line per reqId
    const merged = [];
    const seen = new Set();
    for (const id of order) {
      if (seen.has(id)) continue;
      seen.add(id);
      const r = byReqId.get(id);
      if (!r) continue;
      merged.push({ kind: "req", key: `${tab}:req:${id}`, req: r });
    }

    // Newest-first: show latest requests at the top
    merged.sort((a, b) => {
      const ta = a.req?.doneTime ?? a.req?.inTime ?? 0;
      const tb = b.req?.doneTime ?? b.req?.inTime ?? 0;
      return Number(tb) - Number(ta);
    });

    // Prefer merged rows; if there are lots of non-json lines, include them too.
    return merged.length ? merged : out.slice().reverse();
  }, [active, tab]);

  useEffect(() => {
    if (!open) return;
    if (!auto) return;
    const el = scrollRef.current;
    if (!el) return;
    // With newest-first ordering, keep viewport pinned to top.
    const t = setTimeout(() => {
      try {
        el.scrollTop = 0;
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open, auto, tab, rows.length]);

  if (!open) return null;
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Logs</div>
            <div className="truncate text-xs text-neutral-500">pm2: {pm2Name}</div>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/10"
            onClick={onClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-1 text-xs">
              <button
                className={clsx(
                  "rounded-md px-3 py-1",
                  tab === "out" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
                )}
                onClick={() => setTab("out")}
              >
                stdout
              </button>
              <button
                className={clsx(
                  "rounded-md px-3 py-1",
                  tab === "err" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
                )}
                onClick={() => setTab("err")}
              >
                stderr
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                Auto
              </label>
              <label className="flex items-center gap-2">
                Lines
                <input
                  type="number"
                  min={50}
                  max={2000}
                  value={lines}
                  onChange={(e) => setLines(Number(e.target.value || 200))}
                  className="w-24 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-200"
                />
              </label>
              <button
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-200 hover:bg-white/10"
                onClick={refresh}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {err ? (
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
              {err}
            </div>
          ) : null}

          <div ref={scrollRef} className="h-[420px] overflow-auto rounded-xl border border-white/10 bg-white/[0.02] p-2 text-[12px] leading-5 text-neutral-200">
            {rows?.length ? (
              <div className="grid gap-1">
                {rows.map((row) => {
                  if (row.kind === "raw") {
                    return (
                      <div key={row.key} className="rounded-lg px-2 py-1 font-mono text-neutral-200">
                        <span className="text-neutral-500">•</span> {row.raw}
                      </div>
                    );
                  }

                  const r = row.req;
                  const ts = r.inTime ?? r.doneTime;
                  const endpoint = r.method && r.url ? `${r.method} ${r.url}` : (r.url || "request");
                  const status = r.status;
                  const rt = r.responseTime;
                  const rtMs = typeof rt === "number" ? `${Math.round(rt)}ms` : (rt != null ? `${rt}ms` : "—");

                  const expanded = expandedKey === row.key;

                  // Minimal one-liner: time + method/url + rt + status
                  return (
                    <div key={row.key} className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <button
                        className="w-full rounded-xl px-3 py-2 text-left"
                        onClick={() => setExpandedKey(expanded ? "" : row.key)}
                        title="Click to toggle raw JSON"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-neutral-500 tabular-nums">{fmtTs(ts) || ""}</span>
                              <span className="truncate font-mono text-[12px] text-neutral-100">{endpoint}</span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={clsx(
                                  "border px-2 py-0.5 text-[11px] font-medium tabular-nums",
                                  statusTone(status)
                                )}
                              >
                                {status ?? "—"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-neutral-300 tabular-nums"
                              >
                                {rtMs}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>

                      {expanded ? (
                        <div className="border-t border-white/[0.06] px-3 py-2">
                          <pre
                            className="overflow-auto rounded-lg bg-black/40 p-2 font-mono text-[12px] leading-5 text-neutral-200"
                            dangerouslySetInnerHTML={{
                              __html: jsonSyntaxHighlight(JSON.stringify(r, null, 2))
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-3 text-neutral-500">No logs.</div>
            )}
          </div>

          <div className="text-[11px] text-neutral-600">Tip: add pm2Name to a monitor to enable this button.</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [monitors, setMonitors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [logsOpen, setLogsOpen] = useState(false);
  const [logsPm2Name, setLogsPm2Name] = useState("");
  const [caps, setCaps] = useState({ pm2Logs: false });

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setIntervalSec] = useState(60);

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const data = await listMonitors();
      setMonitors(data.monitors || []);
      setSelected((prev) => {
        if (prev) return prev;
        const list = data.monitors || [];
        return list.length ? list[0] : null;
      });
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    getCapabilities()
      .then((c) => setCaps({ pm2Logs: !!c?.pm2Logs }))
      .catch(() => setCaps({ pm2Logs: false }));

    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!selected) return;
    // pull more so we can compute 24h + 30d stats
    getChecks(selected.id, 500)
      .then((d) => setChecks(d.checks || []))
      .catch(() => setChecks([]));
  }, [selected]);

  const selectedMonitor = useMemo(() => {
    if (!selected) return null;
    return monitors.find((m) => m.id === selected.id) || null;
  }, [selected, monitors]);

  async function createMonitor() {
    setLoading(true);
    setErr("");
    try {
      await addMonitor({ name, url, intervalSec: Number(interval) });
      setName("");
      setUrl("");
      setIntervalSec(60);
      setAddOpen(false);
      await refresh();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this monitor?");
    if (!ok) return;
    setLoading(true);
    setErr("");
    try {
      await deleteMonitor(id);
      if (selected?.id === id) {
        setSelected(null);
        setChecks([]);
      }
      await refresh();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <LogsModal open={logsOpen} onClose={() => setLogsOpen(false)} pm2Name={logsPm2Name} enabled={caps.pm2Logs} />

      {/* Add Monitor Modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4" onMouseDown={() => setAddOpen(false)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-black shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Add monitor</div>
                <div className="text-xs text-neutral-500">Create a new HTTP monitor</div>
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/10"
                onClick={() => setAddOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form
              className="grid gap-3 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                createMonitor();
              }}
            >
              <div className="grid gap-2">
                <label className="text-xs text-neutral-400">Name</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bookmarks Backend"
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-neutral-400">URL</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://192.168.31.176:8787/health"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-neutral-400">Interval (sec)</label>
                <input
                  type="number"
                  min={10}
                  max={3600}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  value={interval}
                  onChange={(e) => setIntervalSec(e.target.value)}
                />
              </div>

              {!caps.pm2Logs ? (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-neutral-300">
                  PM2 logs aren’t available in this hosted mode. Self-host to enable PM2 log viewing.
                </div>
              ) : null}

              {err ? (
                <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
                  {err}
                </div>
              ) : null}

              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-neutral-200 hover:bg-white/10"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
                  disabled={loading}
                  type="submit"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-neutral-400 hover:text-white transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Moni8</span>
            </Link>
            <span className="text-neutral-600">/</span>
            <h1 className="text-2xl font-extrabold tracking-tighter">Monitors</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={() => setAddOpen(true)}
              disabled={loading}
              title="Add monitor"
            >
              <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" />
              Add
            </button>
            <button
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={clsx("transition-transform duration-300 group-hover:rotate-180", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </header>

        <main className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[360px_1fr]">
          {/* Left: monitor list */}
          <section className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{monitors.length} monitors</div>
            </div>

            <div className="mt-3 grid gap-2">
              {monitors.map((m) => {
                const ok = m.lastCheck ? m.lastCheck.ok === 1 : null;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={clsx(
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      selected?.id === m.id
                        ? "border-white/20 bg-white/[0.04]"
                        : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {ok === null ? (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-600" title="Pending" />
                          ) : (
                            <StatusPip ok={ok} />
                          )}
                          <div className="truncate text-sm font-medium">{m.name}</div>
                        </div>
                        <div className="mt-1 truncate text-xs text-neutral-500">{m.url}</div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                          <span>{m.interval_sec}s</span>
                          {m.lastCheck?.latency_ms != null ? <span>{m.lastCheck.latency_ms}ms</span> : null}
                          {m.lastCheck?.status_code != null ? <span>HTTP {m.lastCheck.status_code}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const openUrl = urlForOpening(m.url);
                            if (openUrl) window.open(openUrl, "_blank", "noopener,noreferrer");
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-neutral-500 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                          title={`Open: ${urlForOpening(m.url)}`}
                        >
                          <ExternalLink size={16} />
                        </div>

                        {caps.pm2Logs && m.pm2_name ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLogsPm2Name(m.pm2_name);
                              setLogsOpen(true);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-neutral-500 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                            title="Logs (pm2)"
                          >
                            <Terminal size={16} />
                          </div>
                        ) : null}

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(m.id);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-neutral-500 hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!monitors.length ? (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-neutral-500">
                  No monitors yet.
                </div>
              ) : null}
            </div>
          </section>

          {/* Right: details */}
          <section className="rounded-2xl border border-white/10 p-4">
            {selectedMonitor ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-100">{selectedMonitor.name}</div>
                    <div className="mt-1 truncate text-xs text-neutral-500">{selectedMonitor.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/10"
                      onClick={() => {
                        const openUrl = urlForOpening(selectedMonitor.url);
                        if (openUrl) window.open(openUrl, "_blank", "noopener,noreferrer");
                      }}
                      title={`Open: ${urlForOpening(selectedMonitor.url)}`}
                    >
                      <ExternalLink size={16} />
                    </button>
                    <div className="text-xs text-neutral-500">id: {selectedMonitor.id}</div>
                  </div>
                </div>

                <MonitorStats checks={checks} />
                <LatencyChart checks={checks} />

    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Recent checks</div>
                      <div className="text-xs text-neutral-500">Last 30</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <HistoryDots checks={checks} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-neutral-500">
                Select a monitor to see details.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
