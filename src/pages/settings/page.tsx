import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-sage-50 text-sage-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'account' ? 'bg-sage-50 text-sage-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-shield-user-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Account</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-sage-50 text-sage-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-notification-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'privacy' ? 'bg-sage-50 text-sage-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className="ri-lock-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preferences' ? 'bg-sage-50 text-sage-700' : 'text-gray-700 hover:bg-gray-50'
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
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah Chen"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      defaultValue="@skincare_enthusiast"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="Passionate about clean beauty and science-backed skincare. Always learning!"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>

                  <button className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer">
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="sarah.chen@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                      Update Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-sage-600 rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Product Reminders</p>
                        <p className="text-sm text-gray-600">Get notified about expiring products</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-sage-600 rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Community Updates</p>
                        <p className="text-sm text-gray-600">Stay updated with community posts</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-sage-600 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Make your profile visible to others</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-sage-600 rounded cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Show Routines</p>
                        <p className="text-sm text-gray-600">Allow others to see your routines</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-sage-600 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">App Preferences</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent cursor-pointer">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent cursor-pointer">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>Auto</option>
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