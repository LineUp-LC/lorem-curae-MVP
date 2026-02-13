import { useEffect, useState } from 'react';
import ProductCatalog from './components/ProductCatalog';
import ComparisonPickerModal from '../../components/feature/ComparisonPickerModal';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState, getEffectiveConcerns } from '../../lib/utils/sessionState';
import type { Product } from '../../types/product';
import { normalizeUserConcern } from '../../lib/utils/matching';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';

/**
 * DiscoverPage Component
 * 
 * MOBILE FIXES APPLIED:
 * - Safe area padding for iOS notch devices
 * - Responsive header offset (64px mobile, 80px desktop)
 */

const DiscoverPage = () => {
  const [userConcerns, setUserConcerns] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Persist comparison visibility state for session continuity
  const [showComparison, setShowComparison] = useLocalStorageState<boolean>(
    'discover_comparison_visible',
    false
  );

  const normalizedConcerns = userConcerns.map((c) => normalizeUserConcern(c));

  useEffect(() => {
    // Check if we should auto-open comparison (from footer link)
    const shouldOpenComparison = localStorage.getItem('openComparisonOnLoad');
    if (shouldOpenComparison === 'true') {
      setShowComparison(true);
      localStorage.removeItem('openComparisonOnLoad');
    }

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
      
      <main className="pt-24 pb-16">
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
        <ComparisonPickerModal
          isOpen={showComparison}
          onClose={handleCloseComparison}
          preSelectedProducts={selectedProducts}
          userConcerns={normalizedConcerns}
          showSelectionView={false}
        />
      )}

      <Footer />
    </div>
  );
};

export default DiscoverPage;