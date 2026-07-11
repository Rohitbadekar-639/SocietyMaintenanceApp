# Deploy SocietyWale — Vercel (frontend) + Render (backend Docker) + Neon (DB)

One **GitHub monorepo**. Custom domain: **SocietyWale.in** (GoDaddy).

```
SocietyMaintenanceApp/                 ← single GitHub repo
├── frontend/                          → Vercel (+ SocietyWale.in)
├── backend/identity-service/          → Render Web Service (Docker)
├── backend/core-service/              → Render Web Service (Docker)
├── render.yaml                        → optional Render blueprint
└── neon/                              → SQL scripts for Neon
```

| Layer | Platform | Notes |
|-------|----------|--------|
| Frontend | **Vercel** (free) | SPA + custom domain |
| Backend ×2 | **Render** Docker (free) | Sleeps when idle; cold start ~30–60s |
| Database | **Neon** PostgreSQL (free) | One DB is fine (`Societywale`) |
| Domain | **GoDaddy** → point to Vercel | Apex + `www` |

---

## A) GitHub email ≠ Vercel/Render email (important)

You do **not** need the same Gmail on GitHub, Vercel, and Render.

What matters is: **which GitHub account owns / can access the repo**.

### Recommended (simplest)

1. Keep the repo on GitHub (`himanshu2devi/SocietyMaintenanceApp` or wherever it lives).
2. Sign into **Vercel** and **Render** with `rohitbadekar3@gmail.com`.
3. In each product, **connect GitHub** and authorize access to that repo:
   - **Vercel** → Settings → Git → Connect GitHub → grant access to `SocietyMaintenanceApp`
   - **Render** → Account Settings → GitHub → Connect / Configure → allow that repo
4. If the repo is under `himanshu2devi` and you signed into GitHub as someone else during OAuth, either:
   - Log into GitHub as `himanshu2devi` when Vercel/Render asks to authorize, **or**
   - Invite `rohitbadekar3`’s GitHub user as a collaborator on the repo, **or**
   - Transfer / mirror the repo to a GitHub account you control with the new email.

### Alternative

Create a new GitHub account with `rohitbadekar3@gmail.com`, push this project there, then import **that** repo into Vercel and Render.

---

## B) Before deploy

- [ ] Code pushed to GitHub (`main`)
- [ ] Neon project ready (you already use `Societywale`)
- [ ] Same `JWT_SECRET` for **both** Render services
- [ ] Vercel + Render accounts created

Generate a strong JWT secret (PowerShell):

```powershell
cd C:\Z_Business\society-app\SocietyMaintenanceApp
.\scripts\generate-secrets.ps1
```

Or:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## C) Neon database

You already run **one** Neon database (`Societywale`) for both services. Keep that for free tier.

Ensure migrations / tables exist (run any pending `neon/V*.sql` in Neon SQL Editor if not already applied).

JDBC URL shape (pooler recommended):

```
jdbc:postgresql://ep-xxxx-pooler.region.aws.neon.tech/Societywale?sslmode=require
```

Save:

| Key | Value |
|-----|--------|
| `DB_URL` | JDBC URL above |
| `DB_USER` | Neon user (e.g. `neondb_owner`) |
| `DB_PASSWORD` | Neon password |

**Use the same `DB_*` on both Render services** (same DB).

---

## D) Render — Identity service (Docker)

You are already on **New Web Service**. Fill it like this:

| Field | Value |
|-------|--------|
| Source | GitHub repo `SocietyMaintenanceApp` |
| Name | `societywale-identity` |
| Language | **Docker** |
| Branch | `main` |
| **Root Directory** | `backend/identity-service` |
| Region | Singapore / closest to you |
| Instance | Free |

Then open **Environment** and add:

| Key | Value |
|-----|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRET` | *(same secret on both services)* |
| `DB_URL` | Neon JDBC URL |
| `DB_USER` | Neon username |
| `DB_PASSWORD` | Neon password |
| `APP_CORS_ORIGINS` | `https://societywale.in,https://www.societywale.in,http://localhost:5173` |

(You can temporarily use only your Vercel URL first, then add the custom domain.)

Deploy → wait for build (Maven Docker build can take several minutes).

Copy public URL, e.g.:

```
https://societywale-identity.onrender.com
```

Health check:

```
https://societywale-identity.onrender.com/actuator/health
```

Expect `{"status":"UP"}`.

---

## E) Render — Core service (Docker)

**New Web Service** again from the **same** repo:

