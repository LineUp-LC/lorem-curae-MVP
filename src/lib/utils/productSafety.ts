/**
 * Product Safety Assessment
 *
 * Checks products against the user's skin profile (survey data, allergens,
 * skin type) and returns safety warnings. Products are never hidden —
 * they are labelled so users can make informed decisions.
 */

import { PREGNANCY_UNSAFE, ADVANCED_INGREDIENTS } from '../ai/ingredientIntelligence';
import { INGREDIENT_ENCYCLOPEDIA } from '../ai/knowledgeBase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SafetyLevel = 'safe' | 'caution' | 'not-recommended';

export interface SafetyWarning {
  level: SafetyLevel;
  label: string;
  detail: string;
}

export interface SafetyResult {
  level: SafetyLevel;
  warnings: SafetyWarning[];
}

interface UserProfile {
  skinType?: string[];
  concerns?: string[];
  allergens?: string[];
  sexAtBirth?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(s: string): string {
  return s.toLowerCase().trim().replace(/[-_]/g, ' ');
}

function ingredientMatch(ingredient: string, list: string[]): boolean {
  const norm = normalise(ingredient);
  return list.some(item => {
    const n = normalise(item);
    return norm.includes(n) || n.includes(norm);
  });
}

// ---------------------------------------------------------------------------
// Core assessment
// ---------------------------------------------------------------------------

/**
 * Load the user's skin profile from localStorage (skinSurveyData).
 */
export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('skinSurveyData');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      skinType: data.skinType || [],
      concerns: data.concerns || [],
      allergens: data.allergens || [],
      sexAtBirth: data.sexAtBirth || '',
    };
  } catch {
    return null;
  }
}

/**
 * Assess a product's safety for the current user.
 *
 * @param keyIngredients – the product's key ingredient name strings
 * @param profile        – optional; will be loaded from localStorage if omitted
 */
export function assessProductSafety(
  keyIngredients: string[],
  profile?: UserProfile | null,
): SafetyResult {
  const user = profile ?? getUserProfile();
  if (!user || keyIngredients.length === 0) {
    return { level: 'safe', warnings: [] };
  }

  const warnings: SafetyWarning[] = [];

  // 1. Allergen check
  if (user.allergens && user.allergens.length > 0) {
    for (const ingredient of keyIngredients) {
      if (ingredientMatch(ingredient, user.allergens)) {
        warnings.push({
          level: 'not-recommended',
          label: 'Not Recommended for Your Skin Profile',
          detail: `Contains ${ingredient}, which is listed in your sensitivities.`,
        });
      }
    }
  }

  // 2. Skin-type compatibility (from knowledge base)
  if (user.skinType && user.skinType.length > 0) {
    for (const ingredient of keyIngredients) {
      const entry = Object.values(INGREDIENT_ENCYCLOPEDIA).find(
        e => normalise(e.name) === normalise(ingredient),
      );
      if (entry && entry.skinTypes.length > 0) {
        const suitable = entry.skinTypes.map(normalise);
        const userTypes = user.skinType.map(normalise);
        // If the ingredient lists specific skin types AND user's type isn't among them
        const hasOverlap = userTypes.some(t => suitable.some(s => s.includes(t) || t.includes(s)));
        if (!hasOverlap && !suitable.includes('all')) {
          warnings.push({
            level: 'caution',
            label: 'Use With Caution',
            detail: `${entry.name} is typically recommended for ${entry.skinTypes.join(', ')} skin. Your profile indicates ${user.skinType.join(', ')}.`,
          });
        }
      }
    }
  }

  // 3. Contraindication check from knowledge base
  for (const ingredient of keyIngredients) {
    const entry = Object.values(INGREDIENT_ENCYCLOPEDIA).find(
      e => normalise(e.name) === normalise(ingredient),
    );
    if (entry && entry.contraindications.length > 0) {
      // Check for sensitivity-related concerns
      if (user.concerns) {
        const userConcerns = user.concerns.map(normalise);
        for (const contra of entry.contraindications) {
          const normContra = normalise(contra);
          if (userConcerns.some(c => normContra.includes(c) || c.includes('sensitive'))) {
            if (normContra.includes('sensitive') || normContra.includes('compromised')) {
              warnings.push({
                level: 'caution',
                label: 'Use With Caution — May Not Suit Your Skin Needs',
                detail: `${entry.name}: ${contra}`,
              });
            }
          }
        }
      }
    }
  }

  // 4. Pregnancy safety check
  if (user.sexAtBirth === 'Female' || user.sexAtBirth === 'female') {
    for (const ingredient of keyIngredients) {
      if (ingredientMatch(ingredient, PREGNANCY_UNSAFE)) {
        warnings.push({
          level: 'caution',
          label: 'Use With Caution',
          detail: `${ingredient} is not recommended during pregnancy or breastfeeding.`,
        });
      }
    }
  }

  // Deduplicate warnings by label + detail
  const seen = new Set<string>();
  const unique = warnings.filter(w => {
    const key = `${w.label}::${w.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Determine overall level
  const hasNotRecommended = unique.some(w => w.level === 'not-recommended');
  const hasCaution = unique.some(w => w.level === 'caution');
  const level: SafetyLevel = hasNotRecommended ? 'not-recommended' : hasCaution ? 'caution' : 'safe';

  return { level, warnings: unique };
}
