import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-browser';

interface Note {
  id: string;
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

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  const [newNote, setNewNote] = useState({
    routine_type: 'morning' as 'morning' | 'evening',
    skin_condition: '',
    products_used: '',
    observations: '',
    mood: '',
    weather: '',
  });

  // EXAMPLE NOTE - Remove when user says "Remove Routine notes example"
  const exampleNote: Note = {
    id: 'example-note',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM',
    routine_type: 'morning',
    skin_condition: 'Clear and hydrated',
    products_used: ['Gentle Cleanser', 'Vitamin C Serum', 'Hyaluronic Acid', 'SPF 50 Sunscreen'],
    observations: 'Started using the new vitamin C serum this morning. Applied after cleansing and before moisturizer. Skin feels slightly tingly but not irritated. Will monitor for any reactions over the next few days.',
    mood: 'Energized',
    weather: 'Sunny',
    photo_url: 'https://readdy.ai/api/search-image?query=close%20up%20portrait%20of%20healthy%20glowing%20facial%20skin%20with%20smooth%20texture%20even%20tone%20and%20natural%20radiance%20soft%20lighting%20on%20clean%20white%20background%20professional%20skincare%20photography%20showing%20clear%20complexion&width=800&height=600&seq=routine-example-photo-001&orientation=landscape',
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    loadNotes();
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

      setNewNote({
        routine_type: 'morning',
        skin_condition: '',
        products_used: '',
        observations: '',
        mood: '',
        weather: '',
      });
      setSelectedPhoto(null);
      setPhotoPreview('');
      setIsAddingNote(false);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const filteredNotes = dateFilter
    ? notes.filter(note => {
        const noteDate = new Date(note.created_at);
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        return noteDate >= startDate && noteDate <= endDate;
      })
    : notes;

  // Combine example note with actual notes
  const allNotes = [exampleNote, ...filteredNotes];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-serif text-deep mb-2">Routine Notes</h2>
            <p className="text-warm-gray text-sm sm:text-base">
              Your personal skincare journal — track what works, notice patterns, and help your AI learn what's best for your skin.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blush/50 text-warm-gray rounded-lg hover:bg-blush transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 text-sm"
            >
              <i className="ri-filter-line"></i>
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <i className="ri-add-line text-xl"></i>
              Add Note
            </button>
          </div>
        </div>

        {/* AI personalization info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full flex-shrink-0">
              <i className="ri-sparkling-line text-primary"></i>
            </div>
            <div>
              <p className="text-sm text-warm-gray leading-relaxed">
                <span className="font-medium text-deep">Your notes power smarter recommendations.</span>{' '}
                The more you track, the better we understand your skin's unique patterns and needs.
              </p>
            </div>
          </div>
        </div>

        {/* What to Track - Quick Prompts */}
        {!isAddingNote && !showDateFilter && (
          <div className="bg-cream/50 border border-blush rounded-xl p-4 mb-6">
            <p className="text-xs font-medium text-deep mb-3 uppercase tracking-wide">Ideas for what to track</p>
            <div className="flex flex-wrap gap-2">
              {[
                'How my skin feels today',
                'New product reaction',
                'Breakout or irritation',
                'Skin looking great!',
                'Changed my routine',
                'Environmental factors'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setIsAddingNote(true)}
                  className="px-3 py-1.5 bg-white border border-blush text-warm-gray text-xs rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <div className="bg-cream rounded-lg p-4 mb-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-gray mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateFilter?.start || ''}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value } as any)}
                  className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-gray mb-1">End Date</label>
                <input
                  type="date"
                  value={dateFilter?.end || ''}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value } as any)}
                  className="w-full px-3 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                onClick={() => {
                  setDateFilter(null);
                  setShowDateFilter(false);
                }}
                className="px-4 py-2 bg-blush/50 text-warm-gray rounded-lg hover:bg-blush transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Add Note Form */}
        {isAddingNote && (
          <div className="bg-cream rounded-xl p-6 mb-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-deep mb-1">New Routine Note</h3>
              <p className="text-sm text-warm-gray">
                Capture how your skin looks and feels — even small details help over time.
              </p>
            </div>

            <div className="space-y-4">
              {/* Routine Type */}
              <div>
                <label className="block text-sm font-medium text-deep mb-2">When did you do this routine?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewNote({ ...newNote, routine_type: 'morning' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      newNote.routine_type === 'morning'
                        ? 'bg-primary text-white'
                        : 'bg-white text-warm-gray hover:bg-blush/30'
                    }`}
                  >
                    <i className="ri-sun-line mr-2"></i>
                    Morning
                  </button>
                  <button
                    onClick={() => setNewNote({ ...newNote, routine_type: 'evening' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      newNote.routine_type === 'evening'
                        ? 'bg-primary text-white'
                        : 'bg-white text-warm-gray hover:bg-blush/30'
                    }`}
                  >
                    <i className="ri-moon-line mr-2"></i>
                    Evening
                  </button>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-deep mb-1">
                  Photo (Optional)
                </label>
                <p className="text-xs text-warm-gray mb-2">A quick selfie helps track visible changes over time</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-blush rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <i className="ri-camera-line text-primary"></i>
                    <span className="text-sm text-warm-gray">Choose Photo</span>
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
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreview('');
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skin Condition */}
              <div>
                <label className="block text-sm font-medium text-deep mb-1">How does your skin look & feel?</label>
                <p className="text-xs text-warm-gray mb-2">Describe texture, hydration, any concerns</p>
                <input
                  type="text"
                  value={newNote.skin_condition}
                  onChange={(e) => setNewNote({ ...newNote, skin_condition: e.target.value })}
                  placeholder="e.g., Hydrated and calm, slight dryness around nose"
                  className="w-full px-4 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Products Used */}
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Products you used</label>
                <p className="text-xs text-warm-gray mb-2">List each product separated by commas</p>
                <input
                  type="text"
                  value={newNote.products_used}
                  onChange={(e) => setNewNote({ ...newNote, products_used: e.target.value })}
                  placeholder="e.g., CeraVe Cleanser, Vitamin C Serum, SPF 50"
                  className="w-full px-4 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Any observations or notes?</label>
                <p className="text-xs text-warm-gray mb-2">Reactions, changes, or anything you noticed</p>
                <textarea
                  value={newNote.observations}
                  onChange={(e) => setNewNote({ ...newNote, observations: e.target.value })}
                  placeholder="e.g., Tried a new serum today — skin tingled slightly but no irritation. Will monitor..."
                  rows={3}
                  className="w-full px-4 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-deep mb-1">Mood</label>
                  <p className="text-xs text-warm-gray mb-2">Stress can affect skin</p>
                  <input
                    type="text"
                    value={newNote.mood}
                    onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
                    placeholder="e.g., Relaxed, Tired, Stressed"
                    className="w-full px-4 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep mb-1">Weather</label>
                  <p className="text-xs text-warm-gray mb-2">Climate impacts skin</p>
                  <input
                    type="text"
                    value={newNote.weather}
                    onChange={(e) => setNewNote({ ...newNote, weather: e.target.value })}
                    placeholder="e.g., Humid, Cold & dry, Sunny"
                    className="w-full px-4 py-2 border border-blush rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setSelectedPhoto(null);
                    setPhotoPreview('');
                  }}
                  className="px-6 py-2 bg-blush/50 text-warm-gray rounded-lg hover:bg-blush transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Note
                </button>
              </div>
            </div>
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
          allNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Example Note Badge */}
              {note.id === 'example-note' && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  <i className="ri-information-line"></i>
                  Example Note — This shows how your entries will look
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    note.routine_type === 'morning' ? 'bg-amber-100' : 'bg-indigo-100'
                  }`}>
                    <i className={`${
                      note.routine_type === 'morning' ? 'ri-sun-line text-amber-600' : 'ri-moon-line text-indigo-600'
                    } text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep capitalize">{note.routine_type} Routine</h3>
                    <p className="text-sm text-warm-gray/80">
                      {new Date(note.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo */}
              {note.photo_url && (
                <div className="mb-4">
                  <img
                    src={note.photo_url}
                    alt="Routine photo"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Note Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-warm-gray">Skin Condition:</span>
                  <p className="text-deep">{note.skin_condition}</p>
                </div>

                {note.products_used && note.products_used.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-warm-gray">Products Used:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {note.products_used.map((product, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-cream text-deep text-sm rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-warm-gray">Observations:</span>
                  <p className="text-deep">{note.observations}</p>
                </div>

                {(note.mood || note.weather) && (
                  <div className="flex gap-4 pt-2 border-t border-blush">
                    {note.mood && (
                      <div className="flex items-center gap-2 text-sm text-warm-gray">
                        <i className="ri-emotion-line"></i>
                        <span>{note.mood}</span>
                      </div>
                    )}
                    {note.weather && (
                      <div className="flex items-center gap-2 text-sm text-warm-gray">
                        <i className="ri-cloud-line"></i>
                        <span>{note.weather}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}