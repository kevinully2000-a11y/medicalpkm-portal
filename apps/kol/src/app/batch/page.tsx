'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BatchItem, BatchKolRow } from '@/lib/types';
import { ESTIMATED_COST_PER_BRIEF } from '@/lib/constants';
import { formatCost } from '@/lib/cost';

function generateItemId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function parseCsv(text: string): BatchKolRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
  const nameIdx =
    headers.indexOf('kolname') !== -1
      ? headers.indexOf('kolname')
      : headers.indexOf('name');
  const instIdx = headers.indexOf('institution');
  const specIdx = headers.indexOf('specialty');
  const ctxIdx =
    headers.indexOf('additionalcontext') !== -1
      ? headers.indexOf('additionalcontext')
      : headers.indexOf('context');
  const npiIdx = headers.indexOf('npi');
  const confIdx = headers.indexOf('conference');
  const prioIdx = headers.indexOf('priority');
  const hsIdx =
    headers.indexOf('headshoturl') !== -1
      ? headers.indexOf('headshoturl')
      : headers.indexOf('headshot');

  if (nameIdx === -1) return [];

  return lines
    .slice(1)
    .map((line) => {
      // Handle quoted CSV fields (headshot URLs may contain commas in query params)
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
        current += char;
      }
      cols.push(current.trim());

      const priority = prioIdx >= 0 ? cols[prioIdx] : undefined;
      return {
        kolName: cols[nameIdx] || '',
        institution: instIdx >= 0 ? cols[instIdx] || undefined : undefined,
        specialty: specIdx >= 0 ? cols[specIdx] || undefined : undefined,
        additionalContext: ctxIdx >= 0 ? cols[ctxIdx] || undefined : undefined,
        npi: npiIdx >= 0 ? cols[npiIdx] || undefined : undefined,
        conference: confIdx >= 0 ? cols[confIdx] || undefined : undefined,
        priority: priority && ['high', 'medium', 'low'].includes(priority.toLowerCase())
          ? (priority.toLowerCase() as 'high' | 'medium' | 'low')
          : undefined,
        headshotUrl: hsIdx >= 0 ? cols[hsIdx] || undefined : undefined,
      };
    })
    .filter((row) => row.kolName.length > 0);
}

