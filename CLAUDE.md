# MedicalPKM Portal

## Project Overview
Cloudflare Worker serving the MedicalPKM Digital Hub — the parent project for all apps in the medicalpkm.com ecosystem. This repo owns the portal homepage, embedded apps (Fountain Pen Companion, Private Apps Hub, Sandbox), D1 database, and shared infrastructure.

## Architecture
```
medicalpkm.com (this repo — Portal Worker)
├── / .......................... Portal homepage (app directory)
├── /apps/shared/fountain-pen/ . Fountain Pen Companion (embedded SPA)
├── /apps/private/ ............. Private Apps Hub (admin only)
├── /sandbox/ .................. Sandbox / experiments
├── /api/fp/* .................. Fountain Pen D1 API
├── /api/fp/export/obsidian .... Obsidian Markdown export
│
├── kol.medicalpkm.com ......... KOL Brief Generator (repo: kol-brief-generator)
├── coc.medicalpkm.com ......... CoC Investigator (repo: coc-investigator)
└── (future subdomains) ........ Obsidian OS, coding exercises, etc.
```

## Deployment
```bash
npx wrangler deploy worker.js --name medicalpkm
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
- **Admin email:** kevin.ully2000@gmail.com

## D1 Database (Fountain Pen)
SQLite at the edge — stores all pen, ink, and pairing data.

**Tables:** `pens`, `inks`, `pairings`, `dropdowns`
**Migrations:** `migrations/0001_initial.sql`

**Commands:**
```bash
# Query the database
npx wrangler d1 execute medicalpkm-fp --remote --command "SELECT count(*) FROM pens"

# Run a migration
npx wrangler d1 execute medicalpkm-fp --remote --file=migrations/0002_whatever.sql
```

**API Endpoints** (all under CF Access auth):
| Method | Path | Description |
|--------|------|-------------|
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

## Data Migration (localStorage → D1)
The FP app client auto-migrates on first load:
1. Tries to fetch from D1 API
2. If D1 is empty but localStorage has data → auto-migrates via `/api/fp/sync`
3. Sets `fp_migrated_to_d1` flag in localStorage
4. Subsequent loads read from D1, with localStorage as backup

## Child Projects
| Project | Repo | Deployed To |
|---------|------|-------------|
| KOL Brief Generator | `~/kol-brief-generator/` | Vercel → kol.medicalpkm.com |
| Fountain Pen Companion | `~/fountain-pen-companion/` (docs) | Embedded in this Worker |
| CoC Investigator | `~/coc-investigator/` | Vercel → coc.medicalpkm.com |

## Key Files
- `worker.js` — Monolithic Worker (~7,100 lines). Portal routing + embedded app HTML/CSS/JS + D1 API.
- `wrangler.toml` — Worker config (name, routes, D1 binding)
- `migrations/` — D1 schema migrations
- `scripts/sync.sh` — Mac22 ↔ Mac24 project sync
- `scripts/setup-machine.sh` — First-time machine setup
- `scripts/sync-obsidian-fp.sh` — Export FP data to Obsidian vault

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

## Worker Route Structure
Routes are handled via `pathname.startsWith()` in a cascading if-else:
1. `/api/fp/*` → D1 API endpoints (handled first, returns JSON)
2. `/sandbox/fountain-pen/` → Sandbox FP app
3. `/sandbox/` → General sandbox
4. `/apps/private/` → Private apps hub (admin only)
5. `/apps/shared/fountain-pen/` → Production FP app (D1-enabled)
6. `/` (default) → Portal homepage

## User Preferences
- **Always explain commands before running them** — the user is learning CLI
- **Commit messages:** Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` on main branch
- **Branching:** Work on dev, merge to main for production
- **Two machines:** Mac22 (desktop, primary) and Mac24 (travel laptop)

## Session Continuity
1. Read this CLAUDE.md first for ecosystem context
2. Run `git log --oneline -5` to see recent changes
3. Run `git status` to check for uncommitted work
4. Deploy with `npx wrangler deploy worker.js --name medicalpkm`
5. Verify: `curl -s -o /dev/null -w "%{http_code}" https://medicalpkm.com` (expect 302 = CF Access)

## Cross-Device Handoff

**Last updated:** 2026-03-19

**What was done:**
1. Extracted portal Worker from kol-brief-generator to its own repo (medicalpkm-portal)
2. Created D1 database (medicalpkm-fp) with pens/inks/pairings/dropdowns tables
3. Added D1 API endpoints to Worker (CRUD + bulk sync + Obsidian export)
4. Updated FP client to auto-migrate localStorage → D1 on first load
5. Created sync scripts for Mac22 ↔ Mac24
6. Verified CF Access security (single policy, no approval_required deadlock)

**Pending verification:**
- User needs to visit the FP app in browser to trigger localStorage → D1 migration
- After migration, verify data integrity (58 pens, 83 inks should appear)
- Test Obsidian export endpoint after D1 has data
