export type BrandConfidence = 'high' | 'medium' | 'low' | null;

export interface ScanConfidenceRecent {
  created_at: string;
  brand_confidence: BrandConfidence;
  overall_confidence: string | null;
}

export interface ScanConfidenceStats {
  from: string;
  to: string;
  total_vision: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  wary: number;
  recent: ScanConfidenceRecent[];
}
