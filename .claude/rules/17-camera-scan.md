---
scope: "Camera scan page, product-scan Edge Function, scanClient, image pipeline, post-scan discovery"
authority: primary
last_synced: "2026-03-21"
related: ["01-workflow.md", "03-frontend.md", "05-ai-pipeline.md", "10-data-layer.md", "13-domain-features.md"]
---

# Camera Scan Rules

> Trigger: read this file when modifying `/scan`, `product-scan` Edge Function, `scanClient.ts`, image processing, or post-scan discovery

---

## Architecture Overview

| Component | Path | Purpose |
|-----------|------|---------|
| Type definitions | `src/types/scan.ts` | `ScanResult`, `ScanRequest`, `ScanResponse`, `ParsedIngredient` (incl. `cautionReason`), `ScanHistoryEntry` |
| Edge Function | `supabase/functions/product-scan/index.ts` | Claude Vision proxy — identification + ingredient parsing |
| Client | `src/lib/ai/scanClient.ts` | Image compress + thumbnail + API caller |
| Scan history | `src/lib/utils/scanHistory.ts` | localStorage persistence for past scans |
| Page | `src/pages/scan/page.tsx` | Main scan page (state machine + history) |
| CameraCapture | `src/pages/scan/components/CameraCapture.tsx` | File input + webcam + barcode mode (BarcodeDetector API) |
| ScanProcessing | `src/pages/scan/components/ScanProcessing.tsx` | Loading state |
| ScanResultView | `src/pages/scan/components/ScanResultView.tsx` | Unified result view (catalog match + any-product identification) |
| PostScanDiscovery | `src/pages/scan/components/PostScanDiscovery.tsx` | Compatible products with AI WHY + category filters |
| ScanReviewPanel | `src/pages/scan/components/ScanReviewPanel.tsx` | Profile-filtered reviews + AI summary |
| ScanHistory | `src/pages/scan/components/ScanHistory.tsx` | Horizontal scroll of past scan thumbnails |

---

## Full Vision Pipeline (Scan → Discover → Understand → Build)

| Stage | Component | What it does |
|-------|-----------|--------------|
| **Scan** | CameraCapture → Edge Function → ScanResultView | Identify product + parse full ingredient list |
| **Discover** | PostScanDiscovery | Find compatible products via `findCompatibleProducts()` + AI WHY |
| **Understand** | ScanReviewPanel | Profile-filtered reviews + AI summary via `curated_review_summary` |
| **Build** | ScanResultView + PostScanDiscovery | Add to Shelf, Add to Routine via RoutinePickerModal |

---

## Image Pipeline Specs

| Parameter | Value | Reason |
|-----------|-------|--------|
| Max dimension | 1568px (longest edge) | Claude Vision optimal input size |
| Format | JPEG | Smallest size, universal support |
| Quality | 0.75 | Balance: quality vs file size |
| Target size | 200–400 KB | Fast upload, low token cost |
| Max payload | 7 MB base64 (~5 MB decoded) | Supabase Edge Function limit |
| Thumbnail size | 80px (longest edge) | Scan history display |
| Thumbnail quality | 0.5 | ~5-10 KB per thumbnail |

Pipeline: `File → loadImage() → canvas resize → toDataURL('image/jpeg', 0.75) → strip prefix → raw base64`
Thumbnail: `File → loadImage() → canvas resize (80px) → toDataURL('image/jpeg', 0.5) → data URL`

---

## Edge Function Contract

**Endpoint:** `POST /functions/v1/product-scan`

**Request (photo mode):**
```json
{
  "image": "<raw-base64-string>",
  "mediaType": "image/jpeg",
  "skinProfile": {
    "skinType": "oily",
    "concerns": ["acne", "dark spots"],
    "sensitivity": "moderate"
  }
}
```

**Request (barcode mode):**
```json
{
  "upc": "850001001011"
}
```

