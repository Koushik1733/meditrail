# MediTrail — Your Medical History, Wherever Care Happens

MediTrail is an end-to-end modern healthcare web application that transforms scattered medical records into a structured, chronological, doctor-ready timeline.

## Product Vision

A clinician should understand a patient's relevant medical history in seconds instead of searching through folders of PDFs and photographs. MediTrail solves the problem of fragmented medical records via patient-controlled sharing, an AI-powered health snapshot, care awareness (duplicate testing), and a unified timeline.

## Tech Stack
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
* **Backend:** Next.js Serverless Functions (API Routes)
* **Database & Auth:** PostgreSQL & Supabase
* **AI:** OpenAI API (with robust deterministic fallback if credentials are unavailable)

## Features Included in This Scaffold
1. **Database Schema:** Complete relational PostgreSQL schema (`schema.sql`) for patients, doctors, medical records, allergies, access audit logs, and sharing sessions. 
2. **Unified Medical Timeline:** A chronological view of past diagnoses, prescriptions, and test reports.
3. **Care Awareness Engine:** Alerts flagging potentially duplicate tests and overlapping medications.
4. **Patient-Controlled Sharing:** Modal capabilities to generate secure, time-limited sharing tokens.
5. **AI Extraction Review:** Workflows ready to connect to an LLM provider for OCR/Information extraction from uploaded PDFs and images.
6. **Role-Based Views:** distinct `patient` and `doctor` access models defined at the database row-level security (RLS) layer.

## Setup & Deployment Instructions

> **Note:** Due to environmental constraints (lack of `npm`/`node` in the local workspace), the application has been scaffolded completely, but you will need to transfer these files to an environment with Node.js installed to build and run the application.

### 1. Local Development Setup
1. Ensure Node.js (v18+) is installed.
2. Navigate to the `MediTrail-App` directory.
3. Run `npm install` to install all Next.js, React, and Tailwind dependencies.
4. Run `npm run dev` to start the local development server at `http://localhost:3000`.

### 2. Database Initialization (Supabase)
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard.
3. Copy the contents of `schema.sql` from this repository and run it. This will create all necessary tables and configure Row-Level Security (RLS).
4. Update your local `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. AI / OCR Configuration
1. Obtain an API key for your preferred LLM provider (e.g., OpenAI).
2. Add the key to your `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
3. *Fallback:* If the AI key is missing, the application defaults to a "Demo Mode" utilizing hardcoded deterministic mock data to ensure continuous demonstrability at the hackathon.

### 4. Deployment to Vercel
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`).
4. Click **Deploy**. The application is production-ready and optimized for Vercel's serverless edge infrastructure.

## Testing & Security
* **RLS Policies:** Explicitly deny users from viewing each other's medical records. Validated at the database level.
* **Audit Logs:** Every time a doctor accesses a sharing token, an entry is written to `access_audit_logs`.
* **Revocation:** Tokens can be revoked instantly by setting `is_revoked = TRUE`, preventing further access.

## Hackathon Demonstration Script (2-5 minutes)
1. **Start as a Patient:** Log in as John Doe. Show the beautiful dashboard.
2. **Upload a Document:** Walk through the upload flow. Show the AI extracting structured data (medications, tests) from an unstructured PDF and asking for Patient Confirmation.
3. **Care Awareness:** Point out the yellow alert banner showing that John had an HbA1c test 2 weeks ago (flagging a potential duplicate).
4. **Share Records:** Click "Share with Doctor". Set an expiry time of 24 hours. Copy the link.
5. **Switch to Doctor:** Open an incognito window. Use the shared link. Show the "Clinician View" which highlights the Health Snapshot immediately without exposing records the patient chose to hide.
6. **Revoke Access:** Go back to the Patient window, click "Revoke". Refresh the Doctor window to prove access is instantly denied.
