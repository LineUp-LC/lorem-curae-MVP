---
scope: "Camera scan page, product-scan Edge Function, scanClient, image pipeline"
authority: primary
last_synced: "2026-03-15"
related: ["01-workflow.md", "03-frontend.md", "10-data-layer.md", "13-domain-features.md"]
---

# Camera Scan Rules

> Trigger: read this file when modifying `/scan`, `product-scan` Edge Function, `scanClient.ts`, or image processing

---

## Architecture Overview

| Component | Path | Purpose |
|-----------|------|---------|
| Type definitions | `src/types/scan.ts` | `ScanResult`, `ScanRequest`, `ScanResponse` |
| Edge Function | `supabase/functions/product-scan/index.ts` | Claude Vision proxy |
| Client | `src/lib/ai/scanClient.ts` | Image compress + API caller |
| Page | `src/pages/scan/page.tsx` | Main scan page (state machine) |
| CameraCapture | `src/pages/scan/components/CameraCapture.tsx` | File input + tips |
| ScanProcessing | `src/pages/scan/components/ScanProcessing.tsx` | Loading state |
| ScanResultView | `src/pages/scan/components/ScanResultView.tsx` | Match/no-match result |

---

## Image Pipeline Specs

| Parameter | Value | Reason |
|-----------|-------|--------|
| Max dimension | 1568px (longest edge) | Claude Vision optimal input size |
| Format | JPEG | Smallest size, universal support |
| Quality | 0.75 | Balance: quality vs file size |
| Target size | 200–400 KB | Fast upload, low token cost |
| Max payload | 7 MB base64 (~5 MB decoded) | Supabase Edge Function limit |

Pipeline: `File → loadImage() → canvas resize → toDataURL('image/jpeg', 0.75) → strip prefix → raw base64`

---

## Edge Function Contract

**Endpoint:** `POST /functions/v1/product-scan`

**Request:**
```json
{
  "image": "<raw-base64-string>",
  "mediaType": "image/jpeg"
}
```

**Response (success):**
```json
{
  "success": true,
  "result": {
    "match": true,
    "productId": 1,
    "confidence": "high",
    "detectedProduct": "Gentle Hydrating Cleanser",
    "detectedBrand": "Pure Essence",
    "detectedCategory": "cleanser",
    "timestamp": "2026-03-15T..."
  },
  "meta": { "authenticated": true, "tokensUsed": 1900, "timestamp": "..." }
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "AI service error: 400",
  "meta": { "authenticated": true, "timestamp": "..." }
}
```

**Auth:** Required. Returns 401 for unauthenticated requests.

---

## Claude Vision Prompt Structure

The system prompt contains:
1. Role definition ("skincare product identifier for Lorem Curae")
2. Full product catalog (12 products with id, name, brand, category, keyIngredients)
3. Identification instructions (read label → match catalog → return JSON)
4. Confidence tier definitions (high/medium/low)
5. Output format specification (strict JSON, no markdown)

**When modifying the prompt:**
- Keep the catalog section separate from instructions
- Always validate productId against the catalog
- Never remove the "respond ONLY with valid JSON" directive
- Test with at least 3 product photos before deploying

**When adding products to the catalog:**
- Add to `PRODUCT_CATALOG` array in the Edge Function
- Match the shape: `{ id, name, brand, category, keyIngredients }`
- When migrating to Supabase, replace the hardcoded array with a database query

---

## UX State Machine

```
idle → captured → processing → result (match/no-match)
                             → error
```

All transitions are forward-only except:
- `captured → idle` (retake)
- `result → idle` (scan another)
- `error → idle` (try again)

---

## Guest Policy

- Guest users see a login CTA — no API calls, no image processing
- Auth check happens client-side in `scanClient.ts` before compression
- Edge Function returns 401 for unauthenticated requests as a safety net

---

## Prohibited Actions

Claude must never:
- Add new npm dependencies for camera/barcode scanning
- Auto-trigger device camera without user action
- Store scanned images (ephemeral only — not persisted)
- Skip image compression before upload
- Modify the prompt without testing identification accuracy
- Expose raw Claude API errors to the user
