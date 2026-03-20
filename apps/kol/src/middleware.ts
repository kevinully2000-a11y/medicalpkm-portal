import { NextRequest, NextResponse } from 'next/server';

const CF_ACCESS_TEAM = 'medicalpkm';
const CF_ACCESS_CERTS_URL = `https://${CF_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`;

// Cache the JWKS keys in memory
let cachedKeys: JsonWebKey[] | null = null;
let cacheExpiry = 0;

async function getPublicKeys(): Promise<JsonWebKey[]> {
  const now = Date.now();
  if (cachedKeys && now < cacheExpiry) {
    return cachedKeys;
  }

  const res = await fetch(CF_ACCESS_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Cloudflare Access certs: ${res.status}`);
  }

  const data = await res.json();
  cachedKeys = data.keys;
  cacheExpiry = now + 5 * 60 * 1000; // Cache for 5 minutes
  return data.keys;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyCloudflareAccessJWT(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const headerJson = new TextDecoder().decode(base64UrlDecode(parts[0]));
    const header = JSON.parse(headerJson);
    const kid = header.kid;

    const keys = await getPublicKeys();
    const matchingKey = keys.find((k: JsonWebKey & { kid?: string }) => k.kid === kid);
    if (!matchingKey) return false;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      matchingKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlDecode(parts[2]).buffer as ArrayBuffer;
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`).buffer as ArrayBuffer;

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signature,
      data
    );

    if (!valid) return false;

    // Check expiration
    const payloadJson = new TextDecoder().decode(base64UrlDecode(parts[1]));
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Bypass auth on Vercel preview deployments and local dev (no CF Access JWT present)
  if (hostname.includes('vercel.app') || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Check for Cloudflare Access JWT
  const cfAccessJwt =
    request.headers.get('cf-access-jwt-assertion') ||
    request.cookies.get('CF_Authorization')?.value;

  if (!cfAccessJwt) {
    return new NextResponse('Access denied', { status: 403 });
  }

  const isValid = await verifyCloudflareAccessJWT(cfAccessJwt);
  if (!isValid) {
    return new NextResponse('Access denied', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
