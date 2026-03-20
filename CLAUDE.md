# KOL Brief Generator

## Project Overview
Next.js web app that generates Key Opinion Leader (KOL) briefs for medical affairs professionals using the Anthropic Claude API. Part of the medicalpkm.com ecosystem. Current version: **v0.4.0**.

## Architecture
- **KOL App**: Next.js 16.1.6 + React 19.2.3 on Vercel → kol.medicalpkm.com
- **Portal**: Cloudflare Worker (monolithic ~248KB worker.js) → medicalpkm.com + www.medicalpkm.com
- **Auth**: Cloudflare Access (Zero Trust) at the edge → JWT validated by Next.js middleware
- **Storage**: Vercel KV (Upstash Redis) for brief persistence
- **DNS**: Cloudflare zone for medicalpkm.com. CNAME kol → Vercel.

## Account IDs
- GitHub: kevinully2000-a11y/kol-brief-generator
- Cloudflare Account: 720188182d247df529ed121b3ddb59e6
- Cloudflare Zone: be92d1c4d36e3d63e7f8211234b59e0f
- Cloudflare Worker: medicalpkm
- Vercel Team: kevinully2000-7619s-projects
- Google Cloud Project (headshots): `kol-headshot-search` — Custom Search API for headshot image search
- Google Programmable Search Engine CX: `e6261e785f17446af`

## Branching Strategy
- main → production (auto-deploys to kol.medicalpkm.com)
- dev → development (gets Vercel preview URL per push)
- Work on dev, test via preview URL, merge to main for production.
- Tag releases: v0.2.0, v0.3.0, v0.4.0, etc.

## Key Files

### App Pages
- src/app/page.tsx — Library (homepage): lists all briefs with FilterBar, hide/unhide, admin delete
- src/app/generate/page.tsx — Brief generation form (KOL name, institution, specialty, headshot URL, additional context)
- src/app/briefs/[id]/page.tsx — Individual brief detail view with hide/unhide/delete actions
- src/app/batch/page.tsx — Batch generation: CSV import, checkbox selection, sequential generation with cost tracking
- src/app/layout.tsx — Root layout

### API Routes
- src/app/api/generate-brief/route.ts — POST: PubMed research → evidence-aware Claude API call with web search → streams via SSE, saves to KV
- src/app/api/briefs/route.ts — GET: list all briefs from KV
- src/app/api/briefs/[id]/route.ts — GET: single brief, PATCH: toggle hidden, DELETE: admin-only permanent delete
- src/app/api/me/route.ts — GET: returns current user context (email, isAdmin) from CF Access JWT

### Components
- src/components/Header.tsx — App header with version badge
- src/components/BriefViewer.tsx — Full brief display with evidence badge, disclaimer, citations, PDF export
- src/components/BriefCard.tsx — Brief summary card for library grid (avatar, version, cost, evidence badge)
- src/components/Avatar.tsx — Headshot display with initials fallback (sm/md/lg sizes)
- src/components/FilterBar.tsx — Library filters: name search, date range, specialty, institution, version, visibility

### Core Libraries
- src/lib/types.ts — TypeScript interfaces (KOLBrief, BriefSummary, EvidenceMetadata, WebSearchCitation, etc.)
- src/lib/prompts.ts — Evidence-grounded system prompt builder (buildSystemPrompt + buildUserPrompt)
- src/lib/research.ts — PubMed E-utilities integration (fetchPubMedResearch, classifyEvidenceLevel, gatherEvidence)
- src/lib/kv.ts — Vercel KV operations (save, get, list, update, delete briefs)
- src/lib/pdf.ts — jsPDF export with headshot embedding (async, fetches image → base64 → addImage)
- src/lib/auth.ts — CF Access JWT email extraction (server + client side), admin check
- src/lib/constants.ts — APP_VERSION, ADMIN_EMAIL, CLAUDE_MODEL, PRICING, WEB_SEARCH_COST, ESTIMATED_COST_PER_BRIEF
- src/lib/cost.ts — calculateCost() from token counts + web search requests, formatCost() for display
- src/lib/headshot.ts — Multi-strategy headshot fetcher (Google CSE → Wikipedia API → institution profile)
- src/middleware.ts — CF Access JWT verification (JWKS validation, expiration check)

