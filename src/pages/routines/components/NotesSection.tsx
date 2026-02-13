import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-browser';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';
import { sessionState } from '../../../lib/utils/sessionState';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

interface NoteDraft {
  title: string;
  routine_type: 'morning' | 'evening';
  skin_condition: string;
  products_used: string;
  observations: string;
  mood: string;
  weather: string;
}

interface Note {
  id: string;
  title?: string;
  date: string;
  time: string;
  routine_type: 'morning' | 'evening';
  skin_condition: string;
  products_used: string[];
  observations: string;
  mood?: string;
  weather?: string;
  photo_url?: string;
  created_at: string;
}

interface SkinConcern {
  id: string;
  name: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface NotesSectionProps {
  autoOpenAssessment?: boolean;
}

export default function NotesSection({ autoOpenAssessment }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);

  // Persisted state for draft note and form visibility
  const [isAddingNote, setIsAddingNote, clearIsAddingNote] = useLocalStorageState<boolean>(
    'routine_note_form_open',
    false
  );

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<{ year?: string; month?: string } | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [entryAnalysis, setEntryAnalysis] = useState<{ note: Note; position: { x: number; y: number } } | null>(null);

  // Helper to get current month key
  const getCurrentMonthKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Calendar-style journal states
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [routineFilter, setRoutineFilter] = useState<'morning' | 'evening' | 'both'>('both');
  const [entrySearch, setEntrySearch] = useState('');
  const [dayFilter, setDayFilter] = useState<string>('');

