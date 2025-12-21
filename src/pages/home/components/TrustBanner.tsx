const TrustBanner = () => {
  const badges = [
    { icon: 'ri-shield-check-line', label: 'WCAG Compliant' },
    { icon: 'ri-leaf-line', label: 'Cruelty-Free' },
    { icon: 'ri-heart-line', label: 'Indie Supported' },
    { icon: 'ri-global-line', label: 'Inclusive Community' },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-purple-100 via-cream-100 to-coral-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-md">
                <i className={`${badge.icon} text-3xl text-sage-600`}></i>
              </div>
              <span className="text-sm font-medium text-forest-900">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-serif text-forest-900 mb-2">
            Built for Every Skin, Every Story, Every Journey
          </h3>
          <div className="w-24 h-1 bg-sage-600 mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;