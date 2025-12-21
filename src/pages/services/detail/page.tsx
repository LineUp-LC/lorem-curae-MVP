import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

interface Treatment {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

interface Employee {
  id: string;
  name: string;
  title: string;
  image: string;
  rating: number;
  specialties: string[];
}

const mockTreatments: Treatment[] = [
  {
    id: '1',
    name: 'Signature Hydrafacial',
    duration: '60 min',
    price: '$180',
    description: 'Deep cleansing, exfoliation, and hydration treatment',
  },
  {
    id: '2',
    name: 'Chemical Peel',
    duration: '45 min',
    price: '$150',
    description: 'Exfoliating treatment for improved skin texture',
  },
  {
    id: '3',
    name: 'Microneedling',
    duration: '90 min',
    price: '$350',
    description: 'Collagen induction therapy for anti-aging',
  },
  {
    id: '4',
    name: 'LED Light Therapy',
    duration: '30 min',
    price: '$80',
    description: 'Non-invasive treatment for various skin concerns',
  },
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Lead Aesthetician',
    image: 'https://readdy.ai/api/search-image?query=professional%20female%20aesthetician%20in%20white%20coat%20smiling%20confident%20medical%20spa%20setting%20clean%20background%20portrait%20photography&width=200&height=200&seq=emp-1&orientation=squarish',
    rating: 4.9,
    specialties: ['Acne Treatment', 'Chemical Peels'],
  },
  {
    id: '2',
    name: 'Emily Rodriguez',
    title: 'Senior Esthetician',
    image: 'https://readdy.ai/api/search-image?query=friendly%20female%20skincare%20specialist%20professional%20attire%20spa%20environment%20warm%20smile%20portrait%20clean%20aesthetic&width=200&height=200&seq=emp-2&orientation=squarish',
    rating: 4.8,
    specialties: ['Hydrafacials', 'LED Therapy'],
  },
  {
    id: '3',
    name: 'Michael Park',
    title: 'Skincare Specialist',
    image: 'https://readdy.ai/api/search-image?query=professional%20male%20esthetician%20in%20spa%20uniform%20confident%20smile%20clinical%20setting%20portrait%20photography%20clean%20background&width=200&height=200&seq=emp-3&orientation=squarish',
    rating: 4.7,
    specialties: ['Microneedling', 'Laser Therapy'],
  },
];

export default function ServiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const businessData = {
    name: 'Radiance Skin Studio',
    rating: 4.9,
    reviewCount: 342,
    location: '123 Beauty Lane, Downtown, Los Angeles, CA 90012',
    phone: '(555) 123-4567',
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM, Sun: 10:00 AM - 5:00 PM',
    description: 'Radiance Skin Studio is a premier skincare destination offering advanced treatments and personalized care. Our team of licensed professionals uses cutting-edge technology and medical-grade products to help you achieve your skincare goals.',
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20spa%20reception%20area%20modern%20elegant%20interior%20soft%20lighting%20comfortable%20seating%20professional%20aesthetic%20clean%20design&width=800&height=500&seq=detail-1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=spa%20treatment%20room%20with%20massage%20bed%20soft%20towels%20calming%20ambiance%20professional%20equipment%20clean%20aesthetic&width=800&height=500&seq=detail-2&orientation=landscape',
      'https://readdy.ai/api/search-image?query=skincare%20products%20display%20shelf%20organized%20beauty%20products%20modern%20spa%20interior%20clean%20minimalist%20design&width=800&height=500&seq=detail-3&orientation=landscape',
    ],
    videos: [
      'https://readdy.ai/api/search-image?query=spa%20treatment%20demonstration%20video%20thumbnail%20professional%20skincare%20procedure%20modern%20clinic%20setting&width=800&height=500&seq=video-1&orientation=landscape',
    ],
  };

  const handleBookNow = () => {
    navigate(`/services/${id}/booking`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F3] to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/services/search')}
              className="flex items-center gap-2 text-[#2C5F4F] hover:text-[#234839] mb-4 cursor-pointer"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Search</span>
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-['Cormorant_Garamond'] text-5xl font-bold text-[#2C5F4F] mb-3">
                  {businessData.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <i className="ri-star-fill text-[#E8956C] text-xl"></i>
                    <span className="font-bold text-[#2C5F4F] text-xl">{businessData.rating}</span>
                    <span className="text-gray-600">({businessData.reviewCount} reviews)</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="text-[#2C5F4F] hover:underline cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                className="px-8 py-4 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors font-medium text-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-calendar-line mr-2"></i>
                Book Now
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#2C5F4F] border-b-2 border-[#2C5F4F]'
                  : 'text-gray-500 hover:text-[#2C5F4F]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'text-[#2C5F4F] border-b-2 border-[#2C5F4F]'
                  : 'text-gray-500 hover:text-[#2C5F4F]'
              }`}
            >
              Reviews
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Media Gallery */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Gallery
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {businessData.images.map((image, idx) => (
                    <div key={idx} className="relative h-64 rounded-xl overflow-hidden group">
                      <img
                        src={image}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {businessData.videos.map((video, idx) => (
                    <div key={`video-${idx}`} className="relative h-64 rounded-xl overflow-hidden group cursor-pointer">
                      <img
                        src={video}
                        alt={`Video ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <i className="ri-play-fill text-3xl text-[#2C5F4F]"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-4">
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">{businessData.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <i className="ri-map-pin-line text-[#2C5F4F] text-xl mt-1"></i>
                    <div>
                      <p className="font-medium text-[#2C5F4F] mb-1">Location</p>
                      <p className="text-gray-600 text-sm">{businessData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="ri-phone-line text-[#2C5F4F] text-xl mt-1"></i>
                    <div>
                      <p className="font-medium text-[#2C5F4F] mb-1">Phone</p>
                      <p className="text-gray-600 text-sm">{businessData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="ri-time-line text-[#2C5F4F] text-xl mt-1"></i>
                    <div>
                      <p className="font-medium text-[#2C5F4F] mb-1">Hours</p>
                      <p className="text-gray-600 text-sm">{businessData.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Treatments */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Our Treatments
                </h2>
                <div className="space-y-4">
                  {mockTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="p-6 border border-gray-200 rounded-xl hover:border-[#2C5F4F]/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F]">
                          {treatment.name}
                        </h3>
                        <span className="text-xl font-bold text-[#2C5F4F]">{treatment.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <i className="ri-time-line text-[#2C5F4F]"></i>
                        <span>{treatment.duration}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                  Meet Our Team
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {mockEmployees.map((employee) => (
                    <div key={employee.id} className="text-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                        <img
                          src={employee.image}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#2C5F4F] mb-1">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{employee.title}</p>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <i className="ri-star-fill text-[#E8956C]"></i>
                        <span className="font-medium text-[#2C5F4F]">{employee.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {employee.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#F8F6F3] text-[#2C5F4F] text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F] mb-6">
                Customer Reviews
              </h2>
              <p className="text-gray-600">Reviews section coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#2C5F4F]">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <p className="text-gray-600 mb-6">Share your experience with {businessData.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C5F4F] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="cursor-pointer">
                      <i className="ri-star-line text-3xl text-gray-300 hover:text-[#E8956C]"></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C5F4F] mb-2">Your Review</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20"
                  placeholder="Tell us about your experience..."
                  maxLength={500}
                ></textarea>
              </div>
              <button className="w-full px-6 py-3 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors font-medium whitespace-nowrap cursor-pointer">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
