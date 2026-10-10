# MediTrail

MediTrail is a web app for keeping a person’s medical history organized across problems, hospitals, and visits. It gives patients a single place to maintain health details and records, while letting them choose which problems are shared with a clinician.

> **Project status:** Demo / educational application. Do not enter real patient or other sensitive health information. MediTrail is not an emergency service, diagnostic tool, or replacement for a qualified clinician.

## Problem statement

Medical information is often spread across paper reports, photos, prescriptions, and separate hospital systems. Patients and families may have trouble finding a useful history at the point of care, and sharing records can be difficult to control.

## Solution

MediTrail provides a patient profile with medical problems, severity history, hospital visits, appointments, and file attachments. Patients can add family relations, manage each person’s profile, and control sharing for each problem. A password-protected clinician search shows only the patient information and problems that are shared.

## Demo video

[Watch the MediTrail demo video](https://drive.google.com/drive/folders/1hPbl10EBuQLqBPoOOUcejUnffzhCIrxy?usp=drive_link)

## Features

- New and existing patient account flows with password-based sign-in.
- Patient profile, prior complications, and profile photo.
- Add and switch between family relation profiles.
- Track medical problems, stop and resume tracking, and chart severity history.
- Organize records by hospital; add or edit visit details, symptoms, clinician name, severity, and hospital stay.
- Attach one prescription and multiple named medical record files to a visit.
- Add and edit future appointments, with a calendar and visibility control.
- Set sharing independently for each medical problem.
- Clinician search by patient username and password; only shared problems and related records are returned.
- Light and dark themes.

## Technology

- **Frontend:** React, TypeScript, Vite, React Router, Recharts.
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy async.
- **Database:** SQLite for local development; PostgreSQL (Supabase) for hosted deployment.
- **Hosting:** Render static site for the frontend and Render web service for the API.

## Repository layout

```text
Meditrial/
├── backend/       # FastAPI application and database models
├── frontend/      # React + Vite application
├── MediTrail-App/ # Older prototype; not used by the current Render Blueprint
├── render.yaml    # Render Blueprint
└── DEPLOYMENT.md  # Supabase + Render deployment notes
```

Run commands below from the Git repository root (the directory containing this `Meditrial` folder).

## Run locally

Requirements: Git, Python 3.12, and Node.js with npm.

### 1. Start the API

PowerShell:

```powershell
cd Meditrial/backend
Copy-Item .env.example .env
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install .
uvicorn app.main:app --reload
```

The backend uses the local SQLite database by default. Its API health endpoint is `http://localhost:8000/health`; interactive API documentation is at `http://localhost:8000/docs`.

### 2. Start the frontend

Open a second terminal at the repository root:

```powershell
cd Meditrial/frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Use the app’s **New user** flow to create a test account; no demo account is pre-seeded. The frontend `.env.example` points to the local API at `http://localhost:8000/api/v1`.

On macOS or Linux, activate the virtual environment with `source .venv/bin/activate` instead of the PowerShell activation command.

## Deploy with Supabase and Render

The Render Blueprint is located at `Meditrial/render.yaml` (relative to the GitHub repository root).

1. Create a Supabase PostgreSQL project. From **Connect**, copy the **Session pooler** URI. Use the project’s database password; URL-encode special characters and require SSL with `?sslmode=require`.
2. Push the repository to GitHub.
3. In Render, create a **Blueprint** connected to the repository and set **Blueprint Path** to `Meditrial/render.yaml`.
4. After Render creates `meditrail-api`, set its `DATABASE_URL` environment variable to the Supabase PostgreSQL URI. Keep this value secret. The API creates its database tables at startup.
5. Wait for both `meditrail-api` and `meditrail-ui` to show **Live**. Open the static site URL and test with fictional data.

The Blueprint configures the frontend to call `https://meditrail-api.onrender.com/api/v1` and allows the default frontend origin `https://meditrail-ui.onrender.com`. If Render assigns different service URLs, update `VITE_API_URL` on the frontend and `CORS_ORIGINS` on the API, then redeploy.

See [DEPLOYMENT.md](Meditrial/DEPLOYMENT.md) for additional deployment notes and free-tier limitations. Render’s free API service may sleep when idle. Use Supabase, not local SQLite, for deployed data because Render’s local filesystem is ephemeral.

## Security and data limits

Patient passwords are hashed by the API. Clinician access in this demo is verified with the patient’s username and password; this is not a verified clinician identity system. File attachments are currently stored with profile data in the database and uploads are limited by the app. This setup is for demonstration with fictional data, not production clinical records.
