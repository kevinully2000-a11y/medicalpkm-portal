#!/usr/bin/env node
/**
 * Regenerate all ACC.26 briefs with v0.6.0 prompt improvements.
 * Feeds existing brief data as context to reduce web search needs.
 *
 * Usage: node scripts/regenerate-acc26.mjs
 * Requires: dev server running on localhost:3000
 */

const BASE = 'http://localhost:3000';

async function fetchBriefs() {
  const res = await fetch(`${BASE}/api/briefs`);
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch briefs: ' + data.error);
  return data.briefs;
}

async function fetchFullBrief(id) {
  const res = await fetch(`${BASE}/api/briefs/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch brief ' + id);
  return data.brief;
}

function buildContext(brief) {
  const parts = [];

  if (brief.executiveSummary) {
    parts.push(`VERIFIED EXECUTIVE SUMMARY (from prior brief):\n${brief.executiveSummary}`);
  }

  if (brief.leadershipPositions?.length > 0) {
    const positions = brief.leadershipPositions
      .map(p => `- ${p.title} at ${p.organization}${p.current ? ' (current)' : ''}`)
      .join('\n');
    parts.push(`VERIFIED LEADERSHIP POSITIONS:\n${positions}`);
  }

  if (brief.metrics) {
    const m = brief.metrics;
    parts.push(`VERIFIED METRICS: ${m.publications} publications, ${m.citations} citations, h-index ${m.hIndex}`);
  }

  if (brief.evidence?.citations?.length > 0) {
    const cites = brief.evidence.citations.slice(0, 5)
      .map(c => `- ${c.title}: ${c.url}`)
      .join('\n');
    parts.push(`VERIFIED SOURCES (from prior web search):\n${cites}`);
  }

  if (brief.professionalBackground) {
    // Just first 200 chars to hint at career path
    parts.push(`CAREER SUMMARY: ${brief.professionalBackground.substring(0, 300)}...`);
  }

  parts.push('Conference: ACC.26');

  return parts.join('\n\n');
}

async function generateBrief(kolName, institution, specialty, context, priority, conference, headshotUrl) {
  const body = {
    kolName,
    institution,
    specialty,
    additionalContext: context,
    priority: priority || 'medium',
    conference: conference || 'ACC.26',
    briefTier: 'strategic',
    maxWebSearches: 3, // Reduced from 5 since we have prior context
    headshotUrl: headshotUrl || undefined,
  };

  const res = await fetch(`${BASE}/api/generate-brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Read SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = null;
  let lastEvent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6));
          lastEvent = event.type;

          if (event.type === 'research') {
            process.stdout.write(` [PubMed: ${event.pubmedCount}, evidence: ${event.evidenceLevel}]`);
          } else if (event.type === 'complete') {
            result = event.brief;
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        } catch (e) {
          if (e.message && !e.message.includes('Unexpected')) throw e;
        }
      }
    }
  }

  return result;
}

async function main() {
  console.log('Fetching existing ACC.26 briefs...\n');

  const allBriefs = await fetchBriefs();
  const accBriefs = allBriefs.filter(b => b.conference === 'ACC.26');

  // Deduplicate by KOL name (keep latest)
  const seen = new Map();
  for (const b of accBriefs) {
    const key = b.kolName.toLowerCase();
    if (!seen.has(key) || new Date(b.generatedAt) > new Date(seen.get(key).generatedAt)) {
      seen.set(key, b);
    }
  }

  const uniqueBriefs = Array.from(seen.values());
  console.log(`Found ${accBriefs.length} ACC.26 briefs (${uniqueBriefs.length} unique KOLs)\n`);

  let totalCost = 0;
  let completed = 0;
  let failed = 0;

  for (const brief of uniqueBriefs) {
    const num = completed + failed + 1;
    process.stdout.write(`[${num}/${uniqueBriefs.length}] ${brief.kolName}`);

    try {
      // Fetch full brief for context
      const fullBrief = await fetchFullBrief(brief.id);
      const context = buildContext(fullBrief);
      const specialty = brief.specialties?.[0] || '';

      const start = Date.now();
      const newBrief = await generateBrief(
        brief.kolName,
        brief.institution,
        specialty,
        context,
        brief.priority,
        brief.conference,
        fullBrief.headshotUrl,
      );

      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      const cost = newBrief?.cost?.totalCostUsd || 0;
      totalCost += cost;
      completed++;

      const starters = newBrief?.conversationStarters?.length || 0;
      const leaders = newBrief?.leadershipPositions?.length || 0;
      console.log(` ✓ ${elapsed}s $${cost.toFixed(2)} (${starters} starters, ${leaders} positions)`);
    } catch (err) {
      failed++;
      console.log(` ✗ ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Completed: ${completed}/${uniqueBriefs.length} | Failed: ${failed}`);
  console.log(`Total cost: $${totalCost.toFixed(2)}`);
  console.log(`Average: $${(totalCost / (completed || 1)).toFixed(2)}/brief`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
