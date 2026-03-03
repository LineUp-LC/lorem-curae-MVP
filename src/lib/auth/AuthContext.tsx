import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

// ✅ Correct imports after refactor
import { supabase } from '../../lib/supabase-browser'
import {
  UserProfile,
  loadUserProfile,
  createUserProfile,
} from '../../lib/supabase'

import { sessionState } from '../utils/sessionState'
import { mergeGuestDataToAccount } from './guestMerge'
import { getRoutineCount } from '../utils/routineState'
import { locationState } from '../utils/locationState'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  routineCount: number
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [routineCount, setRoutineCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Sync profile to sessionState + rehydrate localStorage if needed
  const syncProfileToSessionState = (userProfile: UserProfile) => {
    sessionState.setUser({
      id: userProfile.id,
      email: userProfile.email,
      full_name: userProfile.full_name || '',
      skin_type: userProfile.skin_type || undefined,
      concerns: userProfile.concerns || [],
      preferences: userProfile.preferences || {},
      lifestyle: userProfile.lifestyle || {},
    })

    // Hydrate location from profile preferences
    const profileLocation = userProfile.preferences?.location
    if (profileLocation && (profileLocation.city || profileLocation.state || profileLocation.zip)) {
      locationState.setLocation(profileLocation)
    }

    // Rehydrate skinSurveyData to localStorage from Supabase profile
    // Always overwrite on sign-in: Supabase is source of truth after mergeGuestDataToAccount
    try {
      const surveyAnswers = userProfile.preferences?.surveyAnswers
      if (surveyAnswers && typeof surveyAnswers === 'object') {
        // Best path: surveyAnswers IS the original skinSurveyData object
        localStorage.setItem('skinSurveyData', JSON.stringify(surveyAnswers))
        localStorage.setItem('survey_completed', 'true')
        console.log('[rehydration] Profile data restored to localStorage (surveyAnswers)')
      } else if (userProfile.skin_type || userProfile.concerns?.length) {
        // Fallback: reconstruct from individual profile fields
        const reconstructed: Record<string, any> = {}
        reconstructed.survey_completed = true
        if (userProfile.skin_type) reconstructed.skinType = [userProfile.skin_type]
        if (userProfile.concerns?.length) reconstructed.concerns = userProfile.concerns
        if (userProfile.preferences?.fitzpatrickType) reconstructed.complexion = userProfile.preferences.fitzpatrickType
        if (userProfile.preferences?.allergens) reconstructed.allergens = userProfile.preferences.allergens
        if (userProfile.preferences?.productPreferences) reconstructed.preferences = userProfile.preferences.productPreferences
        if (userProfile.preferences?.routinePreferences) reconstructed.routine = userProfile.preferences.routinePreferences
        const ls = userProfile.lifestyle || {}
        if (ls.factors) reconstructed.lifestyle = ls.factors
        if (ls.sleepPattern) reconstructed.sleepPattern = ls.sleepPattern
        if (ls.stressLevel) reconstructed.stressLevel = ls.stressLevel
        if (ls.dietPattern) reconstructed.dietPattern = ls.dietPattern
        if (ls.waterIntake) reconstructed.waterIntake = ls.waterIntake
        if (ls.exerciseFrequency) reconstructed.exerciseFrequency = ls.exerciseFrequency
        if (ls.environmentalExposure) reconstructed.environmentalExposure = ls.environmentalExposure
        if (ls.sexAtBirth) reconstructed.sexAtBirth = ls.sexAtBirth
        if (ls.acneType) reconstructed.acneType = ls.acneType
        if (ls.scarringType) reconstructed.scarringType = ls.scarringType
        localStorage.setItem('skinSurveyData', JSON.stringify(reconstructed))
        localStorage.setItem('survey_completed', 'true')
        console.log('[rehydration] Profile data restored to localStorage (reconstructed)')
      } else {
        console.log('[rehydration] No profile data to restore')
      }
    } catch (e) {
      console.error('[rehydration] Failed to restore profile data:', e)
    }
  }

  // Initial load + auth listener
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        // Timeout guard: if Supabase is unreachable, don't block the app forever
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('[auth] Session check timed out')), 5000)
        )

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise])

        if (!isMounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const userProfile = await loadUserProfile(currentUser.id)
          const count = await getRoutineCount(currentUser.id)
          if (isMounted) {
            setProfile(userProfile)
            setRoutineCount(count)
            if (userProfile) syncProfileToSessionState(userProfile)
          }
        }
      } catch (e) {
        console.error('[auth] Failed to initialize session:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return

        const authUser = session?.user ?? null
        setUser(authUser)

        if (event === 'SIGNED_IN' && authUser) {
          setLoading(true)
          try {
            const hydrate = async () => {
              const existing = await loadUserProfile(authUser.id)

              if (!existing) {
                await mergeGuestDataToAccount(authUser.id, null)
                await createUserProfile(authUser)
              } else {
                await mergeGuestDataToAccount(authUser.id, existing)
              }

              const userProfile = await loadUserProfile(authUser.id)
              const count = await getRoutineCount(authUser.id)

              if (isMounted) {
                setProfile(userProfile)
                setRoutineCount(count)
                if (userProfile) syncProfileToSessionState(userProfile)
              }
            }

            // Timeout guard: don't let sign-in hydration block the app
            await Promise.race([
              hydrate(),
              new Promise<void>((_, reject) =>
                setTimeout(() => reject(new Error('[auth] Sign-in hydration timed out')), 8000)
              ),
            ])
          } catch (e) {
            console.error('[auth] Failed to hydrate profile after sign-in:', e)
          } finally {
            if (isMounted) setLoading(false)
          }
        }

        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setProfile(null)
            setRoutineCount(0)
            sessionState.clearUser()
            sessionState.clearTempData()
            localStorage.removeItem('skinSurveyData')
            localStorage.removeItem('survey_completed')
            locationState.clearLocation()
            console.log('[auth] Personalization state cleared')
          }
        }
      }
    )

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Sign Up
  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
  }, [])

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }, [])

  // Sign Out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  // Refresh profile manually
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await loadUserProfile(user.id)
      const count = await getRoutineCount(user.id)
      setProfile(userProfile)
      setRoutineCount(count)

      if (userProfile) syncProfileToSessionState(userProfile)
    }
  }, [user])

  const value = useMemo(() => ({
    user,
    profile,
    routineCount,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }), [user, profile, routineCount, loading, signUp, signIn, signOut, refreshProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}