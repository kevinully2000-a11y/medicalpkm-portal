import { BriefCost } from './types';
import { PRICING, WEB_SEARCH_COST_PER_REQUEST } from './constants';

/**
 * Calculate cost breakdown from raw token counts + optional web search usage.
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  webSearchRequests?: number,
): BriefCost {
  const inputCostUsd = (inputTokens * PRICING.inputRatePerMTok) / 1_000_000;
  const outputCostUsd = (outputTokens * PRICING.outputRatePerMTok) / 1_000_000;
  const webSearchCostUsd = (webSearchRequests ?? 0) * WEB_SEARCH_COST_PER_REQUEST;
  return {
    inputTokens,
    outputTokens,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd + webSearchCostUsd,
    model: PRICING.model,
    webSearchRequests: webSearchRequests ?? 0,
    webSearchCostUsd,
  };
}

/**
 * Format a cost value for display (e.g., "$0.08").
 */
export function formatCost(usd: number): string {
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}
