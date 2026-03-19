#!/bin/bash
# ============================================================
# Sync Fountain Pen data to Obsidian vault
# ============================================================
# Fetches the current FP collection from D1 (via the API)
# and updates your Obsidian note with the latest data.
#
# Usage: ./sync-obsidian-fp.sh
#
# Note: Requires authentication via Cloudflare Access.
# If you get a 302 redirect, open the FP app in your browser
# first to authenticate, then run this script.
# ============================================================

OBSIDIAN_FILE="$HOME/Documents/Schu_Obsidian_2025/+/🖋️ Pen & Ink Pairings — The Living Journal.md"
API_URL="https://medicalpkm.com/api/fp/export/obsidian"

echo "Fetching FP collection from D1..."

# Try to fetch (may need CF Access cookie)
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  # Backup existing note
  if [ -f "$OBSIDIAN_FILE" ]; then
    cp "$OBSIDIAN_FILE" "${OBSIDIAN_FILE}.backup"
    echo "✓ Backed up existing note"
  fi

  # Write new content
  echo "$BODY" > "$OBSIDIAN_FILE"
  echo "✓ Obsidian note updated from D1 data"
  echo "  File: $OBSIDIAN_FILE"
else
  echo "❌ Failed to fetch (HTTP $HTTP_CODE)"
  echo "   You may need to authenticate first."
  echo "   Open https://medicalpkm.com/apps/shared/fountain-pen/ in your browser,"
  echo "   then try again."
fi
