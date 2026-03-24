/**
 * Scan History — localStorage persistence for past product scans.
 *
 * Stores up to MAX_ENTRIES scan results with small thumbnails.
 * Thumbnails are base64 data URLs (~5-10KB each).
 */

import type { ScanHistoryEntry, ScanResult } from '../../types/scan';

const STORAGE_KEY = 'scanHistory';
const MAX_ENTRIES = 20;
/** Only keep imageBase64 (~200-400KB each) for the N most recent entries to limit localStorage usage */
const MAX_IMAGE_ENTRIES = 5;

export function getScanHistory(): ScanHistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function addScanHistoryEntry(
  result: ScanResult,
  thumbnail: string,
  imageBase64?: string,
): ScanHistoryEntry {
  const entry: ScanHistoryEntry = {
    id: `scan-${Date.now()}`,
    result,
    thumbnail,
    imageBase64,
    timestamp: new Date().toISOString(),
  };

  const history = getScanHistory();
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);

  // Strip imageBase64 from older entries to manage localStorage size
  for (let i = MAX_IMAGE_ENTRIES; i < updated.length; i++) {
    if (updated[i].imageBase64) {
      updated[i] = { ...updated[i], imageBase64: undefined };
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — strip ALL imageBase64 and retry
    const stripped = updated.map(e => ({ ...e, imageBase64: undefined, fullScanResult: undefined }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped.slice(0, 10)));
    } catch {
      // Silent fail — scan history is not critical
    }
  }

  return entry;
}

/** Update a specific history entry (e.g., to cache fullScanResult after lazy load) */
export function updateScanHistoryEntry(
  entryId: string,
  updates: { fullScanResult?: ScanResult },
): void {
  const history = getScanHistory();
  const idx = history.findIndex(e => e.id === entryId);
  if (idx === -1) return;

  history[idx] = { ...history[idx], ...updates };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // If storing with fullScanResult overflows, strip it and retry
    history[idx] = { ...history[idx], fullScanResult: undefined };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Silent fail
    }
  }
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
