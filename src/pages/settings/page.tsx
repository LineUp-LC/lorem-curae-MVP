import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const SettingsPage = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('user_language') || 'en';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('user_theme') || 'light';
  });

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

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-deep mb-2">Settings</h1>
          <p className="text-warm-gray">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'account' ? 'bg-primary-50 text-primary-700' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-shield-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Account</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-primary-50 text-primary-700' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-notification-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'privacy' ? 'bg-primary-50 text-primary-700' : 'text-warm-gray hover:bg-cream'
                }`}
              >
                <i className="ri-lock-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preferences' ? 'bg-primary-50 text-primary-700' : 'text-warm-gray hover:bg-cream'
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

                  <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-dark transition-colors whitespace-nowrap cursor-pointer">
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
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Change Password</label>
                    <button className="px-6 py-3 border border-blush text-warm-gray rounded-lg font-medium hover:bg-cream transition-colors whitespace-nowrap cursor-pointer">
                      Update Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-blush">
                    <h3 className="text-lg font-semibold text-deep mb-4">Danger Zone</h3>
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-deep">Email Notifications</p>
                        <p className="text-sm text-warm-gray">Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-deep">Product Reminders</p>
                        <p className="text-sm text-warm-gray">Get notified about expiring products</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-deep">Community Updates</p>
                        <p className="text-sm text-warm-gray">Stay updated with community posts</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-deep">Profile Visibility</p>
                        <p className="text-sm text-warm-gray">Make your profile visible to others</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-deep">Show Routines</p>
                        <p className="text-sm text-warm-gray">Allow others to see your routines</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6 motion-safe:animate-fade-in">
                  <h2 className="text-xl font-bold text-deep">App Preferences</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Language</label>
                    <select 
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-gray mb-2">Theme</label>
                    <select 
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;