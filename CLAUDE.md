# MedicalPKM Portal

## Project Overview
Cloudflare Worker serving the MedicalPKM Digital Hub — the parent project for all apps in the medicalpkm.com ecosystem. This repo owns the portal homepage, embedded apps (Fountain Pen Companion, Private Apps Hub, Sandbox), and shared infrastructure (D1 database, CF Access).

## Architecture
```
medicalpkm.com (this repo — Portal Worker)
├── / .......................... Portal homepage (app directory)
├── /apps/fountain-pen/ ....... Fountain Pen Companion (embedded SPA)
├── /apps/private/ ............ Private Apps Hub (admin only)
├── /sandbox/ ................. Sandbox / experiments
│
├── kol.medicalpkm.com ........ KOL Brief Generator (separate repo: kol-brief-generator)
├── coc.medicalpkm.com ........ CoC Investigator (separate repo: coc-investigator)
└── (future subdomains) ....... Obsidian OS, coding exercises, etc.
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

## Cloudflare Access (Zero Trust)
- **Team domain:** medicalpkm.cloudflareaccess.com
- **App ID:** dbf6d196-faeb-4403-9acc-92469c67ef64
- **Policy:** Allow whitelisted emails (kevin.ully2000@gmail.com + VuMedi team)
- **Identity Providers:** Google OAuth + One-Time PIN
- **Admin email:** kevin.ully2000@gmail.com

## Child Projects
| Project | Repo | Deployed To |
|---------|------|-------------|
| KOL Brief Generator | `~/kol-brief-generator/` | Vercel → kol.medicalpkm.com |
| Fountain Pen Companion | `~/fountain-pen-companion/` (docs) | Embedded in this Worker |
| CoC Investigator | `~/coc-investigator/` | Vercel → coc.medicalpkm.com |

## Key Files
- `worker.js` — Monolithic Worker (~6,957 lines, 277KB). Contains all portal routing and embedded app HTML/CSS/JS.
- `wrangler.toml` — Worker configuration (name, routes, D1 bindings)
- `migrations/` — D1 schema migrations (future: Fountain Pen database)

## Worker Route Structure
Routes are handled via `pathname.startsWith()` in a cascading if-else:
1. `/sandbox/fountain-pen/` → Sandbox FP app
2. `/sandbox/` → General sandbox
3. `/apps/private/` → Private apps hub (admin only)
4. `/apps/shared/fountain-pen/` → Production FP app
5. `/` (default) → Portal homepage

## User Preferences
- **Always explain commands before running them** — the user is learning CLI
- **Commit messages:** Use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` on main branch
- **Branching:** Work on dev, merge to main for production
- **Two machines:** Mac22 (desktop) and Mac24 (travel laptop)

## Session Continuity
1. Read this CLAUDE.md first for ecosystem context
2. Run `git log --oneline -5` to see recent changes
3. Run `git status` to check for uncommitted work
4. Deploy with `npx wrangler deploy worker.js --name medicalpkm`
5. Verify: `curl -s -o /dev/null -w "%{http_code}" https://medicalpkm.com` (expect 302 = CF Access)
