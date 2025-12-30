import { useState, useEffect } from 'react';

const HERO_IMAGE = 'https://readdy.ai/api/search-image?query=elegant%20skincare%20beauty%20products%20arranged%20on%20natural%20stone%20surface%20with%20soft%20botanical%20elements%20delicate%20flowers%20gentle%20morning%20light%20cream%20textures%20serene%20spa%20aesthetic%20minimalist%20composition%20warm%20earth%20tones%20peaceful%20wellness%20atmosphere%20high%20quality%20product%20photography%20clean%20beauty%20concept&width=1920&height=1080&seq=hero-skincare-beauty-v3&orientation=landscape';

export default function HeroSection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-green-200 via-amber-100 to-green-300 transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
        <img
          src={HERO_IMAGE}
          alt="Skincare products"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h1 
          className={`text-4xl md:text-6xl font-serif text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Your Skin, Your Journey,
          <br />
          Personalized for You
        </h1>
        
        <p 
          className={`text-xl text-white/90 mb-10 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Discover products perfect for your unique skin with our smart product finder, ingredient library, AI guidance, and product comparison feature
        </p>

        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <a
            href="/skin-survey"
            className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span>Start Your Journey</span>
            <i className="ri-arrow-right-line"></i>
          </a>
          <a
            href="/discover"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-200"
          >
            Explore Products
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center space-y-2 animate-bounce">
          <span className="text-white/80 text-sm">Explore</span>
          <i className="ri-arrow-down-line text-white/80 text-2xl"></i>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-50 to-transparent z-10 pointer-events-none" />
    </section>
  );
}