'use client';

import { useState, useEffect, useRef } from 'react';
import { KOLBrief, EvidenceLevel, WebSearchCitation, Priority, BriefTier } from '@/lib/types';
import Avatar from '@/components/Avatar';
import { formatCost } from '@/lib/cost';
import { AMA_SPECIALTIES } from '@/lib/specialties';

// ── Evidence Badge ───────────────────────────────────────────────────────────

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const config: Record<EvidenceLevel, { bg: string; text: string; label: string; icon: string }> = {
    high: { bg: 'bg-green-50', text: 'text-green-600', label: 'Verified', icon: '✓' },
    moderate: { bg: 'bg-sky-50', text: 'text-sky-600', label: 'Grounded', icon: '◉' },
    low: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Limited Data', icon: '⚠' },
    minimal: { bg: 'bg-red-50', text: 'text-red-600', label: 'Caution', icon: '⚠' },
  };
  const c = config[level];
  return (
    <span
      className={`px-1.5 py-0.5 ${c.bg} ${c.text} rounded text-xs font-medium`}
      title={`Evidence level: ${level} (${level === 'high' ? '50+' : level === 'moderate' ? '10-49' : level === 'low' ? '1-9' : '0'} PubMed publications)`}
    >
      {c.icon} {c.label}
    </span>
  );
}

// ── Tier Selector ────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<BriefTier, { label: string; description: string }> = {
  executive: { label: 'Executive', description: '2-page quick prep' },
  strategic: { label: 'Strategic', description: 'Key insights, no filler' },
  comprehensive: { label: 'Comprehensive', description: 'Full research' },
};

