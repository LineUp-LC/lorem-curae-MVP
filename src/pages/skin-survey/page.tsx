import { useAuth } from '@/lib/auth/AuthContext';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import QuizFlow from './components/QuizFlow';
import AuthPrompt from './components/AuthPrompt';

const SkinSurveyPage = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
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

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <QuizFlow />
      <Footer />
    </div>
  );
};

export default SkinSurveyPage;