import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase-browser';
import { sessionState } from '../../lib/utils/sessionState';
import QuizFlow from '../skin-survey/components/QuizFlow';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function SkinSurveyAccountPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in, but allow them to take the quiz
        setIsAuthenticated(false);
        setShowAuthPrompt(true);
      } else {
        // User is logged in
        setIsAuthenticated(true);
        setShowAuthPrompt(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Allow quiz access even if there's an error
      setIsAuthenticated(false);
      setShowAuthPrompt(true);
    }
  };

  const handleQuizComplete = async (data: any) => {
    // Save quiz data to localStorage
    localStorage.setItem('skinSurveyData', JSON.stringify(data));
    
    // FIXED: Sync to sessionState for immediate use across the app
    if (data.skinType?.[0]) {
      sessionState.setTempSkinType(data.skinType[0]);
    }
    if (data.concerns?.length > 0) {
      sessionState.setTempConcerns(data.concerns);
    }
    
    // If user is authenticated, save to database
    if (isAuthenticated) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Save to user profile
          await supabase
            .from('users_profiles')
            .upsert({
              id: user.id,
              skin_type: data.skinType?.[0] || null,
              concerns: data.concerns || [],
              fitzpatrick_type: data.complexion || null,
              updated_at: new Date().toISOString(),
            });
        }
      } catch (error) {
        console.error('Error saving quiz data:', error);
      }
    }
    
    // Navigate to results
    navigate('/skin-survey/results');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-20">
        {showAuthPrompt && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 flex items-center justify-center bg-sage-600 rounded-full flex-shrink-0">
                  <i className="ri-information-line text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-forest-900 mb-2">
                    Save Your Results
                  </h3>
                  <p className="text-gray-700 mb-4">
                    You can take the quiz without an account, but creating one allows you to save your results, track your progress, and get personalized recommendations.
                  </p>
                  <div className="flex items-center space-x-4">
                    <a
                      href="/auth/signup"
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-sage-600 text-white rounded-full font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <span>Create Account</span>
                      <i className="ri-arrow-right-line"></i>
                    </a>
                    <a
                      href="/auth/login"
                      className="inline-flex items-center space-x-2 px-6 py-2.5 border-2 border-sage-600 text-sage-700 rounded-full font-medium hover:bg-sage-50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <span>Log In</span>
                    </a>
                    <button
                      onClick={() => setShowAuthPrompt(false)}
                      className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      Continue without account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <QuizFlow onComplete={handleQuizComplete} />
      </main>
      <Footer />
    </div>
  );
}