function TierSelector({ selected, onChange }: { selected: BriefTier; onChange: (t: BriefTier) => void }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
      {(['executive', 'strategic', 'comprehensive'] as BriefTier[]).map((tier) => (
        <button
          key={tier}
          onClick={() => onChange(tier)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selected === tier
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title={TIER_CONFIG[tier].description}
        >
          {TIER_CONFIG[tier].label}
          <span className="hidden sm:inline text-xs font-normal ml-1 text-gray-400">
            — {TIER_CONFIG[tier].description}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Section definitions for TOC + rendering ──────────────────────────────────

interface SectionDef {
  id: string;
  title: string;
  field: keyof KOLBrief;
  tiers: BriefTier[];  // which tiers show this section
  truncateInTier?: BriefTier;  // if set, truncate to 1st paragraph in this tier
  borderColor: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'executive-summary', title: 'Executive Summary', field: 'executiveSummary', tiers: ['executive', 'strategic', 'comprehensive'], borderColor: 'border-l-sky-500' },
  { id: 'professional-background', title: 'Professional Background', field: 'professionalBackground', tiers: ['strategic', 'comprehensive'], truncateInTier: 'strategic', borderColor: 'border-l-slate-400' },
  { id: 'expertise-research', title: 'Expertise & Research Focus', field: 'expertiseAndResearch', tiers: ['strategic', 'comprehensive'], borderColor: 'border-l-emerald-500' },
  { id: 'notable-achievements', title: 'Notable Achievements', field: 'notableAchievements', tiers: ['comprehensive'], borderColor: 'border-l-amber-500' },
  { id: 'recent-work', title: 'Recent Work & Trends', field: 'recentWork', tiers: ['strategic', 'comprehensive'], borderColor: 'border-l-purple-500' },
];

// ── Main Component ───────────────────────────────────────────────────────────

interface BriefViewerProps {
  brief: KOLBrief;
  showExportButton?: boolean;
  onUpdate?: (updates: Partial<KOLBrief>) => Promise<void>;
}

export default function BriefViewer({ brief, showExportButton = true, onUpdate }: BriefViewerProps) {
  const [selectedTier, setSelectedTier] = useState<BriefTier>(brief.briefTier || 'strategic');
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    priority: brief.priority || '',
    notes: brief.notes || '',
    npi: brief.npi || '',
    conference: brief.conference || '',
    kolName: brief.kolName,
    institution: brief.institution,
    credentials: brief.credentials,
    department: brief.department,
    specialties: brief.specialties?.join(', ') || '',
    focusAreas: brief.focusAreas?.join(', ') || '',
    headshotUrl: brief.headshotUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // IntersectionObserver for sticky TOC highlighting
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = SECTIONS.filter((s) => s.tiers.includes(selectedTier) && brief[s.field]);

    visibleSections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id);
          }
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [selectedTier, brief]);

  const handleSave = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      await onUpdate({
        priority: (editFields.priority as Priority) || undefined,
        notes: editFields.notes || undefined,
        npi: editFields.npi || undefined,
        conference: editFields.conference || undefined,
        kolName: editFields.kolName,
        institution: editFields.institution,
        credentials: editFields.credentials,
        department: editFields.department,
        specialties: editFields.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        focusAreas: editFields.focusAreas.split(',').map((s) => s.trim()).filter(Boolean),
        headshotUrl: editFields.headshotUrl || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    const { generateBriefPdf } = await import('@/lib/pdf');
    const doc = await generateBriefPdf(brief);
    doc.save(`${brief.kolName.replace(/\s+/g, '-')}-brief.pdf`);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleSections = SECTIONS.filter((s) => s.tiers.includes(selectedTier) && brief[s.field]);
  const showConversationStarters = brief.conversationStarters && brief.conversationStarters.length > 0;
  const showCitations = selectedTier !== 'executive' && brief.evidence?.citations && brief.evidence.citations.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tier Selector */}
      <div data-tour="tier">
        <TierSelector selected={selectedTier} onChange={setSelectedTier} />
      </div>

      <div className="flex gap-8">
        {/* ── Sticky TOC (desktop only) ─────────────────────────────────────── */}
        <nav className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-20 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Contents</p>
            <a
              href="#header"
              onClick={(e) => { e.preventDefault(); document.getElementById('header')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="block px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded transition-colors"
            >
              Overview
            </a>
            {visibleSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block px-2 py-1.5 text-sm rounded transition-colors border-l-2 ${
                  activeSection === section.id
                    ? 'text-sky-700 font-medium bg-sky-50 border-sky-500'
                    : 'text-gray-500 hover:text-gray-900 border-transparent'
                }`}
              >
                {section.title}
              </a>
            ))}
            {showConversationStarters && (
              <a
                href="#conversation-starters"
                onClick={(e) => { e.preventDefault(); document.getElementById('conversation-starters')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`block px-2 py-1.5 text-sm rounded transition-colors border-l-2 ${
                  activeSection === 'conversation-starters'
                    ? 'text-sky-700 font-medium bg-sky-50 border-sky-500'
                    : 'text-gray-500 hover:text-gray-900 border-transparent'
                }`}
              >
                Conversation Starters
              </a>
            )}
          </div>
        </nav>

        {/* ── Content Column ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header Card */}
          <div id="header" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <Avatar name={brief.kolName} headshotUrl={brief.headshotUrl} size="lg" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {brief.kolName}
                      {brief.credentials && (
                        <span className="text-gray-500 font-normal text-xl ml-2">
                          {brief.credentials}
                        </span>
                      )}
                    </h1>
                    {brief.priority && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        brief.priority === 'high' ? 'bg-red-50 text-red-600' :
                        brief.priority === 'medium' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {brief.priority.toUpperCase()}
                      </span>
                    )}
                    {brief.conference && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                        {brief.conference}
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mt-1">
                    {brief.department && `${brief.department}, `}{brief.institution}
                  </p>
                  {brief.npi && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      NPI:{' '}
                      <a
                        href={`https://npiregistry.cms.hhs.gov/provider-view/${brief.npi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-suite-sky hover:underline"
                      >
                        {brief.npi}
                      </a>
                    </p>
                  )}
                  {brief.conferenceSessions && brief.conferenceSessions.length > 0 && (
                    <p className="text-sm text-purple-600 mt-1">
                      <span className="font-medium">{brief.conference || 'Conference'} Lecture{brief.conferenceSessions.length !== 1 ? 's' : ''}:</span>{' '}
                      {brief.conferenceSessions.join('; ')}
                    </p>
                  )}
                  {brief.email && brief.email !== 'Not publicly available' && (
                    <p className="text-sm text-suite-sky mt-1">{brief.email}</p>
                  )}
                  {brief.specialties && brief.specialties.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {brief.specialties.join(' · ')}
                    </p>
                  )}
                  {brief.focusAreas && brief.focusAreas.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {brief.focusAreas.map((fa, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                        >
                          {fa}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <p>Generated {new Date(brief.generatedAt).toLocaleDateString()}</p>
                  {brief.appVersion && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                      v{brief.appVersion}
                    </span>
                  )}
                  {brief.cost && (
                    <span
                      className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium"
                      title={`${brief.cost.inputTokens.toLocaleString()} input + ${brief.cost.outputTokens.toLocaleString()} output tokens${brief.cost.webSearchRequests ? ` + ${brief.cost.webSearchRequests} web searches` : ''}`}
                    >
                      {formatCost(brief.cost.totalCostUsd)}
                    </span>
                  )}
                  {brief.evidence?.evidenceLevel && (
                    <EvidenceBadge level={brief.evidence.evidenceLevel} />
                  )}
                </div>
                <div className="flex gap-2">
                  {onUpdate && (
                    <button
                      onClick={() => setEditing(!editing)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                        editing
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {editing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                  {showExportButton && (
                    <button
                      onClick={handleExportPdf}
                      data-tour="export"
                      className="px-3 py-1.5 bg-suite-amber text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Leadership Positions */}
            {brief.leadershipPositions && brief.leadershipPositions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Key Leadership Positions
                </h2>
                <div className="space-y-2">
                  {brief.leadershipPositions.map((pos, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${pos.current ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <span className="font-medium text-gray-900">{pos.title}</span>
                        <span className="text-gray-500"> — {pos.organization}</span>
                        {pos.current && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Box */}
            {brief.metrics && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{brief.metrics.publications}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Publications</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{typeof brief.metrics.citations === 'number' ? brief.metrics.citations.toLocaleString() : brief.metrics.citations}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Citations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{brief.metrics.hIndex}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">H-Index</p>
                </div>
              </div>
            )}
          </div>

          {/* Edit Panel */}
          {editing && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Brief</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={editFields.kolName} onChange={(e) => setEditFields((f) => ({ ...f, kolName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                  <input type="text" value={editFields.credentials} onChange={(e) => setEditFields((f) => ({ ...f, credentials: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input type="text" value={editFields.institution} onChange={(e) => setEditFields((f) => ({ ...f, institution: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input type="text" value={editFields.department} onChange={(e) => setEditFields((f) => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NPI</label>
                  <input type="text" value={editFields.npi} onChange={(e) => setEditFields((f) => ({ ...f, npi: e.target.value }))} placeholder="10-digit NPI number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={editFields.priority} onChange={(e) => setEditFields((f) => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900">
                    <option value="">None</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conference</label>
                  <input type="text" value={editFields.conference} onChange={(e) => setEditFields((f) => ({ ...f, conference: e.target.value }))} placeholder="e.g., ACP.26" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headshot URL</label>
                  <input type="text" value={editFields.headshotUrl} onChange={(e) => setEditFields((f) => ({ ...f, headshotUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialties <span className="text-gray-400 font-normal">(AMA/ABMS — comma-separated)</span>
                  </label>
                  <input type="text" value={editFields.specialties} onChange={(e) => setEditFields((f) => ({ ...f, specialties: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" list="ama-specialties" />
                  <datalist id="ama-specialties">
                    {AMA_SPECIALTIES.map((s) => (<option key={s} value={s} />))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Areas <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input type="text" value={editFields.focusAreas} onChange={(e) => setEditFields((f) => ({ ...f, focusAreas: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={editFields.notes} onChange={(e) => setEditFields((f) => ({ ...f, notes: e.target.value }))} placeholder="Conversation notes, Plaud AI transcripts, or any free-form text..." rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-suite-sky text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes Section (read-only when not editing) */}
          {!editing && brief.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {brief.notes}
              </div>
            </div>
          )}

          {/* Disclaimer Banner */}
          {brief.disclaimer && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Limited Evidence Notice</p>
                <p className="text-sm text-amber-700 mt-1">{brief.disclaimer}</p>
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-4">
            {visibleSections.map((section) => {
              const content = brief[section.field] as string;
              if (!content) return null;

              const isCollapsed = collapsedSections.has(section.id);
              const shouldTruncate = section.truncateInTier === selectedTier;
              const displayContent = shouldTruncate
                ? content.split('\n\n')[0]
                : content;

              return (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${section.borderColor} overflow-hidden`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 pb-0 text-left"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {!isCollapsed && (
                    <div className="px-6 pb-6 pt-3">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {displayContent}
                      </div>
                      {shouldTruncate && content.split('\n\n').length > 1 && (
                        <button
                          onClick={() => {
                            // Switch to comprehensive to see full content
                            setSelectedTier('comprehensive');
                          }}
                          className="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                        >
                          View full section →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conversation Starters */}
          {showConversationStarters && (
            <div id="conversation-starters" data-tour="starters" className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Conversation Starters</h2>
              <div className="space-y-4">
                {brief.conversationStarters.map((starter, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-sky-500 p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-suite-sky text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {starter.title}
                        </h3>
                        {/* In executive tier, hide the body — just show title + question */}
                        {selectedTier !== 'executive' && (
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                            {starter.body}
                          </div>
                        )}
                        {starter.question && (
                          <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                            <p className="text-sm font-medium text-sky-800">
                              Strategic Question:
                            </p>
                            <p className="text-sky-700 mt-1">{starter.question}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citations Section */}
          {showCitations && (
            <CitationsSection citations={brief.evidence!.citations} webSearches={brief.evidence!.webSearchesPerformed} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Citations Section ────────────────────────────────────────────────────────

function CitationsSection({ citations, webSearches }: { citations: WebSearchCitation[]; webSearches: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Sources ({webSearches} web search{webSearches !== 1 ? 'es' : ''}, {citations.length} citation{citations.length !== 1 ? 's' : ''})
      </button>
      {expanded && (
        <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="space-y-2">
            {citations.map((cite, i) => (
              <div key={i} className="text-sm">
                <a
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-suite-sky hover:text-sky-700 hover:underline font-medium"
                >
                  {cite.title}
                </a>
                {cite.citedText && (
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                    &ldquo;{cite.citedText}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
