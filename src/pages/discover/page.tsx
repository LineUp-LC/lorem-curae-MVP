import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProductCatalog from './components/ProductCatalog';
import QuizFlow from './components/QuizFlow';
import ResultsDisplay from './components/ResultsDisplay';
import { sessionState } from '../../utils/sessionState';

const DiscoverPage = () => {
  const [view, setView] = useState<'catalog' | 'quiz' | 'results'>('catalog');
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    sessionState.navigateTo('/discover');
  }, []);

  const handleStartQuiz = () => {
    setView('quiz');
    sessionState.trackInteraction('click', 'start-quiz');
  };

  const handleQuizComplete = (data: any) => {
    setQuizData(data);
    setView('results');
    sessionState.completeAction('skin-quiz');
  };

  const handleProductClick = (productId: string) => {
    sessionState.viewProduct(productId);
    sessionState.trackInteraction('click', 'product-card', { productId });
  };

  const handleSaveProduct = (productId: string) => {
    sessionState.saveItem(productId, 'product');
    sessionState.trackInteraction('click', 'save-product', { productId });
  };

  const handleFilterChange = (filterType: string, value: any) => {
    sessionState.trackInteraction('selection', `filter-${filterType}`, { value });
  };

  const handleBackToCatalog = () => {
    setView('catalog');
    setQuizData(null);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-20">
        {view === 'catalog' && (
          <ProductCatalog
            onStartQuiz={handleStartQuiz}
            onProductClick={handleProductClick}
            onSaveProduct={handleSaveProduct}
            onFilterChange={handleFilterChange}
          />
        )}
        {view === 'quiz' && <QuizFlow onComplete={handleQuizComplete} />}
        {view === 'results' && <ResultsDisplay data={quizData} onBackToCatalog={handleBackToCatalog} />}
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;
