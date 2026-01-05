import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-browser';
import { sessionState } from '../../lib/utils/sessionState';
import QuizFlow from '../skin-survey/components/QuizFlow';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

export default function SkinSurveyAccountPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

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
      <Navbar />
      <main className="pt-20">
        <QuizFlow onComplete={handleQuizComplete} />
      </main>
      <Footer />
    </div>
  );
}