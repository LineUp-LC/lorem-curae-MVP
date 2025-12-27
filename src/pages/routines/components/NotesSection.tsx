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
    id: 'example-note-1',
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
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-serif text-forest-800 mb-2">Routine Notes & Progress</h2>
            <p className="text-gray-600">Track your daily routine and skin observations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-filter-line"></i>
              Filter by Date
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-6 py-2 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-add-line text-xl"></i>
              Add Note
            </button>
          </div>
        </div>

        {/* FIXED: Added AI personalization info banner */}
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-sage-100 rounded-full flex-shrink-0">
              <i className="ri-sparkling-line text-sage-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-forest-800">Self-tracking helps your AI understand you better.</span>{' '}
                The more notes you add, the more personalized your skincare recommendations and overall website experience becomes.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        {showDateFilter && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateFilter?.start || ''}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value } as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateFilter?.end || ''}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value } as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
                />
              </div>
              <button
                onClick={() => {
                  setDateFilter(null);
                  setShowDateFilter(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Add Note Form */}
        {isAddingNote && (
          <div className="bg-cream-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-forest-800 mb-4">New Routine Note</h3>
            
            <div className="space-y-4">
              {/* Routine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Routine Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewNote({ ...newNote, routine_type: 'morning' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      newNote.routine_type === 'morning'
                        ? 'bg-forest-800 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className="ri-sun-line mr-2"></i>
                    Morning
                  </button>
                  <button
                    onClick={() => setNewNote({ ...newNote, routine_type: 'evening' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      newNote.routine_type === 'evening'
                        ? 'bg-forest-800 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className="ri-moon-line mr-2"></i>
                    Evening
                  </button>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-forest-800 transition-colors cursor-pointer">
                    <i className="ri-camera-line text-forest-800"></i>
                    <span className="text-sm text-gray-700">Upload Photo</span>
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
                <p className="text-xs text-gray-500 mt-1">
                  Photos help AI track your progress and provide better insights
                </p>
              </div>

              {/* Skin Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skin Condition</label>
                <input
                  type="text"
                  value={newNote.skin_condition}
                  onChange={(e) => setNewNote({ ...newNote, skin_condition: e.target.value })}
                  placeholder="e.g., Clear, Slightly dry, Small breakout on chin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
                />
              </div>

              {/* Products Used */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Products Used</label>
                <input
                  type="text"
                  value={newNote.products_used}
                  onChange={(e) => setNewNote({ ...newNote, products_used: e.target.value })}
                  placeholder="Separate products with commas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
                />
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observations</label>
                <textarea
                  value={newNote.observations}
                  onChange={(e) => setNewNote({ ...newNote, observations: e.target.value })}
                  placeholder="How does your skin feel? Any changes or reactions?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20 resize-none"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood (Optional)</label>
                  <input
                    type="text"
                    value={newNote.mood}
                    onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
                    placeholder="e.g., Stressed, Relaxed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weather (Optional)</label>
                  <input
                    type="text"
                    value={newNote.weather}
                    onChange={(e) => setNewNote({ ...newNote, weather: e.target.value })}
                    placeholder="e.g., Humid, Dry"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20"
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
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-6 py-2 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors cursor-pointer whitespace-nowrap"
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
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <i className="ri-file-list-3-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your routine to see progress over time</p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-6 py-2 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Add Your First Note
            </button>
          </div>
        ) : (
          allNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Example Note Badge */}
              {note.id === 'example-note-1' && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <i className="ri-information-line"></i>
                  Example Note - Remove when you say "Remove Routine notes example"
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
                    <h3 className="font-semibold text-gray-900 capitalize">{note.routine_type} Routine</h3>
                    <p className="text-sm text-gray-500">
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
                  <span className="text-sm font-medium text-gray-700">Skin Condition:</span>
                  <p className="text-gray-900">{note.skin_condition}</p>
                </div>

                {note.products_used && note.products_used.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Products Used:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {note.products_used.map((product, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-cream-100 text-forest-800 text-sm rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Observations:</span>
                  <p className="text-gray-900">{note.observations}</p>
                </div>

                {(note.mood || note.weather) && (
                  <div className="flex gap-4 pt-2 border-t border-gray-100">
                    {note.mood && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="ri-emotion-line"></i>
                        <span>{note.mood}</span>
                      </div>
                    )}
                    {note.weather && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
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