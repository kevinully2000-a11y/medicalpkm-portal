import { NpiProviderData } from './types';

const NPPES_API_URL = 'https://npiregistry.cms.hhs.gov/api/';

interface NppesResponse {
  result_count: number;
  results: NppesResult[];
}

interface NppesResult {
  number: number;
  enumeration_type: string;
  basic: {
    first_name?: string;
    last_name?: string;
    credential?: string;
    name_prefix?: string;
  };
  taxonomies: {
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }[];
  addresses: {
    city: string;
    state: string;
    postal_code: string;
    address_type: string;
  }[];
}

function toProviderData(r: NppesResult): NpiProviderData {
  return {
    npi: String(r.number),
    firstName: r.basic.first_name || '',
    lastName: r.basic.last_name || '',
    credential: r.basic.credential || '',
    taxonomies: r.taxonomies.map((t) => ({
      code: t.code,
      description: t.desc,
      primary: t.primary,
    })),
    addresses: r.addresses
      .filter((a) => a.address_type === 'DOM')
      .map((a) => ({
        city: a.city,
        state: a.state,
        postalCode: a.postal_code,
      })),
  };
}

export async function lookupNpi(
  firstName: string,
  lastName: string,
  state?: string,
  specialty?: string
): Promise<NpiProviderData[]> {
  const params = new URLSearchParams({
    version: '2.1',
    first_name: firstName,
    last_name: lastName,
    enumeration_type: 'NPI-1',
    limit: '10',
  });

  if (state) params.set('state', state);
  if (specialty) params.set('taxonomy_description', specialty);

  const res = await fetch(`${NPPES_API_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    console.error(`NPPES API error: ${res.status}`);
    return [];
  }

  const data: NppesResponse = await res.json();
  if (!data.results || data.result_count === 0) return [];

  return data.results.map(toProviderData);
}

export async function lookupNpiByNumber(
  npi: string
): Promise<NpiProviderData | null> {
  const params = new URLSearchParams({
    version: '2.1',
    number: npi,
  });

  const res = await fetch(`${NPPES_API_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;

  const data: NppesResponse = await res.json();
  if (!data.results || data.result_count === 0) return null;

  return toProviderData(data.results[0]);
}

// Parse a speaker name like "Julia Arnsten, MD, FACP" into first/last
export function parseNameFromSpeaker(fullName: string): {
  firstName: string;
  lastName: string;
} {
  // Split on comma followed by a known credential (word boundary to avoid matching inside names like "Eduardo")
  const cleaned = fullName
    .replace(
      /,\s*(?:MD|M\.D\.|DO|D\.O\.|PhD|MPH|MHA|MHPE|MSEd|MSc|MS|MSCE|MBBS|JD|LCSW|COTA|LPC|RN|NP|PA|FACP|MACP|FACS|FACEP|Member|Jr\.|Sr\.)(?:\b|,).*$/i,
      ''
    )
    .trim();

  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };

  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
  };
}

// Extract state abbreviation from affiliation text like "...Boston, MA. Has no..."
export function extractStateFromAffiliation(
  affiliation: string
): string | undefined {
  const match = affiliation.match(
    /,\s*([A-Z]{2})(?:\s*\.|,|\s+Has\s|\s*$)/
  );
  return match ? match[1] : undefined;
}
