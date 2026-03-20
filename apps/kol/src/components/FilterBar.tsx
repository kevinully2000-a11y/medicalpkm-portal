'use client';

import { useState, useMemo, useEffect } from 'react';
import { BriefSummary } from '@/lib/types';

interface FilterBarProps {
  briefs: BriefSummary[];
  onFilteredChange: (filtered: BriefSummary[]) => void;
  isAdmin: boolean;
}

interface Filters {
  search: string;
  dateRange: 'all' | '7d' | '30d' | '90d';
  specialty: string;
  focusArea: string;
  appVersion: string;
  institution: string;
  visibility: 'visible' | 'hidden' | 'all';
  conference: string;
  priority: string;
  hasNotes: boolean;
}

const defaultFilters: Filters = {
  search: '',
  dateRange: 'all',
  specialty: '',
  focusArea: '',
  appVersion: '',
  institution: '',
  visibility: 'visible',
  conference: '',
  priority: '',
  hasNotes: false,
};

export default function FilterBar({ briefs, onFilteredChange, isAdmin }: FilterBarProps) {
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    visibility: isAdmin ? 'all' : 'visible',
  });

  // Derive unique filter options from briefs
  const specialties = useMemo(
    () => Array.from(new Set(briefs.flatMap((b) => b.specialties))).sort(),
    [briefs]
  );
  const focusAreas = useMemo(
    () => Array.from(new Set(briefs.flatMap((b) => b.focusAreas ?? []))).sort(),
    [briefs]
  );
  const versions = useMemo(
    () => Array.from(new Set(briefs.map((b) => b.appVersion).filter(Boolean))).sort(),
    [briefs]
  );
  const institutions = useMemo(
    () => Array.from(new Set(briefs.map((b) => b.institution).filter(Boolean))).sort(),
    [briefs]
  );
  const conferences = useMemo(
    () => Array.from(new Set(briefs.map((b) => b.conference).filter((c): c is string => !!c))).sort(),
    [briefs]
  );

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...briefs];

    // Visibility
    if (filters.visibility === 'visible') result = result.filter((b) => !b.hidden);
    else if (filters.visibility === 'hidden') result = result.filter((b) => b.hidden);

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((b) => b.kolName.toLowerCase().includes(q));
    }

    // Date range
    if (filters.dateRange !== 'all') {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[filters.dateRange];
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();
      result = result.filter((b) => b.generatedAt >= cutoff);
    }

    // Specialty
    if (filters.specialty) {
      result = result.filter((b) => b.specialties.includes(filters.specialty));
    }

    // Focus Area
    if (filters.focusArea) {
      result = result.filter((b) => (b.focusAreas ?? []).includes(filters.focusArea));
    }

    // App Version
    if (filters.appVersion) {
      result = result.filter((b) => b.appVersion === filters.appVersion);
    }

    // Institution
    if (filters.institution) {
      result = result.filter((b) => b.institution === filters.institution);
    }

    // Conference
    if (filters.conference) {
      result = result.filter((b) => b.conference === filters.conference);
    }

    // Priority
    if (filters.priority) {
      result = result.filter((b) => b.priority === filters.priority);
    }

    // Has Notes
    if (filters.hasNotes) {
      result = result.filter((b) => b.notes && b.notes.trim().length > 0);
    }

    return result;
  }, [briefs, filters]);

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.dateRange !== 'all' ||
    filters.specialty !== '' ||
    filters.focusArea !== '' ||
    filters.appVersion !== '' ||
    filters.institution !== '' ||
    filters.visibility !== (isAdmin ? 'all' : 'visible') ||
    filters.conference !== '' ||
    filters.priority !== '' ||
    filters.hasNotes;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search KOL name..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mt-3">
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value as Filters['dateRange'] }))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>

        {specialties.length > 0 && (
          <select
            value={filters.specialty}
            onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {focusAreas.length > 0 && (
          <select
            value={filters.focusArea}
            onChange={(e) => setFilters((f) => ({ ...f, focusArea: e.target.value }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Focus Areas</option>
            {focusAreas.map((fa) => (
              <option key={fa} value={fa}>
                {fa}
              </option>
            ))}
          </select>
        )}

        {institutions.length > 1 && (
          <select
            value={filters.institution}
            onChange={(e) => setFilters((f) => ({ ...f, institution: e.target.value }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Institutions</option>
            {institutions.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        )}

        {versions.length > 1 && (
          <select
            value={filters.appVersion}
            onChange={(e) => setFilters((f) => ({ ...f, appVersion: e.target.value }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Versions</option>
            {versions.map((v) => (
              <option key={v} value={v}>
                v{v}
              </option>
            ))}
          </select>
        )}

        {conferences.length > 0 && (
          <select
            value={filters.conference}
            onChange={(e) => setFilters((f) => ({ ...f, conference: e.target.value }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Conferences</option>
            {conferences.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Priorities</option>
          <option value="high">HIGH</option>
          <option value="medium">MEDIUM</option>
          <option value="low">LOW</option>
        </select>

        <select
          value={filters.visibility}
          onChange={(e) => setFilters((f) => ({ ...f, visibility: e.target.value as Filters['visibility'] }))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-sky-500"
        >
          <option value="visible">Visible Only</option>
          <option value="hidden">Hidden Only</option>
          <option value="all">All</option>
        </select>

        <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasNotes}
            onChange={(e) => setFilters((f) => ({ ...f, hasNotes: e.target.checked }))}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          Has Notes
        </label>

        {hasActiveFilters && (
          <button
            onClick={() =>
              setFilters({
                ...defaultFilters,
                visibility: isAdmin ? 'all' : 'visible',
              })
            }
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mt-3 text-xs text-gray-500">
        Showing {filtered.length} of {briefs.length} briefs
      </p>
    </div>
  );
}
