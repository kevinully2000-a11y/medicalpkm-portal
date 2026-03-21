import { jsPDF } from 'jspdf';
import { KOLBrief, BriefTier } from '@/lib/types';

const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LINE_HEIGHT = 6;

// Headshot dimensions in mm for the PDF
const HEADSHOT_SIZE = 25;

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(title, MARGIN, y);
  y += 2;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + 40, y);
  y += 8;
  return y;
}

function addWrappedText(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);

  // Normalize em-dashes and split into paragraphs
  const normalized = text.replace(/\u2014/g, '--');
  const paragraphs = normalized.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      y += 3;
      continue;
    }
    const lines: string[] = doc.splitTextToSize(paragraph, CONTENT_WIDTH);
    for (const line of lines) {
      y = checkPageBreak(doc, y, LINE_HEIGHT);
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 2;
  }

  return y;
}

/**
 * Fetch an image URL and convert to a base64 data URL for jsPDF embedding.
 * Returns undefined if the fetch fails (CORS, network error, etc.).
 */
async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return undefined;

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    // CORS or network error — try canvas fallback
    return fetchImageViaCanvas(url);
  }
}

/**
 * Fallback: load image via an <img> element + canvas to get base64.
 * This works for images that allow cross-origin rendering.
 */
function fetchImageViaCanvas(url: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(undefined);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(undefined); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        // Canvas tainted by CORS
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);

    // Timeout: don't wait forever
    setTimeout(() => resolve(undefined), 8000);
    img.src = url;
  });
}

/**
 * Draw initials circle (fallback when headshot isn't available).
 */
function drawInitialsCircle(doc: jsPDF, name: string, x: number, y: number, size: number) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;

  // Blue circle background
  doc.setFillColor(219, 234, 254); // blue-100
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.setLineWidth(0.3);
  doc.circle(centerX, centerY, radius, 'FD');

  // Initials text
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216); // blue-700
  const textWidth = doc.getTextWidth(initials);
  doc.text(initials, centerX - textWidth / 2, centerY + 2);
}

