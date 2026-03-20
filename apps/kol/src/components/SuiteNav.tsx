'use client';

import { useState, useRef, useEffect } from 'react';
import { UserContext } from '@/lib/types';

interface SuiteNavProps {
  currentApp?: 'kol' | 'fountain-pen' | 'coc' | null;
  user: UserContext | null;
  onLogout: () => void;
}

const apps = [
  {
    id: 'kol',
    name: 'KOL Brief Generator',
    description: 'Generate PDF briefs for Key Opinion Leaders',
    href: 'https://kol.medicalpkm.com',
    color: 'bg-suite-sky',
    dotColor: 'bg-sky-400',
  },
  {
    id: 'coc',
    name: 'Cthulhu Investigator',
    description: 'Solo horror adventures with an AI Keeper',
    href: 'https://coc.medicalpkm.com',
    color: 'bg-suite-emerald',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'fountain-pen',
    name: 'Fountain Pen Companion',
    description: 'Track your fountain pen collection',
    href: 'https://medicalpkm.com/apps/shared/fountain-pen/',
    color: 'bg-suite-emerald',
    dotColor: 'bg-emerald-400',
  },
];

export default function SuiteNav({ currentApp, user, onLogout }: SuiteNavProps) {
  const [appsOpen, setAppsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) {
        setAppsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentAppName = currentApp
    ? apps.find((a) => a.id === currentApp)?.name
    : null;

  return (
    <nav className="bg-suite-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: Logo + breadcrumb */}
          <div className="flex items-center gap-3">
            <a
              href="https://medicalpkm.com"
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-amber-400 text-lg font-bold">&#9672;</span>
              <span className="font-semibold text-sm tracking-tight">MedicalPKM</span>
            </a>
            {currentAppName && (
              <>
                <span className="text-slate-500 text-sm">&#47;</span>
                <span className="text-slate-300 text-sm font-medium">{currentAppName}</span>
              </>
            )}
          </div>

          {/* Right: Apps dropdown + User menu */}
          <div className="flex items-center gap-2">
            {/* Apps switcher - desktop */}
            <div className="relative hidden sm:block" ref={appsRef}>
              <button
                onClick={() => { setAppsOpen(!appsOpen); setUserOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Apps
              </button>

              {appsOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Tools</p>
                  {apps.map((app) => (
                    <a
                      key={app.id}
                      href={app.href}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                        currentApp === app.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${app.dotColor} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-500 truncate">{app.description}</p>
                      </div>
                      {currentApp === app.id && (
                        <span className="text-xs text-suite-sky font-medium">Current</span>
                      )}
                    </a>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <a
                      href="https://medicalpkm.com"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      All Apps
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            {user && (
              <div className="relative hidden sm:block" ref={userRef}>
                <button
                  onClick={() => { setUserOpen(!userOpen); setAppsOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md text-sm transition-colors"
                >
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[140px] truncate text-sm">{user.email}</span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user.isAdmin ? 'Administrator' : 'Team Member'}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Off
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden flex items-center p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Apps</p>
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${app.dotColor}`} />
              <span className="text-sm text-slate-200">{app.name}</span>
              {currentApp === app.id && (
                <span className="text-xs text-suite-sky font-medium ml-auto">Current</span>
              )}
            </a>
          ))}
          <a
            href="https://medicalpkm.com"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">All Apps</span>
          </a>
          {user && (
            <>
              <div className="border-t border-slate-700 mt-2 pt-2">
                <div className="px-3 py-2">
                  <p className="text-sm text-slate-200 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400">
                    {user.isAdmin ? 'Administrator' : 'Team Member'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md transition-colors"
                >
                  Log Off
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
