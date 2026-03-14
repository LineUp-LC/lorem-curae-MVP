# Environment & Location Personalization Rules

> Trigger: Read this file when working on UV, climate, season, location, environment-fit, or product-fit features.

---

## Purpose

Provide environment-aware insights based on real user location data. Never fake personalization — if no location data exists, clearly indicate insights are based on default data.

---

## Canonical Type

**`src/lib/environment/context.ts`** → `EnvironmentContext`

```ts
type EnvironmentContext = {
  location: { city?, region?, country?, lat?, lon? };
  uvIndex?: number;
  uvBand?: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  climate?: 'humid_continental' | 'mediterranean' | 'tropical' | 'arid' | 'polar' | 'unknown';
  season?: 'winter' | 'spring' | 'summer' | 'autumn';
  source: 'mock' | 'live' | 'partial';
};
```

Do not modify this shape without updating this file.

---

## Canonical Modules

| Module | Path | Purpose |
|--------|------|---------|
| EnvironmentContext type | `src/lib/environment/context.ts` | Canonical type definition |
| buildEnvironmentContext | `src/lib/environment/buildEnvironmentContext.ts` | Location → UV/climate/season pipeline |
| getUvIndex | `src/lib/environment/uvProvider.ts` | Client-side UV Edge Function caller |
| inferClimate | `src/lib/environment/inferClimate.ts` | Deterministic Koppen-like classification |
| inferSeason | `src/lib/environment/inferSeason.ts` | Date + hemisphere → season |
| useEnvironmentContext | `src/lib/environment/useEnvironmentContext.ts` | React hook for all UI surfaces |
| get-uv-index | `supabase/functions/get-uv-index/index.ts` | Server-side UV API wrapper |
| geocode-location | `supabase/functions/geocode-location/index.ts` | Server-side geocoding wrapper |

---

## Profile Location Fields

Stored in `preferences.location` within `users_profiles` table:

| Field | Type | Source |
|-------|------|--------|
| city | string | User input or reverse geocoding |
| state | string | User input (backward compat) |
| region | string | Normalized region name |
| zip | string | User input |
| country | string | User input or reverse geocoding |
| lat | number | Browser geolocation, geocoding, or manual input |
| lon | number | Browser geolocation, geocoding, or manual input |
| timezone | string | Inferred from lat/lon |
| hemisphere | 'northern' \| 'southern' | Inferred from lat |

All fields optional and nullable. Existing users with only city/state/zip continue to work.

---

## Source Determination

| Condition | source | Behavior |
|-----------|--------|----------|
| No location fields (all null) | `'mock'` | Default UV/climate/season. **Never claim personalization.** |
| City/state/zip but no lat/lon | `'partial'` | Inferred season only. Softer language. |
| lat/lon present | `'live'` | Real UV, inferred climate + season. Show "personalized." |

> Copy templates → `CLAUDE_PRODUCT.md` Section 8.

**Critical rule:** Never claim personalization when `source === 'mock'`.

### UI Consumption
- All UV/climate/season references **must** use `useEnvironmentContext()`
- No hard-coded UV index values, climate strings, or season strings
- No direct external UV API calls — go through server wrapper
- No independent climate/season computation — use shared inference utilities

---

## Consent & Privacy

- Browser geolocation **only** triggered by explicit user action ("Use my current location")
- Never auto-triggered on page load, route change, or session start
- Users can always clear their location → forces `source = 'mock'`
- Location data only used for environmental insights
- Visible privacy note must appear in Settings → Location UI

---

## Modification Constraints

Claude must never:
- Change `EnvironmentContext` type without updating this file
- Bypass `buildEnvironmentContext()` or `useEnvironmentContext()` with inline calculations
- Reintroduce hard-coded UV, climate, or season strings
- Auto-trigger browser geolocation
- Display "personalized" copy when `source === 'mock'`
- Call external UV/geocoding APIs from frontend (must go through Edge Functions)

---

## Texture Inference

`inferTexture()` (`src/lib/environment/inferTexture.ts`) derives canonical texture from product metadata.

- Inferred texture is never displayed directly to the user
- Used internally only for environment-fit sentence generation
- Explicit `texture` field takes priority over inference
- Must degrade to `'unknown'` rather than guess incorrectly

---

## Reviewer Evidence Integration

`reviewerEvidence.ts` aggregator must:
- Never fabricate review data or reviewer profiles
- Use minimum 30% similarity threshold
- Return `undefined` when no reviews meet the threshold

> For user-facing reviewer evidence framing → `CLAUDE_PRODUCT.md` Section 9.

---

## Knowledge Base Maintenance

When adding new product categories, ingredient classes, texture types, or condition keys:
1. Add entries to all three knowledge maps in `productKnowledge.ts`
2. Update corresponding TypeScript types (`ConditionKey`, `IngredientClass`, `InferredTexture`)
3. Update `deriveConditions()` if new condition requires new environment context mapping
4. Update `inferTexture()` if new texture requires inference rules
5. Verify all 12 mock products produce reasonable explanations across all 3 modes
6. Run `npx tsc --noEmit` and `npx vite build` to confirm zero errors

---

## Environment-Linked Product Fit (Jargon-Free)

### Jargon-Free Rules
1. **Never expose ingredient class names.** Internal labels (humectant, emollient, occlusive, etc.) are engineering labels. Users see what ingredients DO.
2. **Never use technical skin-science language.** Prohibited: "atmospheric moisture," "ambient humidity," "depletes surface moisture," "counteract," "transepidermal," "occlusion," "antioxidant defense," "mineral-based protection," "barrier function," "sensitized skin," "UV-related stress," "environmental stress," "perspiration," "congesting."
3. **Never use weather/climate jargon.** Say "cold, dry air" not "low ambient humidity." Say "strong sun" not "elevated UV levels."

### Environment-Linking Rules
1. Always name location + season + most impactful weather condition in opening sentence
2. Always use cause-and-effect language
3. Select the condition that matters most for the user's skin type first

### Product-Quality Rules
1. Describe what the product does, not what it contains
2. Tie every product quality to the current condition in the same sentence
3. When matching a user concern, explain why that concern is harder in current environment

### Sentence Structure (max 4 bullets)
1. **Environment opener:** [Season] in [Location] means [condition] — [skin type] skin [impact]
2. **Primary product action:** This [product type] [what it does], [tied to condition]
3. **Secondary action/texture:** It also [what it does], [tied to condition or skin type]
4. **Concern alignment:** [Concern] [why harder right now], so this product [why it helps]

### Enforcement
- `MECHANISM_PHRASES` in `productKnowledge.ts` must use plain language
- `buildProductFitNarrative()` must never expose ingredient class names
- All product-fit text must pass the "would a first-time skincare user understand this?" test
