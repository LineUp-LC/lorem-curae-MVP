import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase, UserProfile } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth/AuthContext';

export default function ProfileCustomizePage() {
  const { user: authUser, refreshProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('sage');
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [showBadges, setShowBadges] = useState(true);
  const [showRoutines, setShowRoutines] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Avatar editing state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMethod, setUploadMethod] = useState<'computer' | 'provided' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const providedAvatars = [
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20young%20woman%20with%20short%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-1&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20long%20wavy%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-2&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20bun%20hairstyle%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-3&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20curly%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-4&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20ponytail%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-5&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20braids%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-6&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20bob%20haircut%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-7&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20pixie%20cut%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-8&orientation=squarish',
  ];


  useEffect(() => {
    loadUserProfile();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(data);
        // Read customization from preferences JSONB
        const prefs = (data.preferences as Record<string, any>) || {};
        setSelectedTheme(prefs.profile_theme || 'sage');
        setSelectedLayout(prefs.profile_layout || 'grid');
        setShowBadges(prefs.show_badges ?? true);
        setShowRoutines(prefs.show_routines ?? true);
        setShowCommunities(prefs.show_communities ?? true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Avatar handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file (PNG, JPG, etc.)', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'File must be under 10MB', type: 'error' });
      return;
    }
    setSelectedFile(file);
    setSelectedAvatarUrl(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file (PNG, JPG, etc.)', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'File must be under 10MB', type: 'error' });
      return;
    }
    setSelectedFile(file);
    setSelectedAvatarUrl(null);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatarUrl(url);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    if (!authUser) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${authUser.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSaveAvatar = async () => {
    if (!authUser) {
      setToast({ message: 'You must be signed in to update your profile picture', type: 'error' });
      return;
    }
    if (!selectedFile && !selectedAvatarUrl) {
      setToast({ message: 'Please select an image first', type: 'error' });
      return;
    }
    setAvatarSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToast({ message: 'Your session has expired. Please sign in again.', type: 'error' });
        setAvatarSaving(false);
        return;
      }
      let avatarUrl: string | null = null;
      if (selectedFile) {
        avatarUrl = await uploadToStorage(selectedFile);
      } else if (selectedAvatarUrl) {
        avatarUrl = selectedAvatarUrl;
      }
      if (!avatarUrl) {
        setToast({ message: 'Failed to process image', type: 'error' });
        setAvatarSaving(false);
        return;
      }
      const { data: currentProfile, error: fetchError } = await supabase
        .from('users_profiles')
        .select('preferences')
        .eq('id', session.user.id)
        .single();
      if (fetchError) throw fetchError;
      const existingPrefs = (currentProfile?.preferences as Record<string, any>) || {};
      const updatedPrefs = { ...existingPrefs, avatar_url: avatarUrl };
      const { error: updateError } = await supabase
        .from('users_profiles')
        .update({ preferences: updatedPrefs, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
      if (updateError) throw updateError;
      const { data: verify } = await supabase
        .from('users_profiles')
        .select('preferences')
        .eq('id', session.user.id)
        .single();
      const savedUrl = (verify?.preferences as any)?.avatar_url;
      if (!savedUrl) {
        setToast({ message: 'Update appeared to succeed but data did not persist. Check RLS policies.', type: 'error' });
        setAvatarSaving(false);
        return;
      }
      await refreshProfile();
      setToast({ message: 'Profile picture saved successfully', type: 'success' });
      setUploadMethod(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedAvatarUrl(null);
      loadUserProfile();
    } catch (err: any) {
      console.error('[Avatar Save] Error:', err);
      setToast({ message: err.message || 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setAvatarSaving(false);
    }
  };

  const currentAvatar = (userProfile?.preferences as any)?.avatar_url || null;
  const displayAvatar = previewUrl || selectedAvatarUrl || currentAvatar;

  const handleSaveCustomization = async () => {
    if (!userProfile) return;

    try {
      setSaving(true);

      // Store customization settings in preferences JSONB
      const existingPrefs = (userProfile.preferences as Record<string, any>) || {};
      const updatedPrefs = {
        ...existingPrefs,
        profile_theme: selectedTheme,
        profile_layout: selectedLayout,
        show_badges: showBadges,
        show_routines: showRoutines,
        show_communities: showCommunities,
      };

      const { error } = await supabase
        .from('users_profiles')
        .update({
          preferences: updatedPrefs,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      // Refresh auth context so avatar + settings appear everywhere instantly
      await refreshProfile();

      setToast({ message: 'Profile customization saved', type: 'success' });
      loadUserProfile();
    } catch (error) {
      console.error('Error saving customization:', error);
      setToast({ message: 'Failed to save customization. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3"></div>
          <p className="text-warm-gray text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Top-right toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] animate-enter-up">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-white border-green-200 text-green-700'
              : 'bg-white border-red-200 text-red-700'
          }`}>
            <i className={`text-base ${
              toast.type === 'success' ? 'ri-check-line text-green-500' : 'ri-error-warning-line text-red-500'
            }`}></i>
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-warm-gray/60 hover:text-warm-gray transition-colors"
            >
              <i className="ri-close-line text-base"></i>
            </button>
          </div>
        </div>
      )}

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-semibold text-deep mb-1">Customize Profile</h1>
            <p className="text-sm text-warm-gray">Control what appears on your public profile</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Customization Options */}
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="bg-white rounded-xl border border-blush/50 p-5">
                <div className="mb-4">
                  <h2 className="font-medium text-deep text-base">Profile Picture</h2>
                  <p className="text-warm-gray text-sm">Choose how you'd like to update your profile picture</p>
                </div>

                {/* Current / Preview */}
                <div className="flex items-center space-x-5 mb-5 pb-5 border-b border-blush/30">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20 flex-shrink-0">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blush/30">
                        <i className="ri-user-line text-2xl text-warm-gray/60"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-deep text-sm mb-1">
                      {previewUrl || selectedAvatarUrl ? 'New Profile Picture' : 'Current Profile Picture'}
                    </h3>
                    <p className="text-xs text-warm-gray">
                      {previewUrl || selectedAvatarUrl
                        ? 'Click "Save Profile Picture" to apply'
                        : 'Choose a method below to update'}
                    </p>
                  </div>
                </div>

                {/* Upload Method Buttons */}
                <div className="space-y-3 mb-5">
                  <button
                    onClick={() => setUploadMethod('computer')}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                      uploadMethod === 'computer' ? 'border-primary bg-primary/5' : 'border-blush hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg mr-4">
                        <i className="ri-computer-line text-xl"></i>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-deep text-sm">Upload from Computer</p>
                        <p className="text-xs text-warm-gray">Choose a file from your device</p>
                      </div>
                    </div>
                    {uploadMethod === 'computer' && <i className="ri-check-line text-xl text-primary"></i>}
                  </button>

                  <button
                    onClick={() => setUploadMethod('provided')}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                      uploadMethod === 'provided' ? 'border-primary bg-primary/5' : 'border-blush hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg mr-4">
                        <i className="ri-gallery-line text-xl"></i>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-deep text-sm">Choose Provided Avatar</p>
                        <p className="text-xs text-warm-gray">Select from our collection</p>
                      </div>
                    </div>
                    {uploadMethod === 'provided' && <i className="ri-check-line text-xl text-primary"></i>}
                  </button>
                </div>

                {/* Upload from Computer */}
                {uploadMethod === 'computer' && (
                  <div
                    className="border-2 border-dashed border-blush rounded-xl p-10 text-center mb-5"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {previewUrl && selectedFile ? (
                      <div className="space-y-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto ring-4 ring-primary/20">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-deep font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-warm-gray">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-block px-5 py-2.5 border border-blush text-warm-gray rounded-lg font-medium text-sm hover:bg-cream transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Choose Different File
                        </button>
                      </div>
                    ) : (
                      <>
                        <i className="ri-upload-cloud-line text-4xl text-warm-gray/40 mb-3"></i>
                        <p className="text-deep font-medium text-sm mb-2">Drop your image here or click to browse</p>
                        <p className="text-xs text-warm-gray mb-4">PNG, JPG up to 10MB</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Choose File
                        </button>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}

                {/* Provided Avatars */}
                {uploadMethod === 'provided' && (
                  <div className="mb-5">
                    <h4 className="font-medium text-deep text-sm mb-4">Select an Avatar</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {providedAvatars.map((avatar, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectAvatar(avatar)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            selectedAvatarUrl === avatar
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-blush hover:border-primary/50'
                          }`}
                        >
                          <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Avatar Button */}
                {uploadMethod && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-blush/30">
                    <button
                      onClick={() => {
                        setUploadMethod(null);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setSelectedAvatarUrl(null);
                      }}
                      disabled={avatarSaving}
                      className="px-5 py-2.5 border border-blush text-warm-gray rounded-lg font-medium text-sm hover:bg-cream transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAvatar}
                      disabled={avatarSaving || (!selectedFile && !selectedAvatarUrl)}
                      className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {avatarSaving ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        'Save Profile Picture'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Visibility Settings */}
              <div className="bg-white rounded-xl border border-blush/50 p-5">
                <div className="mb-4">
                  <h2 className="font-medium text-deep text-base">Visibility Settings</h2>
                  <p className="text-warm-gray text-sm">Control what appears on your profile</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-blush/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-medal-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Badges</p>
                        <p className="text-xs text-warm-gray">Display earned badges</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBadges(!showBadges)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        showBadges ? 'bg-primary' : 'bg-warm-gray/25'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showBadges ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-blush/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-calendar-check-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Routines</p>
                        <p className="text-xs text-warm-gray">Display skincare routines</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRoutines(!showRoutines)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        showRoutines ? 'bg-primary' : 'bg-warm-gray/25'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showRoutines ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="ri-community-line text-base text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-deep text-sm">Show Communities</p>
                        <p className="text-xs text-warm-gray">Display joined communities</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCommunities(!showCommunities)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        showCommunities ? 'bg-primary' : 'bg-warm-gray/25'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                          showCommunities ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>


              {/* Save Button */}
              <div className="flex gap-3">
                <Link
                  to="/account"
                  className="flex-1 px-5 py-2.5 border border-blush text-warm-gray rounded-lg hover:bg-cream transition-colors font-medium text-center text-sm"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSaveCustomization}
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
