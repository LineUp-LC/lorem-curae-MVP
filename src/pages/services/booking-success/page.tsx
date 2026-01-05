import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  specialties: string[];
  image: string;
  featured: boolean;
  priceRange: string;
}

const featuredBusinesses: Business[] = [
  {
    id: '1',
    name: 'Radiance Skin Studio',
    rating: 4.9,
    reviewCount: 342,
    location: 'Downtown, Los Angeles',
    distance: '2.3 miles',
    specialties: ['Acne Treatment', 'Chemical Peels', 'Microneedling'],
    image: 'https://readdy.ai/api/search-image?query=modern%20luxury%20skincare%20spa%20interior%20with%20treatment%20beds%20soft%20lighting%20elegant%20minimalist%20design%20professional%20aesthetic%20clean%20white%20surfaces&width=600&height=400&seq=spa-1&orientation=landscape',
    featured: true,
    priceRange: '$$$',
  },
  {
    id: '2',
    name: 'Glow Aesthetics Clinic',
    rating: 4.8,
    reviewCount: 289,
    location: 'Beverly Hills, CA',
    distance: '5.1 miles',
    specialties: ['Laser Therapy', 'Anti-Aging', 'Hydrafacial'],
    image: 'https://readdy.ai/api/search-image?query=upscale%20medical%20spa%20treatment%20room%20with%20advanced%20skincare%20equipment%20modern%20professional%20interior%20soft%20ambient%20lighting%20luxury%20aesthetic&width=600&height=400&seq=spa-2&orientation=landscape',
    featured: true,
    priceRange: '$$$$',
  },
  {
    id: '3',
    name: 'Pure Essence Spa',
    rating: 4.7,
    reviewCount: 456,
    location: 'Santa Monica, CA',
    distance: '8.7 miles',
    specialties: ['Organic Facials', 'LED Therapy', 'Dermaplaning'],
    image: 'https://readdy.ai/api/search-image?query=serene%20natural%20spa%20room%20with%20plants%20organic%20skincare%20products%20calming%20atmosphere%20zen%20aesthetic%20soft%20natural%20lighting%20wellness%20center&width=600&height=400&seq=spa-3&orientation=landscape',
    featured: true,
    priceRange: '$$',
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [businesses] = useState<Business[]>(featuredBusinesses);

  const handleDiscoverBusinesses = () => {
    navigate('/services/search');
  };

  const handleViewBusiness = (id: string) => {
    navigate(`/services/${id}`);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section - Clean style matching About/Marketplace */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-serif text-deep mb-4">
                Discover Professional Skincare Services
              </h1>
              <p className="text-lg text-warm-gray max-w-3xl mx-auto mb-8">
                Find trusted skincare professionals, spas, and clinics near you for expert treatments and personalized care.
              </p>
              <button
                onClick={handleDiscoverBusinesses}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors duration-fast shadow-lg whitespace-nowrap cursor-pointer inline-flex items-center space-x-2"
              >
                <i className="ri-compass-line text-xl"></i>
                <span>Discover Businesses</span>
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Businesses Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-light/30 rounded-full mb-4">
                <i className="ri-star-fill text-primary"></i>
                <span className="text-sm font-medium text-primary-700">Proudly Featured</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl text-deep mb-4">
                Top-Rated Skincare Professionals
              </h2>
              <p className="text-lg text-warm-gray max-w-2xl mx-auto mb-8">
                Handpicked businesses with exceptional reviews and proven expertise in skincare treatments
              </p>
              <button
                onClick={handleDiscoverBusinesses}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors duration-fast shadow-lg whitespace-nowrap cursor-pointer inline-flex items-center space-x-2"
              >
                <i className="ri-compass-line text-xl"></i>
                <span>Discover All Businesses</span>
              </button>
            </div>

            {/* Featured Business Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  onClick={() => handleViewBusiness(business.id)}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                      }}
                    />
                    {/* Fix 3: Featured label now uses taupe to match Best Match */}
                    {business.featured && (
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium flex items-center gap-1 shadow">
                          <i className="ri-star-fill"></i>
                          Featured
                        </div>
                      </div>
                    )}
                    {/* Fix 4: Price indicator with tooltip */}
                    <div className="absolute top-4 right-4 group/price">
                      <div 
                        className="px-3 py-1 bg-white/95 rounded-full text-xs font-medium text-deep cursor-help shadow-sm"
                        tabIndex={0}
                        role="button"
                        aria-describedby={`price-tooltip-${business.id}`}
                      >
                        {business.priceRange}
                      </div>
                      {/* Tooltip */}
                      <div 
                        id={`price-tooltip-${business.id}`}
                        role="tooltip"
                        className="absolute right-0 top-full mt-2 w-52 p-3 bg-dark text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover/price:opacity-100 group-hover/price:visible group-focus-within/price:opacity-100 group-focus-within/price:visible motion-safe:animate-enter-fade transition-all duration-fast z-20"
                      >
                        <p className="font-semibold mb-1">Price Range Guide</p>
                        <p className="text-white/90">
                          {business.priceRange === '$' && '$ — Under $100: Budget-friendly options'}
                          {business.priceRange === '$$' && '$$ — $100–$200: Mid-range services'}
                          {business.priceRange === '$$$' && '$$$ — $200–$350: Premium treatments'}
                          {business.priceRange === '$$$$' && '$$$$ — $350+: Luxury experiences'}
                        </p>
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-dark rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-deep mb-2">
                      {business.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <i className="ri-star-fill text-amber-400"></i>
                        <span className="font-bold text-deep">{business.rating}</span>
                      </div>
                      <span className="text-sm text-warm-gray/80">({business.reviewCount} reviews)</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-warm-gray mb-4">
                      <i className="ri-map-pin-line text-deep"></i>
                      <span>{business.location}</span>
                      <span className="text-warm-gray/60">•</span>
                      <span>{business.distance}</span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {business.specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-cream text-deep text-xs font-medium rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewBusiness(business.id);
                      }}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      View Details & Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Professional Services */}
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <h2 className="font-serif text-4xl text-deep text-center mb-12">
              Why Choose Professional Skincare Services?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-star-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-serif text-2xl text-deep mb-3">
                  Expert Care
                </h3>
                <p className="text-warm-gray">
                  Licensed professionals with years of experience in advanced skincare treatments
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-microscope-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-serif text-2xl text-deep mb-3">
                  Advanced Technology
                </h3>
                <p className="text-warm-gray">
                  Access to professional-grade equipment and cutting-edge treatment methods
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-heart-pulse-line text-3xl text-primary"></i>
                </div>
                <h3 className="font-serif text-2xl text-deep mb-3">
                  Personalized Plans
                </h3>
                <p className="text-warm-gray">
                  Customized treatment plans tailored to your unique skin concerns and goals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section - Clean style matching Marketplace */}
        <section className="py-16 px-6 lg:px-12 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif text-deep mb-6">
              Ready to Book Your Treatment?
            </h2>
            <p className="text-lg text-warm-gray mb-8 max-w-2xl mx-auto">
              Browse our curated selection of skincare professionals and find the perfect match for your needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDiscoverBusinesses}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors duration-fast shadow-lg whitespace-nowrap cursor-pointer"
              >
                Discover All Businesses
              </button>
              <button
                onClick={() => navigate('/services/search')}
                className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary-50 transition-colors duration-fast whitespace-nowrap cursor-pointer"
              >
                Search Near Me
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}