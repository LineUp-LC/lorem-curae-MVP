import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import ProductCatalog from './components/ProductCatalog';
import ProductComparison from './components/ProductComparison';
import QuizFlow from './components/QuizFlow';
import ResultsDisplay from './components/ResultsDisplay';
import { sessionState } from '../../utils/sessionState';
import type { Product } from '../../types/product';

const DiscoverPage = () => {
  const [view, setView] = useState<'catalog' | 'quiz' | 'results'>('catalog');
  const [quizData, setQuizData] = useState<any>(null);
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  
  // Comparison state
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    sessionState.navigateTo('/discover');
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('userConcerns');
    if (stored) {
      const parsed = JSON.parse(stored);
      const concernIds = parsed.map((c: any) => c.id);
      console.log('Loaded mapped concern IDs:', concernIds);
      setUserConcerns(concernIds);
    }
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

  const handleProductClick = (productId: number) => {
    sessionState.viewProduct(productId);
    sessionState.trackInteraction('click', 'product-card', { productId });
  };

  const handleSaveProduct = (productId: number) => {
    sessionState.saveItem(productId.toString(), 'product');
    sessionState.trackInteraction('click', 'save-product', { productId });
  };

  const handleFilterChange = (filterType: string, value: any) => {
    sessionState.trackInteraction('selection', `filter-${filterType}`, { value });
  };

  const handleBackToCatalog = () => {
    setView('catalog');
    setQuizData(null);
  };

  // Comparison handlers
  const handleOpenComparison = () => {
    setIsComparisonOpen(true);
    sessionState.trackInteraction('click', 'open-comparison', { count: compareList.length });
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
  };

  const handleRemoveFromComparison = (productId: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
    sessionState.trackInteraction('click', 'remove-from-comparison', { productId });
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-20">
        {view === 'catalog' && (
          <ProductCatalog
            userConcerns={userConcerns}
            compareList={compareList}
            setCompareList={setCompareList}
            onOpenComparison={handleOpenComparison}
            onStartQuiz={handleStartQuiz}
            onProductClick={handleProductClick}
            onSaveProduct={handleSaveProduct}
            onFilterChange={handleFilterChange}
          />
        )}
        {view === 'quiz' && <QuizFlow onComplete={handleQuizComplete} />}
        {view === 'results' && (
          <ResultsDisplay data={quizData} onBackToCatalog={handleBackToCatalog} />
        )}
      </main>

      {/* Comparison Modal */}
      {isComparisonOpen && (
        <ProductComparison
          products={compareList}
          userConcerns={userConcerns}
          onClose={handleCloseComparison}
          onRemoveProduct={handleRemoveFromComparison}
        />
      )}

      <Footer />
    </div>
  );
};

export default DiscoverPage;