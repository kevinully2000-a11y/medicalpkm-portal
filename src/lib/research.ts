/**
 * PubMed E-utilities integration for evidence-grounded KOL brief generation.
 *
 * Queries PubMed for a KOL's actual publications before the Claude API call,
 * providing verifiable publication data (titles, journals, dates, counts).
 * This prevents hallucination by grounding the brief in real evidence.
 *
 * PubMed API: free, no API key required (3 req/sec without key).
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];   // first 3 authors + "et al." if more
  journal: string;
  pubDate: string;     // e.g. "2024 Jan"
  doi?: string;
}

export interface PubMedResearch {
  totalPublications: number;
  recentArticles: PubMedArticle[];   // up to 10 most recent
  searchQuery: string;               // the PubMed query used (for transparency)
  fetchedAt: string;                 // ISO timestamp
  status: 'success' | 'partial' | 'no_results' | 'error';
  errorMessage?: string;
}

export type EvidenceLevel = 'high' | 'moderate' | 'low' | 'minimal';

export interface ResearchContext {
  pubmed: PubMedResearch;
  evidenceLevel: EvidenceLevel;
}

// ── PubMed API ─────────────────────────────────────────────────────────────

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const SEARCH_TIMEOUT = 5000;  // 5s for ESearch
const SUMMARY_TIMEOUT = 5000; // 5s for ESummary
const MAX_ARTICLES = 10;

/**
 * Build a PubMed author search query from a full name.
 *
 * PubMed author format: "LastName FI" (e.g., "Flack JM")
 * If the name has a middle initial, we include it.
 */
