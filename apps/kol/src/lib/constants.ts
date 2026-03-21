export const APP_VERSION = '0.6.0';
export const ADMIN_EMAIL = 'kevin.ully2000@gmail.com';

// Cloudflare Access config — used by admin user management API
export const CF_ACCOUNT_ID = '720188182d247df529ed121b3ddb59e6';
export const CF_APP_ID = 'dbf6d196-faeb-4403-9acc-92469c67ef64';
export const CF_POLICY_ID = 'ad315038-7242-448e-9d7c-29ddcf812e02'; // "Allow Approved Emails" policy

// --- Claude API Pricing ---
export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
export const CLAUDE_MAX_TOKENS = 16384;

// USD per million tokens
export const PRICING = {
  model: CLAUDE_MODEL,
  inputRatePerMTok: 3.00,
  outputRatePerMTok: 15.00,
} as const;

// Web search cost (Anthropic server-side tool)
export const WEB_SEARCH_COST_PER_REQUEST = 0.01; // $10 per 1,000 searches

// Typical token counts for a single brief (measured empirically)
// Input tokens increased due to web search result content being counted as input
export const ESTIMATED_TOKENS = {
  input: 5000,
  output: 6000,
} as const;

export const ESTIMATED_WEB_SEARCHES_PER_BRIEF = 5;

// Pre-computed estimated cost per brief (USD)
export const ESTIMATED_COST_PER_BRIEF =
  (ESTIMATED_TOKENS.input * PRICING.inputRatePerMTok +
    ESTIMATED_TOKENS.output * PRICING.outputRatePerMTok) /
  1_000_000 +
  ESTIMATED_WEB_SEARCHES_PER_BRIEF * WEB_SEARCH_COST_PER_REQUEST;
