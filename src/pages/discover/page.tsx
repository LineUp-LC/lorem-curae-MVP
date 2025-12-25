import { useEffect, useState } from 'react';
import ProductCatalog from './components/ProductCatalog';
import ProductComparison from './components/ProductComparison';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState, getEffectiveConcerns } from '../../utils/sessionState';
import type { Product } from '../../types/product';

const DiscoverPage = () => {
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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
      setUserConcerns(effectiveConcerns);
    } else {
      // Fallback to localStorage for backwards compatibility
      const stored = localStorage.getItem('userConcerns');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const concernIds = parsed.map((c: any) => c.id || c);
          console.log('Loaded mapped concern IDs:', concernIds);
          setUserConcerns(concernIds);
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
          userConcerns={userConcerns}
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
          userConcerns={userConcerns}
          onClose={handleCloseComparison}
          onRemoveProduct={handleRemoveProduct}
        />
      )}

      <Footer />
    </div>
  );
};

export default DiscoverPage;