import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { onAction } from '@/lib/utils/gamificationTriggers';
import IngredientLibrary from './components/IngredientLibrary';
import IngredientDetail from './components/IngredientDetail';

const IngredientsPage = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(initialId);
  const { user } = useAuth();
  const awardedIngredientsRef = useRef(new Set<string>());

  // Sync state with URL when query params change (e.g., navigating from search)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id !== null) setSelectedIngredient(id);
  }, [searchParams]);

  // Gamification: award ingredient search points (once per ingredient per session)
  useEffect(() => {
    if (!selectedIngredient || !user?.id) return;
    if (awardedIngredientsRef.current.has(selectedIngredient)) return;
    awardedIngredientsRef.current.add(selectedIngredient);
    onAction(user.id, 'INGREDIENT_SEARCH').catch(() => {});
  }, [selectedIngredient, user?.id]);

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