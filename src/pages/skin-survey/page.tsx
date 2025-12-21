import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import QuizFlow from './components/QuizFlow';
import AuthPrompt from './components/AuthPrompt';

const SkinSurveyPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulate authentication check
  useEffect(() => {
    // In a real app, check authentication status here
    // For demo purposes, setting to false to show auth prompt
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <QuizFlow />
      <Footer />
    </div>
  );
};

export default SkinSurveyPage;