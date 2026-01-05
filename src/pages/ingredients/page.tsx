import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import IngredientLibrary from './components/IngredientLibrary';
import IngredientDetail from './components/IngredientDetail';

const IngredientsPage = () => {
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="pt-20">
        {!selectedIngredient ? (
          <IngredientLibrary onSelectIngredient={setSelectedIngredient} />
        ) : (
          <IngredientDetail
            ingredientId={selectedIngredient}
            onBack={() => setSelectedIngredient(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default IngredientsPage;