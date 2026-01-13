import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

/**
 * AboutPage Component
 *
 * Premium, engaging About page with improved layout,
 * typography, spacing, and storytelling.
 */

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
              Our Story
            </p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-deep mb-6 leading-tight">
              We believe skincare should be simple, honest, and built around you
            </h1>
            <p className="text-lg text-warm-gray leading-relaxed">
              Lorem Curae—Latin for "Customer Care"—is more than a name. It's our promise to put you first at every step of your skincare journey.
            </p>
          </div>
        </section>

        {/* Subtle Divider */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-warm-gray/20"></div>
        </div>

        {/* Why We Built Curae Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-deep mb-4">
                Why We Built Curae
              </h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="space-y-6 text-warm-gray leading-relaxed">
              <p className="text-lg">
                Finding the right skincare shouldn't require hours of research, endless trial and error, or deciphering confusing ingredient lists. Yet for so many people, that's exactly what it takes.
              </p>
              <p className="text-lg">
                We built Lorem Curae to change that. We wanted to create a space where personalized guidance meets transparency—where you can discover products that actually work for your unique skin, from retailers you can trust.
              </p>
              <p className="text-lg">
                Our approach is rooted in science, not hype. In community, not isolation. In care, not commerce. Because your skin deserves thoughtful attention, and you deserve confidence in every choice you make.
              </p>
            </div>
          </div>
        </section>

        {/* Subtle Divider */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-warm-gray/20"></div>
        </div>

        {/* Mission + Values 2-Column Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              {/* Mission */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <i className="ri-compass-3-line text-primary text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-deep">Our Mission</h2>
                </div>
                <p className="text-warm-gray leading-relaxed mb-4">
                  To simplify the search for skincare that truly works. We curate personalized experiences that save you time, empower informed decisions, and connect you with trusted retailers.
                </p>
                <p className="text-warm-gray leading-relaxed">
                  Together, we're building a journey toward confidence and self-care—because your skin deserves the very best.
                </p>
              </div>

              {/* Values */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center">
                    <i className="ri-heart-3-line text-sage text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-deep">Our Values</h2>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-primary mt-1"></i>
                    <span className="text-warm-gray"><strong className="text-deep">Honesty</strong> — Transparent information so you can make informed choices.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-primary mt-1"></i>
                    <span className="text-warm-gray"><strong className="text-deep">Authenticity</strong> — Real stories, real results, no false promises.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="ri-check-line text-primary mt-1"></i>
                    <span className="text-warm-gray"><strong className="text-deep">Care</strong> — Your journey is our priority, every step of the way.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Principles Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-deep mb-4">
                Our Principles
              </h2>
              <p className="text-warm-gray max-w-xl mx-auto">
                The foundations that guide every decision we make
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-flask-line text-primary text-2xl"></i>
                </div>
                <h3 className="text-lg font-serif font-semibold text-deep mb-2">Science-Rooted</h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  Every recommendation is grounded in evidence-based research, not marketing hype or trends.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-group-line text-sage text-2xl"></i>
                </div>
                <h3 className="text-lg font-serif font-semibold text-deep mb-2">Community-Driven</h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  Real reviews from real people. Our trust scores reflect authentic community experiences.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-eye-line text-primary text-2xl"></i>
                </div>
                <h3 className="text-lg font-serif font-semibold text-deep mb-2">Fully Transparent</h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  Clear ingredient breakdowns, honest retailer rankings, and no hidden agendas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-deep mb-4">
                From Our Founder
              </h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-10 border border-warm-gray/10">
              <div className="relative rounded-xl overflow-hidden mb-8 group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-blush to-cream"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-deep/30">
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <i className="ri-play-fill text-3xl text-primary ml-1"></i>
                  </div>
                </div>
              </div>

              <blockquote className="text-lg text-warm-gray leading-relaxed italic text-center mb-6">
                "I started Lorem Curae because I was tired of spending countless hours researching products that didn't work for my skin. I wanted to create a space where everyone could find their perfect skincare match without the overwhelm."
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-deep">Ethan Jones</p>
                <p className="text-sm text-warm-gray">Founder & CEO</p>
              </div>
            </div>
          </div>
        </section>

        {/* Subtle Divider */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-warm-gray/20"></div>
        </div>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-deep mb-4">
              Join Our Community
            </h2>
            <p className="text-warm-gray mb-8">
              Start your personalized skincare journey today
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/auth/signup"
                className="px-8 py-3 bg-primary hover:bg-dark text-white rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Get Started
              </a>
              <a
                href="/skin-survey"
                className="px-8 py-3 bg-white border-2 border-primary text-deep hover:bg-cream rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
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
