=# STEMSAGE Web Platform

Full-stack web application, administrative content management dashboard, and API backend for **STEMSAGE Techworld**, enabling STEM education, hands-on workshops, course management, educational products, and community blogs.

---

## Architecture Overview

```
Stemsage_Website/
├── backend/          # Node.js / Express REST API & MongoDB Data Layer
├── frontend/         # Public React 19 Client Website (Vite + Tailwind CSS v4)
├── admin/            # Administrative Content Management Dashboard (React 19 + Vite)
└── docs/             # Product and navigation documentation
```

- **Backend (`backend/`)**: Express 5 REST API connecting to MongoDB via Mongoose. Features role-based access control (RBAC), JWT authentication, Google OAuth verification, Cloudinary media storage, nodemailer contact dispatching, and rate limiting.
- **Frontend (`frontend/`)**: Public website featuring dynamic data integration with graceful offline/outage fallbacks for all content sections (courses, products, services, testimonials, news highlights, gallery, associations, innovations, and blogs).
- **Admin App (`admin/`)**: Dedicated administrative dashboard with authentication, interactive data tables, Zod-validated forms, image uploads, and live status toggles for all content types.

---

## Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for a complete, step-by-step deployment guide for teammates who own the Vercel account and are new to this project.

---

## Environment Variables

Copy each `.env.example` to `.env` in the respective directory:

### 1. Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB connection string (Required) | `mongodb://localhost:27017/stemsage` |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | Secret key for JWT signing & verification (Required) | `your_jwt_secret` |
| `JWT_EXPIRE` | Token validity duration | `7d` |
| `FRONTEND_URL` | Allowed origin(s) for frontend CORS (comma-separated) | `http://localhost:5173` |
| `ADMIN_ORIGIN` | Allowed origin(s) for admin CORS (comma-separated) | `http://localhost:5174` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | `your_google_client_id` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API access key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API access secret | `your_api_secret` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port (`587` for STARTTLS, `465` for SSL) | `587` |
| `EMAIL_USER` | SMTP username / address | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | SMTP password or app-specific password | `your_app_password` |
| `CONTACT_EMAILS` | Target recipient email for contact enquiries | `info@example.com` |
| `ADMIN_EMAIL` | Email used by `scripts/createAdmin.js` | `your_admin_email@example.com` |
| `ADMIN_PASSWORD` | Password used by `scripts/createAdmin.js` | `your_secure_password` |

### 2. Frontend (`frontend/.env`)

> `frontend/src/services/apiClient.js` reads `VITE_API_URL` as the root host and appends `/api/...` paths itself in every service call, so **do not** include `/api` in this value.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Root URL of backend (no `/api` suffix) | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for sign-in button | `your_google_client_id` |

### 3. Admin (`admin/.env`)

> `admin/src/services/api.js` uses `VITE_API_URL` directly as the axios `baseURL`. Admin service calls do **not** append `/api` themselves, so the value must include the `/api` suffix.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL prefix for admin client (include `/api`) | `http://localhost:5000/api` |

---

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Admin dependencies
cd ../admin && npm install
cd ..
```

### Step 2: Initialize Database and Admin Account
```bash
# Seed initial content (dry run preview)
cd backend && npm run seed:content:dry-run

# Seed initial content to MongoDB
npm run seed:content

# Create or promote admin user
node scripts/createAdmin.js
```

### Step 3: Run Development Servers
In separate terminal windows:
```bash
# Terminal 1: Backend API (port 5000)
cd backend && npm run dev

# Terminal 2: Public Frontend Website (port 5173)
cd frontend && npm run dev

# Terminal 3: Admin Dashboard (port 5174)
cd admin && npm run dev
```

---

## Production Build & Verification

```bash
# Build frontend
cd frontend && npm run build

# Build admin dashboard
cd ../admin && npm run build

# Start production backend
cd ../backend && npm start
```

---

## Using the Admin Panel

Navigate to the admin URL (e.g., `http://localhost:5174` locally) and log in with the credentials set via `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Content Types
The admin panel manages the following content types, each with its own page accessible from the sidebar:

| Content Type | Public Site Section |
| :--- | :--- |
| Products | Shop / Products section |
| Services | Services section |
| Courses | Courses section |
| Testimonials | Testimonials / Reviews section |
| News | News & Highlights section |
| Gallery Images | Gallery section |
| Association Logos | Associations / Partners section |
| Innovations | Innovations section |
| Blogs | Blog section |
| Contact Messages | Enquiries from the contact form |

