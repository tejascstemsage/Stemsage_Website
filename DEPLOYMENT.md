# DEPLOYMENT

## Overview

```
Stemsage_Website/
├── backend/          # Node.js / Express REST API on your cloud host (MongoDB + JWT, etc.)
├── frontend/         # Public React Website (Vercel) - serves at https://&lt;site-domain&gt;/
├── admin/            # Admin Dashboard (Vercel) - serves at https://&lt;site-domain&gt;/admin
└── docs/             # Product and navigation documentation
```

**Final URLs:**
- Public site: `https://<site-domain>`
- Admin panel: `https://<site-domain>/admin`
- Backend API: `https://<backend-domain>/api/health`

## Before you start (checklist)

### Accounts & Access Needed

| Role | Account/Access Required | Primary Holder |
| :--- | :--- | :--- |
| **Vercel** | Vercel account with write access to this repository | Your team admin or you (if you own Vercel) |
| **GitHub** | Repo write access, ability to create deployments and set environment variables | Your GitHub team admin |
| **Backend Host** | Cloud server (Render, Railway, Fly.io, etc.) with Node.js and MongoDB Atlas access | DevOps or you |
| **MongoDB Atlas** | MongoDB Atlas cluster, read/write user, network access setup | DevOps or you |
| **Cloudinary** | Cloudinary account and cloud name | DevOps or you |
| **Google Cloud** | Google Cloud project and OAuth Client ID (for Google Sign-In) | DevOps or you |
| **Email/SMTP** | SMTP credentials for nodemailer (if using email sending) | DevOps or you |

### Prerequisites
- You have write access to the GitHub repository and Vercel account
- You have a cloud server or are willing to use a free-tier host like Render or Railway
- You have MongoDB Atlas account and can configure network access
- You have Google Cloud credentials to create the OAuth Client ID

## Step 1, MongoDB Atlas

1. **Sign up for MongoDB Atlas**
   - Visit https://www.mongodb.com/atlas and create an account
   - Create a new cluster (any edition, e.g., M0 Free)

2. **Get your cluster connection string**
   - Go to "Connect" in your Atlas dashboard
   - Select "Create a new database user"
   - Add the new user’s IP address:
     - For Render/Railway (free tiers): `0.0.0.0/0` (less secure, but for demo)
     - For production: the exact backend server IP (found in your cloud host dashboard)
   - Copy the full connection string (e.g., `mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster&gt;.mongodb.net/stemsage`)

3. **Save the connection string**
   - This will go into your backend `.env` later

## Step 2, Deploy the backend (Render as primary example)

