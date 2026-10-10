/**
 * Scan Confidence admin read path.
 *
 * Reads aggregated, de-identified scan-confidence stats via the
 * `scan_confidence_stats` SECURITY DEFINER RPC. The underlying
 * scan_confidence_log table has no SELECT policy, so this RPC is the
 * only read path — it returns counts + a de-identified recent feed,
 * never user_id or detected product names.
 */

import { supabase } from '@/lib/supabase-browser';
import type { ScanConfidenceStats } from '@/types/scanConfidence';

export async function fetchScanConfidenceStats(
  fromISO: string,
  toISO: string,
): Promise<ScanConfidenceStats | null> {
  const { data, error } = await supabase.rpc('scan_confidence_stats', {
    p_from: fromISO,
    p_to: toISO,
  });

  if (error) {
    console.error('scan_confidence_stats RPC failed', error);
    return null;
  }

  return data as ScanConfidenceStats;
}
