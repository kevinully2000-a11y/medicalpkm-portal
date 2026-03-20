#!/bin/bash
# ============================================================
# MedicalPKM — First-Time Machine Setup
# ============================================================
# Run this once on a new machine (Mac24) to set up all projects.
# It clones repos from GitHub and installs dependencies.
#
# Prerequisites:
#   - GitHub CLI (gh) must be installed: brew install gh
#   - Must be logged in: gh auth login
#   - Node.js must be installed
# ============================================================

echo ""
echo "========================================="
echo "  MedicalPKM — Machine Setup"
echo "========================================="
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found."
  echo "   Install it: brew install gh"
  echo "   Then log in: gh auth login"
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found."
  echo "   Install it: brew install node"
  exit 1
fi

echo "✓ GitHub CLI found"
echo "✓ Node.js $(node --version) found"
echo ""

# Clone repos
# KOL Brief Generator now lives at medicalpkm-portal/apps/kol/ (monorepo)
REPOS=(
  "medicalpkm-portal"
  "fountain-pen-companion"
  "coc-investigator"
)

for repo in "${REPOS[@]}"; do
  if [ -d "$HOME/$repo" ]; then
    echo "✓ $repo already exists"
  else
    echo "Cloning $repo..."
    gh repo clone "kevinully2000-a11y/$repo" "$HOME/$repo"
  fi
done

echo ""

# Install dependencies
for repo in "${REPOS[@]}"; do
  if [ -f "$HOME/$repo/package.json" ]; then
    echo "Installing dependencies for $repo..."
    cd "$HOME/$repo" && npm install --silent
  fi
done

# Install monorepo sub-app dependencies
if [ -f "$HOME/medicalpkm-portal/apps/kol/package.json" ]; then
  echo "Installing KOL app dependencies..."
  cd "$HOME/medicalpkm-portal/apps/kol" && npm install --silent
fi

echo ""
echo "========================================="
echo "  MANUAL STEPS NEEDED"
echo "========================================="
echo ""
echo "1. Copy .env.local from your other Mac:"
echo "   scp Mac22:~/medicalpkm-portal/apps/kol/.env.local ~/medicalpkm-portal/apps/kol/.env.local"
echo ""
echo "2. Log in to Cloudflare (for Worker deploys):"
echo "   npx wrangler login"
echo ""
echo "3. Log in to Vercel (for KOL app deploys):"
echo "   npx vercel login"
echo ""
echo "4. (Optional) Log in to Google Cloud:"
echo "   gcloud auth login"
echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