### Config
- tsconfig.json — paths: @/* → ./src/*
- package.json — version 0.4.0
- .env.local — local env vars (KV_REST_API_URL, KV_REST_API_TOKEN, ANTHROPIC_API_KEY)

### Scripts
- scripts/setup-google-cse.sh — Automated Google CSE API key setup (gcloud + vercel env update)

## Environment Variables
- `ANTHROPIC_API_KEY` — Claude API key (Vercel project env)
- `KV_REST_API_URL` — Vercel KV / Upstash Redis URL
- `KV_REST_API_TOKEN` — Vercel KV / Upstash Redis auth token
- `CLOUDFLARE_ACCESS_TOKEN` — CF API token for Access policy management (needed for admin user management)
- `GOOGLE_CSE_API_KEY` — Google Custom Search API key for headshot image search (configured on all environments). **GCP project**: `kol-headshot-search`. When setting on Vercel, use `printf '%s'` not `echo` to avoid trailing `\n`.
- `GOOGLE_CSE_CX` — Google Custom Search engine ID: `e6261e785f17446af` (configured on all environments)

## Cloudflare Access Setup
- **Team domain**: medicalpkm.cloudflareaccess.com
- **App ID**: dbf6d196-faeb-4403-9acc-92469c67ef64
- **Policy 1** ("Allow Approved Emails"): ad315038-7242-448e-9d7c-29ddcf812e02
  - Decision: ALLOW, Precedence: 1
  - Include: specific whitelisted emails (kevin.ully2000@gmail.com + VuMedi team)
- **Identity Providers**: Google OAuth (17b289ff-48a6-4a22-b37d-7ccd997b5736), One-Time PIN (3243ca08-c70d-49fa-8e25-31e7655806f7)
- **Logout URL**: https://medicalpkm.cloudflareaccess.com/cdn-cgi/access/logout
- **Admin email**: kevin.ully2000@gmail.com (defined in src/lib/constants.ts)
- **Google OAuth Client ID**: 770436803686-148ljnkldj2dmqp01vn28a3q35ifn2ni.apps.googleusercontent.com

## v0.4.0 Features (Current)
1. **Evidence-grounded brief generation** — Two-layer anti-hallucination system:
   - Layer 1: PubMed E-utilities pre-fetch (real publication data before Claude call)
   - Layer 2: Anthropic `web_search_20250305` server-side tool (Claude verifies claims during generation)
2. **Evidence level classification** — high (50+ pubs), moderate (10-49), low (1-9), minimal (0). Adapts brief length, conversation starter count, and disclaimer requirements.
3. **Anti-hallucination prompt rules** — Claude instructed to never fabricate, use only PubMed-verified publication data, verify affiliations via web search, and include disclaimers for low-evidence KOLs.
4. **Evidence badges** — Color-coded badges in library cards, brief viewer, and PDF (Verified/Grounded/Limited Data/Caution)
5. **Disclaimer system** — Yellow banner for low/minimal evidence briefs explaining data limitations
6. **Citations section** — Collapsible sources section in brief viewer showing all web search citations with URLs
7. **Research phase UI** — Generate page shows "Researching..." phase with PubMed result count before Claude generation starts
8. **SDK upgrade** — `@anthropic-ai/sdk` upgraded from 0.39.0 to 0.78.0 for web search tool support

## v0.3.0 Features
1. **App version tagging** — Every brief stores appVersion, displayed in cards, viewer, and PDF footer
2. **KOL headshots** — Auto-fetch via Google CSE + Wikipedia API + institution scraping. Manual URL field on generate form.
3. **Hide/delete permissions** — All users can hide/unhide briefs. Only admin can permanently delete.
4. **Library filter system** — Search by KOL name, filter by date range, specialty, institution, version, visibility
5. **PDF headshot embedding** — PDF export fetches headshot image, converts to base64, embeds in header
6. **Per-brief cost tracking** — Anthropic API usage capture, cost display in cards/viewer/PDF
7. **Batch generation** — CSV import, sequential generation, progress tracking, cost estimation
8. **Specialties/FocusAreas split** — Specialties (AMA/ABMS) separated from focus areas (research interests)

## Tech Stack and Conventions
- TypeScript strict mode, Tailwind CSS for styling
- Path aliases: @/* maps to ./src/*
- Brief generation pipeline: PubMed research → evidence-aware prompt → Claude API with web_search tool → SSE streaming
- Anthropic SDK v0.78.0 with `web_search_20250305` server-side tool
- PubMed E-utilities API (free, no key): ESearch + ESummary for publication verification
- Client-side filtering via useMemo (KV doesn't support complex queries)
- Optimistic updates for hide/unhide operations
- All headshot fetching is non-blocking (returns undefined on failure)

## Known Constraints
- Vercel Hobby plan: 60-second serverless function timeout (brief generation streams to stay within limits)
- Cloudflare Worker is monolithic (~248KB) — use wrangler CLI to edit, not browser editor
- Em-dash encoding normalized in generated briefs and PDF export
- Headshot auto-fetch uses Google CSE (primary), Wikipedia API, and institution profile scraping as fallbacks
- CF Access preview URL testing: preview URLs bypass CF Access (no JWT), so auth features only testable on production
- Brief generation cost ~$0.15-0.25/brief (up from ~$0.08) due to web search tool and larger input tokens from search results
- PubMed API: free, no key needed, rate limit 3 req/sec. 5-second timeout per call with graceful degradation

## Roadmap
### Completed
- [x] Brief generation with Claude API (streaming)
- [x] Vercel KV persistence + Library page
- [x] PDF export (jsPDF) with headshot embedding
- [x] Version display in UI and briefs
- [x] Cloudflare Access authentication (Google OAuth + OTP)
- [x] v0.3.0: Version tagging, headshots, hide/delete, filters
- [x] Separate specialties (AMA/ABMS) from focus areas (research interests, themes)
- [x] Per-brief cost tracking (Anthropic API usage capture + display)
- [x] Batch generation page (CSV import, sequential generation, progress tracking)
- [x] Google CSE headshot search (API key + Search Engine configured on Vercel)
- [x] v0.4.0: Evidence-grounded brief generation (PubMed + web search anti-hallucination)

### In Progress / Next
- [ ] "My Account > Log Off" in header (CF Access logout integration)
- [ ] Admin user management page (add/remove whitelisted emails from within the app)
- [ ] Headshot KV caching (30-day TTL to avoid repeated fetches)
- [ ] Connect portal: Update Worker so KOL card links to kol.medicalpkm.com

### Future
- [ ] Brief sharing / collaboration features
- [ ] Brief revision history
- [ ] Batch enhancements: Excel (.xlsx) import, retry failed, export results CSV

## CLI Tools
- wrangler — Cloudflare Worker management (authenticated via OAuth, `npx wrangler whoami` to check)
- vercel — Vercel project management (`npx vercel list` to check deployments)
- gh — GitHub CLI (already installed via Homebrew)
- gcloud — Google Cloud CLI (installed via Homebrew, needs `gcloud auth login` before first use)

## Session Continuity
When starting a new Claude Code session on this project:
1. This file (CLAUDE.md) contains all project context — read it first
2. Run `git log --oneline -10` to see recent changes
3. Run `git status` to check for uncommitted work
4. Run `git branch` to confirm you're on the right branch (dev for development, main for production)
5. The user works on `dev`, merges to `main` for production deploy
6. Always run `npm run build` before committing to catch TypeScript errors
7. After merging to main, run `npx vercel list` to verify deployment
8. Admin email: kevin.ully2000@gmail.com — this is the only email with delete permissions
9. CF Access protects the production site — preview URLs bypass it, so test auth features on production only

## Cross-Device Handoff

This section is updated by whichever Claude Code instance last worked on the project.

**Last updated**: 2026-03-02

**Status**: v0.4.0 deployed to production — headshot CSE fix in progress

**What was done** (2026-03-02):

1. **Google CSE headshot fix (in progress)**:
   - Root cause: Old GCP project `medicalpkm-access` returns 403 on Custom Search API despite billing + API enabled
   - Created new GCP project `kol-headshot-search` (project ID: `kol-headshot-search`) with billing linked and Custom Search API enabled
   - **Blocker**: Need to create an API key in the new project (requires `gcloud auth login` or Google Cloud Console)
   - Setup script created: `scripts/setup-google-cse.sh` — automates key creation, testing, and Vercel env update
   - gcloud CLI installed via Homebrew (needs `gcloud auth login` for first use)
   - Fallback strategies (Wikipedia API, institution scraping) work for notable KOLs

2. **Headshot logging improvements**:
   - Added detailed error logging to `src/lib/headshot.ts` for all strategies
   - Google CSE now logs HTTP status + error body on failure (instead of silently returning undefined)
   - Main `fetchHeadshotUrl` logs which strategies were attempted

3. **Vercel env var cleanup**:
   - Fixed trailing `\n` characters on GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX across all environments
   - Root cause: `echo` adds trailing newline when piping to `vercel env add`
   - Fix: always use `printf '%s'` when piping values to `vercel env add`

**Previous session** (2026-02-24):

1. **Evidence-grounded brief generation** (v0.4.0, tag `v0.4.0`):
   - Two-layer anti-hallucination: PubMed E-utilities pre-fetch + Anthropic web_search tool
   - Evidence level classification, adaptive output, badges, disclaimers, citations
   - `@anthropic-ai/sdk` upgraded from 0.39.0 to 0.78.0

2. **Middleware auth bypass**: Added `vercel.app`, `localhost`, `127.0.0.1` to hostname bypass

3. **Citation tag stripping**: Regex strip `<cite>` tags from web_search output before JSON parsing

4. **Portal version badge** updated to v0.4.0

**Critical deployment note**:
- Commits on `main` MUST use `--author="Kevin Ully <kevin.ully2000@gmail.com>"` or Vercel webhook won't fire
- This is because the Vercel Git Integration requires the commit author email to match a Vercel team member

**Backward compatibility**:
- Old briefs (v0.3.0 and earlier) display normally — no evidence badge, no disclaimer, no citations
- Evidence fields are all optional on the KOLBrief type

**Deployment checklist** (always do after any deploy):
- Update this CLAUDE.md with what changed
- Confirm version badge is correct in both KOL app header and portal card

**Session (2026-03-19 / 2026-03-20):**

1. **ACC.26 batch generation completed**: 17 ACC.26 conference speaker briefs generated (16/17 first attempt, 1 retry). Total cost: $8.65.
2. **Admin moved to portal**: User management is now centralized at medicalpkm.com/admin/ (portal repo). The KOL app's local admin page at `/admin` should be removed and replaced with a link to the portal admin.
3. **Portal v0.2.0 released**: Admin Console with app-level permissions (KOL, FP, Cthulhu). Three-level permission enforcement. See ~/medicalpkm-portal/CLAUDE.md for details.

**Next steps**:
1. **Remove KOL local admin page**: Replace with link to medicalpkm.com/admin/. Add permission check via portal API.
2. **Complete Google CSE fix**: Run `gcloud auth login` then `./scripts/setup-google-cse.sh` — or create API key manually in Google Cloud Console for project `kol-headshot-search`
3. Regenerate Jordan Rennicke brief on production to verify anti-hallucination + clean formatting
4. Generate a brief for a prolific KOL to verify headshots + no regression
5. Headshot KV caching (30-day TTL)
