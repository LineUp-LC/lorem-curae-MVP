import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import Dropdown from '../../components/ui/Dropdown';
import Toast from '../../components/feature/Toast';
import { supabase } from '../../lib/supabase-browser';

const SettingsPage = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('user_language') || 'en';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('user_theme') || 'light';
  });

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
  };

  const handleReminderTimeChange = (field: 'morningTime' | 'eveningTime', value: string) => {
    const updated = { ...routineReminders, [field]: value };
    setRoutineReminders(updated);
    localStorage.setItem('routine_reminders', JSON.stringify(updated));
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('user_language', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('user_theme', newTheme);
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

  const handleSaveChanges = () => {
    setToastMessage('Settings saved');
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
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
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Profile Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah Chen"
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue="@skincare_enthusiast"
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="Passionate about clean beauty and science-backed skincare. Always learning!"
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Account Settings</h2>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="sarah.chen@example.com"
                      className="w-full px-4 py-2.5 border border-blush rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
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
                    <label className="flex items-center justify-between py-2 cursor-pointer group">
                      <div>
                        <p className="font-medium text-deep text-sm">Email Notifications</p>
                        <p className="text-xs text-warm-gray">Receive updates via email</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="w-10 h-6 bg-warm-gray/25 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between py-2 cursor-pointer group">
                      <div>
                        <p className="font-medium text-deep text-sm">Product Reminders</p>
                        <p className="text-xs text-warm-gray">Get notified about expiring products</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="w-10 h-6 bg-warm-gray/25 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between py-2 cursor-pointer group">
                      <div>
                        <p className="font-medium text-deep text-sm">Community Updates</p>
                        <p className="text-xs text-warm-gray">Stay updated with community posts</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-10 h-6 bg-warm-gray/25 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Privacy Settings</h2>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between py-2 cursor-pointer group">
                      <div>
                        <p className="font-medium text-deep text-sm">Profile Visibility</p>
                        <p className="text-xs text-warm-gray">Make your profile visible to others</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <div className="w-10 h-6 bg-warm-gray/25 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between py-2 cursor-pointer group">
                      <div>
                        <p className="font-medium text-deep text-sm">Show Routines</p>
                        <p className="text-xs text-warm-gray">Allow others to see your routines</p>
                      </div>
                      <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-10 h-6 bg-warm-gray/25 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </label>
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

      <Footer />
    </div>
  );
};

export default SettingsPage;
