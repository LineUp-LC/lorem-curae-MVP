import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoutineBuilder from './components/RoutineBuilder';
import ConflictDetection from './components/ConflictDetection';
import NotesSection from './components/NotesSection';
import { sessionState } from '../../lib/utils/sessionState';

export default function RoutinesPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'routine' | 'notes'>('routine');
  const [routineSteps, setRoutineSteps] = useState<any[]>([]);
  const [routineName, setRoutineName] = useState('My Skincare Routine');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showBrowsePopup, setShowBrowsePopup] = useState(false);
  const [showSavedProductsPopup, setShowSavedProductsPopup] = useState(false);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);

  useEffect(() => {
    sessionState.navigateTo('/routines');

    // Load routine name from URL params or localStorage
    const routineId = searchParams.get('id');
    const tabParam = searchParams.get('tab');

    // Set active tab based on URL param
    if (tabParam === 'notes') {
      setActiveTab('notes');
    } else if (tabParam === 'routine') {
      setActiveTab('routine');
    }

    if (routineId) {
      const savedRoutines = JSON.parse(localStorage.getItem('routines') || '[]');
      const routine = savedRoutines.find((r: any) => r.id === routineId);
      if (routine) {
        setRoutineName(routine.name);
      }
    }

    // Load saved products
    const products = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    setSavedProducts(products);
  }, [searchParams]);

  const handleSaveRoutineName = () => {
    setIsEditingName(false);
    // Save to localStorage
    const routineId = searchParams.get('id');
    if (routineId) {
      const savedRoutines = JSON.parse(localStorage.getItem('routines') || '[]');
      const updatedRoutines = savedRoutines.map((r: any) => 
        r.id === routineId ? { ...r, name: routineName } : r
      );
      localStorage.setItem('routines', JSON.stringify(updatedRoutines));
    }
    sessionState.trackInteraction('click', 'save-routine-name', { name: routineName });
  };

  const handleRemoveSavedProduct = (productId: number) => {
    const updated = savedProducts.filter((p: any) => p.id !== productId);
    setSavedProducts(updated);
    localStorage.setItem('savedProducts', JSON.stringify(updated));
  };

  const handleAddStep = (step: any) => {
    const newSteps = [...routineSteps, { ...step, id: Date.now().toString() }];
    setRoutineSteps(newSteps);
    
    // Update session context with routine
    sessionState.updateContext({ routineSteps: newSteps });
    sessionState.trackInteraction('click', 'add-routine-step', { step: step.type });
  };

  const handleRemoveStep = (stepId: string) => {
    const newSteps = routineSteps.filter(s => s.id !== stepId);
    setRoutineSteps(newSteps);
    
    sessionState.updateContext({ routineSteps: newSteps });
    sessionState.trackInteraction('click', 'remove-routine-step', { stepId });
  };

  const handleReorderSteps = (newOrder: any[]) => {
    setRoutineSteps(newOrder);
    sessionState.updateContext({ routineSteps: newOrder });
    sessionState.trackInteraction('click', 'reorder-routine-steps');
  };

  const handleSaveRoutine = () => {
    sessionState.completeAction('save-routine');
    sessionState.trackInteraction('click', 'save-routine', { stepCount: routineSteps.length });
  };

  const handleAIAssistantQuery = (query: string) => {
    sessionState.trackInteraction('input', 'routine-ai-query', { query });
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Shows routine name only */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="text-4xl lg:text-6xl font-serif text-deep-900 bg-transparent border-b-2 border-deep focus:outline-none text-center"
                    autoFocus
                    onBlur={handleSaveRoutineName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRoutineName()}
                  />
                </div>
              ) : (
                <h1 
                  className="text-4xl lg:text-6xl font-serif text-deep-900 cursor-pointer hover:text-taupe-700 transition-colors flex items-center gap-3"
                  onClick={() => setIsEditingName(true)}
                >
                  {routineName}
                  <button className="text-gray-400 hover:text-deep transition-colors">
                    <i className="ri-pencil-line text-2xl"></i>
                  </button>
                </h1>
              )}
            </div>
          </div>

          {/* View Saved Products CTA (Task 11) */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowSavedProductsPopup(true)}
              className="px-4 py-2 bg-taupe-100 text-taupe-700 rounded-full text-sm font-medium hover:bg-taupe-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="ri-bookmark-line"></i>
              View Saved Products ({savedProducts.length})
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-full p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('routine')}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'routine'
                    ? 'bg-deep text-white'
                    : 'text-gray-600 hover:text-deep'
                }`}
              >
                Routine Builder
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'bg-deep text-white'
                    : 'text-gray-600 hover:text-deep'
                }`}
              >
                Routine Notes
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'routine' ? (
            <div className="space-y-8">
              <RoutineBuilder
                steps={routineSteps}
                onAddStep={handleAddStep}
                onRemoveStep={handleRemoveStep}
                onReorderSteps={handleReorderSteps}
                onSave={handleSaveRoutine}
                onBrowseClick={() => setShowBrowsePopup(true)}
              />
              <ConflictDetection />
            </div>
          ) : (
            <NotesSection />
          )}
        </div>
      </main>

      {/* Browse Popup (Task 7) */}
      {showBrowsePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowBrowsePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-taupe-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-taupe text-3xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-2">Browse Products</h3>
              <p className="text-gray-600 text-sm">Find products to add to your routine</p>
            </div>

            <div className="space-y-3">
              <a
                href="/marketplace"
                className="w-full px-6 py-4 bg-deep text-white rounded-xl hover:bg-deep-900 transition-colors text-left flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="ri-shopping-bag-3-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-semibold">Browse Marketplace</p>
                  <p className="text-sm text-cream-100">Shop curated products and services</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </a>

              <a
                href="/discover"
                className="w-full px-6 py-4 bg-white border-2 border-deep text-deep rounded-xl hover:bg-cream-100 transition-colors text-left flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-deep/10 flex items-center justify-center">
                  <i className="ri-compass-discover-line text-2xl text-deep"></i>
                </div>
                <div>
                  <p className="font-semibold">Browse Discovery</p>
                  <p className="text-sm text-gray-600">Explore personalized recommendations</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Saved Products Popup (Task 11) */}
      {showSavedProductsPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden relative">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-deep">Saved Products</h3>
              <button
                onClick={() => setShowSavedProductsPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-bookmark-line text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No saved products yet</p>
                  <a href="/discover" className="text-taupe hover:underline text-sm mt-2 inline-block">
                    Browse products to save
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <p className="font-medium text-deep truncate">{product.name}</p>
                        <p className="text-sm text-taupe">{product.priceRange}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/product-detail?id=${product.id}`}
                          className="p-2 text-deep hover:bg-deep/10 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <i className="ri-eye-line"></i>
                        </a>
                        <button
                          onClick={() => handleRemoveSavedProduct(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}