function buildAuthorQuery(kolName: string): string {
  // Remove credentials (MD, PhD, DO, FAHA, etc.)
  const cleaned = kolName
    .replace(/,?\s*(MD|DO|PhD|MPH|MS|MBA|FAHA|FACC|FACEP|FACS|FCCP|FRCP|DrPH|MSCI|MHS|MA|EdD|JD|RN|NP|PA|CAQSM|CAQ-SM)\b/gi, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return kolName;

  const lastName = parts[parts.length - 1];
  const firstInitial = parts[0]?.[0]?.toUpperCase() || '';
  const middleInitial = parts.length > 2 ? parts[1]?.[0]?.toUpperCase() || '' : '';

  return `${lastName} ${firstInitial}${middleInitial}`.trim();
}

/**
 * Build alternate PubMed queries for hyphenated or complex last names.
 * E.g., "Cobb-Walch A" → also try "Walch A", "Cobb Walch A"
 */
function buildAlternateQueries(kolName: string): string[] {
  const primary = buildAuthorQuery(kolName);
  const alts: string[] = [];

  // For hyphenated last names: try just the last part, and without hyphen
  const parts = primary.split(' ');
  const lastName = parts[0];
  const initials = parts.slice(1).join(' ');

  if (lastName.includes('-')) {
    const hyphenParts = lastName.split('-');
    // Try last part of hyphenated name (e.g., "Walch A")
    alts.push(`${hyphenParts[hyphenParts.length - 1]} ${initials}`.trim());
    // Try without hyphen (e.g., "Cobb Walch A")
    alts.push(`${hyphenParts.join(' ')} ${initials}`.trim());
  }

  return alts;
}

/**
 * Search PubMed for publications by a given KOL.
 *
 * Strategy:
 * 1. Search by author name in PubMed's standard format
 * 2. If institution provided and results are ambiguous (>500), narrow with affiliation filter
 * 3. Fetch article summaries for the top 10 most recent
 */
export async function fetchPubMedResearch(
  kolName: string,
  institution?: string,
): Promise<PubMedResearch> {
  const fetchedAt = new Date().toISOString();
  const authorQuery = buildAuthorQuery(kolName);

  try {
    // Step 1: ESearch — get PMIDs
    let searchTerm = `"${authorQuery}"[Author]`;
    const initialResult = await pubmedSearch(searchTerm);

    // If ambiguous (>500 results) and institution provided, narrow search
    if (initialResult.count > 500 && institution) {
      const narrowTerm = `"${authorQuery}"[Author] AND "${institution}"[Affiliation]`;
      const narrowResult = await pubmedSearch(narrowTerm);
      // Use narrow results if they returned something (even 0 is informative)
      if (narrowResult.count > 0) {
        searchTerm = narrowTerm;
        const articles = narrowResult.ids.length > 0
          ? await fetchArticleSummaries(narrowResult.ids.slice(0, MAX_ARTICLES))
          : [];
        return {
          totalPublications: narrowResult.count,
          recentArticles: articles,
          searchQuery: narrowTerm,
          fetchedAt,
          status: articles.length > 0 ? 'success' : 'partial',
        };
      }
      // Fall through to original results if narrow search found nothing
    }

    if (initialResult.count === 0) {
      // Try alternate queries for hyphenated/complex names
      const alternates = buildAlternateQueries(kolName);
      for (const altQuery of alternates) {
        const altTerm = `"${altQuery}"[Author]`;
        const altResult = await pubmedSearch(altTerm);
        if (altResult.count > 0 && altResult.count < 500) {
          const articles = await fetchArticleSummaries(altResult.ids.slice(0, MAX_ARTICLES));
          return {
            totalPublications: altResult.count,
            recentArticles: articles,
            searchQuery: altTerm,
            fetchedAt,
            status: articles.length > 0 ? 'success' : 'partial',
          };
        }
      }

      // Try broader search: full name without PubMed author format
      const broadTerm = `${kolName.replace(/,?\s*(MD|DO|PhD|MPH|MS|MBA|FAHA|FACC|FACEP|FACS|FCCP|FRCP|DrPH|MSCI|MHS|CAQSM)\b/gi, '').trim()}[Author]`;
      const broadResult = await pubmedSearch(broadTerm);
      if (broadResult.count > 0) {
        const articles = await fetchArticleSummaries(broadResult.ids.slice(0, MAX_ARTICLES));
        return {
          totalPublications: broadResult.count,
          recentArticles: articles,
          searchQuery: broadTerm,
          fetchedAt,
          status: articles.length > 0 ? 'success' : 'partial',
        };
      }

      // Discovery search: find one article by searching the full name as text,
      // then extract the exact PubMed-indexed author name and re-search.
      // This mimics the "human trick" of clicking an author name on a PubMed article.
      const discoveryResult = await discoverAuthorFormat(kolName, institution);
      if (discoveryResult) {
        return {
          ...discoveryResult,
          fetchedAt,
        };
      }

      return {
        totalPublications: 0,
        recentArticles: [],
        searchQuery: searchTerm,
        fetchedAt,
        status: 'no_results',
      };
    }

    // Step 2: ESummary — get article metadata
    const articles = await fetchArticleSummaries(initialResult.ids.slice(0, MAX_ARTICLES));
    return {
      totalPublications: initialResult.count,
      recentArticles: articles,
      searchQuery: searchTerm,
      fetchedAt,
      status: articles.length > 0 ? 'success' : 'partial',
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown PubMed error';
    console.error('PubMed research failed:', errorMessage);
    return {
      totalPublications: 0,
      recentArticles: [],
      searchQuery: `"${authorQuery}"[Author]`,
      fetchedAt,
      status: 'error',
      errorMessage,
    };
  }
}

// ── PubMed ESearch ─────────────────────────────────────────────────────────

interface ESearchResult {
  count: number;
  ids: string[];
}

async function pubmedSearch(term: string): Promise<ESearchResult> {
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=${MAX_ARTICLES}&sort=date`;
  const res = await fetch(url, { signal: AbortSignal.timeout(SEARCH_TIMEOUT) });
  if (!res.ok) throw new Error(`PubMed ESearch HTTP ${res.status}`);

  const data = await res.json();
  const result = data?.esearchresult;
  return {
    count: parseInt(result?.count || '0', 10),
    ids: result?.idlist || [],
  };
}

// ── Discovery Search ──────────────────────────────────────────────────────
/**
 * "Human trick" for PubMed: search broadly to find one article by the author,
 * extract their exact PubMed-indexed name format, then re-search with that.
 *
 * E.g., searching "Abby Cobb-Walch" as text → find an article with her as author
 * → PubMed stores her as "Cobb-Walch AB" → search "Cobb-Walch AB"[Author] → all papers.
 */
async function discoverAuthorFormat(
  kolName: string,
  institution?: string,
): Promise<Omit<PubMedResearch, 'fetchedAt'> | null> {
  try {
    // Clean the name for text search
    const cleanName = kolName
      .replace(/,?\s*(MD|DO|PhD|MPH|MS|MBA|FAHA|FACC|FACEP|FACS|FCCP|FRCP|DrPH|MSCI|MHS|MA|EdD|JD|RN|NP|PA|CAQSM)\b/gi, '')
      .trim();

    const nameParts = cleanName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) return null;

    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts[nameParts.length - 1].toLowerCase();

    // Search by full name as free text (not [Author] tag) + optionally institution
    let discoveryTerm = `${cleanName}`;
    if (institution) {
      discoveryTerm += ` ${institution}`;
    }

    const discoveryResult = await pubmedSearch(discoveryTerm);
    if (discoveryResult.count === 0 || discoveryResult.ids.length === 0) return null;

    // Fetch summaries for first few articles to find the author's exact PubMed name
    const sampleArticles = await fetchArticleSummaries(discoveryResult.ids.slice(0, 5));

    // Look through author lists to find a matching name
    for (const article of sampleArticles) {
      // The raw ESummary gives us author names — we need to check the raw data
      // Re-fetch the summary to get the full author list
      const url = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${article.pmid}&retmode=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(SEARCH_TIMEOUT) });
      if (!res.ok) continue;

      const data = await res.json();
      const entry = data?.result?.[article.pmid];
      if (!entry?.authors) continue;

      // Find an author whose name matches (case-insensitive)
      for (const author of entry.authors) {
        const authorName: string = author.name || '';
        const authorLower = authorName.toLowerCase();

        // Check if this author matches: last name must appear, and first initial must match
        if (authorLower.includes(lastName) && authorLower.includes(firstName[0].toLowerCase())) {
          // Found the exact PubMed format! Now search with it
          const exactTerm = `"${authorName}"[Author]`;
          const exactResult = await pubmedSearch(exactTerm);

          if (exactResult.count > 0) {
            const articles = await fetchArticleSummaries(exactResult.ids.slice(0, MAX_ARTICLES));
            console.log(`PubMed discovery: "${kolName}" → "${authorName}" → ${exactResult.count} publications`);
            return {
              totalPublications: exactResult.count,
              recentArticles: articles,
              searchQuery: exactTerm,
              status: articles.length > 0 ? 'success' : 'partial',
            };
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.error('PubMed discovery search failed:', err);
    return null;
  }
}

// ── PubMed ESummary ────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchArticleSummaries(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  const url = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(SUMMARY_TIMEOUT) });
  if (!res.ok) throw new Error(`PubMed ESummary HTTP ${res.status}`);

  const data = await res.json();
  const result = data?.result;
  if (!result) return [];

  const articles: PubMedArticle[] = [];
  for (const pmid of pmids) {
    const entry = result[pmid];
    if (!entry || entry.error) continue;

    // Extract first 3 authors
    const authorList: string[] = (entry.authors || [])
      .slice(0, 3)
      .map((a: any) => a.name || a.authtype || 'Unknown');
    if ((entry.authors || []).length > 3) {
      authorList.push('et al.');
    }

    articles.push({
      pmid,
      title: entry.title || 'Untitled',
      authors: authorList,
      journal: entry.source || entry.fulljournalname || 'Unknown Journal',
      pubDate: entry.pubdate || entry.epubdate || 'Unknown Date',
      doi: entry.elocationid?.replace('doi: ', '') || undefined,
    });
  }

  return articles;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Evidence Level Classification ──────────────────────────────────────────

/**
 * Classify evidence level based on PubMed data.
 *
 * - high:    50+ publications — prolific researcher, full brief expected
 * - moderate: 10-49 publications — established, detailed brief
 * - low:     1-9 publications — early career, shorter brief with caveats
 * - minimal: 0 publications — maximum caution, only web-verified facts
 */
export function classifyEvidenceLevel(pubmed: PubMedResearch): EvidenceLevel {
  if (pubmed.status === 'error') return 'minimal';
  if (pubmed.totalPublications >= 50) return 'high';
  if (pubmed.totalPublications >= 10) return 'moderate';
  if (pubmed.totalPublications >= 1) return 'low';
  return 'minimal';
}

/**
 * Orchestrate all research for a KOL.
 */
export async function gatherEvidence(
  kolName: string,
  institution?: string,
): Promise<ResearchContext> {
  const pubmed = await fetchPubMedResearch(kolName, institution);
  const evidenceLevel = classifyEvidenceLevel(pubmed);
  return { pubmed, evidenceLevel };
}
