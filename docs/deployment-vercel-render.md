# Deploying Inkroom: Frontend on Vercel + Backend on Render

You can easily host this monorepo using your favorite setup: **Vercel** for the React frontend, **Render** for the Express + Hocuspocus backend, and **MongoDB Atlas** for the database.

---

## Architecture Overview

```
 [Browser] 
    │
    ├── (HTTPS static app) ────► Vercel (apps/web)
    │
    └── (WSS WebSocket + REST) ─► Render (apps/server) ──► MongoDB Atlas
```

---

## Step 1: Set up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free shared cluster (M0).
2. Create a database user with username and password.
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render can connect.
4. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/inkroom?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

### Option A: Automatic via Blueprint (Recommended)
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **Blueprints** -> **New Blueprint Instance**.
3. Select your `inkroom` repository.
4. Render will read `render.yaml` and prompt you to fill in:
   - `DATABASE_URL`: Your MongoDB Atlas connection string.
   - `CORS_ORIGIN`: `*` (or your Vercel URL once created).

### Option B: Manual Web Service
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository `inkroom`.
3. Configure the settings:
   - **Name**: `inkroom-server`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root for monorepo linking)
   - **Build Command**: `pnpm install && pnpm --filter @inkroom/server build`
   - **Start Command**: `pnpm --filter @inkroom/server start`
   - **Instance Type**: `Free`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_ACCESS_SECRET`: `<any-random-string>`
   - `CORS_ORIGIN`: `*`
5. Click **Create Web Service**.
6. Once deployed, note your Render URL: e.g. `https://inkroom-server.onrender.com`.

---

## Step 3: Deploy Frontend to Vercel

Vercel has first-class built-in support for monorepos (pnpm & Turborepo).

1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New...** -> **Project**.
2. Import your GitHub repository `inkroom`.
3. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `apps/web`.
4. In **Environment Variables**, add:
   - `VITE_SERVER_URL`: `https://inkroom-server.onrender.com`
   - `VITE_WS_URL`: `wss://inkroom-server.onrender.com`
5. Click **Deploy**.

Vercel will build `@inkroom/web`, link workspace dependencies (`@inkroom/core`, `@inkroom/shared`, `@inkroom/ui`), and deploy your whiteboard globally with instant CDN speeds!

---

## Step 4: Final Touch (Update CORS on Render)

Once you have your Vercel domain (e.g. `https://inkroom.vercel.app`):
1. In Render Dashboard -> `inkroom-server` -> **Environment**.
2. Set `CORS_ORIGIN` to `https://inkroom.vercel.app`.
3. Save changes.

Your real-time collaborative whiteboard is now live!
