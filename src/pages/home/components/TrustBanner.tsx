const badges = [
  { icon: 'ri-shield-check-line', label: 'WCAG 2.1 AA' },
  { icon: 'ri-leaf-line', label: 'Cruelty-Free' },
  { icon: 'ri-heart-line', label: 'Indie Supported' },
  { icon: 'ri-global-line', label: 'Inclusive Community' },
];

const TrustBanner = () => {
  return (
    <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-sage-50 via-cream-50 to-coral-50">
      <div className="max-w-6xl mx-auto">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100">
                <i className={`${badge.icon} text-2xl text-sage-600`}></i>
              </div>
              <span className="text-sm font-medium text-forest-900">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <h3 className="text-3xl lg:text-4xl font-serif text-forest-900 mb-3">
            Built for Every Skin, Every Story, Every Journey
          </h3>
          <div className="w-24 h-1 bg-sage-600 mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;