import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<'computer' | 'drive' | 'provided' | null>(null);

  const providedAvatars = [
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20young%20woman%20with%20short%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-1&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20long%20wavy%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-2&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20bun%20hairstyle%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-3&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20curly%20hair%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-4&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20ponytail%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-5&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20braids%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-6&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20bob%20haircut%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-7&orientation=squarish',
    'https://readdy.ai/api/search-image?query=minimalist%20avatar%20illustration%20woman%20with%20pixie%20cut%20clean%20simple%20design%20pastel%20colors%20flat%20design%20modern%20profile%20picture&width=200&height=200&seq=avatar-8&orientation=squarish'
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile Picture</h1>
          <p className="text-gray-600">Choose how you'd like to update your profile picture</p>
        </div>

        <div className="bg-white rounded-xl p-8">
          {/* Current Profile */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-sage-200">
              <img 
                src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=current-avatar&orientation=squarish"
                alt="Current profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Current Profile Picture</h3>
              <p className="text-sm text-gray-600">Choose a new method below to update</p>
            </div>
          </div>

          {/* Upload Methods */}
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Choose Upload Method</h3>
            
            <button
              onClick={() => setUploadMethod('computer')}
              className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                uploadMethod === 'computer' ? 'border-sage-600 bg-sage-50' : 'border-gray-200 hover:border-sage-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-sage-100 text-sage-600 rounded-lg mr-4">
                  <i className="ri-computer-line text-2xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Upload from Computer</p>
                  <p className="text-sm text-gray-600">Choose a file from your device</p>
                </div>
              </div>
              {uploadMethod === 'computer' && (
                <i className="ri-check-line text-2xl text-sage-600"></i>
              )}
            </button>

            <button
              onClick={() => setUploadMethod('drive')}
              className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                uploadMethod === 'drive' ? 'border-sage-600 bg-sage-50' : 'border-gray-200 hover:border-sage-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-coral-100 text-coral-600 rounded-lg mr-4">
                  <i className="ri-google-line text-2xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Upload from Google Drive</p>
                  <p className="text-sm text-gray-600">Select from your cloud storage</p>
                </div>
              </div>
              {uploadMethod === 'drive' && (
                <i className="ri-check-line text-2xl text-sage-600"></i>
              )}
            </button>

            <button
              onClick={() => setUploadMethod('provided')}
              className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                uploadMethod === 'provided' ? 'border-sage-600 bg-sage-50' : 'border-gray-200 hover:border-sage-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mr-4">
                  <i className="ri-gallery-line text-2xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Choose Provided Avatar</p>
                  <p className="text-sm text-gray-600">Select from our collection</p>
                </div>
              </div>
              {uploadMethod === 'provided' && (
                <i className="ri-check-line text-2xl text-sage-600"></i>
              )}
            </button>
          </div>

          {/* Upload Area */}
          {uploadMethod === 'computer' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <i className="ri-upload-cloud-line text-5xl text-gray-400 mb-4"></i>
              <p className="text-gray-900 font-medium mb-2">Drop your image here or click to browse</p>
              <p className="text-sm text-gray-600 mb-4">PNG, JPG up to 10MB</p>
              <input type="file" accept="image/*" className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Choose File
              </label>
            </div>
          )}

          {uploadMethod === 'drive' && (
            <div className="border-2 border-gray-200 rounded-lg p-12 text-center">
              <i className="ri-google-line text-5xl text-coral-600 mb-4"></i>
              <p className="text-gray-900 font-medium mb-2">Connect to Google Drive</p>
              <p className="text-sm text-gray-600 mb-4">Access your photos from the cloud</p>
              <button className="px-6 py-3 bg-coral-600 text-white rounded-lg font-medium hover:bg-coral-700 transition-colors cursor-pointer whitespace-nowrap">
                Connect Google Drive
              </button>
            </div>
          )}

          {uploadMethod === 'provided' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Select an Avatar</h4>
              <div className="grid grid-cols-4 gap-4">
                {providedAvatars.map((avatar, idx) => (
                  <button
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-sage-600 transition-all cursor-pointer"
                  >
                    <img 
                      src={avatar}
                      alt={`Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {uploadMethod && (
            <div className="flex items-center justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer whitespace-nowrap">
                Save Profile Picture
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileEditPage;