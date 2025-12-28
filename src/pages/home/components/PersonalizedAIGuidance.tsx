import { Link } from 'react-router-dom';

export default function PersonalizedAIGuidance() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Personalized AI Guidance
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Your <span className="text-sage-600 bg-sage-50 px-1 rounded">personal skincare assistant</span>
            </h3>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Get instant answers to your skincare questions with our <a href="/ai-chat" className="text-sage-600 hover:text-sage-700 font-medium underline" title="Chat with AI skincare assistant">AI-powered guidance system</a>. Ask about product compatibility, routine order, ingredient concerns, or get personalized recommendations based on your unique skin profile.
            </p>
            <Link
              to="/ai-chat"
              className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
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
                src="https://readdy.ai/api/search-image?query=modern%20smartphone%20screen%20displaying%20a%20clean%20minimalist%20AI%20skincare%20assistant%20chat%20interface%20with%20personalized%20product%20recommendations%2C%20ingredient%20analysis%20results%2C%20and%20skin%20concern%20questions%20in%20a%20conversational%20format%2C%20professional%20UI%20design%20with%20teal%20and%20purple%20accent%20colors%2C%20realistic%20mobile%20app%20mockup%20held%20in%20hand%20against%20soft%20gradient%20background&width=600&height=700&seq=ai-guidance-realistic-chat-ui-v2&orientation=portrait"
                alt="AI Skincare Assistant"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-sparkling-2-fill text-2xl text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">AI Recommendation</p>
                  <p className="text-xs text-gray-600">Based on your skin profile, try adding a niacinamide serum to your routine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}