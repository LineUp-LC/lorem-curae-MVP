import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/ui/Dropdown';
import Toast from '../../components/feature/Toast';
import { supabase } from '../../lib/supabase-browser';
import { useAuth } from '../../lib/auth/AuthContext';
import { updateUserProfile } from '../../lib/supabase';
import { useUserLocation } from '../../lib/utils/locationState';

const SettingsPage = () => {
  const { i18n } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'account', 'notifications', 'privacy', 'preferences', 'location'].includes(tab)) {
      return tab;
    }
    return 'profile';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('user_language') || 'en';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('user_theme') || 'light';
  });

  // Profile form state - initialized from real profile data
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Display name state
  const [fullName, setFullName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [nameChangedAt, setNameChangedAt] = useState<string | null>(null);
  const [nameChangeCount, setNameChangeCount] = useState(0);

  const COOLDOWN_DAYS = 30;
  const MAX_FREE_CHANGES = 2;

  const getDaysRemaining = () => {
    if (!nameChangedAt) return 0;
    const changedDate = new Date(nameChangedAt);
    const now = new Date();
    const diffMs = now.getTime() - changedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remaining = COOLDOWN_DAYS - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  const effectiveChangeCount = getDaysRemaining() > 0 ? nameChangeCount : 0;
  const isNameCooldownActive = effectiveChangeCount >= MAX_FREE_CHANGES && getDaysRemaining() > 0;
  const changesRemaining = MAX_FREE_CHANGES - effectiveChangeCount;
  const nameChanged = fullName.trim() !== originalName.trim();

  // Location state
  const { location: savedLocation, setLocation: saveLocation, clearLocation } = useUserLocation();
  const [locationCity, setLocationCity] = useState('');
  const [locationStateVal, setLocationStateVal] = useState('');
  const [locationZip, setLocationZip] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [locationLat, setLocationLat] = useState<string>('');
  const [locationLon, setLocationLon] = useState<string>('');
  const [savingLocation, setSavingLocation] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);

  // Initialize form fields when profile loads
  useEffect(() => {
    if (profile) {
      setBio((profile.preferences as any)?.bio || '');
      setFullName(profile.full_name || '');
      setOriginalName(profile.full_name || '');

      const namePrefs = profile.preferences as any;
      if (namePrefs?.name_changed_at) setNameChangedAt(namePrefs.name_changed_at);
      if (namePrefs?.name_change_count) setNameChangeCount(namePrefs.name_change_count);

      // Hydrate preferences from Supabase (server wins for cross-device sync)
      const prefs = profile.preferences as any;
      if (prefs?.language && prefs.language !== language) {
        setLanguage(prefs.language);
        localStorage.setItem('user_language', prefs.language);
        i18n.changeLanguage(prefs.language);
      }
      if (prefs?.theme && prefs.theme !== theme) {
        setTheme(prefs.theme);
        localStorage.setItem('user_theme', prefs.theme);
      }
      if (prefs?.routineReminders) {
        setRoutineReminders(prefs.routineReminders);
        localStorage.setItem('routine_reminders', JSON.stringify(prefs.routineReminders));
      }
      // Hydrate notification preferences
      if (prefs?.notifications) {
        setEmailNotifications(prefs.notifications.email ?? true);
        setProductReminders(prefs.notifications.productReminders ?? true);
        setCommunityUpdates(prefs.notifications.communityUpdates ?? false);
      }
      // Hydrate privacy preferences
      if (prefs?.privacy) {
        setProfileVisibility(prefs.privacy.profileVisible ?? true);
        setShowRoutinesPublic(prefs.privacy.showRoutines ?? false);
      }
      // Hydrate location
      if (prefs?.location) {
        saveLocation(prefs.location);
        setLocationCity(prefs.location.city || '');
        setLocationStateVal(prefs.location.state || '');
        setLocationZip(prefs.location.zip || '');
        setLocationCountry(prefs.location.country || '');
        if (prefs.location.lat != null) setLocationLat(String(prefs.location.lat));
        if (prefs.location.lon != null) setLocationLon(String(prefs.location.lon));
      }
    }
  }, [profile]);

  // Initialize location fields from localStorage on mount
  useEffect(() => {
    if (savedLocation) {
      setLocationCity(savedLocation.city || '');
      setLocationStateVal(savedLocation.state || '');
      setLocationZip(savedLocation.zip || '');
      setLocationCountry(savedLocation.country || '');
      if (savedLocation.lat != null) setLocationLat(String(savedLocation.lat));
      if (savedLocation.lon != null) setLocationLon(String(savedLocation.lon));
    }
  }, []);

  // Feature 3: Daily Routine Reminder settings
  const [routineReminders, setRoutineReminders] = useState(() => {
    const saved = localStorage.getItem('routine_reminders');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      morningTime: '07:00',
      eveningTime: '21:00'
    };
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Notification toggle state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productReminders, setProductReminders] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);

  // Privacy toggle state
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showRoutinesPublic, setShowRoutinesPublic] = useState(false);

  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [emailError, setEmailError] = useState('');

  // Password update state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return; // Don't enable if permission denied
      }
    }
    const updated = { ...routineReminders, enabled };
    setRoutineReminders(updated);
    localStorage.setItem('routine_reminders', JSON.stringify(updated));
    syncRemindersToSupabase(updated);
  };

  const handleReminderTimeChange = (field: 'morningTime' | 'eveningTime', value: string) => {
    const updated = { ...routineReminders, [field]: value };
    setRoutineReminders(updated);
    localStorage.setItem('routine_reminders', JSON.stringify(updated));
    syncRemindersToSupabase(updated);
  };

  const syncRemindersToSupabase = async (reminders: typeof routineReminders) => {
    if (!user) return;
    try {
      await updateUserProfile(user.id, {
        preferences: {
          ...(profile?.preferences as object),
          routineReminders: reminders,
        },
      });
      console.log('[DataSync] Routine reminders synced to Supabase');
    } catch (e) {
      console.error('[DataSync] Failed to sync reminders:', e);
    }
  };

  // Apply theme on mount and when changed
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('user_language', newLanguage);
    i18n.changeLanguage(newLanguage);

    // Sync to Supabase if authenticated
    if (user) {
      try {
        await updateUserProfile(user.id, {
          preferences: {
            ...(profile?.preferences as object),
            language: newLanguage,
          },
        });
        console.log('[DataSync] Language preference synced to Supabase');
      } catch (e) {
        console.error('[DataSync] Failed to sync language:', e);
      }
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('user_theme', newTheme);

    // Sync to Supabase if authenticated
    if (user) {
      try {
        await updateUserProfile(user.id, {
          preferences: {
            ...(profile?.preferences as object),
            theme: newTheme,
          },
        });
        console.log('[DataSync] Theme preference synced to Supabase');
      } catch (e) {
        console.error('[DataSync] Failed to sync theme:', e);
      }
    }
  };

  const handleEmailUpdate = async () => {
    setEmailError('');
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      setEmailError('Please enter a new email address');
      return;
    }

    if (trimmedEmail === user?.email) {
      setEmailError('This is already your current email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSavingEmail('saving');
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: trimmedEmail,
      });

      if (error) {
        setEmailError(error.message || 'Failed to update email');
        setSavingEmail('idle');
        return;
      }

      setNewEmail('');
      setSavingEmail('saved');
      setToastMessage('Confirmation link sent — check your inbox');
      setTimeout(() => setSavingEmail('idle'), 4000);
    } catch (error: any) {
      setEmailError(error?.message || 'Failed to update email. Please try again.');
      setSavingEmail('idle');
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);

      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user found');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect');
        setPasswordLoading(false);
        return;
      }

      // Now update to new password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Password updated successfully');
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setPasswordError('No email found for this account');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setShowPasswordModal(false);
      setToastMessage('Password reset email sent');
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to send reset email');
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      setToastMessage('Settings saved');
      return;
    }
    try {
      await updateUserProfile(user.id, {
        preferences: {
          ...(profile?.preferences as object),
          notifications: {
            email: emailNotifications,
            productReminders: productReminders,
            communityUpdates: communityUpdates,
          },
          privacy: {
            profileVisible: profileVisibility,
            showRoutines: showRoutinesPublic,
          },
        },
      });
      await refreshProfile();
      setToastMessage('Settings saved');
    } catch (e) {
      console.error('Error saving settings:', e);
      setToastMessage('Failed to save settings');
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!user) return;

    if (nameChanged && isNameCooldownActive) {
      setToastMessage(`You can change your name again in ${getDaysRemaining()} days`);
      return;
    }

    try {
      setSavingProfile(true);
      const existingPrefs = (profile?.preferences as Record<string, any>) || {};
      const updatedPrefs = {
        ...existingPrefs,
        bio: bio,
      };

      if (nameChanged) {
        updatedPrefs.name_change_count = effectiveChangeCount + 1;
        updatedPrefs.name_changed_at = new Date().toISOString();
      }

      await updateUserProfile(user.id, {
        full_name: fullName,
        preferences: updatedPrefs,
      });
      await refreshProfile();

      setOriginalName(fullName);
      if (nameChanged) {
        setNameChangeCount(effectiveChangeCount + 1);
        setNameChangedAt(new Date().toISOString());
      }

      setToastMessage('Profile saved');
    } catch (error) {
      console.error('Error saving profile:', error);
      setToastMessage('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveLocation = async () => {
    setSavingLocation('saving');

    const parsedLat = locationLat ? parseFloat(locationLat) : undefined;
    const parsedLon = locationLon ? parseFloat(locationLon) : undefined;
    const hasManualCoords = typeof parsedLat === 'number' && !isNaN(parsedLat) && typeof parsedLon === 'number' && !isNaN(parsedLon);

    let finalLat = hasManualCoords ? parsedLat : undefined;
    let finalLon = hasManualCoords ? parsedLon : undefined;

    // If no coordinates but city/zip exist, attempt geocoding
    if (!hasManualCoords && (locationCity || locationZip)) {
      try {
        const { data, error } = await supabase.functions.invoke('geocode-location', {
          body: { city: locationCity, region: locationStateVal, postalCode: locationZip, country: locationCountry },
        });
        if (!error && data && data.lat != null) {
          finalLat = data.lat;
          finalLon = data.lon;
          setLocationLat(String(data.lat));
          setLocationLon(String(data.lon));
        }
      } catch {
        // Geocoding failed — save without coordinates (source will be 'partial')
      }
    }

    const hemisphere = (typeof finalLat === 'number' && !isNaN(finalLat))
      ? (finalLat >= 0 ? 'northern' as const : 'southern' as const)
      : undefined;

    const loc = {
      city: locationCity,
      state: locationStateVal,
      zip: locationZip,
      region: locationStateVal,
      country: locationCountry,
      lat: finalLat,
      lon: finalLon,
      hemisphere,
    };
    saveLocation(loc);

    if (user) {
      try {
        await updateUserProfile(user.id, {
          preferences: {
            ...(profile?.preferences as object),
            location: loc,
          },
        });
        await refreshProfile();
      } catch (e) {
        console.error('Failed to sync location:', e);
      }
    }
    setToastMessage('Location saved');
    setSavingLocation('saved');
    setTimeout(() => setSavingLocation('idle'), 2000);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationLat(String(Math.round(latitude * 10000) / 10000));
        setLocationLon(String(Math.round(longitude * 10000) / 10000));

        // Attempt reverse geocoding to fill city/region/country
        try {
          const { data, error } = await supabase.functions.invoke('geocode-location', {
            body: { city: '', region: '', postalCode: '', country: '' },
          });
          // The geocode function needs coords for reverse — for now, just set coords
          if (!error && data?.normalizedCity) {
            setLocationCity(data.normalizedCity);
            if (data.normalizedRegion) setLocationStateVal(data.normalizedRegion);
            if (data.normalizedCountry) setLocationCountry(data.normalizedCountry);
          }
        } catch {
          // Reverse geocoding optional — coords are the priority
        }

        setGeolocating(false);
        setToastMessage('Location updated using your current position.');
      },
      (err) => {
        setGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("We couldn't access your location. You can still enter a city or ZIP manually.");
        } else {
          setGeoError('Unable to determine your location. Please try again or enter it manually.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleClearLocation = async () => {
    clearLocation();
    setLocationCity('');
    setLocationStateVal('');
    setLocationZip('');
    setLocationCountry('');
    setLocationLat('');
    setLocationLon('');
    setGeoError(null);

    if (user) {
      try {
        const prefs = { ...(profile?.preferences as object) };
        delete (prefs as Record<string, unknown>).location;
        await updateUserProfile(user.id, { preferences: prefs });
        await refreshProfile();
      } catch (e) {
        console.error('Failed to clear location:', e);
      }
    }
    setToastMessage('Location cleared');
  };

  return (
    <div className="min-h-screen bg-cream">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-2">Settings</h1>
          <p className="text-sm text-warm-gray">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'account' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-shield-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Account</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-notification-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'privacy' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-lock-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preferences' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-settings-3-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Preferences</span>
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'location' ? 'bg-primary/10 text-primary' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-map-pin-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Location</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Profile Information</h2>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-1.5">Display Name</label>
                    <div className="mb-2 flex items-center gap-2 text-xs text-warm-gray">
                      <i className="ri-user-line text-sm"></i>
                      <span>Current name: <span className="font-medium text-deep">{originalName || user?.email?.split('@')[0] || 'Not set'}</span></span>
                      {!originalName && (
                        <span className="text-[10px] text-warm-gray/70 italic">(from email)</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={user?.email?.split('@')[0] || 'Enter your display name'}
                      disabled={isNameCooldownActive}
                      className="w-full max-w-sm px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-cream/50"
                    />

                    {isNameCooldownActive && (
                      <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-sm">
                        <i className="ri-time-line text-amber-500 text-sm"></i>
                        <p className="text-xs text-amber-700">
                          You've used both name changes. You can change it again in <span className="font-semibold">{getDaysRemaining()} day{getDaysRemaining() !== 1 ? 's' : ''}</span>
                        </p>
                      </div>
                    )}

                    {!isNameCooldownActive && effectiveChangeCount > 0 && changesRemaining > 0 && (
                      <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-amber-50/50 border border-amber-100 rounded-lg max-w-sm">
                        <i className="ri-information-line text-amber-500 text-sm"></i>
                        <p className="text-xs text-amber-700">
                          {changesRemaining} name change{changesRemaining !== 1 ? 's' : ''} remaining before a 30-day wait
                        </p>
                      </div>
                    )}

                    {nameChanged && !isNameCooldownActive && changesRemaining === 1 && (
                      <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg max-w-sm">
                        <i className="ri-information-line text-primary text-sm"></i>
                        <p className="text-xs text-warm-gray">
                          This is your last free change. After saving, you'll need to wait 30 days
                        </p>
                      </div>
                    )}
                  </div>


                  <button
                    onClick={handleSaveProfileChanges}
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Account Settings</h2>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Email Address</label>
                    <p className="text-sm text-deep mb-2">{user?.email || 'No email on file'}</p>
                    <label className="block text-xs font-medium text-warm-gray mb-1.5">New Email</label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }}
                          placeholder={user?.email || 'Enter new email'}
                          className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                        {emailError && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <i className="ri-error-warning-line"></i>
                            {emailError}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleEmailUpdate}
                        disabled={savingEmail === 'saving'}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                          savingEmail === 'saved'
                            ? 'bg-sage text-white'
                            : 'border border-blush text-warm-gray hover:bg-cream hover:border-primary/50'
                        } disabled:opacity-70`}
                      >
                        {savingEmail === 'saving' && <i className="ri-loader-4-line animate-spin"></i>}
                        {savingEmail === 'saved' && <i className="ri-check-line"></i>}
                        {savingEmail === 'idle' && 'Update'}
                        {savingEmail === 'saving' && 'Updating...'}
                        {savingEmail === 'saved' && 'Check Inbox'}
                      </button>
                    </div>
                    <p className="text-xs text-warm-gray/70 mt-1.5">A confirmation link will be sent to your new email address</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Password</label>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-5 py-2.5 border border-blush text-warm-gray rounded-xl text-sm font-medium hover:bg-cream hover:border-primary/50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <div className="pt-6 border-t border-blush">
                    <h3 className="text-sm font-semibold text-deep mb-3">Danger Zone</h3>
                    <button className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Notification Preferences</h2>

                  {/* Daily Routine Reminders Section */}
                  <div className="p-4 bg-cream rounded-xl border border-blush">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                          <i className="ri-notification-badge-line text-sage text-xl"></i>
                        </div>
                        <div>
                          <p className="font-medium text-deep">Daily Routine Reminders</p>
                          <p className="text-sm text-warm-gray">Get reminded to complete your skincare routine</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReminderToggle(!routineReminders.enabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                          routineReminders.enabled ? 'bg-sage' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          routineReminders.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>

                    {routineReminders.enabled && (
                      <div className="space-y-3 pt-3 border-t border-blush">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className="ri-sun-line text-amber-500"></i>
                            <span className="text-sm text-warm-gray">Morning routine</span>
                          </div>
                          <input
                            type="time"
                            value={routineReminders.morningTime}
                            onChange={(e) => handleReminderTimeChange('morningTime', e.target.value)}
                            className="px-3 py-1.5 border border-blush rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className="ri-moon-line text-indigo-500"></i>
                            <span className="text-sm text-warm-gray">Evening routine</span>
                          </div>
                          <input
                            type="time"
                            value={routineReminders.eveningTime}
                            onChange={(e) => handleReminderTimeChange('eveningTime', e.target.value)}
                            className="px-3 py-1.5 border border-blush rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {notificationPermission === 'denied' && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        Notifications are blocked. Please enable them in your browser settings.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-deep text-sm">Email Notifications</p>
                        <p className="text-xs text-warm-gray">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          emailNotifications ? 'bg-primary' : 'bg-warm-gray/25'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          emailNotifications ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-deep text-sm">Product Reminders</p>
                        <p className="text-xs text-warm-gray">Get notified about expiring products</p>
                      </div>
                      <button
                        onClick={() => setProductReminders(!productReminders)}
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          productReminders ? 'bg-primary' : 'bg-warm-gray/25'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          productReminders ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-deep text-sm">Community Updates</p>
                        <p className="text-xs text-warm-gray">Stay updated with community posts</p>
                      </div>
                      <button
                        onClick={() => setCommunityUpdates(!communityUpdates)}
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          communityUpdates ? 'bg-primary' : 'bg-warm-gray/25'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          communityUpdates ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Privacy Settings</h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-deep text-sm">Profile Visibility</p>
                        <p className="text-xs text-warm-gray">Make your profile visible to others</p>
                      </div>
                      <button
                        onClick={() => setProfileVisibility(!profileVisibility)}
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          profileVisibility ? 'bg-primary' : 'bg-warm-gray/25'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          profileVisibility ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-deep text-sm">Show Routines</p>
                        <p className="text-xs text-warm-gray">Allow others to see your routines</p>
                      </div>
                      <button
                        onClick={() => setShowRoutinesPublic(!showRoutinesPublic)}
                        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                          showRoutinesPublic ? 'bg-primary' : 'bg-warm-gray/25'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          showRoutinesPublic ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">App Preferences</h2>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Language</label>
                    <Dropdown
                      id="language-select"
                      value={language}
                      onChange={handleLanguageChange}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                      ]}
                      className="max-w-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Theme</label>
                    <Dropdown
                      id="theme-select"
                      value={theme}
                      onChange={handleThemeChange}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'auto', label: 'Auto (System)' },
                      ]}
                      className="max-w-xs"
                    />
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Location for Environmental Insights</h2>
                  <p className="text-sm text-warm-gray">
                    Your location is used to personalize UV, climate, and seasonal insights. You can remove it at any time.
                  </p>

                  {/* Use Current Location */}
                  <div>
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={geolocating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-blush rounded-xl text-sm font-medium text-deep hover:bg-cream transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {geolocating ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-crosshair-2-line text-primary"></i>
                      )}
                      {geolocating ? 'Detecting location...' : 'Use my current location'}
                    </button>
                    {geoError && (
                      <p className="mt-2 text-xs text-warm-gray">
                        <i className="ri-information-line mr-1"></i>{geoError}
                      </p>
                    )}
                  </div>

                  {/* Text Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-warm-gray mb-2">City</label>
                      <input
                        type="text"
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                        placeholder="e.g. New York"
                        className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-gray mb-2">State / Region</label>
                      <input
                        type="text"
                        value={locationStateVal}
                        onChange={(e) => setLocationStateVal(e.target.value)}
                        placeholder="e.g. NY"
                        className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-gray mb-2">ZIP / Postal Code</label>
                      <input
                        type="text"
                        value={locationZip}
                        onChange={(e) => setLocationZip(e.target.value)}
                        placeholder="e.g. 10001"
                        maxLength={10}
                        className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-gray mb-2">Country</label>
                      <input
                        type="text"
                        value={locationCountry}
                        onChange={(e) => setLocationCountry(e.target.value)}
                        placeholder="e.g. US"
                        className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Advanced Location Options (collapsible) */}
                  <div>
                    <button
                      onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                      className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-deep transition-colors cursor-pointer"
                    >
                      <i className={`ri-arrow-${showAdvancedLocation ? 'up' : 'down'}-s-line`}></i>
                      Advanced location options
                    </button>
                    {showAdvancedLocation && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        <div>
                          <label className="block text-sm font-medium text-warm-gray mb-2">Latitude</label>
                          <input
                            type="number"
                            value={locationLat}
                            onChange={(e) => setLocationLat(e.target.value)}
                            placeholder="e.g. 40.7128"
                            min={-90}
                            max={90}
                            step="any"
                            className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-warm-gray mb-2">Longitude</label>
                          <input
                            type="number"
                            value={locationLon}
                            onChange={(e) => setLocationLon(e.target.value)}
                            placeholder="e.g. -74.0060"
                            min={-180}
                            max={180}
                            step="any"
                            className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                        <p className="sm:col-span-2 text-xs text-warm-gray/70">
                          Optional. Only needed if you want to override automatic detection.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleSaveLocation}
                      disabled={savingLocation === 'saving'}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-2 ${
                        savingLocation === 'saved'
                          ? 'bg-sage text-white'
                          : 'bg-primary text-white hover:bg-dark'
                      } disabled:opacity-70`}
                    >
                      {savingLocation === 'saving' && <i className="ri-loader-4-line animate-spin"></i>}
                      {savingLocation === 'saved' && <i className="ri-check-line"></i>}
                      {savingLocation === 'idle' && 'Save Location'}
                      {savingLocation === 'saving' && 'Saving...'}
                      {savingLocation === 'saved' && 'Saved'}
                    </button>

                    {(locationCity || locationStateVal || locationZip || locationLat || locationLon) && (
                      <button
                        onClick={handleClearLocation}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-warm-gray border border-blush hover:border-red-300 hover:text-red-600 transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <i className="ri-delete-bin-line"></i>
                        Clear my location
                      </button>
                    )}
                  </div>

                  {/* Privacy Note */}
                  <p className="text-xs text-warm-gray/60 leading-relaxed max-w-lg">
                    <i className="ri-shield-check-line mr-1"></i>
                    Your location is only used to personalize environmental insights (UV, climate, season). It is not shared with third parties. You can remove it at any time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-deep/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-deep">Update Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {passwordError}
                </p>
              )}

              <button
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-dark transition-colors cursor-pointer"
              >
                Forgot your password? Send reset email
              </button>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-blush text-warm-gray rounded-xl text-sm font-medium hover:bg-cream transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
