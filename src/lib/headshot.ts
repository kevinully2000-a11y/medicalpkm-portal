/**
 * Auto-fetch KOL headshot using multiple strategies:
 * 1. KV cache (30-day TTL)
 * 2. Google Custom Search API (if configured)
 * 3. Wikipedia API (free, bot-friendly, works for notable KOLs)
 * 4. Direct institution website profile page (og:image extraction)
 *
 * Gracefully returns undefined if all strategies fail.
 */

import { getCachedHeadshot, cacheHeadshot } from './kv';

export async function fetchHeadshotUrl(
  kolName: string,
  institution?: string
): Promise<string | undefined> {
  // Strategy 1: Check KV cache
  try {
    const cached = await getCachedHeadshot(kolName);
    if (cached) {
      console.log(`Headshot cache hit for ${kolName}`);
      return cached;
    }
  } catch {
    // Cache miss or KV unavailable — continue
  }

  console.log(`Fetching headshot for ${kolName} (institution: ${institution || 'none'})`);

  // Strategy 2: Google CSE (if API keys are configured)
  const cseResult = await tryGoogleCSE(kolName, institution);
  if (cseResult) {
    await cacheHeadshot(kolName, cseResult);
    return cseResult;
  }

  // Strategy 3: Wikipedia API (free, no key needed)
  const wikiResult = await tryWikipedia(kolName);
  if (wikiResult) {
    await cacheHeadshot(kolName, wikiResult);
    return wikiResult;
  }

  // Strategy 4: Direct institution profile page
  if (institution) {
    const profileResult = await tryInstitutionProfile(kolName, institution);
    if (profileResult) {
      await cacheHeadshot(kolName, profileResult);
      return profileResult;
    }
  }

  console.log(`No headshot found for ${kolName} after all strategies`);
  return undefined;
}

