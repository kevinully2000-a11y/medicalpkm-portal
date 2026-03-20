'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { KOLBrief, BriefCost, NpiProviderData } from '@/lib/types';
import BriefViewer from '@/components/BriefViewer';
import { ESTIMATED_COST_PER_BRIEF } from '@/lib/constants';
import { formatCost } from '@/lib/cost';

export default function GeneratePage() {
  return (
    <Suspense>
      <GeneratePageInner />
    </Suspense>
  );
}

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const [kolName, setKolName] = useState('');
  const [institution, setInstitution] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [headshotUrl, setHeadshotUrl] = useState('');
  const [npi, setNpi] = useState('');
  const [conference, setConference] = useState('');
  const [npiResults, setNpiResults] = useState<NpiProviderData[]>([]);
  const [npiLooking, setNpiLooking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState<KOLBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [actualCost, setActualCost] = useState<BriefCost | null>(null);
  const [researchPhase, setResearchPhase] = useState<{ evidenceLevel: string; pubmedCount: number } | null>(null);

  useEffect(() => {
    const name = searchParams.get('kolName');
    const inst = searchParams.get('institution');
    const spec = searchParams.get('specialty');
    if (name) setKolName(name);
    if (inst) setInstitution(inst);
    if (spec) setSpecialty(spec);
  }, [searchParams]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!kolName.trim()) return;
    setIsGenerating(true);
    setError(null);
    setBrief(null);
    setElapsed(0);
    setActualCost(null);
    setResearchPhase(null);
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    try {
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kolName: kolName.trim(),
          institution: institution.trim() || undefined,
          specialty: specialty.trim() || undefined,
          additionalContext: additionalContext.trim() || undefined,
          headshotUrl: headshotUrl.trim() || undefined,
          npi: npi.trim() || undefined,
          conference: conference.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Unknown error occurred');
        return;
      }

      if (!response.body) {
        setError('Streaming not supported by browser.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, '');
          if (!dataLine) continue;
          try {
            const event = JSON.parse(dataLine);
            if (event.type === 'research') {
              setResearchPhase({ evidenceLevel: event.evidenceLevel, pubmedCount: event.pubmedCount });
            } else if (event.type === 'complete' && event.brief) {
              setBrief(event.brief);
              if (event.brief.cost) setActualCost(event.brief.cost);
            } else if (event.type === 'error') {
              setError(event.error || 'Unknown error occurred');
            }
            // 'delta' events keep the connection alive — no UI action needed
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Generation error:', err);
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!brief ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Generate KOL Brief</h1>
            <p className="mt-2 text-gray-600">Enter a Key Opinion Leader&apos;s name and optional details to generate a comprehensive brief.</p>
          </div>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
              <div>
                <label htmlFor="kolName" className="block text-sm font-medium text-gray-700 mb-1">KOL Name <span className="text-red-500">*</span></label>
                <input type="text" id="kolName" value={kolName} onChange={(e) => setKolName(e.target.value)} placeholder="e.g., John Flack" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" required disabled={isGenerating} />
              </div>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Institution <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g., Southern Illinois University" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" disabled={isGenerating} />
              </div>
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Specialty / Field <span className="text-gray-400">(optional)</span></label>
                <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g., Hypertension, Cardiology" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" disabled={isGenerating} />
              </div>
              <div>
                <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700 mb-1">Additional Context <span className="text-gray-400">(optional)</span></label>
                <textarea id="additionalContext" value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="e.g., Meeting at AHA 2025..." rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400 resize-none" disabled={isGenerating} />
              </div>
              <div>
                <label htmlFor="npi" className="block text-sm font-medium text-gray-700 mb-1">NPI <span className="text-gray-400">(optional — auto-fills from NPPES)</span></label>
                <div className="flex gap-2">
                  <input type="text" id="npi" value={npi} onChange={(e) => setNpi(e.target.value)} placeholder="10-digit NPI number" className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" disabled={isGenerating} />
                  <button
                    type="button"
                    disabled={!kolName.trim() || npiLooking || isGenerating}
                    onClick={async () => {
                      setNpiLooking(true);
                      setNpiResults([]);
                      try {
                        const nameParts = kolName.trim().replace(/,.*$/, '').trim().split(/\s+/);
                        const firstName = nameParts[0];
                        const lastName = nameParts[nameParts.length - 1];
                        const params = new URLSearchParams({ firstName, lastName });
                        const res = await fetch(`/api/npi?${params}`);
                        const data = await res.json();
                        if (data.success && data.results.length > 0) {
                          setNpiResults(data.results);
                          if (data.results.length === 1) {
                            setNpi(data.results[0].npi);
                          }
                        }
                      } finally {
                        setNpiLooking(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {npiLooking ? 'Looking up...' : 'Lookup NPI'}
                  </button>
                </div>
                {npiResults.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {npiResults.map((r) => (
                      <button
                        key={r.npi}
                        type="button"
                        onClick={() => { setNpi(r.npi); setNpiResults([]); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${
                          npi === r.npi ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{r.firstName} {r.lastName}</span>
                        <span className="text-gray-500"> — {r.credential}</span>
                        {r.taxonomies.find((t) => t.primary) && (
                          <span className="text-gray-400"> · {r.taxonomies.find((t) => t.primary)!.description}</span>
                        )}
                        {r.addresses[0] && (
                          <span className="text-gray-400"> · {r.addresses[0].state}</span>
                        )}
                        <span className="text-gray-300 ml-2">NPI: {r.npi}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="conference" className="block text-sm font-medium text-gray-700 mb-1">Conference Tag <span className="text-gray-400">(optional, e.g., ACP.26)</span></label>
                <input type="text" id="conference" value={conference} onChange={(e) => setConference(e.target.value)} placeholder="e.g., ACP.26" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" disabled={isGenerating} />
              </div>
              <div>
                <label htmlFor="headshotUrl" className="block text-sm font-medium text-gray-700 mb-1">Headshot URL <span className="text-gray-400">(optional — auto-fetched if left blank)</span></label>
                <input type="url" id="headshotUrl" value={headshotUrl} onChange={(e) => setHeadshotUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-900 placeholder-gray-400" disabled={isGenerating} />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Estimated cost: ~{formatCost(ESTIMATED_COST_PER_BRIEF)} per brief (Claude Sonnet 4.5)
            </p>
            {error && (<div className="p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700">{error}</p></div>)}
            <button type="submit" disabled={isGenerating || !kolName.trim()} className="w-full py-3 px-6 bg-suite-amber text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isGenerating ? (<span className="flex items-center justify-center gap-3"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>{!researchPhase ? `Researching ${kolName.trim()}...` : `Generating Brief... (${elapsed}s)`}</span>) : 'Generate KOL Brief'}
            </button>
            {isGenerating && !researchPhase && (<p className="text-center text-sm text-gray-500">Searching PubMed for publications...</p>)}
            {isGenerating && researchPhase && (
              <div className="text-center text-sm">
                <p className={researchPhase.pubmedCount > 0 ? 'text-green-600' : 'text-amber-600'}>
                  {researchPhase.pubmedCount > 0
                    ? `Found ${researchPhase.pubmedCount} publication${researchPhase.pubmedCount !== 1 ? 's' : ''} on PubMed`
                    : 'No PubMed publications found — brief will rely on web search verification'}
                </p>
                <p className="text-gray-500 mt-1">This typically takes 30-60 seconds with web search verification.</p>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <button onClick={() => { setBrief(null); setActualCost(null); setKolName(''); setInstitution(''); setSpecialty(''); setAdditionalContext(''); setHeadshotUrl(''); }} className="text-sm text-suite-sky hover:text-sky-700 font-medium">&larr; Generate Another</button>
          </div>
          {actualCost && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="font-medium text-gray-900">{formatCost(actualCost.totalCostUsd)}</span>
              <span className="text-gray-300">|</span>
              <span>{actualCost.inputTokens.toLocaleString()} input tokens</span>
              <span className="text-gray-300">|</span>
              <span>{actualCost.outputTokens.toLocaleString()} output tokens</span>
              {actualCost.webSearchRequests != null && actualCost.webSearchRequests > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{actualCost.webSearchRequests} web search{actualCost.webSearchRequests !== 1 ? 'es' : ''}</span>
                </>
              )}
            </div>
          )}
          <BriefViewer
            brief={brief}
            onUpdate={async (updates) => {
              const res = await fetch(`/api/briefs/${brief.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
              });
              const data = await res.json();
              if (data.success) {
                setBrief(data.brief);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
