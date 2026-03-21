'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BriefSummary, UserContext, Priority } from '@/lib/types';
import BriefCard from '@/components/BriefCard';
import FilterBar from '@/components/FilterBar';
import { downloadBriefsAsZip, BatchDownloadProgress } from '@/lib/batch-download';
import { isTourCompleted } from '@/lib/tour-steps';
import OnboardingTour from '@/components/OnboardingTour';

export default function LibraryPage() {
  const router = useRouter();
  const [allBriefs, setAllBriefs] = useState<BriefSummary[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<BriefSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserContext | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    fetchBriefs();
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser({ email: data.email, isAdmin: data.isAdmin });
      })
      .catch(() => {
        // Not critical — default to non-admin
      });
    // Show tour for first-time users
    if (!isTourCompleted()) {
      setShowTour(true);
    }
  }, []);

  async function fetchBriefs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/briefs');
      const data = await res.json();
      if (data.success) {
        setAllBriefs(data.briefs);
      } else {
        setError(data.error || 'Failed to load briefs');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setAllBriefs((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`/api/briefs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        if (data.error?.includes('admin')) {
          setError(data.error);
        }
        fetchBriefs();
      }
    } catch {
      fetchBriefs();
    }
  }

  async function handleToggleHide(id: string, hidden: boolean) {
    // Optimistic update
    setAllBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, hidden } : b))
    );
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden }),
      });
      const data = await res.json();
      if (!data.success) fetchBriefs(); // Revert on failure
    } catch {
      fetchBriefs();
    }
  }

  function handleView(id: string) {
    router.push(`/briefs/${id}`);
  }

  function handleRegenerate(brief: BriefSummary) {
    const params = new URLSearchParams({ kolName: brief.kolName });
    if (brief.institution) params.set('institution', brief.institution);
    if (brief.specialties?.[0]) params.set('specialty', brief.specialties[0]);
    router.push(`/generate?${params.toString()}`);
  }

  async function handleUpdatePriority(id: string, priority: Priority) {
    setAllBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, priority } : b))
    );
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (!data.success) fetchBriefs();
    } catch {
      fetchBriefs();
    }
  }

  const handleFilteredChange = useCallback((filtered: BriefSummary[]) => {
    setFilteredBriefs(filtered);
  }, []);

  const [downloadProgress, setDownloadProgress] = useState<BatchDownloadProgress | null>(null);

  async function handleBatchDownload() {
    if (filteredBriefs.length === 0) return;
    try {
      await downloadBriefsAsZip(filteredBriefs, setDownloadProgress);
    } catch (err) {
      console.error('Batch download failed:', err);
      setDownloadProgress({
        current: 0,
        total: filteredBriefs.length,
        currentName: '',
        phase: 'error',
        error: err instanceof Error ? err.message : 'Download failed',
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brief Library</h1>
          <p className="mt-1 text-gray-600">Your generated KOL briefs for conference preparation</p>
        </div>
        <Link href="/generate" className="px-4 py-2.5 bg-suite-amber text-white font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Brief
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-suite-sky" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => { setError(null); fetchBriefs(); }} className="mt-2 text-sm text-red-600 font-medium hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && allBriefs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No briefs yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Generate your first KOL brief to prepare for upcoming conferences.</p>
          <Link href="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-suite-amber text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Generate Your First Brief
          </Link>
        </div>
      )}

      {!loading && allBriefs.length > 0 && (
        <>
          <div data-tour="search">
            <FilterBar
              briefs={allBriefs}
              onFilteredChange={handleFilteredChange}
              isAdmin={user?.isAdmin ?? false}
            />
          </div>
          {filteredBriefs.length > 0 ? (
            <>
              {/* Batch Download Bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {filteredBriefs.length} brief{filteredBriefs.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleBatchDownload}
                  disabled={downloadProgress !== null && downloadProgress.phase !== 'done' && downloadProgress.phase !== 'error'}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All as ZIP
                </button>
              </div>

              {/* Download Progress */}
              {downloadProgress && downloadProgress.phase !== 'done' && (
                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {downloadProgress.phase === 'error' ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-600">Download failed: {downloadProgress.error}</p>
                      <button onClick={() => setDownloadProgress(null)} className="text-sm text-gray-500 hover:text-gray-700">Dismiss</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-gray-700">
                          {downloadProgress.phase === 'zipping'
                            ? 'Creating ZIP file...'
                            : `${downloadProgress.phase === 'fetching' ? 'Fetching' : 'Generating PDF for'} ${downloadProgress.currentName}`}
                        </p>
                        <span className="text-sm text-gray-500">{downloadProgress.current}/{downloadProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-suite-sky h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {downloadProgress?.phase === 'done' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-green-700">Downloaded {downloadProgress.total} briefs as ZIP</p>
                  <button onClick={() => setDownloadProgress(null)} className="text-sm text-green-600 hover:text-green-800">Dismiss</button>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBriefs.map((brief) => (
                <BriefCard
                  key={brief.id}
                  brief={brief}
                  isAdmin={user?.isAdmin ?? false}
                  onView={handleView}
                  onDelete={handleDelete}
                  onRegenerate={handleRegenerate}
                  onToggleHide={handleToggleHide}
                  onUpdatePriority={handleUpdatePriority}
                />
              ))}
            </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No briefs match your current filters.</p>
            </div>
          )}
        </>
      )}
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </div>
  );
}
