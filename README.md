# moni8

A tiny uptime monitor, extremely minimal, no bloat.

**Live:** [moni8.khushal.work](https://moni8.khushal.work/?utm_source=github&utm_medium=repo)

![moni8 landing](docs/landing-page.png)
![moni8 dashboard](docs/moni8-screenshot.png)

## Features

- Interval-based HTTP checks (default 60s)
- Add monitors via API or UI
- Pass/fail history with latency charts
- PM2 log viewer (self-hosted only)
- Cron-triggered health checks (Cloudflare)

## Self-Hosting

Self-host to get the **PM2 logs** feature (Terminal button in the dashboard).

### Quick Start

```bash
# Backend
cd backend
npm install
APP_ENV=dev PORT=4070 node src/server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 4071
```

- Backend: http://localhost:4070
- Frontend: http://localhost:4071

### Production Mode

```bash
# Backend (PM2 logs disabled)
APP_ENV=prod PORT=4070 node src/server.js

# Frontend
cd frontend
npm run build
```

If frontend and backend are on different origins, set CORS:
```bash
APP_ENV=prod CORS_ORIGIN=https://your-frontend.com PORT=4070 node src/server.js
```

### PM2 Logs

The Terminal/PM2 logs feature only works when self-hosted:
- Run your services under PM2 on the same machine
- Create monitors with a `pm2_name` (e.g. `uptime-api`)
- Click the Terminal icon in the dashboard to view logs

This feature is disabled on Cloudflare for security.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/monitors` | List all monitors |
| `POST` | `/api/monitors` | Create monitor `{ name, url, intervalSec }` |
| `PATCH` | `/api/monitors/:id` | Update monitor |
| `DELETE` | `/api/monitors/:id` | Delete monitor |
| `GET` | `/api/monitors/:id/checks?limit=90` | Get check history |
| `GET` | `/api/capabilities` | Feature flags |
| `GET` | `/health` | Health check |

## Tech Stack

- **Frontend:** React, Tailwind CSS v4, Vite
- **Backend:** Fastify (self-host) / Hono (Cloudflare Workers)
- **Database:** SQLite via better-sqlite3 (self-host) / D1 (Cloudflare)
- **Scheduling:** setInterval (self-host) / Cron Triggers (Cloudflare)

## License

MIT
