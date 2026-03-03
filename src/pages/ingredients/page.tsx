import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import IngredientLibrary from './components/IngredientLibrary';
import IngredientDetail from './components/IngredientDetail';

const IngredientsPage = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(initialId);

  // Sync state with URL when query params change (e.g., navigating from search)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id !== null) setSelectedIngredient(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream">
      <main className="pt-24">
        {!selectedIngredient ? (
          <IngredientLibrary onSelectIngredient={setSelectedIngredient} />
        ) : (
          <IngredientDetail
            ingredientId={selectedIngredient}
            onBack={() => setSelectedIngredient(null)}
          />
        )}
      </main>
    </div>
  );
};

export default IngredientsPage;