import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { KOLBrief, GenerateBriefRequest, WebSearchCitation, EvidenceMetadata } from '@/lib/types';
import { saveBrief } from '@/lib/kv';
import { APP_VERSION, CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '@/lib/constants';
import { calculateCost } from '@/lib/cost';
import { fetchHeadshotUrl } from '@/lib/headshot';
import { gatherEvidence } from '@/lib/research';
import type { EvidenceLevel } from '@/lib/research';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Determine max web search uses based on evidence level.
 * Lower evidence = more searches needed to find verifiable info.
 */
function getMaxWebSearchUses(evidenceLevel: EvidenceLevel): number {
  switch (evidenceLevel) {
    case 'high': return 5;
    case 'moderate': return 5;
    case 'low': return 8;
    case 'minimal': return 10;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBriefRequest = await request.json();
    if (!body.kolName || body.kolName.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'KOL name is required' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured.' }, { status: 500 });
    }

    const encoder = new TextEncoder();

    let abortStream: (() => void) | null = null;
    let cancelled = false;

    const stream = new ReadableStream({
      async start(controller) {
        function enqueue(data: object) {
          if (!cancelled) {
            try {
              controller.enqueue(encoder.encode(sseEvent(data)));
            } catch {
              // Controller already closed (client disconnected)
            }
          }
        }

        function close() {
          if (!cancelled) {
            try {
              controller.close();
            } catch {
              // Controller already closed
            }
          }
        }

        try {
          // ── Phase 1: Research (parallel with headshot fetch) ──────────
          const [evidenceResult, headshotResult] = await Promise.allSettled([
            gatherEvidence(body.kolName, body.institution),
            body.headshotUrl
              ? Promise.resolve(body.headshotUrl)
              : fetchHeadshotUrl(body.kolName, body.institution).catch(() => undefined),
          ]);

          const research = evidenceResult.status === 'fulfilled'
            ? evidenceResult.value
            : {
                pubmed: {
                  totalPublications: 0,
                  recentArticles: [],
                  searchQuery: body.kolName,
                  fetchedAt: new Date().toISOString(),
                  status: 'error' as const,
                  errorMessage: 'Research failed',
                },
                evidenceLevel: 'minimal' as EvidenceLevel,
              };

          let headshotUrl: string | undefined =
            headshotResult.status === 'fulfilled' ? headshotResult.value || undefined : undefined;

          // Send research phase result to client
          enqueue({
            type: 'research',
            evidenceLevel: research.evidenceLevel,
            pubmedCount: research.pubmed.totalPublications,
          });

          // ── Phase 2: Build evidence-aware prompts ────────────────────
          const systemPrompt = buildSystemPrompt(research);
          const userPrompt = buildUserPrompt(
            body.kolName, body.institution, body.specialty, body.additionalContext,
          );

          // ── Phase 3: Claude API call with web search tool ────────────
          const response = anthropic.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: CLAUDE_MAX_TOKENS,
            messages: [{ role: 'user', content: userPrompt }],
            system: systemPrompt,
            tools: [{
              type: 'web_search_20250305' as const,
              name: 'web_search',
              max_uses: body.maxWebSearches ?? getMaxWebSearchUses(research.evidenceLevel),
            }],
          });

          abortStream = () => {
            cancelled = true;
            response.abort();
          };

          let fullText = '';

          response.on('text', (text) => {
            fullText += text;
            enqueue({ type: 'delta', text });
          });

          const message = await response.finalMessage();

          // ── Phase 4: Parse response + extract evidence metadata ──────

          // Check for truncation (stop_reason === 'max_tokens')
          if (message.stop_reason === 'max_tokens') {
            console.error('Response truncated — hit max_tokens limit. Full text length:', fullText.length);
            enqueue({ type: 'error', error: 'Response was truncated (too long). Try again or simplify the request.' });
            close();
            return;
          }

          // Extract JSON from accumulated text
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error('No JSON found in response. Stop reason:', message.stop_reason, 'Text length:', fullText.length, 'First 500 chars:', fullText.substring(0, 500));
            enqueue({ type: 'error', error: 'Failed to parse AI response.' });
            close();
            return;
          }

          // Strip <cite> tags injected by web search tool before parsing
          const cleanedJson = jsonMatch[0].replace(/<cite[^>]*>|<\/cite>/g, '');

          let briefData: Omit<KOLBrief, 'id' | 'generatedAt' | 'status'>;
          try {
            briefData = JSON.parse(cleanedJson);
          } catch {
            console.error('Failed to parse:', cleanedJson.substring(0, 500));
            enqueue({ type: 'error', error: 'Failed to parse AI response.' });
            close();
            return;
          }

          // Extract web search citations from content blocks
          const citations: WebSearchCitation[] = [];
          for (const block of message.content) {
            if (block.type === 'text' && block.citations) {
              for (const cite of block.citations) {
                if (cite.type === 'web_search_result_location') {
                  // Deduplicate by URL
                  if (!citations.some(c => c.url === cite.url)) {
                    citations.push({
                      url: cite.url,
                      title: cite.title || 'Untitled',
                      citedText: cite.cited_text?.substring(0, 200),
                    });
                  }
                }
              }
            }
          }

          // Extract web search usage
          const webSearchRequests = message.usage?.server_tool_use?.web_search_requests ?? 0;

          // Headshot: if auto-fetch didn't find one, try with Claude-detected institution
          if (!headshotUrl && briefData.institution) {
            try {
              headshotUrl = await fetchHeadshotUrl(body.kolName, briefData.institution);
            } catch {
              // Non-blocking
            }
          }

          // Compute cost (now includes web search)
          const usage = message.usage;
          const briefCost = calculateCost(
            usage.input_tokens,
            usage.output_tokens,
            webSearchRequests,
          );

          // Build evidence metadata
          const evidence: EvidenceMetadata = {
            evidenceLevel: research.evidenceLevel,
            pubmedPublications: research.pubmed.totalPublications,
            webSearchesPerformed: webSearchRequests,
            citations,
            researchFetchedAt: research.pubmed.fetchedAt,
          };

          const brief: KOLBrief = {
            id: generateId(),
            ...briefData,
            generatedAt: new Date().toISOString(),
            status: 'complete',
            appVersion: APP_VERSION,
            hidden: false,
            headshotUrl,
            cost: briefCost,
            evidence,
            disclaimer: briefData.disclaimer || undefined,
            npi: body.npi || undefined,
            conference: body.conference || undefined,
            conferenceSessions: body.additionalContext
              ? (body.additionalContext.match(/Session:\s*([^;]+)/g) || [])
                  .map((s: string) => s.replace(/^Session:\s*/, '').trim())
                  .filter(Boolean)
              : undefined,
            priority: body.priority || undefined,
            briefTier: body.briefTier || 'strategic',
          };

          // Save to KV
          try {
            await saveBrief(brief);
          } catch (kvError) {
            console.error('Failed to save brief to KV:', kvError);
          }

          enqueue({ type: 'complete', brief });
          close();
        } catch (error: unknown) {
          if (cancelled) return;
          const msg = error instanceof Error ? error.message : 'Unexpected error';
          let userError = msg;
          if (msg.includes('authentication') || msg.includes('api_key')) {
            userError = 'API auth failed.';
          } else if (msg.includes('rate_limit')) {
            userError = 'Rate limit. Wait and retry.';
          }
          console.error('Brief generation error:', error);
          enqueue({ type: 'error', error: userError });
          close();
        }
      },
      cancel() {
        abortStream?.();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Request error:', error);
    const msg = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

function generateId(): string {
  return `brief_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
