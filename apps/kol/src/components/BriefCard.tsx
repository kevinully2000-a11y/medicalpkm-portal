'use client';

import { useState } from 'react';
import { BriefSummary, EvidenceLevel, Priority } from '@/lib/types';
import Avatar from '@/components/Avatar';
import { formatCost } from '@/lib/cost';

function PriorityBadge({ priority, onClick }: { priority: Priority; onClick?: () => void }) {
  const config: Record<Priority, { bg: string; text: string; label: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-600', label: 'HIGH' },
    medium: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'MED' },
    low: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'LOW' },
  };
  const c = config[priority];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`px-1.5 py-0.5 ${c.bg} ${c.text} rounded text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity`}
      title="Click to change priority"
    >
      {c.label}
    </button>
  );
}

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const config: Record<EvidenceLevel, { bg: string; text: string; label: string }> = {
    high: { bg: 'bg-green-50', text: 'text-green-600', label: 'Verified' },
    moderate: { bg: 'bg-sky-50', text: 'text-sky-600', label: 'Grounded' },
    low: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Limited Data' },
    minimal: { bg: 'bg-red-50', text: 'text-red-600', label: 'Caution' },
  };
  const c = config[level];
  return (
    <span className={`px-1.5 py-0.5 ${c.bg} ${c.text} rounded text-xs font-medium`}>
      {c.label}
    </span>
  );
}

interface BriefCardProps {
  brief: BriefSummary;
  isAdmin: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (brief: BriefSummary) => void;
  onToggleHide: (id: string, hidden: boolean) => void;
  onUpdatePriority?: (id: string, priority: Priority) => void;
}

export default function BriefCard({
  brief,
  isAdmin,
  onView,
  onDelete,
  onRegenerate,
  onToggleHide,
  onUpdatePriority,
}: BriefCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cyclePriority = () => {
    const cycle: Priority[] = ['high', 'medium', 'low'];
    const current = brief.priority ? cycle.indexOf(brief.priority) : -1;
    const next = cycle[(current + 1) % cycle.length];
    onUpdatePriority?.(brief.id, next);
  };

  return (
    <div
      onClick={() => onView(brief.id)}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col cursor-pointer hover:shadow-md hover:border-gray-300 transition-all ${
        brief.hidden ? 'opacity-60' : ''
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {brief.hidden && (
            <span className="inline-flex px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              Hidden
            </span>
          )}
          {brief.priority && (
            <PriorityBadge priority={brief.priority} onClick={cyclePriority} />
          )}
          {brief.conference && (
            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">
              {brief.conference}
            </span>
          )}
          {brief.notes && (
            <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-xs" title="Has notes">
              <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={brief.kolName} headshotUrl={brief.headshotUrl} size="sm" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{brief.kolName}</h3>
            {brief.institution && (
              <p className="text-sm text-gray-600">{brief.institution}</p>
            )}
            {brief.npi && (
              <p className="text-xs text-gray-400">NPI: {brief.npi}</p>
            )}
            {brief.conferenceSessions && brief.conferenceSessions.length > 0 && (
              <p className="text-xs text-purple-600 mt-1">
                <span className="font-medium">{brief.conference || 'Conference'} Lecture{brief.conferenceSessions.length !== 1 ? 's' : ''}:</span>{' '}
                {brief.conferenceSessions.join('; ')}
              </p>
            )}
          </div>
        </div>
        {brief.specialties && brief.specialties.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {brief.specialties.join(' · ')}
          </p>
        )}
        {brief.focusAreas && brief.focusAreas.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {brief.focusAreas.slice(0, 3).map((fa, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
              >
                {fa}
              </span>
            ))}
            {brief.focusAreas.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs">
                +{brief.focusAreas.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          <p className="text-xs text-gray-400">
            {new Date(brief.generatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          {brief.appVersion && brief.appVersion !== 'unknown' && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">
              v{brief.appVersion}
            </span>
          )}
          {brief.cost && (
            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs">
              {formatCost(brief.cost.totalCostUsd)}
            </span>
          )}
          {brief.evidenceLevel && <EvidenceBadge level={brief.evidenceLevel} />}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onView(brief.id)}
          className="flex-1 px-3 py-2 bg-suite-sky text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => onRegenerate(brief)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          title="Regenerate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {/* Hide/Unhide toggle (all users) */}
        <button
          onClick={() => onToggleHide(brief.id, !brief.hidden)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            brief.hidden
              ? 'text-green-600 bg-green-50 hover:bg-green-100'
              : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
          }`}
          title={brief.hidden ? 'Unhide' : 'Hide'}
        >
          {brief.hidden ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>
        {/* Delete button (admin only) */}
        {isAdmin && (
          <>
            {confirmDelete ? (
              <div className="flex gap-1">
                <button
                  onClick={() => { onDelete(brief.id); setConfirmDelete(false); }}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                title="Delete (Admin)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
