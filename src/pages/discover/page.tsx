import { useEffect, useState } from 'react';
import ProductCatalog from './components/ProductCatalog';
import ProductComparison from './components/ProductComparison';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState, getEffectiveConcerns } from '../../lib/utils/sessionState';
import type { Product } from '../../types/product';
import { normalizeUserConcern } from '../../lib/utils/matching';

const DiscoverPage = () => {
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const normalizedConcerns = userConcerns.map((c) => normalizeUserConcern(c));

  useEffect(() => {
    const stored = localStorage.getItem('selectedProducts');
    if (stored) {
      try {
        setSelectedProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse selectedProducts:', e);
      }
    }
  }, []);

  useEffect(() => {
    const effectiveConcerns = getEffectiveConcerns();
    
    if (effectiveConcerns.length > 0) {
      setUserConcerns(effectiveConcerns);
    } else {
      const surveyData = localStorage.getItem('skinSurveyData');
      if (surveyData) {
        try {
          const parsed = JSON.parse(surveyData);
          if (parsed.concerns && Array.isArray(parsed.concerns)) {
            setUserConcerns(parsed.concerns);
            sessionState.setTempConcerns(parsed.concerns);
            return;
          }
        } catch (e) {
          console.error('Failed to parse skinSurveyData:', e);
        }
      }
      
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        try {
          const parsed = JSON.parse(userProfile);
          if (parsed.concerns && Array.isArray(parsed.concerns)) {
            setUserConcerns(parsed.concerns);
            sessionState.setTempConcerns(parsed.concerns);
            return;
          }
        } catch (e) {
          console.error('Failed to parse userProfile:', e);
        }
      }
      
      const storedConcerns = localStorage.getItem('userConcerns');
      if (storedConcerns) {
        try {
          const parsed = JSON.parse(storedConcerns);
          const concernStrings = parsed.map((c: any) => 
            typeof c === 'string' ? c : (c.name || c.id || c)
          );
          setUserConcerns(concernStrings);
          sessionState.setTempConcerns(concernStrings);
        } catch (e) {
          console.error('Failed to parse userConcerns:', e);
        }
      }
    }

    const unsubscribe = sessionState.subscribe(() => {
      const updatedConcerns = getEffectiveConcerns();
      if (updatedConcerns.length > 0) {
        setUserConcerns(updatedConcerns);
      }
    });

    return unsubscribe;
  }, []);

  const handleOpenComparison = () => {
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-20">
        <ProductCatalog
          userConcerns={normalizedConcerns}
          compareList={selectedProducts}
          setCompareList={setSelectedProducts}
          onOpenComparison={handleOpenComparison}
          onStartQuiz={() => {}}
          onProductClick={(id) => console.log('Product clicked:', id)}
          onSaveProduct={(id) => console.log('Product saved:', id)}
          onFilterChange={(type, value) => console.log('Filter changed:', type, value)}
        />
      </main>

      {showComparison && selectedProducts.length >= 2 && (
        <ProductComparison
          products={selectedProducts}
          userConcerns={normalizedConcerns}
          onClose={handleCloseComparison}
          onRemoveProduct={handleRemoveProduct}
        />
      )}

      <Footer />
    </div>
  );
};

export default DiscoverPage;