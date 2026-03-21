/**
 * Scan History — localStorage persistence for past product scans.
 *
 * Stores up to MAX_ENTRIES scan results with small thumbnails.
 * Thumbnails are base64 data URLs (~5-10KB each).
 */

import type { ScanHistoryEntry, ScanResult } from '../../types/scan';

const STORAGE_KEY = 'scanHistory';
const MAX_ENTRIES = 20;

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
): ScanHistoryEntry {
  const entry: ScanHistoryEntry = {
    id: `scan-${Date.now()}`,
    result,
    thumbnail,
    timestamp: new Date().toISOString(),
  };

  const history = getScanHistory();
  // Prepend new entry, cap at MAX_ENTRIES
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — remove oldest entries and retry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10)));
    } catch {
      // Silent fail — scan history is not critical
    }
  }

  return entry;
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
