# MedicalPKM — Monorepo

## Project Overview
Monorepo for the MedicalPKM Digital Hub — the parent project for all apps in the medicalpkm.com ecosystem. Contains the Portal Worker (homepage, Admin Console, embedded apps, D1 database) and the KOL Brief Generator (Next.js app on Vercel).

## Architecture
```
medicalpkm.com (Portal Worker — worker.js)
├── /admin/ ................... Admin Console (user mgmt, roles, app permissions)
├── / ......................... Portal homepage (app directory)
├── /apps/shared/fountain-pen/ . Fountain Pen Companion (embedded SPA)
├── /apps/private/ ............ Cthulhu Investigator (embedded, permission-gated)
├── /sandbox/ ................. Sandbox / experiments
├── /api/admin/* .............. Admin API (users, roles, permissions)
├── /api/fp/* ................. Fountain Pen D1 API (permission-gated)
├── /api/fp/check-access ...... FP permission check endpoint
├── /api/fp/export/obsidian ... Obsidian Markdown export
│
kol.medicalpkm.com (KOL Brief Generator — apps/kol/)
├── / ......................... Brief library (homepage)
├── /generate ................. Brief generation form
├── /batch .................... CSV batch generation
├── /briefs/:id ............... Individual brief viewer
├── /api/generate-brief ....... Claude API + PubMed → SSE streaming
├── /api/briefs ............... Brief CRUD (Vercel KV)
├── /api/me ................... Current user context from JWT
└── /api/npi .................. NPI registry lookup
```

## Repo Structure
```
medicalpkm-portal/
├── worker.js ............. Portal Cloudflare Worker (~7,900 lines)
├── wrangler.toml ......... Worker config (routes, D1 binding)
├── migrations/ ........... D1 schema migrations
├── scripts/ .............. Multi-machine sync, setup, Obsidian export
├── .gitignore
├── CLAUDE.md ............. This file
└── apps/
    └── kol/ .............. KOL Brief Generator (Next.js, deploys to Vercel)
        ├── src/app/ ...... Pages + API routes
        ├── src/components/ UI components
        ├── src/lib/ ...... Core libraries (auth, KV, prompts, PDF, etc.)
        ├── src/middleware.ts CF Access JWT verification
        ├── package.json
        └── .env.local .... Secrets (gitignored)
```

## Deployment

**Portal** (Cloudflare Worker):
```bash
cd ~/medicalpkm-portal
node -c worker.js && npx wrangler deploy   # Always validate syntax first!
```
Deploys to: medicalpkm.com + www.medicalpkm.com

