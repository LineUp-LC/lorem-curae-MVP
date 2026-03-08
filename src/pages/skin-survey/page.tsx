import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase-browser';
import { sessionState } from '@/lib/utils/sessionState';
import QuizFlow from './components/QuizFlow';
import AuthPrompt from './components/AuthPrompt';

const SkinSurveyPage = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [retaking, setRetaking] = useState(false);
  const [started, setStarted] = useState(false);

  // Check both Supabase profile and localStorage for survey completion
  const surveyCompleted = profile?.survey_completed || localStorage.getItem('survey_completed') === 'true';

  // Show loading state only on initial auth check — not on background token refresh
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth prompt if not logged in
  if (!user) {
    return <AuthPrompt />;
  }

  // Show completed state if survey already done (unless retaking)
  if (surveyCompleted && !retaking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-2xl text-primary"></i>
          </div>
          <h1 className="text-2xl font-serif font-bold text-deep mb-3">
            Your Skin Survey Is Complete
          </h1>
          <p className="text-warm-gray text-sm mb-8 leading-relaxed">
            We already have your skin profile on file. You can retake the survey to update your results, or start exploring personalized product recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setRetaking(true)}
              className="px-6 py-3 border border-deep/20 text-deep rounded-full font-medium hover:bg-deep/5 transition-colors cursor-pointer"
            >
              Retake Survey
            </button>
            <Link
              to="/discover"
              className="px-6 py-3 bg-deep text-white rounded-full font-medium hover:bg-deep/90 transition-colors"
            >
              Start Discovering Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show start page if survey not yet started
  if (!started && !retaking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-survey-line text-3xl text-primary"></i>
          </div>
          <h1 className="text-2xl font-serif font-bold text-deep mb-3">
            Your Personalized Skin Survey
          </h1>
          <p className="text-warm-gray text-sm mb-8 leading-relaxed">
            Answer a few questions about your skin type, concerns, and lifestyle so we can tailor suggestions that specifically fits you.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-deep text-white rounded-full font-medium hover:bg-deep/90 transition-colors cursor-pointer"
          >
            Start Survey
          </button>
        </div>
      </div>
    );
  }

  const handleQuizComplete = async (data: any) => {
    // Save to localStorage as fallback
    localStorage.setItem('skinSurveyData', JSON.stringify(data));
    localStorage.setItem('survey_completed', 'true');

    // Sync to sessionState for immediate use
    if (data.skinType?.[0]) {
      sessionState.setTempSkinType(data.skinType[0]);
    }
    if (data.concerns?.length > 0) {
      sessionState.setTempConcerns(data.concerns);
    }

    // Guard: ensure user is authenticated before Supabase write
    if (!user?.id) {
      console.error('[survey] No authenticated user — skipping Supabase save');
      return;
    }

    // Save full survey data to Supabase (merge with existing preferences)
    try {
      // Fetch existing preferences to merge (not overwrite)
      const { data: existing, error: fetchError } = await supabase
        .from('users_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('[survey] Error fetching existing preferences:', fetchError.message, fetchError.details, fetchError.hint);
      }

      const existingPrefs = (existing?.preferences as Record<string, any>) || {};

      // Sanitize surveyAnswers to strip non-serializable values
      const cleanSurveyAnswers = JSON.parse(JSON.stringify(data));

      const payload = {
        skin_type: data.skinType?.[0]?.toLowerCase() || null,
        concerns: data.concerns || [],
        survey_completed: true,
        preferences: {
          ...existingPrefs,
          allergens: data.allergens || [],
          fitzpatrickType: data.complexion || null,
          productPreferences: data.preferences || [],
          routinePreferences: data.routine || [],
          surveyAnswers: cleanSurveyAnswers,
        },
        lifestyle: {
          factors: data.lifestyle || [],
          sleepPattern: data.sleepPattern || null,
          stressLevel: data.stressLevel || null,
          dietPattern: data.dietPattern || null,
          waterIntake: data.waterIntake || null,
          exerciseFrequency: data.exerciseFrequency || null,
          environmentalExposure: data.environmentalExposure || [],
          sexAtBirth: data.sexAtBirth || null,
          acneType: data.acneType || [],
          scarringType: data.scarringType || [],
        },
        updated_at: new Date().toISOString(),
      };

      console.log('[survey] Saving to Supabase for user:', user.id);

      const { error } = await supabase
        .from('users_profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) {
        console.error('[survey] Error saving survey to profile:', error.message, error.details, error.hint, error.code);
      } else {
        console.log('[survey] Survey saved to Supabase successfully');
        await refreshProfile();
      }
    } catch (error) {
      console.error('[survey] Error saving survey data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <QuizFlow onComplete={handleQuizComplete} />
    </div>
  );
};

export default SkinSurveyPage;