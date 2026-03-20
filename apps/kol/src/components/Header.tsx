'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APP_VERSION } from '@/lib/constants';
import { UserContext } from '@/lib/types';
import SuiteNav from '@/components/SuiteNav';

const CF_LOGOUT_URL = 'https://medicalpkm.cloudflareaccess.com/cdn-cgi/access/logout';

const tabs = [
  { label: 'Library', href: '/' },
  { label: 'Generate Brief', href: '/generate' },
  { label: 'Batch', href: '/batch' },
];

const adminTab = { label: 'Admin', href: '/admin' };

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setUser({ email: data.email, isAdmin: data.isAdmin });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    window.location.href = CF_LOGOUT_URL;
  };

  const allTabs = user?.isAdmin ? [...tabs, adminTab] : tabs;

  return (
    <>
      {/* Universal suite navigation */}
      <SuiteNav currentApp="kol" user={user} onLogout={handleLogout} />

      {/* App-specific tab bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            <nav className="flex items-center gap-0.5 -mb-px overflow-x-auto">
              {allTabs.map((tab) => {
                const isActive =
                  tab.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-suite-sky text-suite-sky'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-xs font-medium flex-shrink-0 ml-4">
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
