import { kv } from '@vercel/kv';
import { KOLBrief, BriefSummary } from './types';

export async function saveBrief(brief: KOLBrief): Promise<void> {
  await kv.set(`brief:${brief.id}`, brief);
  await kv.zadd('briefs:index', {
    score: -new Date(brief.generatedAt).getTime(),
    member: brief.id,
  });
}

export async function getBrief(id: string): Promise<KOLBrief | null> {
  return kv.get<KOLBrief>(`brief:${id}`);
}

export async function listBriefs(): Promise<BriefSummary[]> {
  const ids = await kv.zrange<string[]>('briefs:index', 0, -1);
  if (!ids || ids.length === 0) return [];

  const briefs = await Promise.all(
    ids.map((id) => kv.get<KOLBrief>(`brief:${id}`))
  );

  return briefs
    .filter((b): b is KOLBrief => b !== null)
    .map((b) => ({
      id: b.id,
      kolName: b.kolName,
      institution: b.institution,
      specialties: b.specialties,
      focusAreas: b.focusAreas ?? [],
      generatedAt: b.generatedAt,
      appVersion: b.appVersion || 'unknown',
      headshotUrl: b.headshotUrl,
      hidden: b.hidden ?? false,
      cost: b.cost,
      evidenceLevel: b.evidence?.evidenceLevel,
      npi: b.npi,
      conference: b.conference,
      conferenceSessions: b.conferenceSessions,
      priority: b.priority,
      notes: b.notes,
    }));
}

export async function updateBrief(
  id: string,
  updates: Partial<KOLBrief>
): Promise<KOLBrief | null> {
  const brief = await kv.get<KOLBrief>(`brief:${id}`);
  if (!brief) return null;
  const updated = { ...brief, ...updates };
  await kv.set(`brief:${id}`, updated);
  return updated;
}

export async function deleteBrief(id: string): Promise<boolean> {
  const exists = await kv.exists(`brief:${id}`);
  if (!exists) return false;
  await kv.del(`brief:${id}`);
  await kv.zrem('briefs:index', id);
  return true;
}

// --- Headshot cache ---
const HEADSHOT_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

function headshotKey(kolName: string): string {
  return `headshot:${kolName.toLowerCase().trim().replace(/\s+/g, '-')}`;
}

export async function getCachedHeadshot(kolName: string): Promise<string | null> {
  try {
    return await kv.get<string>(headshotKey(kolName));
  } catch {
    return null;
  }
}

export async function cacheHeadshot(kolName: string, url: string): Promise<void> {
  try {
    await kv.set(headshotKey(kolName), url, { ex: HEADSHOT_TTL });
  } catch {
    // Non-blocking — cache miss is fine
  }
}
