#!/bin/bash
# ============================================================
# MedicalPKM Project Sync
# ============================================================
# Syncs all projects between Mac22 (desktop) and Mac24 (laptop)
# via GitHub. Run this when switching between machines.
#
# Usage:
#   ./sync.sh push   — Save your work to GitHub (before leaving this Mac)
#   ./sync.sh pull   — Get latest work from GitHub (when arriving on this Mac)
#
# What it does:
#   push: For each project, shows changes, asks if you want to save,
#         commits with your machine name, and pushes to GitHub.
#   pull: For each project, downloads latest from GitHub and installs
#         any missing dependencies.
# ============================================================

ACTION=${1:-help}
MACHINE=$(scutil --get ComputerName 2>/dev/null || hostname)

# All your projects — add new ones here
REPOS=(
  "$HOME/medicalpkm-portal"
  "$HOME/kol-brief-generator"
  "$HOME/fountain-pen-companion"
  "$HOME/coc-investigator"
)

# Colors for readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "========================================="
echo "  MedicalPKM Sync — $MACHINE"
echo "========================================="
echo ""

if [ "$ACTION" = "push" ]; then
  echo -e "${YELLOW}Pushing all projects to GitHub...${NC}"
  echo ""

  for repo in "${REPOS[@]}"; do
    name=$(basename "$repo")
    if [ ! -d "$repo/.git" ]; then
      echo -e "${RED}⚠ $name — not a git repo, skipping${NC}"
      continue
    fi

    echo -e "${GREEN}--- $name ---${NC}"
    cd "$repo"

    # Show what changed
    changes=$(git status --short)
    if [ -z "$changes" ]; then
      echo "  No changes to push."
      echo ""
      continue
    fi

    echo "  Changes:"
    echo "$changes" | head -20 | sed 's/^/    /'
    if [ $(echo "$changes" | wc -l) -gt 20 ]; then
      echo "    ... and more"
    fi

    echo ""
    echo -n "  Push these changes? (y/n): "
    read -r confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      branch=$(git branch --show-current)
      git add -A
      git commit -m "Sync from $MACHINE — $(date '+%Y-%m-%d %H:%M')"
      git push origin "$branch"
      echo -e "  ${GREEN}✓ Pushed to $branch${NC}"
    else
      echo "  Skipped."
    fi
    echo ""
  done

elif [ "$ACTION" = "pull" ]; then
  echo -e "${YELLOW}Pulling all projects from GitHub...${NC}"
  echo ""

  for repo in "${REPOS[@]}"; do
    name=$(basename "$repo")
    if [ ! -d "$repo/.git" ]; then
      echo -e "${RED}⚠ $name — not found at $repo, skipping${NC}"
      echo "  Run setup-machine.sh to clone missing repos."
      echo ""
      continue
    fi

    echo -e "${GREEN}--- $name ---${NC}"
    cd "$repo"
    branch=$(git branch --show-current)
    git pull origin "$branch" 2>&1 | sed 's/^/  /'

    # Install dependencies if package.json exists but node_modules doesn't
    if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
      echo "  Installing dependencies (npm install)..."
      npm install --silent 2>&1 | tail -1 | sed 's/^/  /'
    fi
    echo ""
  done

elif [ "$ACTION" = "status" ]; then
  echo -e "${YELLOW}Status of all projects...${NC}"
  echo ""

  for repo in "${REPOS[@]}"; do
    name=$(basename "$repo")
    if [ ! -d "$repo/.git" ]; then
      echo -e "${RED}⚠ $name — not found${NC}"
      continue
    fi

    cd "$repo"
    branch=$(git branch --show-current)
    changes=$(git status --short | wc -l | tr -d ' ')
    echo -e "${GREEN}$name${NC} ($branch) — $changes uncommitted changes"
  done
  echo ""

else
  echo "Usage: ./sync.sh [push|pull|status]"
  echo ""
  echo "  push   — Save your work to GitHub (before leaving this Mac)"
  echo "  pull   — Get latest from GitHub (when arriving on this Mac)"
  echo "  status — Show status of all projects"
  echo ""
fi

echo "========================================="
echo "  Done!"
echo "========================================="