  // Custom dropdown states
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  // AI Assessment states
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<string>('');
  const [showConcernDropdown, setShowConcernDropdown] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1month');
  const [assessmentMessages, setAssessmentMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI skin assessment assistant. Select a concern and timeframe to analyze your progress.',
      timestamp: new Date(),
    },
  ]);
  const [assessmentInput, setAssessmentInput] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [userConcerns, setUserConcerns] = useState<SkinConcern[]>([]);

  const timeframes = [
    { id: '1day', label: '1 Day', value: '1 day' },
    { id: '1week', label: '1 Week', value: '1 week' },
    { id: '1month', label: '1 Month', value: '1 month' },
    { id: '3months', label: '3 Months', value: '3 months' },
    { id: '6months', label: '6 Months', value: '6 months' },
  ];


  const defaultDraft: NoteDraft = {
    title: '',
    routine_type: 'morning',
    skin_condition: '',
    products_used: '',
    observations: '',
    mood: '',
    weather: '',
  };

  const [newNote, setNewNote, clearNoteDraft] = useLocalStorageState<NoteDraft>(
    'routine_note_draft',
    defaultDraft
  );

  // EXAMPLE NOTES - For testing
  const exampleNotes: Note[] = [
    // Current month - February 2026
    {
      id: 'example-note-1',
      date: '2026-02-11',
      time: '08:30 AM',
      routine_type: 'morning',
      skin_condition: 'Clear and hydrated',
      products_used: ['Gentle Cleanser', 'Vitamin C Serum', 'Hyaluronic Acid', 'SPF 50 Sunscreen'],
      observations: 'Skin is glowing today! The vitamin C serum seems to be making a real difference. Pores look smaller and tone is more even.',
      mood: 'Energized',
      weather: 'Sunny',
      created_at: '2026-02-11T08:30:00.000Z',
    },
    {
      id: 'example-note-2',
      date: '2026-02-08',
      time: '09:00 PM',
      routine_type: 'evening',
      skin_condition: 'Slightly dry around nose',
      products_used: ['Oil Cleanser', 'Gentle Cleanser', 'Retinol Serum', 'Night Cream'],
      observations: 'Started retinol 3 days ago. Some dryness around nose and chin but no irritation. Will add extra moisturizer tomorrow.',
      mood: 'Tired',
      weather: 'Cold',
      created_at: '2026-02-08T21:00:00.000Z',
    },
    {
      id: 'example-note-3',
      date: '2026-02-03',
      time: '07:45 AM',
      routine_type: 'morning',
      skin_condition: 'Breakout on chin',
      products_used: ['Gentle Cleanser', 'Niacinamide Serum', 'Moisturizer', 'SPF 50'],
      observations: 'Woke up with a few spots on my chin. Could be hormonal or stress-related. Skipping vitamin C today and using niacinamide instead.',
      mood: 'Stressed',
      weather: 'Cloudy',
      created_at: '2026-02-03T07:45:00.000Z',
    },
    // January 2026
    {
      id: 'example-note-4',
      date: '2026-01-28',
      time: '08:00 AM',
      routine_type: 'morning',
      skin_condition: 'Dull and dehydrated',
      products_used: ['Gentle Cleanser', 'Hyaluronic Acid', 'Moisturizer', 'SPF 30'],
      observations: 'Skin looking tired after traveling. Need to focus on hydration this week. Adding extra HA layers.',
      mood: 'Jet-lagged',
      weather: 'Dry',
      created_at: '2026-01-28T08:00:00.000Z',
    },
    {
      id: 'example-note-5',
      date: '2026-01-20',
      time: '10:00 PM',
      routine_type: 'evening',
      skin_condition: 'Irritated and red',
      products_used: ['Micellar Water', 'Centella Serum', 'Barrier Repair Cream'],
      observations: 'Tried a new mask yesterday and skin is reacting badly. Switching to minimal routine until calmed down. No actives for a few days.',
      mood: 'Frustrated',
      weather: 'Cold',
      created_at: '2026-01-20T22:00:00.000Z',
    },
    {
      id: 'example-note-6',
      date: '2026-01-15',
      time: '08:30 AM',
      routine_type: 'morning',
      skin_condition: 'Balanced and calm',
      products_used: ['Gentle Cleanser', 'Vitamin C Serum', 'Moisturizer', 'SPF 50'],
      observations: 'Good skin day! Keeping routine simple seems to be working. Will maintain this for the rest of the month.',
      mood: 'Happy',
      weather: 'Sunny',
      created_at: '2026-01-15T08:30:00.000Z',
    },
    // December 2025
    {
      id: 'example-note-7',
      date: '2025-12-22',
      time: '09:30 PM',
      routine_type: 'evening',
      skin_condition: 'Oily T-zone, dry cheeks',
      products_used: ['Oil Cleanser', 'Foam Cleanser', 'BHA Toner', 'Light Gel Moisturizer'],
      observations: 'Combination skin acting up with the holiday stress. Using BHA on T-zone only, heavier cream on cheeks.',
      mood: 'Busy',
      weather: 'Cold',
      created_at: '2025-12-22T21:30:00.000Z',
    },
    {
      id: 'example-note-8',
      date: '2025-12-10',
      time: '07:30 AM',
      routine_type: 'morning',
      skin_condition: 'Congested with blackheads',
      products_used: ['Salicylic Acid Cleanser', 'Niacinamide', 'Oil-Free Moisturizer', 'SPF'],
      observations: 'Noticing more blackheads on nose. Going to add a clay mask twice a week and see if that helps.',
      mood: 'Determined',
      weather: 'Rainy',
      created_at: '2025-12-10T07:30:00.000Z',
    },
  ];

  useEffect(() => {
    loadNotes();
    loadUserConcerns();
  }, []);

  // Auto-open assessment modal when coming from AI Chat
  useEffect(() => {
    if (autoOpenAssessment) {
      setShowAssessmentModal(true);
      // Clear the URL param so it doesn't trigger again on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('openAssessment');
      window.history.replaceState({}, '', url.toString());
    }
  }, [autoOpenAssessment]);

  // Listen for custom event from tutorial completion (for ai-chat flow)
  useEffect(() => {
    const handleOpenAssessment = () => {
      setShowAssessmentModal(true);
    };
    window.addEventListener('openProgressAssessment', handleOpenAssessment);
    return () => window.removeEventListener('openProgressAssessment', handleOpenAssessment);
  }, []);

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('routine_notes')
        .select('*')
        .eq('id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadUserConcerns = () => {
    try {
      const savedSurvey = localStorage.getItem('skinSurveyData');
      if (savedSurvey) {
        const surveyData = JSON.parse(savedSurvey);
        const concerns = surveyData.concerns || [];
        const mappedConcerns: SkinConcern[] = concerns.map((concern: string, index: number) => ({
          id: `concern-${index}`,
          name: concern,
        }));
        setUserConcerns(mappedConcerns);
      }
    } catch (error) {
      console.error('Error loading user concerns:', error);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('routine-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('routine-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSaveNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to save notes');
        return;
      }

      let photoUrl = null;
      if (selectedPhoto) {
        photoUrl = await uploadPhoto(selectedPhoto);
      }

      const { error } = await supabase
        .from('routine_notes')
        .insert([
          {
            user_id: user.id,
            routine_type: newNote.routine_type,
            skin_condition: newNote.skin_condition,
            products_used: newNote.products_used.split(',').map(p => p.trim()),
            observations: newNote.observations,
            mood: newNote.mood,
            weather: newNote.weather,
            photo_url: photoUrl,
          },
        ]);

      if (error) throw error;

      // Clear the persisted draft after successful save
      clearNoteDraft();
      clearIsAddingNote();

      setSelectedPhoto(null);
      setPhotoPreview('');
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleSelectConcern = (concern: SkinConcern) => {
    setSelectedConcern(concern.name);
    setShowConcernDropdown(false);

    sessionState.trackInteraction('selection', 'assessment-concern', { concern: concern.name });

    const initialAssessment: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Great! I'll assess your progress with ${concern.name} over the ${timeframes.find(t => t.id === selectedTimeframe)?.label.toLowerCase()} timeframe. Based on your routine and notes, I can provide insights on improvements, setbacks, and recommendations.`,
      timestamp: new Date(),
    };
    setAssessmentMessages([assessmentMessages[0], initialAssessment]);
  };

  const handleTimeframeChange = (timeframeId: string) => {
    setSelectedTimeframe(timeframeId);

    sessionState.trackInteraction('selection', 'assessment-timeframe', { timeframe: timeframeId });

    if (selectedConcern) {
      const timeframeLabel = timeframes.find(t => t.id === timeframeId)?.label.toLowerCase();
      const updateMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Timeframe updated to ${timeframeLabel}. I'll now analyze your ${selectedConcern} progress over this period.`,
        timestamp: new Date(),
      };
      setAssessmentMessages(prev => [...prev, updateMessage]);
    }
  };

  const handleSendAssessmentMessage = () => {
    if (!assessmentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: assessmentInput,
      timestamp: new Date(),
    };
    setAssessmentMessages(prev => [...prev, userMessage]);

    sessionState.trackInteraction('input', 'assessment-query', { query: assessmentInput });

    setAssessmentInput('');
    setIsAssessing(true);

    setTimeout(() => {
      const aiResponse = generateAssessmentResponse(assessmentInput, selectedConcern, selectedTimeframe);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setAssessmentMessages(prev => [...prev, aiMessage]);
      setIsAssessing(false);
    }, 1500);
  };

  const generateAssessmentResponse = (query: string, concern: string, timeframe: string): string => {
    const timeframeLabel = timeframes.find(t => t.id === timeframe)?.label.toLowerCase() || '1 month';

    if (!concern) {
      return 'Please select a concern first so I can provide a targeted assessment of your progress.';
    }

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('progress') || lowerQuery.includes('improvement')) {
      return `Based on your ${timeframeLabel} journey with ${concern}:\n\n📊 **Progress Analysis:**\n• Visible improvements in affected areas\n• Reduced severity of symptoms\n• Better skin texture and tone\n\n✨ **Key Observations:**\n• Your consistent routine is showing results\n• Continue current regimen for optimal results\n\n💡 **Recommendation:** Keep tracking your progress with photos and notes. You're on the right path!`;
    }

    if (lowerQuery.includes('product') || lowerQuery.includes('routine')) {
      return `For your ${concern} over ${timeframeLabel}:\n\n🎯 **Product Effectiveness:**\n• Active ingredients are showing positive results\n• No adverse reactions detected\n\n📋 **Routine Assessment:**\n• Morning routine: Well-balanced\n• Evening routine: Effective treatment application\n• Consistency: Excellent\n\n💡 **Suggestion:** Consider adding a weekly treatment for enhanced results.`;
    }

    if (lowerQuery.includes('concern') || lowerQuery.includes('issue')) {
      return `Analyzing your ${concern} over ${timeframeLabel}:\n\n⚠️ **Current Status:**\n• Overall improvement noted\n• Active concerns: Decreasing\n• New issues: Minimal\n\n🔍 **Detailed Insights:**\n• Initial phase showed adjustment period\n• Recent progress is steady and consistent\n\n💡 **Next Steps:** Continue current routine and reassess in 2 weeks.`;
    }

    return `Assessment for ${concern} (${timeframeLabel}):\n\n📈 **Overall Progress:** Positive trajectory\n\n🎯 **Key Findings:**\n• Your skin is responding well to treatment\n• Consistency in routine is paying off\n\n💪 **Strengths:**\n• Regular product application\n• Good documentation in notes\n\n💡 **Recommendations:**\n• Continue current routine\n• Take weekly progress photos\n• Stay patient - results take time\n\nWhat specific aspect would you like me to analyze further?`;
  };

  const generateEntryAnalysis = (note: Note, previousNote: Note | null): string => {
    const skinCondition = note.skin_condition || 'Not specified';
    const observations = note.observations || 'No observations recorded';

    let analysis = `**${note.routine_type === 'morning' ? '☀️ Morning' : '🌙 Evening'} Entry Summary**\n`;
    analysis += `• Skin: ${skinCondition}\n`;
    if (note.mood) analysis += `• Mood: ${note.mood}\n`;
    if (note.weather) analysis += `• Weather: ${note.weather}\n\n`;

    if (previousNote) {
      analysis += `**📊 Compared to Previous Entry**\n`;
      if (previousNote.skin_condition !== note.skin_condition) {
        analysis += `• Skin changed from "${previousNote.skin_condition || 'unspecified'}" to "${skinCondition}"\n`;
      } else {
        analysis += `• Skin condition remains consistent\n`;
      }
      if (previousNote.mood && note.mood && previousNote.mood !== note.mood) {
        analysis += `• Mood shifted: ${previousNote.mood} → ${note.mood}\n`;
      }
      analysis += `\n**💡 Insight:** `;
      analysis += note.skin_condition?.toLowerCase().includes('hydrat') || note.skin_condition?.toLowerCase().includes('clear')
        ? 'Your routine appears to be working well. Keep it consistent.'
        : 'Consider adjusting your routine if concerns persist.';
    } else {
      analysis += `**💡 Tip:** Keep tracking to see patterns over time.`;
    }

    return analysis;
  };

  // Helper to group notes by month
  const groupNotesByMonth = (notes: Note[]): Map<string, Note[]> => {
    const grouped = new Map<string, Note[]>();
    notes.forEach(note => {
      const date = new Date(note.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(note);
    });
    return grouped;
  };

  // Filter notes by routine type, search, and day
  const filterMonthNotes = (notes: Note[]): Note[] => {
    return notes.filter(note => {
      // Routine filter
      if (routineFilter !== 'both' && note.routine_type !== routineFilter) return false;

      // Entry search filter
      if (entrySearch) {
        const search = entrySearch.toLowerCase();
        const title = (note.title || '').toLowerCase();
        const observations = (note.observations || '').toLowerCase();
        if (!title.includes(search) && !observations.includes(search)) return false;
      }

      // Day filter
      if (dayFilter) {
        const noteDay = new Date(note.created_at).getDate().toString();
        if (noteDay !== dayFilter) return false;
      }

      return true;
    });
  };

  const filteredNotes = notes.filter(note => {
    // Date filters (year and month only - day filter is in expanded view)
    if (dateFilter) {
      const noteDate = new Date(note.created_at);
      if (dateFilter.year && noteDate.getFullYear().toString() !== dateFilter.year) return false;
      if (dateFilter.month && (noteDate.getMonth() + 1).toString() !== dateFilter.month) return false;
    }
    return true;
  });

  // Combine example notes with actual notes
  const allNotes = [...exampleNotes, ...filteredNotes];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-deep mb-2">Routine Notes</h2>
            <p className="text-warm-gray text-sm sm:text-base">
              Your personal skincare journal.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`px-4 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-sm border ${
                showDateFilter
                  ? 'bg-primary text-white border-primary'
                  : 'text-warm-gray border-blush hover:bg-blush/50'
              }`}
            >
              <i className="ri-filter-3-line text-base"></i>
              <span>Filter</span>
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-5 py-2 bg-white text-primary rounded-full hover:bg-primary/5 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-sm font-medium border border-primary"
            >
              <i className="ri-add-line text-base"></i>
              Add Note
            </button>
            <button
              onClick={() => setShowAssessmentModal(true)}
              data-tutorial="progress-assessment"
              className="px-5 py-2 bg-primary text-white rounded-full hover:bg-dark transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-sm font-medium"
            >
              <i className="ri-line-chart-line text-base"></i>
              Progress Assessment
            </button>
          </div>
        </div>

        {/* AI personalization info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full flex-shrink-0">
              <NeuralBloomIcon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-warm-gray leading-relaxed">
                <span className="font-medium text-deep">Your notes power smarter recommendations.</span>{' '}
                The more you track, the better Curae will understand your skin's unique patterns and needs.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        {showDateFilter && (
          <div className="bg-cream rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Year - Custom Dropdown */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-deep mb-1.5">Year</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-blush rounded-xl text-left flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <span className={dateFilter?.year ? 'text-deep font-medium text-sm' : 'text-warm-gray/70 text-sm'}>
                      {dateFilter?.year || 'All Years'}
                    </span>
                    <i className={`ri-arrow-${showYearDropdown ? 'up' : 'down'}-s-line text-warm-gray`}></i>
                  </button>
                  {showYearDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-blush rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setDateFilter({ ...dateFilter, year: undefined });
                          setShowYearDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${!dateFilter?.year ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                      >
                        All Years
                      </button>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setDateFilter({ ...dateFilter, year: year.toString() });
                            setShowYearDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${dateFilter?.year === year.toString() ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Month - Custom Dropdown */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-deep mb-1.5">Month</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-blush rounded-xl text-left flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <span className={dateFilter?.month ? 'text-deep font-medium text-sm' : 'text-warm-gray/70 text-sm'}>
                      {dateFilter?.month ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(dateFilter.month) - 1] : 'All Months'}
                    </span>
                    <i className={`ri-arrow-${showMonthDropdown ? 'up' : 'down'}-s-line text-warm-gray`}></i>
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-blush rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <button
                        onClick={() => {
                          setDateFilter({ ...dateFilter, month: undefined });
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${!dateFilter?.month ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                      >
                        All Months
                      </button>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                        <button
                          key={month}
                          onClick={() => {
                            setDateFilter({ ...dateFilter, month: (i + 1).toString() });
                            setShowMonthDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${dateFilter?.month === (i + 1).toString() ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setDateFilter(null);
                  setShowDateFilter(false);
                  setShowYearDropdown(false);
                  setShowMonthDropdown(false);
                }}
                className="px-4 py-2.5 bg-white text-warm-gray rounded-xl hover:bg-blush transition-colors cursor-pointer whitespace-nowrap text-sm font-medium border border-blush"
              >
                Clear
              </button>
            </div>

            {/* Active Filter Indicator */}
            {dateFilter && (dateFilter.year || dateFilter.month) && (
              <div className="mt-3 pt-3 border-t border-blush/50">
                <p className="text-xs text-warm-gray flex items-center flex-wrap gap-2">
                  <i className="ri-filter-3-line text-primary"></i>
                  Filtering:
                  {dateFilter.month && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateFilter.month) - 1]}
                    </span>
                  )}
                  {dateFilter.year && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {dateFilter.year}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {allNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
              <i className="ri-edit-2-line text-3xl text-primary"></i>
            </div>
            <h3 className="text-xl font-serif font-semibold text-deep mb-2">Start Your Skincare Journal</h3>
            <p className="text-warm-gray mb-2 max-w-md mx-auto">
              Tracking your routine helps you understand what works for your unique skin.
            </p>
            <p className="text-sm text-warm-gray/80 mb-6 max-w-md mx-auto">
              Note how products feel, track reactions, and watch your progress over time. Your AI will use these insights to personalize recommendations.
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Write Your First Note
            </button>
          </div>
        ) : (
          <>
            {/* Calendar Grid of Month Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from(groupNotesByMonth(allNotes)).map(([monthKey, monthNotes]) => {
                const [year, month] = monthKey.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
                const morningCount = monthNotes.filter(n => n.routine_type === 'morning').length;
                const eveningCount = monthNotes.filter(n => n.routine_type === 'evening').length;
                const isCurrentMonth = monthKey === getCurrentMonthKey();

                return (
                  <button
                    key={monthKey}
                    onClick={() => setSelectedMonth(monthKey)}
                    className={`relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
                      isCurrentMonth ? 'border-primary' : 'border-transparent hover:border-primary/30'
                    }`}
                  >
                    {isCurrentMonth && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                        Now
                      </span>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-serif font-bold text-deep">{monthName}</p>
                      <p className="text-xs text-warm-gray mt-0.5">{year}</p>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <i className="ri-sun-line"></i>
                          {morningCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-indigo-600">
                          <i className="ri-moon-line"></i>
                          {eveningCount}
                        </span>
                      </div>
                      <p className="text-xs text-warm-gray mt-2">
                        {monthNotes.length} {monthNotes.length === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded Month View (Centered Modal) */}
            {selectedMonth && (() => {
              const monthNotes = groupNotesByMonth(allNotes).get(selectedMonth) || [];
              const filteredMonthNotes = filterMonthNotes(monthNotes);
              const [year, month] = selectedMonth.split('-');
              const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

              return (
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setSelectedMonth(null);
                    setEntrySearch('');
                    setDayFilter('');
                    setRoutineFilter('both');
                    setShowDayDropdown(false);
                  }}
                >
                  <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDayDropdown(false);
                    }}
                  >
                    {/* Expanded Header */}
                    <div className="bg-gradient-to-r from-cream to-cream/80 p-5 border-b border-blush">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="ri-calendar-line text-primary text-xl"></i>
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-deep">{monthLabel}</h3>
                            <p className="text-sm text-warm-gray">{filteredMonthNotes.length} {filteredMonthNotes.length === 1 ? 'entry' : 'entries'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMonth(null);
                            setEntrySearch('');
                            setDayFilter('');
                            setRoutineFilter('both');
                            setShowDayDropdown(false);
                          }}
                          className="w-10 h-10 rounded-full bg-white hover:bg-blush flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        >
                          <i className="ri-close-line text-xl text-warm-gray"></i>
                        </button>
                      </div>

                      {/* Search and Day Filter */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        {/* Entry Search */}
                        <div className="flex-1 relative">
                          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray"></i>
                          <input
                            type="text"
                            value={entrySearch}
                            onChange={(e) => setEntrySearch(e.target.value)}
                            placeholder="Search entries..."
                            className="w-full pl-10 pr-9 py-2.5 border border-blush rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-sm"
                          />
                          {entrySearch && (
                            <button
                              onClick={() => setEntrySearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-deep cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          )}
                        </div>

                        {/* Day Filter - Custom Dropdown */}
                        <div className="relative min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setShowDayDropdown(!showDayDropdown)}
                            className="w-full px-4 py-2.5 bg-white border border-blush rounded-xl text-left flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                          >
                            <span className={dayFilter ? 'text-deep font-medium text-sm' : 'text-warm-gray/70 text-sm'}>
                              {dayFilter ? `Day ${dayFilter}` : 'All Days'}
                            </span>
                            <i className={`ri-arrow-${showDayDropdown ? 'up' : 'down'}-s-line text-warm-gray`}></i>
                          </button>
                          {showDayDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-blush rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              <button
                                onClick={() => {
                                  setDayFilter('');
                                  setShowDayDropdown(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${!dayFilter ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                              >
                                All Days
                              </button>
                              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                <button
                                  key={day}
                                  onClick={() => {
                                    setDayFilter(day.toString());
                                    setShowDayDropdown(false);
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cream transition-colors cursor-pointer ${dayFilter === day.toString() ? 'bg-primary/5 text-primary font-medium' : 'text-deep'}`}
                                >
                                  Day {day}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Morning/Night/Both Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-warm-gray mr-2">Show:</span>
                        <button
                          onClick={() => setRoutineFilter('morning')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            routineFilter === 'morning'
                              ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                              : 'bg-white text-warm-gray hover:bg-amber-50 border-2 border-transparent'
                          }`}
                        >
                          <i className="ri-sun-line"></i>
                          Morning
                        </button>
                        <button
                          onClick={() => setRoutineFilter('evening')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            routineFilter === 'evening'
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                              : 'bg-white text-warm-gray hover:bg-indigo-50 border-2 border-transparent'
                          }`}
                        >
                          <i className="ri-moon-line"></i>
                          Night
                        </button>
                        <button
                          onClick={() => setRoutineFilter('both')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            routineFilter === 'both'
                              ? 'bg-primary text-white border-2 border-primary'
                              : 'bg-white text-warm-gray hover:bg-cream border-2 border-transparent'
                          }`}
                        >
                          Both
                        </button>
                      </div>
                    </div>

                    {/* Entries Grid */}
                    <div className="p-5 overflow-y-auto max-h-[calc(85vh-220px)]">
                      {filteredMonthNotes.length === 0 ? (
                        <div className="text-center py-12">
                          <i className="ri-file-text-line text-4xl text-warm-gray/40 mb-3"></i>
                          <p className="text-warm-gray">
                            {entrySearch || dayFilter || routineFilter !== 'both'
                              ? 'No entries match your filters'
                              : 'No entries this month'}
                          </p>
                          {(entrySearch || dayFilter || routineFilter !== 'both') && (
                            <button
                              onClick={() => {
                                setEntrySearch('');
                                setDayFilter('');
                                setRoutineFilter('both');
                              }}
                              className="mt-2 text-primary text-sm hover:underline cursor-pointer"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredMonthNotes.map((note) => (
                            <div
                              key={note.id}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setEntryAnalysis({
                                  note,
                                  position: { x: rect.right + 12, y: rect.top }
                                });
                              }}
                              className="flex flex-col gap-2 p-4 bg-cream/30 border border-blush rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                {note.photo_url ? (
                                  <img
                                    src={note.photo_url}
                                    alt="Entry photo"
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-cream"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-blush/50 border-2 border-blush flex-shrink-0 flex items-center justify-center">
                                    <i className="ri-user-smile-line text-warm-gray/60 text-lg"></i>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-deep text-sm truncate">
                                    {note.title || `${note.routine_type.charAt(0).toUpperCase() + note.routine_type.slice(1)} Routine`}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-warm-gray mt-0.5">
                                    <span>{new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span>•</span>
                                    <span className={`inline-flex items-center gap-1 font-medium ${
                                      note.routine_type === 'morning' ? 'text-amber-600' : 'text-indigo-600'
                                    }`}>
                                      <i className={note.routine_type === 'morning' ? 'ri-sun-line' : 'ri-moon-line'}></i>
                                      <span className="capitalize">{note.routine_type}</span>
                                    </span>
                                    {note.id.startsWith('example-note') && (
                                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Example</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {(note.observations || note.skin_condition) && (
                                <p className="text-xs text-warm-gray line-clamp-2">
                                  {note.observations || note.skin_condition}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-blush p-4 sm:p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                    selectedNote.routine_type === 'morning' ? 'bg-amber-100' : 'bg-indigo-100'
                  }`}>
                    <i className={`${
                      selectedNote.routine_type === 'morning' ? 'ri-sun-line text-amber-600' : 'ri-moon-line text-indigo-600'
                    } text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-deep">
                      {selectedNote.title || `${selectedNote.routine_type.charAt(0).toUpperCase() + selectedNote.routine_type.slice(1)} Routine`}
                    </h3>
                    <p className="text-sm text-warm-gray">
                      <span className="capitalize">{selectedNote.routine_type}</span> • {new Date(selectedNote.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-warm-gray"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Photo */}
              {selectedNote.photo_url && (
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={selectedNote.photo_url}
                    alt="Routine photo"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Skin Condition */}
              <div className="bg-cream/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-heart-pulse-line text-primary"></i>
                  <span className="text-sm font-medium text-deep">Skin Condition</span>
                </div>
                <p className="text-warm-gray">{selectedNote.skin_condition}</p>
              </div>

              {/* Products Used */}
              {selectedNote.products_used && selectedNote.products_used.length > 0 && (
                <div className="bg-cream/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-flask-line text-primary"></i>
                    <span className="text-sm font-medium text-deep">Products Used</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.products_used.map((product, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white text-deep text-sm rounded-full border border-blush"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedNote.observations && (
                <div className="bg-cream/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-edit-line text-primary"></i>
                    <span className="text-sm font-medium text-deep">Observations</span>
                  </div>
                  <p className="text-warm-gray">{selectedNote.observations}</p>
                </div>
              )}

              {/* Mood & Weather */}
              {(selectedNote.mood || selectedNote.weather) && (
                <div className="flex gap-3">
                  {selectedNote.mood && (
                    <div className="flex-1 bg-cream/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-emotion-line text-primary"></i>
                        <span className="text-sm font-medium text-deep">Mood</span>
                      </div>
                      <p className="text-warm-gray">{selectedNote.mood}</p>
                    </div>
                  )}
                  {selectedNote.weather && (
                    <div className="flex-1 bg-cream/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-cloud-line text-primary"></i>
                        <span className="text-sm font-medium text-deep">Weather</span>
                      </div>
                      <p className="text-warm-gray">{selectedNote.weather}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-blush p-4 rounded-b-2xl">
              <button
                onClick={() => setSelectedNote(null)}
                className="w-full py-3 bg-cream hover:bg-blush text-deep rounded-xl font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Analysis Popup */}
      {entryAnalysis && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setEntryAnalysis(null)}
          onKeyDown={(e) => e.key === 'Escape' && setEntryAnalysis(null)}
        >
          <div
            className="absolute bg-gradient-to-br from-primary to-primary/90 rounded-xl shadow-2xl w-80 max-h-[450px] flex flex-col overflow-hidden"
            style={{
              top: Math.min(entryAnalysis.position.y, window.innerHeight - 470),
              left: Math.min(entryAnalysis.position.x, window.innerWidth - 340),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <span className="font-semibold text-sm">Entry Analysis</span>
              <button
                onClick={() => setEntryAnalysis(null)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-white">
              {(() => {
                const note = entryAnalysis.note;

                return (
                  <>
                    {/* Entry Summary */}
                    <div>
                      <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        {note.routine_type === 'morning' ? (
                          <><i className="ri-sun-line text-amber-500"></i> Morning Entry</>
                        ) : (
                          <><i className="ri-moon-line text-indigo-500"></i> Evening Entry</>
                        )}
                      </h4>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-warm-gray">
                          <span className="font-medium text-deep">Skin:</span> {note.skin_condition || 'Not specified'}
                        </p>
                        {note.mood && (
                          <p className="text-warm-gray">
                            <span className="font-medium text-deep">Mood:</span> {note.mood}
                          </p>
                        )}
                        {note.weather && (
                          <p className="text-warm-gray">
                            <span className="font-medium text-deep">Weather:</span> {note.weather}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-deep flex items-start gap-1.5">
                        <i className="ri-lightbulb-line text-primary mt-0.5"></i>
                        <span>
                          {(() => {
                            const condition = note.skin_condition?.toLowerCase() || '';
                            if (condition.includes('clear') || condition.includes('hydrat') || condition.includes('glow') || condition.includes('balanced') || condition.includes('calm')) {
                              return 'Your routine appears to be working well. Keep it consistent for continued results.';
                            } else if (condition.includes('breakout') || condition.includes('acne') || condition.includes('spots')) {
                              return 'Breakouts can be triggered by stress, hormones, or new products. Consider simplifying your routine and avoiding actives until skin calms.';
                            } else if (condition.includes('irritat') || condition.includes('red') || condition.includes('sensitiv')) {
                              return 'Your skin barrier may be compromised. Focus on gentle, soothing products and avoid actives until irritation subsides.';
                            } else if (condition.includes('dry') || condition.includes('dehydrat') || condition.includes('flak')) {
                              return 'Your skin needs more hydration. Layer hydrating serums and consider a richer moisturizer. Avoid over-exfoliating.';
                            } else if (condition.includes('oily') || condition.includes('congest') || condition.includes('blackhead')) {
                              return 'Focus on gentle cleansing and oil-control. BHA and niacinamide can help without over-stripping your skin.';
                            } else if (condition.includes('dull') || condition.includes('tired')) {
                              return 'Dullness often signals dehydration or buildup. Try gentle exfoliation and boost hydration for a refreshed glow.';
                            } else {
                              return 'Keep tracking your skin to identify patterns. Consistency is key to understanding what works for you.';
                            }
                          })()}
                        </span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Popup Footer */}
            <div className="px-4 py-3 bg-white border-t border-blush flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedNote(entryAnalysis.note);
                  setEntryAnalysis(null);
                }}
                className="flex-1 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-file-text-line mr-1"></i>
                View Full Entry
              </button>
              <button
                onClick={() => {
                  setShowAssessmentModal(true);
                  setEntryAnalysis(null);
                }}
                className="flex-1 py-2 text-xs font-medium text-white bg-primary hover:bg-dark rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-line-chart-line mr-1"></i>
                Full Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowAssessmentModal(false)}
              className="absolute top-4 right-4 text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center">
                <i className="ri-line-chart-line text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-deep">
                  Progress Assessment
                </h2>
                <p className="text-sm text-warm-gray">
                  Track your skincare journey
                </p>
              </div>
            </div>

            {/* Assessment Controls */}
            <div className="space-y-4 mb-4">
              {/* Select Concern */}
              <div>
                <label className="block text-sm font-medium text-deep mb-2">
                  Select Your Concern
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowConcernDropdown(!showConcernDropdown)}
                    className="w-full px-4 py-3 bg-white border-2 border-blush rounded-lg text-left flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <span className={selectedConcern ? 'text-deep font-medium' : 'text-warm-gray/80'}>
                      {selectedConcern || 'Choose a concern...'}
                    </span>
                    <i className={`ri-arrow-${showConcernDropdown ? 'up' : 'down'}-s-line text-deep`}></i>
                  </button>

                  {showConcernDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blush rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {userConcerns.map((concern) => (
                        <button
                          key={concern.id}
                          onClick={() => handleSelectConcern(concern)}
                          className="w-full px-4 py-3 text-left hover:bg-cream transition-colors cursor-pointer"
                        >
                          <p className="font-medium text-deep text-sm">{concern.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeframe Selection */}
              <div>
                <label className="block text-sm font-medium text-deep mb-2">
                  Assessment Timeframe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe.id}
                      onClick={() => handleTimeframeChange(timeframe.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        selectedTimeframe === timeframe.id
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white text-warm-gray hover:bg-blush'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Chat Box */}
            <div className="flex flex-col bg-white rounded-xl border-2 border-blush overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <NeuralBloomIcon size={18} color="white" />
                  </div>
                  <h3 className="font-bold text-sm">Curae AI</h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[300px]">
                {assessmentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-cream text-deep border border-blush'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-warm-gray/60'}`}>
                        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isAssessing && (
                  <div className="flex justify-start">
                    <div className="bg-cream rounded-2xl px-4 py-2 border border-blush">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-cream/50 border-t border-blush">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assessmentInput}
                    onChange={(e) => setAssessmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendAssessmentMessage()}
                    placeholder={selectedConcern ? 'Ask about your progress...' : 'Select a concern first...'}
                    disabled={!selectedConcern}
                    className="flex-1 px-4 py-2 border border-blush rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm disabled:bg-cream disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendAssessmentMessage}
                    disabled={!assessmentInput.trim() || !selectedConcern}
                    className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <i className="ri-send-plane-fill text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isAddingNote && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            clearNoteDraft();
            setIsAddingNote(false);
            setSelectedPhoto(null);
            setPhotoPreview('');
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-cream px-5 py-4 border-b border-blush flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-deep">New Note</h3>
              <button
                onClick={() => {
                  clearNoteDraft();
                  setIsAddingNote(false);
                  setSelectedPhoto(null);
                  setPhotoPreview('');
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg text-warm-gray"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-130px)] space-y-3">
              {/* Routine Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNewNote({ ...newNote, routine_type: 'morning' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    newNote.routine_type === 'morning'
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                      : 'bg-cream text-warm-gray hover:bg-blush/50 border-2 border-transparent'
                  }`}
                >
                  <i className="ri-sun-line"></i>
                  Morning
                </button>
                <button
                  onClick={() => setNewNote({ ...newNote, routine_type: 'evening' })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    newNote.routine_type === 'evening'
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                      : 'bg-cream text-warm-gray hover:bg-blush/50 border-2 border-transparent'
                  }`}
                >
                  <i className="ri-moon-line"></i>
                  Evening
                </button>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-cream border border-dashed border-blush rounded-lg hover:border-primary transition-colors cursor-pointer text-sm">
                  <i className="ri-camera-line text-primary"></i>
                  <span className="text-warm-gray">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview('');
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-warm-gray/70 -mt-1">
                Capture before and after your routine to track visible changes over time.
              </p>

              {/* Note Title */}
              <div>
                <label className="block text-xs font-medium text-deep mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g., Post-facial check-in"
                  className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              {/* Skin Condition */}
              <div>
                <label className="block text-xs font-medium text-deep mb-1">Skin condition</label>
                <input
                  type="text"
                  value={newNote.skin_condition}
                  onChange={(e) => setNewNote({ ...newNote, skin_condition: e.target.value })}
                  placeholder="e.g., Hydrated, slight dryness"
                  className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-medium text-deep mb-1">Observations</label>
                <textarea
                  value={newNote.observations}
                  onChange={(e) => setNewNote({ ...newNote, observations: e.target.value })}
                  placeholder="Any reactions or changes noticed..."
                  rows={2}
                  className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                />
              </div>

              {/* Mood & Weather in row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-deep mb-1">Mood</label>
                  <input
                    type="text"
                    value={newNote.mood}
                    onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
                    placeholder="e.g., Relaxed"
                    className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-deep mb-1">Weather</label>
                  <input
                    type="text"
                    value={newNote.weather}
                    onChange={(e) => setNewNote({ ...newNote, weather: e.target.value })}
                    placeholder="e.g., Sunny"
                    className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-cream/50 border-t border-blush flex gap-3">
              <button
                onClick={() => {
                  clearNoteDraft();
                  setIsAddingNote(false);
                  setSelectedPhoto(null);
                  setPhotoPreview('');
                }}
                className="flex-1 py-2.5 bg-white text-warm-gray rounded-lg hover:bg-blush transition-colors cursor-pointer text-sm font-medium border border-blush"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-dark transition-colors cursor-pointer text-sm font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}