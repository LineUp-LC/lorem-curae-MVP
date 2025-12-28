import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

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
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section - Clean style matching Discover/Ingredients */}
        <section className="py-12 px-6 lg:px-12 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl lg:text-6xl font-serif text-forest-900 mb-6">
                Discover Professional Skincare Services
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find trusted skincare professionals, spas, and clinics near you for expert treatments and personalized care
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Businesses Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600/10 rounded-full mb-4">
                <i className="ri-star-fill text-sage-600"></i>
                <span className="text-sm font-medium text-sage-600">Proudly Featured</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-4">
                Top-Rated Skincare Professionals
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Handpicked businesses with exceptional reviews and proven expertise in skincare treatments
              </p>
              <button
                onClick={handleDiscoverBusinesses}
                className="px-8 py-4 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all shadow-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-compass-line mr-2"></i>
                Discover All Businesses
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
                    {business.featured && (
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-sage-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
                          <i className="ri-star-fill"></i>
                          Featured
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-forest-800">
                        {business.priceRange}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-forest-800 mb-2">
                      {business.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <i className="ri-star-fill text-amber-500"></i>
                        <span className="font-bold text-forest-800">{business.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({business.reviewCount} reviews)</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <i className="ri-map-pin-line text-forest-800"></i>
                      <span>{business.location}</span>
                      <span className="text-gray-400">•</span>
                      <span>{business.distance}</span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {business.specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-cream-100 text-forest-800 text-xs font-medium rounded-full"
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
                      className="w-full px-6 py-3 bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-all text-sm font-semibold whitespace-nowrap cursor-pointer"
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
            <h2 className="text-4xl font-serif text-forest-900 text-center mb-12">
              Why Choose Professional Skincare Services?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-forest-800/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-star-line text-3xl text-forest-800"></i>
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest-800 mb-3">
                  Expert Care
                </h3>
                <p className="text-gray-600">
                  Licensed professionals with years of experience in advanced skincare treatments
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-forest-800/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-microscope-line text-3xl text-forest-800"></i>
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest-800 mb-3">
                  Advanced Technology
                </h3>
                <p className="text-gray-600">
                  Access to professional-grade equipment and cutting-edge treatment methods
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-forest-800/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-heart-pulse-line text-3xl text-forest-800"></i>
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest-800 mb-3">
                  Personalized Plans
                </h3>
                <p className="text-gray-600">
                  Customized treatment plans tailored to your unique skin concerns and goals
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}