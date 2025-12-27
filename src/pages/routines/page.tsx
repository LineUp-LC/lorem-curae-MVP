import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import RoutineBuilder from './components/RoutineBuilder';
import ConflictDetection from './components/ConflictDetection';
import NotesSection from './components/NotesSection';
import { sessionState } from '../../lib/utils/sessionState';

export default function RoutinesPage() {
  const [activeTab, setActiveTab] = useState<'routine' | 'notes'>('routine');
  const [routineSteps, setRoutineSteps] = useState<any[]>([]);

  useEffect(() => {
    sessionState.navigateTo('/routines');
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl font-bold text-forest-800 mb-4">
              My Skincare Routine
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build your personalized routine with our guided templates and smart conflict detection
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-full p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('routine')}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'routine'
                    ? 'bg-forest-800 text-white'
                    : 'text-gray-600 hover:text-forest-800'
                }`}
              >
                Routine Builder
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'bg-forest-800 text-white'
                    : 'text-gray-600 hover:text-forest-800'
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
              />
              <ConflictDetection />
            </div>
          ) : (
            <NotesSection />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}