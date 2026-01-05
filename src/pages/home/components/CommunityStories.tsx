import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * CommunityStories Component
 * 
 * COPY UPDATES APPLIED:
 * - Edit 3: Changed "Products Analyzed" to "Marketplace Brands" and "50,000+" to "100+"
 */

const testimonials = [
  {
    id: 1,
    quote: "I spent years bouncing between influencer recommendations and overwhelming product walls. Lorem Curae was the first place that actually understood my skin—not just sold to it.",
    name: "Sarah M.",
    skin: "Combination Skin",
    journey: "8 months",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    result: 'Found her perfect routine',
  },
  {
    id: 2,
    quote: "My dermatologist was surprised at how well I understood my routine. I told her I finally had tools that explained the 'why' behind every product.",
    name: "Keisha L.",
    skin: "Sensitive Skin",
    journey: "1 year",
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    result: 'Reduced irritation by 80%',
  },
  {
    id: 3,
    quote: "As someone with rosacea, I was terrified of trying new products. The ingredient transparency and AI guidance gave me confidence I never had before.",
    name: "Emma T.",
    skin: "Rosacea-prone",
    journey: "6 months",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    result: 'Calmed flare-ups significantly',
  },
];

// EDIT 3: Changed "Products Analyzed" to "Marketplace Brands" and "50,000+" to "100+"
const stats = [
  { value: '10,000+', label: 'Community Members' },
  { value: '100+', label: 'Marketplace Brands' },
  { value: '1,200+', label: 'Ingredients Decoded' },
  { value: '4.9', label: 'Average Rating' },
];

const CommunityStories = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24" style={{ backgroundColor: '#FDF8F5' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
            <i className="ri-group-line text-sm" style={{ color: '#C4704D' }}></i>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8B4D35' }}>Community Voices</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-serif mb-6" style={{ color: '#2D2A26' }}>
            Stories from people like you
          </h2>
          
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B635A' }}>
            These aren't influencers. They're real people who were frustrated with skincare—until they found tools that actually worked.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#C4704D' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: '#6B635A' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <blockquote className="text-2xl lg:text-3xl font-serif italic leading-relaxed mb-8" style={{ color: '#2D2A26' }}>
              "{testimonials[activeTestimonial].quote}"
            </blockquote>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src={testimonials[activeTestimonial].avatar} 
                alt={testimonials[activeTestimonial].name}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid rgba(122, 139, 122, 0.2)' }}
              />
              <div className="text-left">
                <p className="font-semibold text-lg" style={{ color: '#2D2A26' }}>{testimonials[activeTestimonial].name}</p>
                <p style={{ color: '#6B635A' }}>{testimonials[activeTestimonial].skin} • {testimonials[activeTestimonial].journey}</p>
              </div>
            </div>

            {/* Result Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)', border: '1px solid rgba(122, 139, 122, 0.2)' }}>
              <i className="ri-checkbox-circle-fill" style={{ color: '#7A8B7A' }}></i>
              <span className="font-medium" style={{ color: '#5A6B5A' }}>{testimonials[activeTestimonial].result}</span>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="h-2 rounded-full transition-all cursor-pointer"
                  style={{
                    width: i === activeTestimonial ? '32px' : '8px',
                    backgroundColor: i === activeTestimonial ? '#C4704D' : 'rgba(196, 112, 77, 0.2)',
                  }}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Story Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((story, index) => (
            <div 
              key={story.id}
              onClick={() => setActiveTestimonial(index)}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer"
              style={{
                border: index === activeTestimonial 
                  ? '1px solid rgba(196, 112, 77, 0.4)' 
                  : '1px solid rgba(232, 212, 204, 0.3)',
                boxShadow: index === activeTestimonial ? '0 0 0 3px rgba(196, 112, 77, 0.1)' : undefined,
              }}
            >
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={story.avatar} 
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: '2px solid rgba(122, 139, 122, 0.2)' }}
                />
                <div>
                  <p className="font-semibold" style={{ color: '#2D2A26' }}>{story.name}</p>
                  <p className="text-sm" style={{ color: '#6B635A' }}>{story.skin}</p>
                </div>
              </div>

              {/* Quote Preview */}
              <p className="text-sm leading-relaxed line-clamp-3 italic mb-4" style={{ color: '#6B635A' }}>
                "{story.quote.substring(0, 100)}..."
              </p>

              {/* Result */}
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#7A8B7A' }}>
                <i className="ri-checkbox-circle-fill"></i>
                <span>{story.result}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/community"
            className="inline-flex items-center space-x-3 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C4704D' }}
          >
            <span>Read More Stories</span>
            <i className="ri-arrow-right-line text-xl"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityStories;