'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KOLBrief, UserContext } from '@/lib/types';
import BriefViewer from '@/components/BriefViewer';

export default function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [brief, setBrief] = useState<KOLBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    fetch(`/api/briefs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBrief(data.brief);
        } else {
          setError(data.error || 'Brief not found');
        }
      })
      .catch(() => setError('Failed to load brief'))
      .finally(() => setLoading(false));

    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser({ email: data.email, isAdmin: data.isAdmin });
      })
      .catch(() => {});
  }, [id]);

  async function handleDelete() {
    try {
      const res = await fetch(`/api/briefs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        setError(data.error || 'Failed to delete brief');
        setConfirmDelete(false);
      }
    } catch {
      setError('Failed to delete brief');
    }
  }

  async function handleToggleHide() {
    if (!brief) return;
    const newHidden = !brief.hidden;
    setBrief({ ...brief, hidden: newHidden });
    try {
      const res = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: newHidden }),
      });
      const data = await res.json();
      if (data.success) {
        setBrief(data.brief);
      } else {
        setBrief({ ...brief, hidden: !newHidden }); // Revert
      }
    } catch {
      setBrief({ ...brief, hidden: !newHidden }); // Revert
    }
  }

  function handleRegenerate() {
    if (!brief) return;
    const params = new URLSearchParams({ kolName: brief.kolName });
    if (brief.institution) params.set('institution', brief.institution);
    if (brief.specialties?.[0]) params.set('specialty', brief.specialties[0]);
    router.push(`/generate?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-suite-sky" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error || 'Brief not found'}</p>
          <button onClick={() => router.push('/')} className="text-sm text-suite-sky hover:text-sky-700 font-medium">
            &larr; Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {brief.hidden && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <span className="text-sm text-yellow-700 font-medium">This brief is hidden from the library.</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/')} className="text-sm text-suite-sky hover:text-sky-700 font-medium">
          &larr; Back to Library
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
          {/* Hide/Unhide (all users) */}
          <button
            onClick={handleToggleHide}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              brief.hidden
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
            }`}
          >
            {brief.hidden ? 'Unhide' : 'Hide'}
          </button>
          {/* Delete (admin only) */}
          {user?.isAdmin && (
            <>
              {confirmDelete ? (
                <div className="flex gap-1">
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <BriefViewer
        brief={brief}
        onUpdate={async (updates) => {
          const res = await fetch(`/api/briefs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          const data = await res.json();
          if (data.success) {
            setBrief(data.brief);
          } else {
            setError(data.error || 'Failed to update brief');
          }
        }}
      />
    </div>
  );
}
