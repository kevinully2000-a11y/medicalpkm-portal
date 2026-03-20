import { ADMIN_EMAIL } from './constants';
import { UserContext } from './types';

/**
 * Server-side: extract user email from CF Access JWT in request headers/cookies.
 * No re-verification needed — middleware.ts already validates the JWT.
 */
export function getUserFromRequest(request: Request): UserContext | null {
  const token =
    request.headers.get('cf-access-jwt-assertion') ||
    getCookieValue(request.headers.get('cookie'), 'CF_Authorization');

  if (!token) return null;
  return decodeJwtEmail(token);
}

/**
 * Client-side: extract user email from CF_Authorization cookie.
 * Safe because middleware already verified the JWT for this request.
 */
export function getUserFromCookie(): UserContext | null {
  if (typeof document === 'undefined') return null;
  const token = getCookieValue(document.cookie, 'CF_Authorization');
  if (!token) return null;
  return decodeJwtEmail(token);
}

function getCookieValue(cookieStr: string | null, name: string): string | null {
  if (!cookieStr) return null;
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function decodeJwtEmail(token: string): UserContext | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(base64 + padding));
    const email = payload.email;
    if (!email) return null;
    return { email, isAdmin: email === ADMIN_EMAIL };
  } catch {
    return null;
  }
}