`skinProfile` is optional — when present, ingredient relevance is personalized.
When `upc` is present, Vision is skipped and the catalog is searched by UPC directly.

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
    "ingredients": [
      { "name": "Hyaluronic Acid", "function": "attracts and retains moisture", "safetyTier": "safe", "relevance": "helps with dryness" },
      { "name": "Glycolic Acid", "function": "exfoliates dead skin cells", "safetyTier": "caution", "cautionReason": "Can cause irritation and sun sensitivity. Start at low concentrations and always wear SPF." }
    ],
    "ingredientCount": 12,
    "timestamp": "2026-03-18T..."
  },
  "meta": { "authenticated": true, "tokensUsed": 1900, "timestamp": "..." }
}
```

**Auth:** Required. Returns 401 for unauthenticated requests. MAX_TOKENS: 8192.

When `stop_reason === 'max_tokens'`, the response sets `ingredientsTruncated: true` and the UI shows a hint to rescan.

---

## AI Modes (Scan-Related)

| Mode | Path | Purpose |
|------|------|---------|
| `curated_recommendation` | surfaceContext + systemPrompt | Batch AI WHY for compatible products |
| `curated_review_summary` | surfaceContext + systemPrompt | Summary of profile-filtered reviews |

---

## Scan History

- Storage: localStorage under key `scanHistory`
- Max entries: 20 (oldest pruned on overflow)
- Each entry: `{ id, result: ScanResult, thumbnail: string (data URL), timestamp }`
- Thumbnails are 80px JPEG data URLs (~5-10 KB each)
- Tapping a history entry restores the full result without re-scanning
- History is non-critical — silent fail on storage errors

---

## Shelf & Routine Integration

- **Add to Shelf**: calls `savedProductsState.addSavedProduct()` + `PRODUCT_SAVED` gamification trigger
- **Add to Routine**: opens `RoutinePickerModal` (existing Phase 2 component)
- Non-matched products create a temporary product object from scan data (negative ID)
- Both buttons available for matched AND non-matched products

---

## Barcode Scanning

- CameraCapture has a `mode` state: `'photo' | 'barcode'` (default `'photo'`)
- Uses browser-native **BarcodeDetector API** (Chrome 83+, Edge 83+) — zero npm dependencies
- Supported formats: `ean_13`, `ean_8`, `upc_a`, `upc_e`
- Unsupported browsers (Firefox, Safari/iOS): shows error message, stays on photo mode
- Desktop barcode flow: webcam → continuous frame scanning via `requestAnimationFrame` → 5s timeout
- Mobile barcode flow: file input → `BarcodeDetector.detect()` on captured image
- When barcode detected → `onBarcodeDetected(upc)` → `scanByUpc()` → Edge Function UPC lookup
- Edge Function `PRODUCT_CATALOG` has placeholder `upc` field on each product
- UPC lookup returns match (if found) or no-match with UPC displayed
- `ScanResult.upc` field present when scanned via barcode mode

---

## Scan Result Behavior

The scanner works with ANY real product — catalog matching is a bonus, not a requirement.

### Result tiers

| Condition | UI Behavior |
|-----------|-------------|
| Catalog match (`match: true`) | "Product Identified" + rich card with rating/reviews + "View Product Details" link + ingredients + shelf/routine |
| Non-catalog product identified (`match: false`, `detectedProduct` present) | "Product Identified" + rich card with brand/name/category + ingredients + shelf/routine |
| Low-confidence blank (`confidence: 'low'`, no product/brand detected) | "Could Not Identify" + retry tips (lighting, closer, brand visible) |
| UPC not recognized | "UPC Not Recognized" + UPC displayed |

### Key rules

- Both catalog and non-catalog results show the SAME rich card layout (image, brand, name, category, CTAs)
- The ONLY difference: catalog matches get a "View Product Details" link; non-catalog products don't
- Ingredient breakdown renders for ALL results with `ingredients.length > 0`
- "Add to Shelf" and "Add to Routine" work for both matched and non-matched products
- Gamification points awarded for ANY successful identification (not just catalog matches)
- Edge Function prompt prioritizes identification over catalog matching — common brands listed as hints
- Confidence level is stored in the API response but NOT shown in the UI (removed from both match and no-match views)
- Ingredients with `safetyTier: "caution"` or `"avoid"` include a `cautionReason` field (2-4 sentences: why flagged, affected skin types, precautions)
- cautionReason is COLLAPSIBLE per-ingredient: default collapsed, NeuralBloomIcon + chevron toggle next to safety badge
- Hovering NeuralBloomIcon shows tooltip: "AI Safety Analysis" (ingredients) or "AI Personalized Insight" (compatible products)
- UI renders expanded cautionReason in app palette: `bg-cream border-blush text-warm-gray` (caution), `bg-cream border-primary/30 text-deep` (avoid)
- SafetyBadge colors: safe = sage, caution = `bg-cream text-warm-gray border-blush`, avoid = `bg-cream text-deep border-primary/30` — NO yellow/red
- Safe ingredients show NO cautionReason block
- Ingredient list uses 3-state collapse: default `'preview'` (top 5) → expanded (all) → collapsed (header only)
- Header chevron toggles collapsed ↔ preview; "Show all" button goes preview → expanded; "Show less" goes expanded → preview
- Compatible products (PostScanDiscovery) show AI WHY as collapsible toggle per-product via NeuralBloomIcon next to compatibility badge
- "Use with Care" badge uses app palette (`bg-cream text-warm-gray border border-blush`) — NO yellow
- Review content uses `highlightRelevantKeywords()` for profile-based keyword highlighting across scan + product detail surfaces
- ScanReviewPanel reviewer concerns rendered as pills with `matchesConcern()` highlighting (same pattern as ProductReviews)
- ScanReviewPanel match badge tap opens full Match Breakdown modal (same pattern as ProductReviews: fixed modal with backdrop, score rows, "theirs vs yours")
- All AI icons in scan components use NeuralBloomIcon from `src/components/icons/NeuralBloomIcon.tsx` — never ri-sparkling-line

---

## UX State Machine

```
idle → captured → processing → result (match/no-match)
                             → error
```

Transitions:
- `captured → idle` (retake)
- `result → idle` (scan another)
- `error → idle` (try again)
- `idle → result` (history card tap — bypasses capture/processing)
- `idle → processing → result` (barcode detected — bypasses capture)

---

## Guest Policy

- Guest users see a login CTA — no API calls, no image processing
- Auth check happens client-side in `scanClient.ts` before compression
- Edge Function returns 401 for unauthenticated requests as a safety net

---

## Prohibited Actions

Claude must never:
- Add new npm dependencies for camera/barcode scanning without approval (BarcodeDetector is browser-native)
- Auto-trigger device camera without user action
- Store full-resolution scanned images (thumbnails only for history)
- Skip image compression before upload
- Modify the prompt without testing identification accuracy
- Expose raw Claude API errors to the user
- Fabricate ingredient safety data — safetyTier comes from Claude Vision
- Show personalized relevance when no skin profile exists