**KOL** (Vercel — auto-deploys on push to main):
```bash
cd ~/medicalpkm-portal/apps/kol
npm run dev          # Local development (localhost:3000)
npm run build        # Verify TypeScript compiles before committing
```
Deploys to: kol.medicalpkm.com
- Vercel Root Directory: `apps/kol`
- Ignored Build Step: `git diff --quiet HEAD^ HEAD -- apps/kol/` (skips build if only portal files changed)
- Commits on main MUST use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` or Vercel webhook won't fire

## Account IDs
- **Cloudflare Account:** 720188182d247df529ed121b3ddb59e6
- **Cloudflare Zone:** be92d1c4d36e3d63e7f8211234b59e0f
- **Worker name:** medicalpkm
- **GitHub:** kevinully2000-a11y/medicalpkm-portal
- **D1 Database:** medicalpkm-fp (ID: 827127ef-961f-40b2-96c0-80d23d62ded7)
- **Vercel Team:** kevinully2000-7619s-projects
- **Google Cloud Project (headshots):** kol-headshot-search (CX: e6261e785f17446af)

## Cloudflare Access (Zero Trust)
- **Team domain:** medicalpkm.cloudflareaccess.com
- **App ID:** dbf6d196-faeb-4403-9acc-92469c67ef64
- **Policy:** Allow whitelisted emails (kevin.ully2000@gmail.com + VuMedi team)
- **Identity Providers:** Google OAuth + One-Time PIN
- **Logout URL:** https://medicalpkm.cloudflareaccess.com/cdn-cgi/access/logout
- **Super Admin email:** kevin.ully2000@gmail.com
- **Admin emails:** bschubsky@gmail.com, bschubsky@vumedi.com

---

## Portal Worker

### Admin Console (v0.2.0)
Full user and permission management at `/admin/`.

**Features:**
- **User management:** Add/remove users with email + role (User/Admin/Super Admin)
- **App permissions:** Clickable chip toggles per user (KOL, FP, Cthulhu) — blue = access, gray = no access
- **Three-level permission enforcement:**
  1. Server-side page gate: unauthorized users get a themed "no access" page
  2. API gate: `/api/fp/*` returns 403 for unauthorized users
  3. Client-side check: FP app calls `/api/fp/check-access` on load, shows "Access Revoked" overlay
- **Access Denied page:** Shows which email is logged in + "Switch Account" link
- **Log Out link** in admin nav bar

### D1 Database
SQLite at the edge — stores pen/ink data and admin tables.

**Tables:** `pens`, `inks`, `pairings`, `dropdowns`, `users`, `app_permissions`
**Migrations:** `migrations/0001_initial.sql`, `migrations/0002_admin.sql`

```bash
npx wrangler d1 execute medicalpkm-fp --remote --command "SELECT count(*) FROM pens"
npx wrangler d1 execute medicalpkm-fp --remote --file=migrations/0003_whatever.sql
```

### Admin API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users with app permissions |
| POST | `/api/admin/users` | Add user (email, role, apps) |
| PUT | `/api/admin/users/:email` | Update role and/or app permissions |
| DELETE | `/api/admin/users/:email` | Remove user + all permissions |

### FP API Endpoints (permission-gated)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/fp/check-access` | Check if current user has FP permission |
| GET/POST/PUT/DELETE | `/api/fp/pens` | Pen CRUD |
| GET/POST/PUT/DELETE | `/api/fp/inks` | Ink CRUD |
| GET/POST/DELETE | `/api/fp/pairings` | Pairing CRUD |
| GET | `/api/fp/dropdowns` | Dropdown options |
| POST | `/api/fp/sync` | Bulk import (migration) |
| GET | `/api/fp/export/obsidian` | Export as Obsidian Markdown |

### Worker Route Structure
Routes handled via `pathname.startsWith()` in cascading if-else:
1. `/api/admin/*` → Admin API (returns JSON)
2. `/api/fp/*` → FP D1 API (permission-gated, returns JSON)
3. `/admin/` → Admin Console (admin/super_admin only)
4. `/sandbox/fountain-pen/` → Sandbox FP app (no D1, localStorage only)
5. `/sandbox/` → General sandbox
6. `/apps/private/` → Cthulhu Investigator (permission-gated)
7. `/apps/shared/fountain-pen/` → Production FP app (D1-enabled, permission-gated)
8. `/` (default) → Portal homepage

### Helper Functions (in worker.js)
- `getEmailFromJWT(request)` — Extracts email from CF Access JWT
- `isSuperAdmin(email)` — Checks if email is kevin.ully2000@gmail.com

---

## KOL Brief Generator (apps/kol/)

### Overview
Next.js 16 web app that generates Key Opinion Leader briefs for medical affairs professionals using Claude API + PubMed research. Current version: **v0.5.0**.

### Tech Stack
- **Frontend:** Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4
- **AI:** Anthropic Claude Sonnet 4.5 with `web_search_20250305` tool
- **Research:** PubMed E-utilities API (free, no key, 3 req/sec)
- **Storage:** Vercel KV (Upstash Redis)
- **Auth:** CF Access JWT validated in middleware
- **PDF:** jsPDF + JSZip for batch export
- **Headshots:** Google CSE + Wikipedia API + institution scraping

### Key Files
- `src/app/page.tsx` — Library homepage (brief grid with filters)
- `src/app/generate/page.tsx` — Brief generation form
- `src/app/batch/page.tsx` — CSV batch generation
- `src/app/api/generate-brief/route.ts` — PubMed → Claude API → SSE streaming
- `src/lib/prompts.ts` — Evidence-grounded system + user prompts
- `src/lib/research.ts` — PubMed E-utilities integration
- `src/lib/kv.ts` — Vercel KV operations
- `src/lib/auth.ts` — CF Access JWT extraction (server + client)
- `src/lib/headshot.ts` — Multi-strategy headshot fetcher
- `src/middleware.ts` — CF Access JWT verification + auth bypass

### Environment Variables (apps/kol/.env.local)
- `ANTHROPIC_API_KEY` — Claude API key
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Vercel KV (Upstash Redis)
- `GOOGLE_CSE_API_KEY` / `GOOGLE_CSE_CX` — Google Custom Search for headshots
- `CLOUDFLARE_ACCESS_TOKEN` — CF API token for user management

### KOL Features
- **Evidence-grounded generation:** PubMed pre-fetch + Claude web search (anti-hallucination)
- **Evidence badges:** Color-coded (Verified/Grounded/Limited Data/Caution)
- **Batch generation:** CSV import, sequential generation, cost tracking, ZIP download
- **NPI integration:** NPI registry lookup for physician verification
- **PDF export:** jsPDF with headshot embedding
- **Library filters:** Search by name, date, specialty, institution, version, visibility

### Known Constraints
- Vercel Hobby: 60-second serverless timeout (brief generation streams to stay within)
- Brief generation cost: ~$0.15-0.25/brief (web search + large input tokens)
- PubMed API: free, 3 req/sec, 5-second timeout with graceful degradation
- CF Access preview URLs bypass auth — test auth features on production only
- Always use `printf '%s'` not `echo` when piping env vars to `vercel env add`

---

## Scripts
```bash
# Sync projects between machines
./scripts/sync.sh push    # Before leaving this Mac
./scripts/sync.sh pull    # When arriving on this Mac
./scripts/sync.sh status  # Check all project statuses

# First-time setup on a new machine
./scripts/setup-machine.sh

# Update Obsidian note from D1 data
./scripts/sync-obsidian-fp.sh
```

## Known Issues & Lessons Learned
- **worker.js has duplicate FP code** — sandbox FP (~line 812) and production FP (~line 4323) have nearly identical HTML/JS. The Edit tool often matches both. Use Python with line numbers to target the production version specifically.
- **Template strings contain backticks** — The FP app's embedded JS uses template literals. Be aware of nested backtick escaping.
- **Always `node -c worker.js` before deploying** — esbuild (wrangler) reports line numbers from bundled output, not source.
- **CF Access 302 redirects** — Client-side `fetch()` can get redirected to CF Access login if session expired.
- **Commit author on main** — Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` or Vercel webhook won't fire.

## User Preferences
- **Always explain commands before running them** — the user is learning CLI
- **Commit messages:** Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` on main branch
- **Branching:** Work on feature branches, merge to main for production
- **Two machines:** Mac22 (desktop, primary) and Mac24 (travel laptop)

## Version History
| Tag | Description |
|-----|-------------|
| Portal v0.0.1 | Initial portal extraction from kol-brief-generator |
| Portal v0.1.0 | D1 database, FP API endpoints, sync scripts |
| Portal v0.2.0 | Admin Console with app-level permissions |
| KOL v0.3.0 | Version tagging, headshots, filters, batch generation |
| KOL v0.4.0 | Evidence-grounded briefs (PubMed + web search) |
| KOL v0.5.0 | NPI integration, conference indexing, batch ZIP download |
| Monorepo | KOL moved into medicalpkm-portal/apps/kol/ |

## Session Continuity
1. Read this CLAUDE.md first for ecosystem context
2. Run `git log --oneline -5` to see recent changes
3. Run `git status` to check for uncommitted work
4. Run `git branch` to confirm you're on the right branch
5. Portal deploy: `node -c worker.js && npx wrangler deploy`
6. KOL dev: `cd apps/kol && npm run dev`
7. KOL build check: `cd apps/kol && npm run build`

## Cross-Device Handoff

**Last updated:** 2026-03-20

**Status:** Portal v0.2.0 + KOL v0.5.0 deployed. Monorepo migration completed.

**What was done (2026-03-20):**
1. **Monorepo migration**: Moved KOL Brief Generator from separate repo (`kol-brief-generator`) into `apps/kol/` via git subtree. Single repo, single CLAUDE.md, independent deployments.
2. Updated `scripts/sync.sh` and `scripts/setup-machine.sh` to reflect monorepo structure.

**Next steps:**
1. Configure Vercel: Connect medicalpkm-portal repo, set Root Directory to `apps/kol`, set Ignored Build Step
2. Remove KOL local admin page — replace with link to medicalpkm.com/admin/. Add permission check via portal API
3. Complete Google CSE fix for headshot auto-fetch
4. Headshot KV caching (30-day TTL)
5. Obsidian sync — verify `/api/fp/export/obsidian` endpoint works with D1 data