### Common Operations

**Adding content** — On any content page, click the **Add** (or **+**) button to open the form modal. Fill in all required fields and click Save. The item appears on the public site immediately.

**Editing content** — Click the **edit icon** on any row in the data table to reopen the form modal pre-populated with existing values. Update fields and save.

**Hiding / showing content (Active toggle)** — Every content item has an **active** toggle switch. Turning it off removes the item from the public-facing site instantly — no code change or redeployment needed. Turning it back on restores the item. Use this to temporarily hide items without deleting them.

**Deleting content** — Click the **delete icon** on a row. A confirmation dialog appears before the record is permanently removed.

**Uploading images** — The form modal for image-bearing content types includes an image uploader. Supported formats: JPG, PNG, WebP, GIF (max 5 MB). Images are stored on Cloudinary and their URL is saved to the database automatically.

**Order field** — Where present, the **order** field is a number that controls the sort position of an item on the public-facing site. Lower numbers appear first. Use it to reorder items without deleting and re-creating them.

### Contact Messages
The **Messages** (or **Enquiries**) page lists all contact form submissions.

- **Mark as read** — Toggle the read/unread status to track which messages have been reviewed.
- **Delete** — Permanently remove a message once it has been handled.

No items on the admin panel require a code change to take effect on the public site — all changes are reflected immediately via the API.

---

## Security Checklist

Before going live, verify each of the following:

- **Strong `ADMIN_PASSWORD`** — Use a long, random password that is not a dictionary word. Store it in a password manager, not in plain text.
- **New `JWT_SECRET` in production** — Generate a fresh, random secret (e.g., `openssl rand -hex 64`). Never reuse a development secret in production.
- **MongoDB IP allowlist** — In MongoDB Atlas (or your self-hosted setup), restrict incoming connections to your backend server's IP address only. Use a dedicated database user with read/write access to the application database only — not a root or admin account.
- **HTTPS only** — Serve all three apps (frontend, admin, backend) over HTTPS in production. Never expose the API on plain HTTP in a production environment.
- **Rotate Cloudinary keys if exposed** — If your Cloudinary API key or secret was ever committed to version control or logged, regenerate the keys in the Cloudinary dashboard and update your environment variables immediately.
- **Never commit `.env` files** — `.env` files are listed in `.gitignore`. Before every push, run `git status` and confirm no `.env` files appear as staged or untracked.
- **`NODE_ENV=production`** — Set this on the backend host to disable debug output and enable production-mode optimisations.

---

## Deployment Guidelines

### Frontend & Admin (Vercel)
Both `frontend/` and `admin/` contain `vercel.json` with SPA route rewrites:
- Deploy `frontend/` as a static/Vite project with root directory set to `frontend`.
- Deploy `admin/` as a static/Vite project with root directory set to `admin`.
- Configure `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in Vercel project settings.

### Backend (Node.js Host)
- Deploy `backend/` to any Node.js container or cloud host (Render, Railway, Fly.io, AWS, DigitalOcean).
- Set `NODE_ENV=production`.
- Configure all backend environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `ADMIN_ORIGIN`, Cloudinary, SMTP).
- `FRONTEND_URL` and `ADMIN_ORIGIN` support comma-separated lists of production and staging origins.

### Production Go-Live Steps

**(a) Google OAuth — add live domains**
In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth Web Client ID, add both the live frontend URL and the live admin URL to **Authorized JavaScript origins**. Without this, Google sign-in will be blocked on the production domains.

**(b) Backend CORS — set live origins**
On your backend host, set:
```
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_ORIGIN=https://your-admin-domain.com
```
Both variables accept comma-separated values if you need to allow multiple domains (e.g., a staging origin alongside production).

**(c) Frontend & admin — set live API URL**
In Vercel project settings, set `VITE_API_URL` for each project:
- **Frontend Vercel project**: `https://api.yourdomain.com` *(no `/api` suffix — the frontend appends it per request)*
- **Admin Vercel project**: `https://api.yourdomain.com/api` *(include `/api` — the admin client uses this as its axios baseURL)*

**(d) Seed production content**
With production environment variables active, run once against the production database:
```bash
cd backend && npm run seed:content
```

**(e) Create the production admin user**
With production environment variables active (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), run once:
```bash
cd backend && node scripts/createAdmin.js
```
This creates or promotes the admin account. After this step the admin panel is ready to use at the live admin URL.
