import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase-browser';
import { sessionState } from '../../lib/utils/sessionState';
import QuizFlow from '../skin-survey/components/QuizFlow';

export default function SkinSurveyAccountPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showRedoPrompt, setShowRedoPrompt] = useState(false);

  useEffect(() => {
    checkAuth();
    checkExistingSurvey();
  }, []);

  const checkExistingSurvey = () => {
    const existingData = localStorage.getItem('skinSurveyData');
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        // Check if survey has meaningful data (at least skin type selected)
        if (parsed.skinType && parsed.skinType.length > 0) {
          setShowRedoPrompt(true);
        }
      } catch (e) {
        console.error('Error parsing survey data:', e);
      }
    }
  };

  const handleRedoSurvey = () => {
    // Clear existing survey data to start fresh
    localStorage.removeItem('skinSurveyData');
    localStorage.removeItem('survey_current_step');
    localStorage.removeItem('survey_answers');
    setShowRedoPrompt(false);
  };

  const handleNoThanks = () => {
    navigate('/my-skin');
  };

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    }
  };

  const handleQuizComplete = async (data: any) => {
    // Save quiz data to localStorage
    localStorage.setItem('skinSurveyData', JSON.stringify(data));
    
    // Sync to sessionState for immediate use across the app
    if (data.skinType?.[0]) {
      sessionState.setTempSkinType(data.skinType[0]);
    }
    if (data.concerns?.length > 0) {
      sessionState.setTempConcerns(data.concerns);
    }
    
    // If user is authenticated, save full survey data to database
    if (isAuthenticated) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users_profiles')
            .update({
              skin_type: data.skinType?.[0] || null,
              concerns: data.concerns || [],
              survey_completed: true,
              preferences: {
                allergens: data.allergens || [],
                fitzpatrickType: data.complexion || null,
                productPreferences: data.preferences || [],
                routinePreferences: data.routine || [],
                surveyAnswers: data,
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
            })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error saving quiz data:', error);
      }
    }
    
    // NOTE: Don't navigate here - let QuizFlow show its completion screen
    // The user will click "Check Results" to navigate to /skin-survey/results
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-warm-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="pt-24">
        {showRedoPrompt ? (
          <div className="max-w-2xl mx-auto px-6 lg:px-12 py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="ri-refresh-line text-2xl text-primary"></i>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-deep mb-3">Survey Already Completed</h1>
            <p className="text-warm-gray text-sm mb-6">
              You've already completed your skin survey. Would you like to retake it with updated information?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleRedoSurvey}
                className="inline-flex items-center space-x-2 bg-primary hover:bg-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Retake Survey</span>
                <i className="ri-restart-line"></i>
              </button>
              <button
                onClick={handleNoThanks}
                className="inline-flex items-center space-x-2 border border-blush hover:border-primary text-warm-gray hover:text-deep px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>View My Profile</span>
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        ) : (
          <QuizFlow onComplete={handleQuizComplete} />
        )}
      </main>
    </div>
  );
}