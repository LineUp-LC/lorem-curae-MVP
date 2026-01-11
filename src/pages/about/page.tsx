import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

/**
 * AboutPage Component
 * 
 * MOBILE FIXES APPLIED:
 * - Safe area padding for iOS notch devices
 * - Responsive header offset (64px mobile, 80px desktop)
 */

const AboutPage = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />
      
      {/* FIXED: Mobile-first padding with iOS safe area support */}
      <main 
        className="pt-16 sm:pt-20"
        style={{ 
          paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))',
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            main {
              padding-top: calc(80px + env(safe-area-inset-top, 0px)) !important;
            }
          }
        `}</style>
        
        {/* Hero Section */}
        <section className="py-16 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-serif mb-6" style={{ color: '#2D2A26' }}>
              We Are Lorem Curae
            </h1>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: '#6B635A' }}>
              Lorem Curae is a home built on honesty, authenticity, and customer care—values that are at the core of everything we do. Our name, Lorem Curae, derives from Latin, means "Customer Care," a philosophy we embrace wholeheartedly. Lorem Curae is more than just an experience; it's a promise—a commitment to put you, the user, first at every step of your skincare journey.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif mb-6" style={{ color: '#2D2A26' }}>Our Mission</h2>
              <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: '#C4704D' }}></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#6B635A' }}>
                We believe that finding products for you shouldn't take hours of your day. So we dedicated our time to curating a user-friendly website that offers an engaging and personalized experience simplifying the search for products.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#6B635A' }}>
                We aim to present you with a wealth of services designed to guide you on your journey. Together, we embark on a journey to empower you with confidence and self-care, because your skin deserves the very best.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: '#6B635A' }}>
                So let's discover that perfect match for your skin, effortlessly. :-)
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20" style={{ backgroundColor: '#FDF8F5' }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-4xl font-serif text-center mb-12" style={{ color: '#2D2A26' }}>Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)', color: '#C4704D' }}>
                  <i className="ri-heart-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-serif mb-3" style={{ color: '#2D2A26' }}>Honesty</h3>
                <p style={{ color: '#6B635A' }}>
                  We provide transparent information about ingredients, products, and services so you can make informed decisions.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)', color: '#7A8B7A' }}>
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-serif mb-3" style={{ color: '#2D2A26' }}>Authenticity</h3>
                <p style={{ color: '#6B635A' }}>
                  We celebrate real stories, real results, and real people. No filters, no false promises—just genuine care.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(232, 168, 136, 0.15)', color: '#C4704D' }}>
                  <i className="ri-customer-service-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-serif mb-3" style={{ color: '#2D2A26' }}>Customer Care</h3>
                <p style={{ color: '#6B635A' }}>
                  Your journey is our priority. We're here to support, guide, and empower you every step of the way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif mb-6" style={{ color: '#2D2A26' }}>Founder Story</h2>
              <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: '#C4704D' }}></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                <div className="aspect-video" style={{ background: 'linear-gradient(135deg, #E8D4CC 0%, #FDF8F5 100%)' }}>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 42, 38, 0.3)' }}>
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-xl group-hover:scale-110 transition-transform">
                    <i className="ri-play-fill text-4xl ml-1" style={{ color: '#C4704D' }}></i>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-lg leading-relaxed italic" style={{ color: '#6B635A' }}>
                  "I started Lorem Curae because I was tired of spending countless hours researching products that didn't work for my skin. I wanted to create a space where everyone could find their perfect skincare match without the overwhelm. Today, I'm proud to say we're helping thousands of people discover what truly works for them."
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-lg" style={{ color: '#2D2A26' }}>Ethan Jones</p>
                  <p style={{ color: '#6B635A' }}>Founder & CEO, Lorem Curae</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 lg:px-12" style={{ backgroundColor: '#F8F4F0' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif mb-6" style={{ color: '#2D2A26' }}>
              Join Our Community
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#6B635A' }}>
              Start your personalized skincare journey today and discover what works for you
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/auth/signup"
                className="px-8 py-4 text-white rounded-full font-semibold transition-colors duration-200 shadow-lg whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: '#C4704D' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8B4D35'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#C4704D'}
              >
                Get Started
              </a>
              <a
                href="/skin-survey"
                className="px-8 py-4 bg-transparent rounded-full font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer"
                style={{ border: '2px solid #C4704D', color: '#C4704D' }}
              >
                Take the Quiz
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;