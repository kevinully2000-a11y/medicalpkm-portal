# MedicalPKM Portal

## Project Overview
Cloudflare Worker serving the MedicalPKM Digital Hub — the parent project for all apps in the medicalpkm.com ecosystem. This repo owns the portal homepage, Admin Console, embedded apps (Fountain Pen Companion, Private Apps Hub, Sandbox), D1 database, and shared infrastructure.

**Current version:** v0.2.0

## Architecture
```
medicalpkm.com (this repo — Portal Worker)
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
├── kol.medicalpkm.com ........ KOL Brief Generator (repo: kol-brief-generator)
└── (future subdomains) ....... Obsidian OS, coding exercises, etc.
```

## Deployment
```bash
cd ~/medicalpkm-portal
node -c worker.js && npx wrangler deploy   # Always validate syntax first!
```
Deploys to: medicalpkm.com + www.medicalpkm.com

## Account IDs
- **Cloudflare Account:** 720188182d247df529ed121b3ddb59e6
- **Cloudflare Zone:** be92d1c4d36e3d63e7f8211234b59e0f
- **Worker name:** medicalpkm
- **GitHub:** kevinully2000-a11y/medicalpkm-portal
- **D1 Database:** medicalpkm-fp (ID: 827127ef-961f-40b2-96c0-80d23d62ded7)

## Cloudflare Access (Zero Trust)
- **Team domain:** medicalpkm.cloudflareaccess.com
- **App ID:** dbf6d196-faeb-4403-9acc-92469c67ef64
- **Policy:** Allow whitelisted emails (kevin.ully2000@gmail.com + VuMedi team)
- **Identity Providers:** Google OAuth + One-Time PIN
- **Logout URL:** https://medicalpkm.cloudflareaccess.com/cdn-cgi/access/logout
- **Super Admin email:** kevin.ully2000@gmail.com
- **Admin emails:** bschubsky@gmail.com, bschubsky@vumedi.com

## Admin Console (v0.2.0)
Full user and permission management at `/admin/`.

### Features
- **User management:** Add/remove users with email + role (User/Admin/Super Admin)
- **App permissions:** Clickable chip toggles per user (KOL, FP, Cthulhu) — blue = access, gray = no access
- **Three-level permission enforcement:**
  1. Server-side page gate: unauthorized users get a themed "no access" page
  2. API gate: `/api/fp/*` returns 403 for unauthorized users
  3. Client-side check: FP app calls `/api/fp/check-access` on load, shows "Access Revoked" overlay
- **Access Denied page:** Shows which email is logged in + "Switch Account" link
- **Log Out link** in admin nav bar

### D1 Tables (Admin)
- `users` — email, role (user/admin/super_admin), created_at
- `app_permissions` — email, app_id (kol/fp/coc), permission (user/admin/none)
- Migration: `migrations/0002_admin.sql`

### Admin API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users with app permissions |
| POST | `/api/admin/users` | Add user (email, role, apps) |
| PUT | `/api/admin/users/:email` | Update role and/or app permissions |
| DELETE | `/api/admin/users/:email` | Remove user + all permissions |

### Helper Functions (in worker.js)
- `getEmailFromJWT(request)` — Extracts email from CF Access JWT (line ~255)
- `isSuperAdmin(email)` — Checks if email is kevin.ully2000@gmail.com (line ~266)

## D1 Database (Fountain Pen)
SQLite at the edge — stores all pen, ink, and pairing data.

**Tables:** `pens`, `inks`, `pairings`, `dropdowns`, `users`, `app_permissions`
**Migrations:** `migrations/0001_initial.sql`, `migrations/0002_admin.sql`
**Data:** 58 pens, 83 inks, 3 pairings (migrated from localStorage 2026-03-19)

**Commands:**
```bash
# Query the database
npx wrangler d1 execute medicalpkm-fp --remote --command "SELECT count(*) FROM pens"
npx wrangler d1 execute medicalpkm-fp --remote --command "SELECT email, role FROM users"

# Run a migration
npx wrangler d1 execute medicalpkm-fp --remote --file=migrations/0003_whatever.sql
```

**FP API Endpoints** (all gated by app permissions):
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/fp/check-access` | Check if current user has FP permission |
| GET | `/api/fp/pens` | List all pens |
| POST | `/api/fp/pens` | Create a pen |
| PUT | `/api/fp/pens/:id` | Update a pen |
| DELETE | `/api/fp/pens/:id` | Delete a pen |
| GET | `/api/fp/inks` | List all inks |
| POST | `/api/fp/inks` | Create an ink |
| PUT | `/api/fp/inks/:id` | Update an ink |
| DELETE | `/api/fp/inks/:id` | Delete an ink |
| GET | `/api/fp/pairings` | List all pairings |
| POST | `/api/fp/pairings` | Create a pairing |
| DELETE | `/api/fp/pairings/:id` | Delete a pairing |
| GET | `/api/fp/dropdowns` | List dropdown options |
| POST | `/api/fp/sync` | Bulk import (migration) |
| GET | `/api/fp/export/obsidian` | Export as Obsidian Markdown |

## Child Projects
| Project | Repo | Deployed To |
|---------|------|-------------|
| KOL Brief Generator | `~/kol-brief-generator/` | Vercel → kol.medicalpkm.com |
| Fountain Pen Companion | Embedded in this Worker | medicalpkm.com/apps/shared/fountain-pen/ |
| Cthulhu Investigator | Embedded in this Worker | medicalpkm.com/apps/private/ |

## Key Files
- `worker.js` — Monolithic Worker (~7,900 lines). Portal routing + embedded app HTML/CSS/JS + D1 API + Admin Console.
- `wrangler.toml` — Worker config (name, routes, D1 binding)
- `migrations/` — D1 schema migrations
- `scripts/sync.sh` — Mac22 ↔ Mac24 project sync
- `scripts/setup-machine.sh` — First-time machine setup
- `scripts/sync-obsidian-fp.sh` — Export FP data to Obsidian vault

## Worker Route Structure
Routes are handled via `pathname.startsWith()` in a cascading if-else:
1. `/api/admin/*` → Admin API endpoints (returns JSON)
2. `/api/fp/*` → FP D1 API endpoints (permission-gated, returns JSON)
3. `/admin/` → Admin Console (admin/super_admin only)
4. `/sandbox/fountain-pen/` → Sandbox FP app (no D1, localStorage only)
5. `/sandbox/` → General sandbox
6. `/apps/private/` → Cthulhu Investigator (permission-gated)
7. `/apps/shared/fountain-pen/` → Production FP app (D1-enabled, permission-gated)
8. `/` (default) → Portal homepage

## Version History
| Tag | Description |
|-----|-------------|
| v0.0.1 | Initial portal extraction from kol-brief-generator |
| v0.1.0 | D1 database, FP API endpoints, sync scripts |
| v0.2.0 | Admin Console with app-level permissions (current) |

## Known Issues & Lessons Learned
- **worker.js has duplicate FP code** — sandbox FP (~line 812) and production FP (~line 4323) have nearly identical HTML/JS. The Edit tool often matches both. Use Python with line numbers to target the production version specifically.
- **Template strings contain backticks** — The FP app's embedded JS uses template literals (`\`...\``). When editing, be aware of nested backtick escaping.
- **Always `node -c worker.js` before deploying** — esbuild (wrangler) reports line numbers from bundled output, not source. Node's syntax check catches errors with correct line numbers.
- **CF Access 302 redirects** — Client-side `fetch()` to `/api/fp/*` can get redirected to CF Access login if the session expired. The FP app has a catch block that falls back to localStorage.
- **Commit author on main** — Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` or Vercel webhook won't fire (for KOL app).
- **`printf '%s'` not `echo`** when piping env vars to `vercel env add` — echo adds trailing `\n`.

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

## User Preferences
- **Always explain commands before running them** — the user is learning CLI
- **Commit messages:** Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` on main branch
- **Branching:** Work on feature branches, merge to main for production
- **Two machines:** Mac22 (desktop, primary) and Mac24 (travel laptop)

## Session Continuity
1. Read this CLAUDE.md first for ecosystem context
2. Run `git log --oneline -5` to see recent changes
3. Run `git status` to check for uncommitted work
4. Run `git branch` to confirm you're on the right branch
5. Deploy with `node -c worker.js && npx wrangler deploy`
6. Verify: `curl -s -o /dev/null -w "%{http_code}" https://medicalpkm.com` (expect 302 = CF Access)

## Cross-Device Handoff

**Last updated:** 2026-03-20

**Status:** v0.2.0 deployed to production — Admin Console live

**What was done (2026-03-19 / 2026-03-20):**

1. **Admin Console** (`/admin/`):
   - D1 migration `0002_admin.sql` — `users` and `app_permissions` tables
   - Admin API routes: CRUD users, update roles, manage per-app permissions
   - Admin HTML page with stats dashboard, user list, clickable app chip toggles
   - Super Admin / Admin / User roles with proper access control
   - Seeded D1 with 9 users from existing CF Access whitelist

2. **App-level permission enforcement**:
   - Server-side page gate for FP and Cthulhu — themed "no access" pages
   - API gate on all `/api/fp/*` endpoints — returns 403 for unauthorized users
   - Client-side check — FP app calls `/api/fp/check-access` on load
   - Clickable app chips in user rows — toggle KOL/FP/Cthulhu access directly

3. **FP data secured in D1**:
   - Auto-migration from localStorage failed (CF Access redirect + empty localStorage)
   - Manual migration via browser console (`/api/fp/sync` POST) — 58 pens, 83 inks, 3 pairings
   - D1 is now the source of truth, localStorage is backup

4. **UX improvements**:
   - Log Out link in admin nav bar (CF Access logout URL)
   - Access Denied page shows logged-in email + "Switch Account" link
   - Promoted bschubsky@gmail.com and bschubsky@vumedi.com to admin role

**Previous session (2026-03-19):**
- Extracted portal to its own repo (medicalpkm-portal)
- Created D1 database with FP tables
- Added D1 API endpoints + auto-migration logic
- Created sync scripts for multi-machine workflow

**Next steps:**
1. Update KOL app — remove its local admin page, add link to portal admin, add permission check via portal API
2. KOL app corporate migration — company may create dev environment under corporate domain
3. Headshot KV caching (30-day TTL)
4. Complete Google CSE fix for headshot auto-fetch
5. Obsidian sync — verify `/api/fp/export/obsidian` endpoint works with D1 data
