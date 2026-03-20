'use client';

import JSZip from 'jszip';
import { KOLBrief, BriefSummary } from '@/lib/types';
import { generateBriefPdf } from '@/lib/pdf';

/**
 * Generate a PDF filename from a brief.
 * Format: ACP_26_Jane_Doe.pdf
 * Conference tag dots become underscores, spaces become underscores.
 */
function makePdfFilename(brief: KOLBrief | BriefSummary): string {
  const parts: string[] = [];

  // Conference tag: "ACP.26" → "ACP_26"
  if (brief.conference) {
    parts.push(brief.conference.replace(/[.\s]+/g, '_'));
  }

  // KOL name: "Jane M. Doe" → "Jane_M_Doe"
  if (brief.kolName) {
    parts.push(
      brief.kolName
        .replace(/[.\s]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    );
  }

  const base = parts.join('_') || 'brief';
  return `${base}.pdf`;
}

export interface BatchDownloadProgress {
  current: number;
  total: number;
  currentName: string;
  phase: 'fetching' | 'generating' | 'zipping' | 'done' | 'error';
  error?: string;
}

/**
 * Download multiple briefs as a ZIP of PDFs.
 * Fetches full brief data, generates PDFs, zips them, and triggers download.
 */
export async function downloadBriefsAsZip(
  briefSummaries: BriefSummary[],
  onProgress?: (progress: BatchDownloadProgress) => void,
): Promise<void> {
  const total = briefSummaries.length;
  if (total === 0) return;

  const zip = new JSZip();

  // Track filenames to avoid duplicates
  const usedNames = new Set<string>();

  for (let i = 0; i < total; i++) {
    const summary = briefSummaries[i];

    try {
      // Phase 1: Fetch full brief
      onProgress?.({
        current: i + 1,
        total,
        currentName: summary.kolName,
        phase: 'fetching',
      });

      const res = await fetch(`/api/briefs/${summary.id}`);
      if (!res.ok) {
        console.warn(`Failed to fetch brief ${summary.id}: ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (!data.success || !data.brief) {
        console.warn(`Brief ${summary.id} not found`);
        continue;
      }
      const brief: KOLBrief = data.brief;

      // Phase 2: Generate PDF
      onProgress?.({
        current: i + 1,
        total,
        currentName: summary.kolName,
        phase: 'generating',
      });

      const doc = await generateBriefPdf(brief);

      // Get unique filename
      let filename = makePdfFilename(brief);
      if (usedNames.has(filename)) {
        const base = filename.replace('.pdf', '');
        let counter = 2;
        while (usedNames.has(`${base}_${counter}.pdf`)) counter++;
        filename = `${base}_${counter}.pdf`;
      }
      usedNames.add(filename);

      // Add to ZIP as arraybuffer
      const pdfBlob = doc.output('arraybuffer');
      zip.file(filename, pdfBlob);
    } catch (err) {
      console.warn(`Error processing brief for ${summary.kolName}:`, err);
      // Continue with remaining briefs
    }
  }

  // Phase 3: Generate ZIP
  onProgress?.({
    current: total,
    total,
    currentName: 'Creating ZIP...',
    phase: 'zipping',
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Determine ZIP filename from conference filter or generic
  const conference = briefSummaries[0]?.conference;
  const zipName = conference
    ? `${conference.replace(/[.\s]+/g, '_')}_Briefs_${total}.zip`
    : `KOL_Briefs_${total}.zip`;

  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  onProgress?.({
    current: total,
    total,
    currentName: '',
    phase: 'done',
  });
}
