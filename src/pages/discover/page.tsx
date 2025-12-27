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
  
  // Normalize concerns for matching (e.g., "Acne Prone" -> "acne")
  const normalizedConcerns = userConcerns.map((c) => normalizeUserConcern(c));

  useEffect(() => {
    // Load selected products from localStorage
    const stored = localStorage.getItem('selectedProducts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedProducts(parsed);
      } catch (e) {
        console.error('Failed to parse selectedProducts:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Get concerns from sessionState (unified source of truth)
    const effectiveConcerns = getEffectiveConcerns();
    
    if (effectiveConcerns.length > 0) {
      console.log('Loaded concerns from sessionState:', effectiveConcerns);
      setUserConcerns(effectiveConcerns);
    } else {
      // Fallback to localStorage for backwards compatibility
      // Try skinSurveyData first (most reliable source)
      const surveyData = localStorage.getItem('skinSurveyData');
      if (surveyData) {
        try {
          const parsed = JSON.parse(surveyData);
          if (parsed.concerns && Array.isArray(parsed.concerns)) {
            console.log('Loaded concerns from skinSurveyData:', parsed.concerns);
            setUserConcerns(parsed.concerns);
            
            // Also sync to sessionState for future use
            sessionState.setTempConcerns(parsed.concerns);
            return;
          }
        } catch (e) {
          console.error('Failed to parse skinSurveyData:', e);
        }
      }
      
      // Fallback to userProfile
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        try {
          const parsed = JSON.parse(userProfile);
          if (parsed.concerns && Array.isArray(parsed.concerns)) {
            console.log('Loaded concerns from userProfile:', parsed.concerns);
            setUserConcerns(parsed.concerns);
            
            // Also sync to sessionState for future use
            sessionState.setTempConcerns(parsed.concerns);
            return;
          }
        } catch (e) {
          console.error('Failed to parse userProfile:', e);
        }
      }
      
      // Last fallback to userConcerns (handles both string[] and SkinConcern[] formats)
      const storedConcerns = localStorage.getItem('userConcerns');
      if (storedConcerns) {
        try {
          const parsed = JSON.parse(storedConcerns);
          // Handle both formats: string[] or SkinConcern[] objects
          const concernStrings = parsed.map((c: any) => 
            typeof c === 'string' ? c : (c.name || c.id || c)
          );
          console.log('Loaded concerns from userConcerns:', concernStrings);
          setUserConcerns(concernStrings);
          
          // Sync to sessionState
          sessionState.setTempConcerns(concernStrings);
        } catch (e) {
          console.error('Failed to parse userConcerns from localStorage:', e);
        }
      }
    }

    // Subscribe to state changes to update concerns dynamically
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
    <div className="min-h-screen bg-cream-50">
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