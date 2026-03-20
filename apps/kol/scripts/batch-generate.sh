#!/bin/bash
# Batch generate briefs from CSV via the local dev server API
# Usage: ./scripts/batch-generate.sh [csv_file] [max_count]
#
# Handles rate limiting with exponential backoff and retries.
# Each brief takes ~30-90s to generate (PubMed + Claude + web search).

CSV_FILE="${1:-data/acp-imm-2026-test10.csv}"
MAX_COUNT="${2:-999}"
BASE_URL="http://localhost:3000"
LOG_FILE="data/batch-generate-$(date +%Y%m%d-%H%M%S).log"
MAX_RETRIES=3
BASE_DELAY=20  # seconds between requests (avoid rate limits)

mkdir -p data

echo "=== Batch Brief Generation ===" | tee "$LOG_FILE"
echo "CSV: $CSV_FILE" | tee -a "$LOG_FILE"
echo "Max: $MAX_COUNT briefs" | tee -a "$LOG_FILE"
echo "Delay between requests: ${BASE_DELAY}s" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

TOTAL=0
SUCCESS=0
FAILED=0
TOTAL_COST=0

# Build array of JSON payloads first
PAYLOADS=()
while IFS= read -r line; do
  PAYLOADS+=("$line")
done < <(python3 -c "
import csv, json, sys

with open('$CSV_FILE') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i >= $MAX_COUNT:
            break
        payload = {'kolName': row.get('kolName', row.get('name', '')).strip()}
        if not payload['kolName']:
            continue
        for key, csv_key in [('institution','institution'),('specialty','specialty'),
                             ('npi','npi'),('conference','conference'),('priority','priority'),
                             ('headshotUrl','headshotUrl'),('additionalContext','additionalContext')]:
            val = row.get(csv_key, '').strip()
            if val:
                payload[key] = val
        print(json.dumps(payload))
" 2>/dev/null)

TOTAL_ITEMS=${#PAYLOADS[@]}
echo "Parsed $TOTAL_ITEMS items from CSV" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

for JSON_PAYLOAD in "${PAYLOADS[@]}"; do
  KOL_NAME=$(echo "$JSON_PAYLOAD" | python3 -c "import sys,json; print(json.load(sys.stdin)['kolName'])")
  TOTAL=$((TOTAL + 1))

  # Health check: make sure server is up before attempting
  SERVER_OK=false
  for HC in 1 2 3 4 5; do
    if curl -s --max-time 5 "$BASE_URL" > /dev/null 2>&1; then
      SERVER_OK=true
      break
    fi
    echo "  ⚠ Server not responding (attempt $HC/5), waiting 30s..." | tee -a "$LOG_FILE"
    sleep 30
  done
  if [ "$SERVER_OK" = false ]; then
    FAILED=$((FAILED + 1))
    echo "  ✗ SKIPPED — server unreachable after 5 attempts" | tee -a "$LOG_FILE"
    continue
  fi

  RETRY=0
  while [ "$RETRY" -le "$MAX_RETRIES" ]; do
    if [ "$RETRY" -gt 0 ]; then
      WAIT=$((BASE_DELAY * RETRY * 2))
      echo "  Retry $RETRY/$MAX_RETRIES — waiting ${WAIT}s..." | tee -a "$LOG_FILE"
      sleep "$WAIT"
    fi

    echo "[$TOTAL/$TOTAL_ITEMS] Generating: $KOL_NAME ..." | tee -a "$LOG_FILE"
    START_TIME=$(date +%s)

    # Call the SSE endpoint — stream the full response
    RESPONSE=$(curl -s -N -X POST "$BASE_URL/api/generate-brief" \
      -H "Content-Type: application/json" \
      -d "$JSON_PAYLOAD" \
      --max-time 180 2>&1)

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    # Check for success
    if echo "$RESPONSE" | grep -q '"type":"complete"'; then
      SUCCESS=$((SUCCESS + 1))
      BRIEF_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
      COST=$(echo "$RESPONSE" | grep -o '"totalCostUsd":[0-9.]*' | head -1 | cut -d: -f2)
      EVIDENCE=$(echo "$RESPONSE" | grep -o '"evidenceLevel":"[^"]*"' | head -1 | cut -d'"' -f4)
      TOTAL_COST=$(python3 -c "print(round($TOTAL_COST + ${COST:-0}, 4))")
      echo "  ✓ Done in ${DURATION}s | ID: $BRIEF_ID | Cost: \$${COST:-?} | Evidence: ${EVIDENCE:-?} | Running total: \$$TOTAL_COST" | tee -a "$LOG_FILE"
      break
    fi

    # Check for rate limit
    if echo "$RESPONSE" | grep -qi "rate.limit"; then
      RETRY=$((RETRY + 1))
      if [ "$RETRY" -gt "$MAX_RETRIES" ]; then
        FAILED=$((FAILED + 1))
        echo "  ✗ FAILED after $MAX_RETRIES retries (rate limited)" | tee -a "$LOG_FILE"
      fi
      continue
    fi

    # Other error
    ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$ERROR" ]; then
      FAILED=$((FAILED + 1))
      echo "  ✗ FAILED in ${DURATION}s | Error: $ERROR" | tee -a "$LOG_FILE"
    else
      FAILED=$((FAILED + 1))
      echo "  ✗ FAILED in ${DURATION}s | No complete event received" | tee -a "$LOG_FILE"
      echo "  Response tail: ${RESPONSE: -300}" >> "$LOG_FILE"
    fi
    break
  done

  # Delay between requests to avoid rate limits
  if [ "$TOTAL" -lt "$TOTAL_ITEMS" ]; then
    echo "  Waiting ${BASE_DELAY}s before next request..." | tee -a "$LOG_FILE"
    sleep "$BASE_DELAY"
  fi
done

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Total: $TOTAL | Success: $SUCCESS | Failed: $FAILED" | tee -a "$LOG_FILE"
echo "Total API cost: \$$TOTAL_COST" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE"
