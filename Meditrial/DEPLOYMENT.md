# Cloud deployment (Render + Supabase)

The app is configured for a free Render static frontend and FastAPI service, with Supabase PostgreSQL as the persistent database. The database URL is intentionally a secret supplied in the Render dashboard; it is not committed to this repository.

## 1. Create the Supabase database

1. Create a Supabase project and wait for it to finish provisioning.
2. In the project, open **Connect** and select the **Session pooler** connection details. Use the URI for the session pooler (port 5432), rather than the direct database URI if your deployment host does not support IPv6.
3. Copy the PostgreSQL URI and replace its password with the database password you set for the project. URL-encode any special characters in that password. Keep the `sslmode=require` query parameter.

The application converts PostgreSQL URLs to the `asyncpg` driver format and uses TLS when `sslmode=require` is present.

## 2. Deploy the Render services

1. Push this repository to a Git provider supported by Render.
2. In Render, choose **New → Blueprint**, connect the repository, and set the Blueprint file path to `Meditrial/render.yaml` (the file is in a subdirectory of this Git repository).
3. Render creates `meditrail-api` and `meditrail-ui`. When prompted for the API's `DATABASE_URL`, enter the Supabase session-pooler URI. If no prompt appears, open the `meditrail-api` service's **Environment** settings and add `DATABASE_URL` there. Treat this value as a secret.
4. The first API startup creates the application tables in Supabase. Wait for `/health` to report healthy.
5. If Render assigns different hostnames, update `CORS_ORIGINS` on the API to the exact frontend origin (scheme and host only, no trailing slash), and set `VITE_API_URL` on the frontend to the API origin plus `/api/v1`. Trigger a frontend redeploy after changing its build-time variable.

The checked-in blueprint uses `https://meditrail-ui.onrender.com` and `https://meditrail-api.onrender.com/api/v1`. The service root directories are `Meditrial/backend` and `Meditrial/frontend`, relative to the Git repository root; the static site's publish directory is `dist` relative to its service root.

## Local development

The backend defaults to a local SQLite file (`backend/meditrail.db`). Start the backend and frontend in separate PowerShell terminals:

```powershell
# Terminal 1
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install .
uvicorn app.main:app --reload

# Terminal 2
cd frontend
npm ci
npm run dev
```

For local PostgreSQL, set `DATABASE_URL` in the backend environment. Set `CORS_ORIGINS` to the frontend origin. The frontend's API base URL is configured with `VITE_API_URL`; see the frontend `.env.example`.

## Free-tier notes

Render's free API service can spin down when idle, and its local filesystem is ephemeral. Deployed data must therefore use Supabase, not SQLite. Free-tier availability and limits can change; Supabase free projects may pause after inactivity and have a database size quota. Medical attachments are currently stored in the database profile data, so monitor database usage and keep uploads within the app's configured limits. This setup is suitable for a demo with test data, not production clinical records.
