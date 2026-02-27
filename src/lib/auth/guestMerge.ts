/**
 * Guest to Account Data Merge System
 *
 * Merges guest localStorage data into authenticated Supabase profile.
 * Called on signup and login to preserve user progress.
 */

import { supabase } from '../supabase-browser'
import { UserProfile } from '../supabase'
import { sessionState } from '../utils/sessionState'
import { savedProductsState, SavedProduct } from '../utils/favoritesState'
import { getLocalRoutines, saveLocalRoutines, SavedRoutine, mergeRoutines } from '../utils/routineState'
import { locationState } from '../utils/locationState'

// -----------------------------
// Types
// -----------------------------

export interface MergeResult {
  success: boolean
  mergedFields: string[]
  skippedFields: string[]
  errors: string[]
}

interface GuestData {
  // Skin profile
  skinType?: string
  concerns?: string[]
  surveyAnswers?: Record<string, any>

  // Saved products
  savedProducts?: SavedProduct[]
  savedItems?: string[]

  // Routines
  routines?: SavedRoutine[]

  // Behavioral data
  searchHistory?: string[]
  viewedProducts?: string[]

  // Preferences
  preferences?: Record<string, any>

  // Location
  location?: { city: string; state: string; zip: string }
}

// -----------------------------
// Collect guest data from localStorage
// -----------------------------

function collectGuestData(): GuestData {
  const data: GuestData = {}

  try {
    // 1. Session state data
    const state = sessionState.getState()
    data.skinType = state.tempSkinType
    data.concerns = state.tempConcerns
    data.savedItems = state.context?.savedItems || []
    data.searchHistory = state.context?.searchHistory || []
    data.viewedProducts = state.context?.viewedProducts || []
    data.preferences = state.preferences || {}

    // 2. Survey answers
    const surveyAnswers = localStorage.getItem('survey_answers')
    if (surveyAnswers) {
      data.surveyAnswers = JSON.parse(surveyAnswers)
    }

    // 3. Legacy skin survey data
    const skinSurveyData = localStorage.getItem('skinSurveyData')
    if (skinSurveyData && !data.skinType) {
      const parsed = JSON.parse(skinSurveyData)
      data.skinType = data.skinType || parsed.skinType?.[0]
      data.concerns = data.concerns?.length ? data.concerns : parsed.concerns
    }

    // 4. Saved products
    data.savedProducts = savedProductsState.getSavedProducts()

    // 5. Routines
    data.routines = getLocalRoutines()

    // 6. Location
    const guestLocation = locationState.getLocation()
    if (guestLocation && (guestLocation.city || guestLocation.state || guestLocation.zip)) {
      data.location = guestLocation
    }

  } catch (e) {
    console.error('[guestMerge] Error collecting guest data:', e)
  }

  return data
}

// -----------------------------
// Dedupe arrays by value
// -----------------------------

function dedupeArray<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// -----------------------------
// Dedupe saved products by ID
// -----------------------------

function dedupeSavedProducts(
  existing: SavedProduct[],
  incoming: SavedProduct[]
): SavedProduct[] {
  const existingIds = new Set(existing.map(p => p.id))
  const newProducts = incoming.filter(p => !existingIds.has(p.id))
  return [...existing, ...newProducts]
}

// -----------------------------
// Main merge function
// -----------------------------

