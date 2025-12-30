import { useState, useEffect } from 'react';

const HERO_IMAGE = 'https://readdy.ai/api/search-image?query=elegant%20skincare%20beauty%20products%20arranged%20on%20natural%20stone%20surface%20with%20soft%20botanical%20elements%20delicate%20flowers%20gentle%20morning%20light%20cream%20textures%20serene%20spa%20aesthetic%20minimalist%20composition%20warm%20earth%20tones%20peaceful%20wellness%20atmosphere%20high%20quality%20product%20photography%20clean%20beauty%20concept&width=1920&height=1080&seq=hero-skincare-beauty-v3&orientation=landscape';

export default function HeroSection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section - Your personalized skincare journey"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Low-quality placeholder / skeleton */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-sage-200 via-cream-100 to-sage-300 transition-opacity duration-700 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
        
        {/* Main hero image */}
        <img
          src={HERO_IMAGE}
          alt="Serene skincare products with natural elements - personalized skincare journey"
          loading="eager"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-top transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"
          aria-hidden="true"
        />
      </div>

      {/* Content with staggered entrance animation */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center w-full">
        {/* Heading */}
        <h1 
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight tracking-tight transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          Your Skin, Your Journey,
          <br />
          Personalized for You
        </h1>
        
        {/* Subheading */}
        <p 
          className={`text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          Discover products perfect for your unique skin with our smart product finder, ingredient library, AI guidance, and product comparison feature
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-out delay-400 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <a
            href="/skin-survey"
            className="group px-8 py-4 bg-white text-forest-900 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
          >
            <span>Start Your Journey</span>
            <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-200"></i>
          </a>
          <a
            href="/discover"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold text-lg hover:bg-white/20 hover:border-white/50 active:scale-[0.98] transition-all duration-200"
          >
            Explore Products
          </a>
        </div>
      </div>

      {/* Scroll Indicator - Original arrow style with bounce animation */}
      <div 
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-1000 ease-out delay-700 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex flex-col items-center space-y-2 motion-safe:animate-bounce">
          <span className="text-white/80 text-sm font-medium">Explore</span>
          <i className="ri-arrow-down-line text-white/80 text-2xl"></i>
        </div>
      </div>

      {/* Decorative gradient at bottom for smooth transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream-50 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}