// ---------------------------------------------------------------------------
// Strategy 2: Google Custom Search API
// ---------------------------------------------------------------------------
async function tryGoogleCSE(
  kolName: string,
  institution?: string
): Promise<string | undefined> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cx) {
    console.log('Google CSE skipped: missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX');
    return undefined;
  }

  try {
    const query = `"${kolName}" ${institution || ''} headshot OR portrait OR photo`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=3&imgSize=medium&imgType=face`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unable to read body');
      console.error(`Google CSE failed for ${kolName}: HTTP ${res.status} — ${errorBody.substring(0, 200)}`);
      return undefined;
    }

    const data = await res.json();
    const items = data.items as Array<{ link: string; displayLink: string }> | undefined;
    if (!items || items.length === 0) {
      console.log(`Google CSE: no image results for ${kolName}`);
      return undefined;
    }

    const institutionLower = (institution || '').toLowerCase().replace(/\s+/g, '');
    const preferred = items.find(
      (item) =>
        item.link.includes('.edu') ||
        (institutionLower && item.displayLink.toLowerCase().includes(institutionLower))
    );

    const result = preferred?.link || items[0]?.link;
    console.log(`Google CSE headshot found for ${kolName}: ${result}`);
    return result;
  } catch (error) {
    console.error(`Google CSE error for ${kolName}:`, error);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Strategy 3: Wikipedia API — free, bot-friendly, no API key
// ---------------------------------------------------------------------------
async function tryWikipedia(kolName: string): Promise<string | undefined> {
  try {
    // Step 1: Try direct page lookup by name
    const title = kolName.replace(/\s+/g, '_');
    const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=400&format=json&origin=*`;

    const directRes = await fetch(directUrl, { signal: AbortSignal.timeout(5000) });
    if (directRes.ok) {
      const data = await directRes.json();
      const pages = data.query?.pages;
      if (pages) {
        for (const pageId of Object.keys(pages)) {
          if (pageId !== '-1' && pages[pageId].thumbnail?.source) {
            console.log(`Wikipedia headshot found for ${kolName} (direct lookup)`);
            return pages[pageId].thumbnail.source;
          }
        }
      }
    }

    // Step 2: If direct lookup fails, try search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(kolName + ' physician')}&srnamespace=0&srlimit=3&format=json&origin=*`;

    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    if (!searchRes.ok) return undefined;

    const searchData = await searchRes.json();
    const results = searchData.query?.search;
    if (!results || results.length === 0) return undefined;

    // Check if any search result is actually about this person
    const nameParts = kolName.toLowerCase().split(' ');
    const lastName = nameParts[nameParts.length - 1];

    for (const result of results) {
      const resultTitle = result.title.toLowerCase();
      if (!resultTitle.includes(lastName)) continue;

      // Fetch the page image for this result
      const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=pageimages&pithumbsize=400&format=json&origin=*`;
      const pageRes = await fetch(pageUrl, { signal: AbortSignal.timeout(5000) });
      if (!pageRes.ok) continue;

      const pageData = await pageRes.json();
      const pages = pageData.query?.pages;
      if (!pages) continue;

      for (const pageId of Object.keys(pages)) {
        if (pageId !== '-1' && pages[pageId].thumbnail?.source) {
          console.log(`Wikipedia headshot found for ${kolName} (search: "${result.title}")`);
          return pages[pageId].thumbnail.source;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.error('Wikipedia API failed:', error);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Strategy 4: Direct institution website profile → extract og:image
// ---------------------------------------------------------------------------
async function tryInstitutionProfile(
  kolName: string,
  institution: string
): Promise<string | undefined> {
  try {
    // Build a set of likely institution domains to try
    const domains = guessInstitutionDomains(institution);
    if (domains.length === 0) return undefined;

    // Try to find the KOL's profile page on each domain
    for (const domain of domains.slice(0, 2)) {
      try {
        // Fetch the institution's main page to find faculty/profile patterns
        const profileUrl = `https://${domain}`;
        const mainRes = await fetch(profileUrl, {
          signal: AbortSignal.timeout(5000),
          redirect: 'follow',
        });
        if (!mainRes.ok) continue;

        // Try a direct Google-style search within the institution site
        // by fetching a page that might be a faculty directory
        const nameParts = kolName.toLowerCase().split(' ');
        const lastName = nameParts[nameParts.length - 1];

        // Common faculty page URL patterns
        const profilePatterns = [
          `https://${domain}/faculty/${lastName}`,
          `https://${domain}/people/${lastName}`,
          `https://${domain}/directory/physicians/${lastName.charAt(0)}/${kolName.toLowerCase().replace(/\s+/g, '-')}`,
          `https://${domain}/providers/${kolName.toLowerCase().replace(/\s+/g, '-')}`,
        ];

        for (const patternUrl of profilePatterns) {
          try {
            const pageRes = await fetch(patternUrl, {
              signal: AbortSignal.timeout(4000),
              redirect: 'follow',
            });
            if (!pageRes.ok) continue;

            const html = await pageRes.text();
            const imageUrl = extractImageFromHtml(html, patternUrl);
            if (imageUrl) {
              console.log(`Institution headshot found for ${kolName} at ${patternUrl}`);
              return imageUrl;
            }
          } catch {
            continue;
          }
        }
      } catch {
        continue;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Guess institution website domains from the institution name.
 */
function guessInstitutionDomains(institution: string): string[] {
  const lower = institution.toLowerCase();
  const domains: string[] = [];

  // Common medical institution domain mappings
  const knownInstitutions: Record<string, string[]> = {
    'scripps': ['www.scripps.edu', 'www.scrippshealth.org'],
    'mayo': ['www.mayoclinic.org', 'www.mayo.edu'],
    'cleveland clinic': ['my.clevelandclinic.org', 'www.clevelandclinic.org'],
    'johns hopkins': ['www.hopkinsmedicine.org', 'www.jhu.edu'],
    'harvard': ['hms.harvard.edu', 'www.massgeneral.org'],
    'stanford': ['med.stanford.edu', 'www.stanfordhealthcare.org'],
    'ucsf': ['www.ucsf.edu', 'profiles.ucsf.edu'],
    'mount sinai': ['www.mountsinai.org', 'icahn.mssm.edu'],
    'boston children': ['www.childrenshospital.org'],
    'children\'s hospital of philadelphia': ['www.chop.edu'],
    'chop': ['www.chop.edu'],
    'memorial sloan': ['www.mskcc.org'],
    'md anderson': ['www.mdanderson.org'],
    'duke': ['medicine.duke.edu', 'www.dukehealth.org'],
    'yale': ['medicine.yale.edu', 'www.yalemedicine.org'],
    'columbia': ['www.columbiadoctors.org', 'www.cumc.columbia.edu'],
    'penn': ['www.pennmedicine.org', 'www.med.upenn.edu'],
    'ucla': ['www.uclahealth.org', 'medschool.ucla.edu'],
    'nyu': ['nyulangone.org', 'med.nyu.edu'],
    'northwestern': ['www.nm.org', 'www.feinberg.northwestern.edu'],
    'emory': ['www.emoryhealthcare.org', 'med.emory.edu'],
  };

  for (const [key, urls] of Object.entries(knownInstitutions)) {
    if (lower.includes(key)) {
      domains.push(...urls);
    }
  }

  return domains;
}

/**
 * Extract the most likely headshot image URL from page HTML.
 */
function extractImageFromHtml(html: string, pageUrl: string): string | undefined {
  // Strategy A: og:image meta tag
  const ogImage = extractMetaContent(html, 'og:image');
  if (ogImage && isLikelyHeadshot(ogImage)) {
    return resolveUrl(ogImage, pageUrl);
  }

  // Strategy B: twitter:image
  const twitterImage = extractMetaContent(html, 'twitter:image');
  if (twitterImage && isLikelyHeadshot(twitterImage)) {
    return resolveUrl(twitterImage, pageUrl);
  }

  // Strategy C: Profile image CSS class patterns
  const profileImgPatterns = [
    /<img[^>]+class="[^"]*(?:profile|headshot|portrait|avatar|physician|faculty|staff|doctor)[^"]*"[^>]+src="([^"]+)"/i,
    /<img[^>]+src="([^"]+)"[^>]+class="[^"]*(?:profile|headshot|portrait|avatar|physician|faculty|staff|doctor)[^"]*"/i,
    /<img[^>]+alt="[^"]*(?:photo|portrait|headshot)[^"]*"[^>]+src="([^"]+)"/i,
    /<img[^>]+src="([^"]+)"[^>]+alt="[^"]*(?:photo|portrait|headshot)[^"]*"/i,
  ];

  for (const pattern of profileImgPatterns) {
    const match = html.match(pattern);
    if (match && isLikelyHeadshot(match[1])) {
      return resolveUrl(match[1], pageUrl);
    }
  }

  // Strategy D: og:image even if not strictly a headshot (last resort)
  if (ogImage) return resolveUrl(ogImage, pageUrl);

  return undefined;
}

function extractMetaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"`, 'i'),
    new RegExp(`<meta\\s+content="([^"]+)"\\s+(?:property|name)="${property}"`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

function resolveUrl(imageUrl: string, pageUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  try {
    return new URL(imageUrl, pageUrl).href;
  } catch {
    return imageUrl;
  }
}

function isLikelyHeadshot(url: string): boolean {
  const lower = url.toLowerCase();
  if (
    lower.includes('logo') ||
    lower.includes('banner') ||
    lower.includes('icon') ||
    lower.includes('favicon') ||
    lower.includes('sprite') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return false;
  }
  return true;
}