export async function mergeGuestDataToAccount(
  userId: string,
  existingProfile: UserProfile | null
): Promise<MergeResult> {
  const result: MergeResult = {
    success: false,
    mergedFields: [],
    skippedFields: [],
    errors: [],
  }

  console.log('[guestMerge] Starting merge for user:', userId)

  // Collect all guest data
  const guestData = collectGuestData()

  // Check if there's anything to merge
  const hasDataToMerge =
    guestData.skinType ||
    (guestData.concerns && guestData.concerns.length > 0) ||
    (guestData.savedProducts && guestData.savedProducts.length > 0) ||
    (guestData.routines && guestData.routines.length > 0) ||
    (guestData.searchHistory && guestData.searchHistory.length > 0) ||
    (guestData.viewedProducts && guestData.viewedProducts.length > 0) ||
    guestData.location

  if (!hasDataToMerge) {
    console.log('[guestMerge] No guest data to merge')
    result.success = true
    result.skippedFields.push('all (no guest data)')
    return result
  }

  // Build update payload
  const updates: Partial<UserProfile> = {}
  const existingPrefs = existingProfile?.preferences || {}
  const newPrefs: Record<string, any> = { ...existingPrefs }

  // 1. Skin type - only if server is empty
  if (guestData.skinType && !existingProfile?.skin_type) {
    updates.skin_type = guestData.skinType
    result.mergedFields.push('skin_type')
  } else if (guestData.skinType) {
    result.skippedFields.push('skin_type (server has value)')
  }

  // 2. Concerns - merge arrays, dedupe
  if (guestData.concerns && guestData.concerns.length > 0) {
    const existingConcerns = existingProfile?.concerns || []
    const merged = dedupeArray([...existingConcerns, ...guestData.concerns])
    if (merged.length > existingConcerns.length) {
      updates.concerns = merged
      result.mergedFields.push('concerns')
    } else {
      result.skippedFields.push('concerns (no new values)')
    }
  }

  // 3. Saved products - append + dedupe by ID
  if (guestData.savedProducts && guestData.savedProducts.length > 0) {
    const existingSaved: SavedProduct[] = existingPrefs.savedProducts || []
    const merged = dedupeSavedProducts(existingSaved, guestData.savedProducts)
    if (merged.length > existingSaved.length) {
      newPrefs.savedProducts = merged
      result.mergedFields.push('savedProducts')
    } else {
      result.skippedFields.push('savedProducts (no new values)')
    }
  }

  // 4. Routines - INSERT into user_routines table
  if (guestData.routines && guestData.routines.length > 0) {
    try {
      // Get existing routine IDs from server
      const { data: existingRows } = await supabase
        .from('user_routines')
        .select('id')
        .eq('user_id', userId)

      const existingIds = new Set((existingRows || []).map(r => r.id))

      // Filter to only new routines
      const newRoutines = guestData.routines.filter(r => !existingIds.has(r.id))

      if (newRoutines.length > 0) {
        // Insert new routines
        const rows = newRoutines.map(r => ({
          id: r.id,
          user_id: userId,
          name: r.name,
          description: r.description || null,
          time_of_day: r.timeOfDay,
          steps: r.steps,
          thumbnail_url: r.thumbnail || null,
          tags: [],
          frequency: null,
          is_active: true,
          is_template: false,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
        }))

        const { error: routineError } = await supabase
          .from('user_routines')
          .insert(rows)

        if (routineError) {
          console.error('[guestMerge] Error inserting routines:', routineError)
          result.errors.push('routines: ' + routineError.message)
        } else {
          result.mergedFields.push('routines')
        }
      } else {
        result.skippedFields.push('routines (no new values)')
      }
    } catch (e) {
      console.error('[guestMerge] Error merging routines:', e)
      result.errors.push('routines: merge failed')
    }
  }

  // 5. Search history - append + dedupe + limit 20
  if (guestData.searchHistory && guestData.searchHistory.length > 0) {
    const existingHistory: string[] = existingPrefs.searchHistory || []
    const merged = dedupeArray([...guestData.searchHistory, ...existingHistory]).slice(0, 20)
    newPrefs.searchHistory = merged
    result.mergedFields.push('searchHistory')
  }

  // 6. Viewed products - append + dedupe + limit 50
  if (guestData.viewedProducts && guestData.viewedProducts.length > 0) {
    const existingViewed: string[] = existingPrefs.viewedProducts || []
    const merged = dedupeArray([...guestData.viewedProducts, ...existingViewed]).slice(0, 50)
    newPrefs.viewedProducts = merged
    result.mergedFields.push('viewedProducts')
  }

  // 7. Survey answers - store if not already present
  if (guestData.surveyAnswers && !existingPrefs.surveyAnswers) {
    newPrefs.surveyAnswers = guestData.surveyAnswers
    result.mergedFields.push('surveyAnswers')
  }

  // 8. Location - merge if server has no location
  if (guestData.location && !existingPrefs.location) {
    newPrefs.location = guestData.location
    result.mergedFields.push('location')
  }

  // Only update preferences if we have changes (routines now in separate table)
  if (Object.keys(newPrefs).length > Object.keys(existingPrefs).length ||
      result.mergedFields.some(f => ['savedProducts', 'searchHistory', 'viewedProducts', 'surveyAnswers', 'location'].includes(f))) {
    updates.preferences = newPrefs
  }

  // If no updates needed, we're done
  if (Object.keys(updates).length === 0) {
    console.log('[guestMerge] No updates to apply')
    result.success = true
    return result
  }

  // Apply updates to Supabase
  console.log('[guestMerge] Applying updates:', Object.keys(updates))

  const { error } = await supabase
    .from('users_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('[guestMerge] Supabase update failed:', error)
    result.errors.push(error.message)
    return result
  }

  // Clear guest data ONLY after successful write
  console.log('[guestMerge] Clearing guest data after successful merge')
  clearGuestData()

  result.success = true
  console.log('[guestMerge] Merge complete:', result)
  return result
}

// -----------------------------
// Clear guest data after successful merge
// -----------------------------

function clearGuestData(): void {
  try {
    // Clear session state temp data
    sessionState.clearTempData()

    // Clear survey data
    localStorage.removeItem('survey_answers')
    localStorage.removeItem('survey_current_step')
    localStorage.removeItem('skinSurveyData')

    // Clear saved products (now in server)
    savedProductsState.clearSavedProducts()

    // Clear routines (now in server)
    saveLocalRoutines([])

    console.log('[guestMerge] Guest data cleared')
  } catch (e) {
    console.error('[guestMerge] Error clearing guest data:', e)
  }
}
