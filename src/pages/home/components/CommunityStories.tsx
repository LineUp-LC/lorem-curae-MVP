import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const CommunityStories = () => {
  const [userSkinProfile, setUserSkinProfile] = useState<any>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users_profiles')
          .select('skin_type, skin_concerns, skin_goals')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserSkinProfile(data);
          setIsPersonalized(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <section className="py-24 px-6 lg:px-12 bg-forest-800">
      <div className="max-w-7xl mx-auto">
        {/* Personalization Badge */}
        {isPersonalized && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-500/20 border border-sage-400/30 rounded-full">
              <i className="ri-user-heart-line text-sage-300" aria-hidden="true"></i>
              <span className="text-sm text-sage-200 font-medium">
                Reviews matched to your {userSkinProfile?.skin_type || 'skin'} profile
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative">
              <i className="ri-double-quotes-l text-8xl text-cream-200/20 absolute -top-6 -left-4" aria-hidden="true"></i>
              <h2 className="text-4xl lg:text-5xl font-serif text-cream-50 relative z-10">
                Real Stories, Real Results
              </h2>
            </div>
            <p className="text-lg text-cream-200 leading-relaxed">
              Join thousands of <a href="/community" className="text-sage-300 hover:text-sage-200 font-medium underline" title="Join our skincare community">community members</a> sharing their authentic skincare journeys, celebrating progress, and empowering each other.
            </p>
          </div>

          {/* Right Testimonial Card */}
          <article className="lg:col-span-2 bg-cream-50 rounded-3xl p-10 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0"
                  style={{ marginLeft: i > 1 ? '-12px' : '0' }}
                >
                  <img
                    src={`https://readdy.ai/api/search-image?query=Diverse%20person%20with%20healthy%20glowing%20skin%2C%20natural%20beauty%20portrait%2C%20warm%20lighting%2C%20authentic%20smile%2C%20inclusive%20representation%2C%20soft%20neutral%20background&width=100&height=100&seq=community-avatar-00${i}&orientation=squarish`}
                    alt={`Community member ${i} with healthy glowing skin`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ))}
              <span className="text-sm font-medium text-gray-600 ml-2">+10,000 members</span>
            </div>

            {/* Similarity Badge */}
            {isPersonalized && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage-100 rounded-full mb-4">
                <i className="ri-user-follow-line text-sage-700 text-sm" aria-hidden="true"></i>
                <span className="text-xs font-medium text-sage-700">
                  Similar to your profile: {userSkinProfile?.skin_type || 'Combination'} skin
                </span>
              </div>
            )}

            <blockquote className="text-3xl lg:text-4xl font-serif text-forest-900 leading-relaxed mb-8">
              "Lorem Curae helped me understand my skin for the first time. The ingredient transparency and community support transformed my entire approach to skincare. I finally feel confident in my routine."
            </blockquote>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg text-forest-900">Sarah Martinez</p>
                <p className="text-sm text-gray-600">Combination Skin • 6 Months Journey</p>
              </div>
              <Link
                to="/community"
                className="px-6 py-3 bg-coral-500 text-white rounded-full font-medium hover:bg-coral-600 transition-colors whitespace-nowrap cursor-pointer"
                aria-label="Read more community success stories"
              >
                Read More Stories
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default CommunityStories;