---
name: moni8-self-host
description: "Use when the user wants to self-host moni8 (uptime monitor). Walks through the full setup step by step, from cloning the repo to seeing the dashboard. Also use when troubleshooting a self-hosted moni8 instance or asking about PM2 logs."
---

# Self-Hosting moni8

Self-host moni8 to get the **PM2 logs / Terminal** feature (view logs of your monitored services directly from the dashboard).

## Prerequisites

You need **Node.js** (v18+) and **PM2** installed on your machine:

```bash
# Check Node.js is installed
node -v

# Install PM2 globally if not already installed
npm install -g pm2
```

## Step 1: Clone the project

```bash
git clone https://github.com/logan1x/moni8.git
cd moni8
```

## Step 2: Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 3: Set up environment

```bash
cd ../backend
cp .env.example .env
```

Open `backend/.env` and make sure it looks like this:

```
PORT=4070
APP_ENV=dev
```

`APP_ENV=dev` is required for the PM2 logs feature to work.

## Step 4: Start the backend

```bash
cd ../backend
APP_ENV=dev PORT=4070 node src/server.js
```

The backend runs at http://localhost:4070.

## Step 5: Start the frontend

Open a **new terminal** and run:

```bash
cd frontend
VITE_API_BASE=http://127.0.0.1:4070 npm run dev -- --host 0.0.0.0 --port 4071
```

The frontend runs at http://localhost:4071.

Open http://localhost:4071 in your browser. You should see the moni8 dashboard.

## Step 6: Using PM2 (optional but recommended)

PM2 keeps your services running in the background and enables the logs feature.

```bash
cd /path/to/moni8

# Start both services with PM2
pm2 start ecosystem.config.cjs

# Save the process list and set up auto-start on reboot
pm2 save
pm2 startup   # run the command it prints
```

Now both services run in the background. You can check status with:

```bash
pm2 list
```

## Step 7: View PM2 logs from the dashboard

1. Make sure your monitored services are running under PM2 (e.g., `pm2 start your-app --name my-api`)
2. When creating a monitor in moni8, set the **PM2 name** to the PM2 process name (e.g., `my-api`)
3. Click the **Terminal** icon in the dashboard to view that service's logs

## Troubleshooting

- **"got HTML instead of JSON"** error: The frontend can't reach the backend. Make sure `VITE_API_BASE=http://127.0.0.1:4070` is set when starting the frontend.
- **PM2 logs not showing**: Make sure the backend is running with `APP_ENV=dev`. PM2 log endpoints are disabled in prod mode.
- **Port already in use**: Change the `PORT` in `backend/.env` or stop whatever is using that port.
- **Database errors**: The backend auto-creates `backend/data/uptime.db` on first run. Make sure `backend/data/` is writable.