export async function generateBriefPdf(brief: KOLBrief, tier: BriefTier = 'comprehensive'): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 20;

  // === Page 1: Header with headshot ===
  // Try to load the headshot image
  let headshotBase64: string | undefined;
  if (brief.headshotUrl) {
    headshotBase64 = await fetchImageAsBase64(brief.headshotUrl);
  }

  // Calculate header layout — text offset depends on whether headshot exists
  const hasHeadshot = !!headshotBase64;
  const textXOffset = hasHeadshot ? MARGIN + HEADSHOT_SIZE + 5 : MARGIN;
  const textWidth = hasHeadshot ? CONTENT_WIDTH - HEADSHOT_SIZE - 5 : CONTENT_WIDTH;

  // Draw headshot or initials circle
  if (hasHeadshot && headshotBase64) {
    try {
      doc.addImage(headshotBase64, 'JPEG', MARGIN, y - 3, HEADSHOT_SIZE, HEADSHOT_SIZE);
    } catch {
      // If addImage fails, draw initials fallback
      drawInitialsCircle(doc, brief.kolName, MARGIN, y - 3, HEADSHOT_SIZE);
    }
  } else if (brief.headshotUrl) {
    // Had a URL but couldn't load it — show initials
    drawInitialsCircle(doc, brief.kolName, MARGIN, y - 3, HEADSHOT_SIZE);
  }

  // Name + credentials (right of headshot if present)
  doc.setFontSize(hasHeadshot ? 18 : 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  const nameText = brief.credentials
    ? `${brief.kolName}, ${brief.credentials}`
    : brief.kolName;
  const nameLines: string[] = doc.splitTextToSize(nameText, textWidth);
  for (const line of nameLines) {
    doc.text(line, textXOffset, y);
    y += hasHeadshot ? 7 : 10;
  }

  // Institution + department
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const instText = brief.department
    ? `${brief.department}, ${brief.institution}`
    : brief.institution;
  const instLines: string[] = doc.splitTextToSize(instText, textWidth);
  for (const line of instLines) {
    doc.text(line, textXOffset, y);
    y += 5;
  }
  y += 2;

  // NPI
  if (brief.npi) {
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`NPI: ${brief.npi}`, textXOffset, y);
    y += 5;
  }

  // Conference + Priority badges
  if (brief.conference || brief.priority) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const badges: string[] = [];
    if (brief.priority) badges.push(brief.priority.toUpperCase());
    if (brief.conference) badges.push(brief.conference);
    doc.setTextColor(107, 114, 128);
    doc.text(badges.join('  |  '), textXOffset, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
  }

  // Email
  if (brief.email && brief.email !== 'Not publicly available') {
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text(brief.email, textXOffset, y);
    y += 7;
  }

  // Make sure y is past the headshot area
  if (hasHeadshot) {
    const headshotBottom = 20 - 3 + HEADSHOT_SIZE + 4;
    if (y < headshotBottom) y = headshotBottom;
  }

  // Specialties
  if (brief.specialties && brief.specialties.length > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(55, 65, 81);
    const specText = brief.specialties.join('  |  ');
    const specLines: string[] = doc.splitTextToSize(specText, CONTENT_WIDTH);
    for (const line of specLines) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 2;
  }

  // Focus Areas
  if (brief.focusAreas && brief.focusAreas.length > 0) {
    y += 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14); // amber-800
    const faText = 'Focus: ' + brief.focusAreas.join('  |  ');
    const faLines: string[] = doc.splitTextToSize(faText, CONTENT_WIDTH);
    for (const line of faLines) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 4;
  }

  // Disclaimer banner (if present — low/minimal evidence briefs)
  if (brief.disclaimer) {
    y += 2;
    y = checkPageBreak(doc, y, 20);
    // Yellow background box
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(253, 230, 138); // amber-200
    doc.setLineWidth(0.3);
    const disclaimerLines: string[] = doc.splitTextToSize(brief.disclaimer, CONTENT_WIDTH - 10);
    const boxHeight = 8 + disclaimerLines.length * 5;
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxHeight, 2, 2, 'FD');
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('Limited Evidence Notice', MARGIN + 5, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // amber-700
    for (const line of disclaimerLines) {
      doc.text(line, MARGIN + 5, y);
      y += 5;
    }
    y += 4;
  }

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // Leadership positions
  if (brief.leadershipPositions && brief.leadershipPositions.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('KEY LEADERSHIP POSITIONS', MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    for (const pos of brief.leadershipPositions) {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      const bulletText = `${pos.title} — ${pos.organization}`;
      const posLines: string[] = doc.splitTextToSize(bulletText, CONTENT_WIDTH - 5);
      for (const line of posLines) {
        doc.text(`  ${line}`, MARGIN, y);
        y += LINE_HEIGHT;
      }
      if (pos.current) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(21, 128, 61);
        doc.text('    (Current)', MARGIN + doc.getTextWidth(`  ${posLines[posLines.length - 1]}`) + 2, y - LINE_HEIGHT);
      }
    }
    y += 6;
  }

  // Publication metrics
  if (brief.metrics) {
    y = checkPageBreak(doc, y, 20);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('PUBLICATION METRICS', MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);

    const pubs = String(brief.metrics.publications);
    const cites = typeof brief.metrics.citations === 'number'
      ? brief.metrics.citations.toLocaleString()
      : String(brief.metrics.citations);
    const hIdx = String(brief.metrics.hIndex);

    const metricsText = `Publications: ${pubs}     Citations: ${cites}     H-Index: ${hIdx}`;
    doc.text(metricsText, MARGIN, y);
    y += 12;
  }

  // === Content sections (filtered by tier) ===
  const allSections: [string, string, BriefTier[]][] = [
    ['Executive Summary', brief.executiveSummary, ['executive', 'strategic', 'comprehensive']],
    ['Professional Background', brief.professionalBackground, ['strategic', 'comprehensive']],
    ['Expertise & Research Focus', brief.expertiseAndResearch, ['strategic', 'comprehensive']],
    ['Notable Achievements', brief.notableAchievements, ['comprehensive']],
    ['Recent Work & Trends', brief.recentWork, ['strategic', 'comprehensive']],
  ];

  for (const [title, content, tiers] of allSections) {
    if (!content || !tiers.includes(tier)) continue;

    // In strategic tier, truncate Professional Background to first paragraph
    let displayContent = content;
    if (tier === 'strategic' && title === 'Professional Background') {
      const firstPara = content.split('\n\n')[0];
      displayContent = firstPara;
    }

    y = addSectionTitle(doc, title, y);
    y = addWrappedText(doc, displayContent, y);
    y += 4;
  }

  // === Notes ===
  if (brief.notes) {
    y = addSectionTitle(doc, 'Notes', y);
    y = addWrappedText(doc, brief.notes, y);
    y += 4;
  }

  // === Conversation starters ===
  if (brief.conversationStarters && brief.conversationStarters.length > 0) {
    y = addSectionTitle(doc, 'Conversation Starters', y);

    for (let i = 0; i < brief.conversationStarters.length; i++) {
      const starter = brief.conversationStarters[i];
      y = checkPageBreak(doc, y, 25);

      // Numbered title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(`${i + 1}. ${starter.title}`, MARGIN, y);
      y += 7;

      // Body (skip in executive tier for conciseness)
      if (tier !== 'executive') {
        y = addWrappedText(doc, starter.body, y);
      }

      // Strategic question
      if (starter.question) {
        y = checkPageBreak(doc, y, 14);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('Strategic Question:', MARGIN + 4, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(29, 78, 216);
        const qLines: string[] = doc.splitTextToSize(starter.question, CONTENT_WIDTH - 8);
        for (const line of qLines) {
          y = checkPageBreak(doc, y, LINE_HEIGHT);
          doc.text(line, MARGIN + 4, y);
          y += LINE_HEIGHT;
        }
        y += 4;
      }
      y += 4;
    }
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    const evidenceTag = brief.evidence?.evidenceLevel
      ? ` | Evidence: ${brief.evidence.evidenceLevel}`
      : '';
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    doc.text(
      `Generated ${new Date(brief.generatedAt).toLocaleDateString()} | ${tierLabel} Brief | v${brief.appVersion || 'unknown'}${evidenceTag}`,
      MARGIN,
      290
    );
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 20, 290);
  }

  return doc;
}