export default function BatchPage() {
  const router = useRouter();
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualInst, setManualInst] = useState('');
  const [manualSpec, setManualSpec] = useState('');
  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const selectedItems = items.filter((i) => i.selected);
  const selectedPending = selectedItems.filter(
    (i) => i.status === 'pending' || i.status === 'error'
  );
  const completedItems = items.filter((i) => i.status === 'complete');
  const generatingItem = items.find((i) => i.status === 'generating');
  const estimatedTotal = selectedPending.length * ESTIMATED_COST_PER_BRIEF;
  const actualTotal = completedItems.reduce(
    (sum, i) => sum + (i.cost?.totalCostUsd || 0),
    0
  );
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  // Average time per brief from completed items
  const avgSeconds =
    completedItems.length > 0
      ? completedItems.reduce((sum, i) => sum + (i.elapsedSeconds || 0), 0) /
        completedItems.length
      : 25;
  const generatingCount = items.filter((i) => i.status === 'generating').length;
  const remainingCount = selectedPending.length - generatingCount;
  const estimatedRemaining = Math.ceil(remainingCount * avgSeconds);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = parseCsv(text);
        if (rows.length === 0) return;

        const newItems: BatchItem[] = rows.map((row) => ({
          id: generateItemId(),
          row,
          status: 'pending',
          selected: true,
        }));
        setItems((prev) => [...prev, ...newItems]);
      };
      reader.readAsText(file);

      // Reset file input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    []
  );

  const handleAddManual = useCallback(() => {
    if (!manualName.trim()) return;
    const newItem: BatchItem = {
      id: generateItemId(),
      row: {
        kolName: manualName.trim(),
        institution: manualInst.trim() || undefined,
        specialty: manualSpec.trim() || undefined,
      },
      status: 'pending',
      selected: true,
    };
    setItems((prev) => [...prev, newItem]);
    setManualName('');
    setManualInst('');
    setManualSpec('');
  }, [manualName, manualInst, manualSpec]);

  const toggleSelect = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const newState = !allSelected;
    setItems((prev) => prev.map((i) => ({ ...i, selected: newState })));
  }, [allSelected]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleGenerateSelected = useCallback(async () => {
    setIsGenerating(true);
    abortRef.current = false;

    const toGenerate = items.filter(
      (i) => i.selected && (i.status === 'pending' || i.status === 'error')
    );

    for (const item of toGenerate) {
      if (abortRef.current) break;

      // Mark as generating
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'generating' as const, error: undefined } : i
        )
      );

      const startTime = Date.now();

      try {
        const response = await fetch('/api/generate-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kolName: item.row.kolName,
            institution: item.row.institution || undefined,
            specialty: item.row.specialty || undefined,
            additionalContext: item.row.additionalContext || undefined,
            headshotUrl: item.row.headshotUrl || undefined,
            npi: item.row.npi || undefined,
            conference: item.row.conference || undefined,
            priority: item.row.priority || undefined,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Generation failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let resultBrief: { id?: string; cost?: { totalCostUsd: number; inputTokens: number; outputTokens: number; inputCostUsd: number; outputCostUsd: number; model: string } } | null = null;

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
              if (event.type === 'complete' && event.brief) {
                resultBrief = event.brief;
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== 'Unexpected token') {
                throw parseErr;
              }
            }
          }
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'complete' as const,
                  briefId: resultBrief?.id,
                  cost: resultBrief?.cost,
                  elapsedSeconds: elapsed,
                }
              : i
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error' as const,
                  error: err instanceof Error ? err.message : 'Unknown error',
                }
              : i
          )
        );
      }
    }

    setIsGenerating(false);
  }, [items]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Batch Generate</h1>
        <p className="mt-2 text-gray-600">
          Import a list of KOLs to generate briefs in bulk. Upload a CSV or add names manually.
        </p>
      </div>

      {/* Input section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* CSV upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isGenerating}
            />
            <label
              htmlFor="csv-upload"
              className={`inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                isGenerating
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload CSV
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Columns: kolName, institution, specialty, npi, conference, priority, headshotUrl, additionalContext
            </p>
          </div>

          {/* Manual entry */}
          <div className="flex-1 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">KOL Name</label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g., John Flack"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1">Institution</label>
              <input
                type="text"
                value={manualInst}
                onChange={(e) => setManualInst(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
              />
            </div>
            <div className="w-36">
              <label className="block text-xs text-gray-500 mb-1">Specialty</label>
              <input
                type="text"
                value={manualSpec}
                onChange={(e) => setManualSpec(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
              />
            </div>
            <button
              onClick={handleAddManual}
              disabled={!manualName.trim() || isGenerating}
              className="px-4 py-2 bg-suite-sky text-white text-sm font-medium rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={isGenerating}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KOL Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.status === 'generating'
                      ? 'bg-sky-50'
                      : item.status === 'error'
                        ? 'bg-red-50'
                        : ''
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      disabled={isGenerating || item.status === 'complete'}
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.row.kolName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.row.institution || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.row.specialty || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'pending' && (
                      <span className="text-gray-400">Pending</span>
                    )}
                    {item.status === 'generating' && (
                      <span className="flex items-center gap-1.5 text-sky-600">
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </span>
                    )}
                    {item.status === 'complete' && (
                      <button
                        onClick={() =>
                          item.briefId && router.push(`/briefs/${item.briefId}`)
                        }
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Done ({item.elapsedSeconds}s)
                      </button>
                    )}
                    {item.status === 'error' && (
                      <span className="text-red-600" title={item.error}>
                        Error
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.cost ? formatCost(item.cost.totalCostUsd) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!isGenerating && item.status !== 'generating' && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: cost summary + generate button */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-600">
                Selected:{' '}
                <span className="font-medium text-gray-900">
                  {selectedItems.length}
                </span>{' '}
                of {items.length}
              </span>
              {selectedPending.length > 0 && (
                <span className="text-gray-600">
                  Est. cost:{' '}
                  <span className="font-medium text-amber-600">
                    ~{formatCost(estimatedTotal)}
                  </span>
                </span>
              )}
              {actualTotal > 0 && (
                <span className="text-gray-600">
                  Actual cost:{' '}
                  <span className="font-medium text-green-600">
                    {formatCost(actualTotal)}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isGenerating ? (
                <>
                  <span className="text-sm text-gray-500">
                    {completedItems.length}/{selectedItems.length} complete
                    {estimatedRemaining > 0 &&
                      ` | ~${Math.floor(estimatedRemaining / 60)}m ${estimatedRemaining % 60}s remaining`}
                  </span>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Stop after current
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGenerateSelected}
                  disabled={selectedPending.length === 0}
                  className="px-6 py-2.5 bg-suite-amber text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate {selectedPending.length} Brief
                  {selectedPending.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar during generation */}
          {isGenerating && selectedItems.length > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-suite-sky h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedItems.length / selectedItems.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No KOLs added yet</p>
          <p className="mt-1">Upload a CSV file or add names manually above.</p>
        </div>
      )}
    </div>
  );
}
