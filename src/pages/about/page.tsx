import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sage-600 to-sage-800"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              We Are Lorem Curae
            </h1>
            <p className="text-xl text-sage-100 leading-relaxed">
              Lorem Curae is a home built on honesty, authenticity, and customer care—values that are at the core of everything we do. Our name, Lorem Curae, derives from Latin, means "Customer Care," a philosophy we embrace wholeheartedly. Lorem Curae is more than just an experience; it's a promise—a commitment to put you, the user, first at every step of your skincare journey.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <div className="w-20 h-1 bg-sage-600 mx-auto mb-8"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We believe that finding products for you shouldn't take hours of your day. So we dedicated our time to curating a user-friendly website that offers an engaging and personalized experience simplifying the search for products.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We aim to present you with a wealth of services designed to guide you on your journey. Together, we embark on a journey to empower you with confidence and self-care, because your skin deserves the very best.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                So let's discover that perfect match for your skin, effortlessly. :-)
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-cream-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 flex items-center justify-center bg-sage-100 text-sage-600 rounded-full mx-auto mb-4">
                  <i className="ri-heart-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Honesty</h3>
                <p className="text-gray-600">
                  We provide transparent information about ingredients, products, and services so you can make informed decisions.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 flex items-center justify-center bg-coral-100 text-coral-600 rounded-full mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Authenticity</h3>
                <p className="text-gray-600">
                  We celebrate real stories, real results, and real people. No filters, no false promises—just genuine care.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mx-auto mb-4">
                  <i className="ri-customer-service-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Care</h3>
                <p className="text-gray-600">
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
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Founder Story</h2>
              <div className="w-20 h-1 bg-sage-600 mx-auto mb-8"></div>
            </div>

            {/* Video Card */}
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-sage-100 to-cream-100">
                  {/* Blank video placeholder */}
                </div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-xl group-hover:scale-110 transition-transform">
                    <i className="ri-play-fill text-4xl text-sage-600 ml-1"></i>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                  "I started Lorem Curae because I was tired of spending countless hours researching products that didn't work for my skin. I wanted to create a space where everyone could find their perfect skincare match without the overwhelm. Today, I'm proud to say we're helping thousands of people discover what truly works for them."
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 text-lg">Ethan Jones</p>
                  <p className="text-gray-600">Founder & CEO, Lorem Curae</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sage-600 to-sage-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Our Community
            </h2>
            <p className="text-xl text-sage-100 mb-8">
              Start your personalized skincare journey today and discover what works for you
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="/signup"
                className="px-8 py-4 bg-white text-sage-700 rounded-lg font-semibold hover:bg-sage-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Get Started
              </a>
              <a
                href="/discover"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
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