| Field | Value |
|-------|--------|
| Name | `societywale-core` |
| Language | **Docker** |
| **Root Directory** | `backend/core-service` |
| Branch | `main` |
| Instance | Free |

Same env vars as identity (`JWT_SECRET` **must match**):

| Key | Value |
|-----|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRET` | *identical to identity* |
| `DB_URL` | same Neon JDBC URL |
| `DB_USER` | same |
| `DB_PASSWORD` | same |
| `APP_CORS_ORIGINS` | same list as identity |

Health:

```
https://societywale-core.onrender.com/actuator/health
```

---

## F) Vercel — Frontend

1. [vercel.com](https://vercel.com) → **Add New Project** → Import `SocietyMaintenanceApp`
2. Configure:

| Setting | Value |
|---------|--------|
| Framework Preset | Vite |
| **Root Directory** | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. **Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `VITE_IDENTITY_URL` | `https://societywale-identity.onrender.com/api/v1` |
| `VITE_CORE_URL` | `https://societywale-core.onrender.com/api/v1` |

No trailing slash after `v1`.

4. Deploy → copy URL, e.g. `https://society-maintenance-app.vercel.app`

5. Update **both** Render services `APP_CORS_ORIGINS` to include that Vercel URL, then redeploy / wait for auto restart.

---

## G) Custom domain SocietyWale.in (GoDaddy → Vercel)

Do this **after** frontend works on `*.vercel.app`.

### On Vercel

1. Project → **Settings** → **Domains**
2. Add:
   - `societywale.in`
   - `www.societywale.in`
3. Vercel shows DNS records to create (usually):
   - **A** record for apex `@` → `76.76.21.21` (Vercel’s current IP — use what Vercel shows)
   - **CNAME** for `www` → `cname.vercel-dns.com` (use exact target Vercel shows)

### On GoDaddy

1. GoDaddy → **My Products** → **DNS** for `SocietyWale.in`
2. Remove conflicting A / CNAME / parking / forwarding records for `@` and `www`
3. Add the records **exactly** as Vercel instructs
4. Wait for DNS (often 5–60 minutes; can be up to 24–48h)

### After domain is live

Update Render CORS again:

```
APP_CORS_ORIGINS=https://societywale.in,https://www.societywale.in,https://YOUR-APP.vercel.app,http://localhost:5173
```

Optional: in Vercel Domains, set `societywale.in` as primary and redirect `www` → apex (or the reverse).

---

## H) End-to-end checklist

1. Identity health UP  
2. Core health UP  
3. Open Vercel URL → Register society / Login  
4. Admin + member flows work  
5. Attach `societywale.in`  
6. Test on custom domain  
7. CORS updated for custom domain  

### Redeploy

- Push to `main` → Vercel and Render auto-deploy if connected.

### Free-tier notes

| Topic | Reality |
|-------|---------|
| Render free | Services **sleep** when idle; first hit is slow |
| Neon free | One DB; may suspend inactive projects |
| Vercel free | Fine for this SPA |
| Production later | Paid Render / always-on JVM if customers complain about cold starts |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Render build fails | Logs → Root Directory must be `backend/identity-service` or `backend/core-service` |
| Health never green | Check `DB_URL` / password; ensure `sslmode=require` |
| CORS errors | `APP_CORS_ORIGINS` must include exact frontend origin (`https://societywale.in`) |
| Login fails live | Same `JWT_SECRET` on both services |
| Frontend calls localhost | Set `VITE_*` in Vercel and **redeploy** (env is baked in at build time) |
| Domain not resolving | Wait on DNS; disable GoDaddy forwarding; use Vercel DNS values only |
| Blank `about:blank` PDF | Already fixed — use latest frontend with jsPDF download |
| GitHub repo not listed | Connect correct GitHub account / grant Vercel-Render access to the repo |

---

## Local development (unchanged)

```powershell
# Neon env for backends
.\scripts\start-backend-neon.ps1 -Service identity
.\scripts\start-backend-neon.ps1 -Service core

cd frontend
npm run dev
```

Open http://localhost:5173

---

## Files added for this deploy path

| File | Purpose |
|------|---------|
| `backend/identity-service/Dockerfile` | Identity Docker image |
| `backend/core-service/Dockerfile` | Core Docker image |
| `render.yaml` | Optional Render blueprint |
| `frontend/vercel.json` | SPA rewrites for Vite |
| `frontend/.env.production.example` | Env template for Vercel |
