#!/bin/bash
# ============================================================================
# Google CSE API Key Setup Script
# Creates an API key in the "KOL Headshot Search" GCP project,
# tests it, and updates Vercel environment variables.
#
# Prerequisites:
#   - gcloud CLI installed (brew install --cask google-cloud-sdk)
#   - Vercel CLI installed (npm i -g vercel)
#   - You're logged in to both (gcloud auth login + vercel login)
#
# Usage:
#   chmod +x scripts/setup-google-cse.sh
#   ./scripts/setup-google-cse.sh
# ============================================================================

set -euo pipefail

PROJECT_ID="kol-headshot-search"
CSE_CX="e6261e785f17446af"
VERCEL_PROJECT="kol-brief-generator"

echo "================================================"
echo "  Google CSE API Key Setup for KOL Brief Generator"
echo "================================================"
echo ""

# Step 1: Authenticate gcloud if needed
echo "Step 1: Checking gcloud authentication..."
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>/dev/null | grep -q "@"; then
  echo "  → No active gcloud account. Logging in..."
  gcloud auth login
else
  ACCOUNT=$(gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>/dev/null)
  echo "  ✓ Logged in as: $ACCOUNT"
fi

# Step 2: Set the project
echo ""
echo "Step 2: Setting GCP project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID" 2>/dev/null
echo "  ✓ Project set to $PROJECT_ID"

# Step 3: Verify Custom Search API is enabled
echo ""
echo "Step 3: Verifying Custom Search API is enabled..."
if gcloud services list --enabled --filter="name:customsearch.googleapis.com" --format="value(name)" 2>/dev/null | grep -q "customsearch"; then
  echo "  ✓ Custom Search API is enabled"
else
  echo "  → Enabling Custom Search API..."
  gcloud services enable customsearch.googleapis.com
  echo "  ✓ Custom Search API enabled"
fi

# Step 4: Create API key
echo ""
echo "Step 4: Creating API key..."
KEY_RESULT=$(gcloud services api-keys create --display-name="KOL Headshot Search Key" --format="json" 2>&1)
KEY_NAME=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['response']['keyString'])" 2>/dev/null || true)

if [ -z "$KEY_NAME" ]; then
  # Try alternate parsing
  echo "  → Waiting for key creation to complete..."
  sleep 5
  KEY_NAME=$(gcloud services api-keys list --format="value(keyString)" --limit=1 2>/dev/null || true)
fi

if [ -z "$KEY_NAME" ]; then
  echo "  ✗ Failed to create API key automatically."
  echo "  → Please create one manually at:"
  echo "    https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
  echo ""
  read -p "  Paste your API key here: " KEY_NAME
fi

echo "  ✓ API Key: ${KEY_NAME:0:10}...${KEY_NAME: -4}"

# Step 5: Test the API key
echo ""
echo "Step 5: Testing API key against Custom Search API..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://www.googleapis.com/customsearch/v1?key=${KEY_NAME}&cx=${CSE_CX}&q=test+headshot&searchType=image&num=1")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✓ API key works! (HTTP 200)"
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "  ✗ API key returned 403. Billing may need time to propagate."
  echo "    Try again in a few minutes, or check billing at:"
  echo "    https://console.cloud.google.com/billing?project=$PROJECT_ID"
  exit 1
else
  echo "  ✗ Unexpected HTTP status: $HTTP_STATUS"
  RESPONSE=$(curl -s "https://www.googleapis.com/customsearch/v1?key=${KEY_NAME}&cx=${CSE_CX}&q=test+headshot&searchType=image&num=1")
  echo "  Response: $RESPONSE"
  exit 1
fi

# Step 6: Update .env.local
echo ""
echo "Step 6: Updating .env.local..."
if [ -f .env.local ]; then
  # Remove old key if present
  sed -i.bak '/GOOGLE_CSE_API_KEY/d' .env.local
  sed -i.bak '/GOOGLE_CSE_CX/d' .env.local
  rm -f .env.local.bak
fi
echo "GOOGLE_CSE_API_KEY=\"${KEY_NAME}\"" >> .env.local
echo "GOOGLE_CSE_CX=\"${CSE_CX}\"" >> .env.local
echo "  ✓ Updated .env.local"

# Step 7: Update Vercel environment variables
echo ""
echo "Step 7: Updating Vercel environment variables..."
echo "  → Setting GOOGLE_CSE_API_KEY for production, preview, and development..."

# Remove existing and re-add (use printf to avoid trailing newline)
printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY production --force 2>/dev/null || \
  (vercel env rm GOOGLE_CSE_API_KEY production -y 2>/dev/null; printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY production)

printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY preview --force 2>/dev/null || \
  (vercel env rm GOOGLE_CSE_API_KEY preview -y 2>/dev/null; printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY preview)

printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY development --force 2>/dev/null || \
  (vercel env rm GOOGLE_CSE_API_KEY development -y 2>/dev/null; printf '%s' "$KEY_NAME" | vercel env add GOOGLE_CSE_API_KEY development)

echo "  ✓ Vercel environment variables updated"

# Step 8: Summary
echo ""
echo "================================================"
echo "  ✓ Setup Complete!"
echo "================================================"
echo ""
echo "  API Key:    ${KEY_NAME:0:10}...${KEY_NAME: -4}"
echo "  CSE CX:     $CSE_CX"
echo "  GCP Project: $PROJECT_ID"
echo ""
echo "  Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Test headshot fetching by generating a brief"
echo "  3. Deploy to production: git push (Vercel auto-deploys)"
echo ""