1. **Log into Render and create a new Web Service**
   - Go to [dashboard.render.com](https://dashboard.render.com) and sign in
   - Click "New Web Service" → connect your repository (select this repo and the `backend/` subdirectory)

2. **Build settings (match backend/package.json)**
   - Build Command: `npm install` (Render auto-runs `npm install` by default; confirm if needed)
   - Start Command: `npm start`
   - Node version: Use the latest stable LTS

3. **Environment variables for Production** *(every row is required)*

| Variable | Required? | What it is | Example placeholder |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | Yes | MongoDB Atlas connection string (full URI, includes password) | `mongodb+srv://admin:ADMIN_PASSWORD@cluster0.abc123.mongodb.net/stemsage` |
| `PORT` | Yes | HTTP port the backend will listen on | `5000` |
| `NODE_ENV` | Yes | Runtime mode (set to `production`) | `production` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens | `openssl rand -base64 48` |
| `JWT_EXPIRE` | No | Token validity (e.g., `7d` = 7 days) | `7d` |
| `FRONTEND_URL` | Yes | Your public website origin (no trailing slash) | `https://&lt;site-domain&gt;` |
| `ADMIN_ORIGIN` | Yes | Your public admin panel origin (no trailing slash) | `https://&lt;site-domain&gt;/admin` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Web Client ID | `123456789-abc123xyz@developer.googleusercontent.com` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `dt8jhn4xj` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abcdefghijklmnopqrstuv` |
| `EMAIL_HOST` | Yes | SMTP server host (e.g., Gmail, SendGrid) | `smtp.gmail.com` |
| `EMAIL_PORT` | Yes | SMTP port (`587` for STARTTLS, `465` for SSL) | `587` |
| `EMAIL_USER` | Yes | SMTP username / address | `noreply@&lt;site-domain&gt;.com` |
| `EMAIL_PASSWORD` | Yes | SMTP password or app-specific password | `your_smtp_password` |
| `CONTACT_EMAILS` | Yes | Recipient email for contact form submissions | `info@&lt;site-domain&gt;.com` |
| `ADMIN_EMAIL` | Yes | Email used to create the admin user (`scripts/createAdmin.js`) | `admin@&lt;site-domain&gt;.com` |
| `ADMIN_PASSWORD` | Yes | Password for the admin user (strong, never reuse dev passwords) | `STRONG_ADMIN_PASSWORD` |

4. **Optional production notes**
   - **First request slow**: Free-tier hosts may sleep; the first request after a sleep can take 30-60 seconds as the container starts.
   - **Health check**: Your backend exposes `/api/health`. After deployment, verify: `curl -I https://<backend-domain>/api/health` should return `200 OK` with `{ success: true, message: "STEMSAGE backend is running" }`.

## Step 3, Create the admin account and load content

1. **Run the admin creator script once**
   ```bash
   cd backend && node scripts/createAdmin.js
   ```
   - This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your production `.env`
   - It **creates or promotes** the user to the `admin` role (stores password as bcrypt)
   - Choose a **strong password** (never reuse a development password)

2. **Seed initial content (run once per production DB)**
   ```bash
   # 1. Preview first (recommended)
   cd backend && npm run seed:content:dry-run
   # 2. Run actual seed (after review)
   cd backend && npm run seed:content
   ```
   - `--dry-run` prints what would happen without touching DB
   - Real `seed:content` loads data from `frontend/src/data/` into MongoDB
   - **Important**: This uploads demo images to Cloudinary (only run once per production DB)

3. **Manual alternative**: If you prefer, you can use the UI to create the admin user after deployment, then manually import content via the admin UI.

## Step 4, Vercel settings (single project, root directory)

1. **Go to your Vercel dashboard → Projects → Add New**
   - Choose **Manually import** → Connect your GitHub repo (`Stemsage_Website`)

2. **Project configuration**
   - **Root Directory**: Leave empty (repo root) → Vercel will serve files from `frontend/dist` as output
   - **Install Command**: `npm run install:all` *(runs both `frontend/` and `admin/` `npm install`)*
   - **Build Command**: `npm run build` *(see scripts/build-all.mjs)*
   - **Output Directory**: `frontend/dist`

3. **Environment variables for Production** *(set each in Vercel UI under Settings → Environment Variables)*

| Variable | What it is | How to set (with placeholders) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Root URL of backend (no `/api` suffix — the frontend adds `/api` itself) | `https://<backend-domain>` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (for Google Sign‑In button) | `123456789-abc123xyz.apps.googleusercontent.com` |

> **Note**: Vercel environment variables apply **only to new deployments**. To update an existing production deployment, redeploy from Git or change the variable in Vercel UI and trigger a new deploy.

## Step 5, Google sign-in

1. **Go to Google Cloud Console**
   - Open [console.cloud.google.com](https://console.cloud.google.com)
   - Select or create a project (e.g., `&lt;site-domain&gt;-gcp`)

2. **Enable APIs & Services**
   - Search for "Google Identity Platform" or "Google+ API" → enable

3. **Create OAuth 2.0 Client ID**
   - Go to "Credentials” → "Create Credentials” → "OAuth 2.0 Client ID" → "Web application"
   - Add **Authorized JavaScript origins**:
     - `https://<site-domain>`
     - `https://<site-domain>/admin`
   - Add **Redirect URIs** (if using Google sign‑in with redirect flow):
     - `https://<site-domain>/google-callback`
     - `https://<site-domain>/admin/google-callback`
   - Save

4. **Copy the Client ID**
   - Paste into Vercel `VITE_GOOGLE_CLIENT_ID` environment variable

## Step 6, Go live order (this order matters)

1. **Deploy backend first**
   - Complete Step 2 and verify `/api/health` returns 200 OK

2. **Set Vercel environment variables**
   - Add both `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in Vercel UI
   - These variables apply to **new** Vercel deployments only

3. **Tag the release**
   ```bash
   git tag stable-before-admin
   git push origin stable-before-admin
   ```
   - This tag helps you rollback if something breaks after admin changes

4. **Push and deploy main**
   - Push your changes to `main` branch
   - Trigger a new Vercel deployment (it will run `npm run install:all && npm run build`)
   - This copies `admin/dist` into `frontend/dist/admin` via `scripts/build-all.mjs`

5. **Verify publicly**
   - Visit `https://<site-domain>` (should show public site)
   - Visit `https://<site-domain>/admin` (should redirect to login if not authenticated)
   - Confirm both frontends load and API calls reach the backend

### Rollback if needed
- Revert Vercel environment variables or rollback the tag
- Fix backend issues and redeploy backend first
- Update Vercel env vars and push again

## Resources & troubleshooting

- **Render docs**: https://render.com/docs/web-services
- **Vercel docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2/web-server

### Common issues
- **First backend request slow**: Wait up to 60 seconds after deploy; free-tier hosts cold-start.
- **CORS errors**: Ensure `FRONTEND_URL` and `ADMIN_ORIGIN` exactly match your deployed domains (protocol, subdomain, port).
- **Admin cannot log in**: Double-check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in backend `.env`.
- **Frontend 404 after deploy**: Verify Vercel output directory is `frontend/dist` and that admin assets are present under `admin/` in the output.

Good luck! If something is unclear, ask for clarification.