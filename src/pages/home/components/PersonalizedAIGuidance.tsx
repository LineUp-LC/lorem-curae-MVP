import { Link } from 'react-router-dom';
import NeuralBloomIcon from '../../../components/icons/NeuralBloomIcon';

// Unsplash - woman with healthy glowing skin, natural portrait
const AI_IMAGE = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';

export default function PersonalizedAIGuidance() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pain Point Callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-dark rounded-full text-sm font-medium mb-4">
            <i className="ri-error-warning-line"></i>
            Sound Familiar?
          </span>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You Googled "can I use retinol with vitamin C" five times and got five different answers. 
            One blog says yes, one says never, and now you're more confused than ever.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-4">
              <NeuralBloomIcon size={14} />
              AI-Powered
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Personalized AI Guidance
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Your <span className="text-taupe bg-taupe-50 px-1 rounded">personal skincare assistant</span> that actually knows your skin.
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Get instant, accurate answers to your skincare questions. Ask about product compatibility, 
              routine order, ingredient concerns—all personalized to <strong>your unique skin profile</strong>.
            </p>

            {/* Trust Layer */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border-l-4 border-purple-500">
              <p className="text-sm font-semibold text-purple-900 mb-2">Why Trust Our AI?</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>Trained on peer-reviewed dermatological research</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>No sponsored recommendations—ever</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-purple-600 mt-0.5"></i>
                  <span>Learns your profile to give better answers over time</span>
                </li>
              </ul>
            </div>

            <Link
              to="/ai-chat"
              className="inline-flex items-center space-x-3 bg-taupe hover:bg-taupe-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
              aria-label="Start chatting with AI skincare assistant"
            >
              <span>Chat with Your Guide</span>
              <i className="ri-chat-smile-3-line text-xl"></i>
            </Link>
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={AI_IMAGE}
                alt="Woman with healthy, glowing skin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
            </div>
            
            {/* Floating Badge - Science Citation */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ri-microscope-line text-purple-600"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Research-Backed</p>
                  <p className="text-xs text-gray-500">1,200+ studies cited</p>
                </div>
              </div>
            </div>
            
            {/* Floating Badge - AI Recommendation */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <NeuralBloomIcon size={24} color="white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">AI Recommendation</p>
                  <p className="text-xs text-gray-600">Based on your profile: try adding a niacinamide serum before your moisturizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}