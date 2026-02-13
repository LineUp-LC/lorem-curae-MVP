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
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 pt-24 pb-16">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-warm-gray hover:text-deep mb-4 cursor-pointer text-sm"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back
          </button>
          <h1 className="font-serif text-2xl font-semibold text-deep mb-2">Edit Profile Picture</h1>
          <p className="text-warm-gray text-sm">Choose how you'd like to update your profile picture</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blush/50">
          {/* Current Profile */}
          <div className="flex items-center space-x-5 mb-6 pb-6 border-b border-blush/30">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=current-avatar&orientation=squarish"
                alt="Current profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-deep text-sm mb-1">Current Profile Picture</h3>
              <p className="text-xs text-warm-gray">Choose a new method below to update</p>
            </div>
          </div>

          {/* Upload Methods */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-deep text-sm mb-3">Choose Upload Method</h3>

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
              {uploadMethod === 'computer' && (
                <i className="ri-check-line text-xl text-primary"></i>
              )}
            </button>

            <button
              onClick={() => setUploadMethod('drive')}
              className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${
                uploadMethod === 'drive' ? 'border-primary bg-primary/5' : 'border-blush hover:border-primary/50'
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg mr-4">
                  <i className="ri-google-line text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-deep text-sm">Upload from Google Drive</p>
                  <p className="text-xs text-warm-gray">Select from your cloud storage</p>
                </div>
              </div>
              {uploadMethod === 'drive' && (
                <i className="ri-check-line text-xl text-primary"></i>
              )}
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
              {uploadMethod === 'provided' && (
                <i className="ri-check-line text-xl text-primary"></i>
              )}
            </button>
          </div>

          {/* Upload Area */}
          {uploadMethod === 'computer' && (
            <div className="border-2 border-dashed border-blush rounded-xl p-10 text-center">
              <i className="ri-upload-cloud-line text-4xl text-warm-gray/40 mb-3"></i>
              <p className="text-deep font-medium text-sm mb-2">Drop your image here or click to browse</p>
              <p className="text-xs text-warm-gray mb-4">PNG, JPG up to 10MB</p>
              <input type="file" accept="image/*" className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Choose File
              </label>
            </div>
          )}

          {uploadMethod === 'drive' && (
            <div className="border border-blush rounded-xl p-10 text-center">
              <i className="ri-google-line text-4xl text-primary mb-3"></i>
              <p className="text-deep font-medium text-sm mb-2">Connect to Google Drive</p>
              <p className="text-xs text-warm-gray mb-4">Access your photos from the cloud</p>
              <button className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap">
                Connect Google Drive
              </button>
            </div>
          )}

          {uploadMethod === 'provided' && (
            <div>
              <h4 className="font-medium text-deep text-sm mb-4">Select an Avatar</h4>
              <div className="grid grid-cols-4 gap-3">
                {providedAvatars.map((avatar, idx) => (
                  <button
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-blush hover:border-primary transition-all cursor-pointer"
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
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-blush/30">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 border border-blush text-warm-gray rounded-lg font-medium text-sm hover:bg-cream transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap">
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