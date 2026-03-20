'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [configError, setConfigError] = useState(false);

  // Check auth
  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success || !data.isAdmin) {
          router.push('/');
          return;
        }
        setUser({ email: data.email, isAdmin: data.isAdmin });
        loadEmails();
      })
      .catch(() => router.push('/'));
  }, [router]);

  async function loadEmails() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        setConfigError(false);
      } else if (data.error?.includes('CLOUDFLARE_ACCESS_TOKEN')) {
        setConfigError(true);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch {
      setError('Failed to load users');
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        setNewEmail('');
        setSuccess(`${newEmail.trim()} added successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add email');
      }
    } catch {
      setError('Failed to add email');
    }
    setActionLoading(false);
  }

  async function handleRemove(email: string) {
    if (!confirm(`Remove ${email} from the whitelist? They will lose access to the app.`)) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        setSuccess(`${email} removed`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to remove email');
      }
    } catch {
      setError('Failed to remove email');
    }
    setActionLoading(false);
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center text-gray-500">Checking permissions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">
          Manage who can access the KOL Brief Generator. Users must sign in with Google or OTP.
        </p>
      </div>

      {configError ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-amber-800 font-semibold text-lg mb-2">Setup Required</h2>
          <p className="text-amber-700 text-sm mb-4">
            To manage users from this page, you need to create a Cloudflare API token and add it to Vercel:
          </p>
          <ol className="text-amber-700 text-sm space-y-2 list-decimal list-inside">
            <li>
              Go to{' '}
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Cloudflare API Tokens
              </a>
            </li>
            <li>Create a token with <strong>Account &gt; Access: Apps and Policies &gt; Edit</strong> permission</li>
            <li>Add it as <code className="bg-amber-100 px-1 rounded">CLOUDFLARE_ACCESS_TOKEN</code> in your Vercel project environment variables</li>
            <li>Redeploy the app</li>
          </ol>
        </div>
      ) : (
        <>
          {/* Add email form */}
          <form onSubmit={handleAdd} className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add a new user</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                disabled={actionLoading}
              />
              <button
                type="submit"
                disabled={actionLoading || !newEmail.trim()}
                className="px-4 py-2 bg-suite-sky text-white rounded-md text-sm font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </form>

          {/* Status messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Email list */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Whitelisted Users ({emails.length})
              </h2>
            </div>
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
            ) : emails.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">No users found</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {emails.map((email) => (
                  <li key={email} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm text-gray-900">{email}</span>
                        {email === 'kevin.ully2000@gmail.com' && (
                          <span className="ml-2 text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Admin</span>
                        )}
                      </div>
                    </div>
                    {email !== 'kevin.ully2000@gmail.com' && (
                      <button
                        onClick={() => handleRemove(email)}
                        disabled={actionLoading}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
