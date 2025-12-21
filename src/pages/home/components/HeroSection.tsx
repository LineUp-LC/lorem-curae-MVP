export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=elegant%20skincare%20beauty%20products%20arranged%20on%20natural%20stone%20surface%20with%20soft%20botanical%20elements%20delicate%20flowers%20gentle%20morning%20light%20cream%20textures%20serene%20spa%20aesthetic%20minimalist%20composition%20warm%20earth%20tones%20peaceful%20wellness%20atmosphere%20high%20quality%20product%20photography%20clean%20beauty%20concept&width=1920&height=1080&seq=hero-skincare-beauty-v3&orientation=landscape"
          alt="Serene skincare products with natural elements - personalized skincare journey"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center w-full">
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
          Your Skin, Your Journey,<br />Personalized for You
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Discover products perfect for your unique skin with our smart finder, ingredient intelligence, AI guidance, and rewards program
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center space-y-2 animate-bounce">
          <span className="text-white/80 text-sm font-medium">Explore</span>
          <i className="ri-arrow-down-line text-white/80 text-2xl"></i>
        </div>
      </div>
    </section>
  );
}
