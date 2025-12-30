import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-forest-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 - Brand */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-3xl font-serif text-cream-50">Lorem Curae</span>
            </div>
            <p className="text-sm text-cream-200 leading-relaxed">
              Empowering authentic skincare journeys through science-backed personalization, holistic wellness, and collective wisdom.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-100/10 text-cream-100 hover:bg-sage-600 hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-100/10 text-cream-100 hover:bg-sage-600 hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="TikTok"
              >
                <i className="ri-tiktok-line text-lg"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-100/10 text-cream-100 hover:bg-sage-600 hover:scale-110 transition-all duration-200 cursor-pointer"
                aria-label="YouTube"
              >
                <i className="ri-youtube-line text-lg"></i>
              </a>
            </div>
          </div>

          {/* Column 2 - Stay Connected */}
          <div className="space-y-6">
  <h4 className="text-xs uppercase tracking-wider font-semibold text-cream-50">
    Stay Connected
  </h4>

  <form className="space-y-3">
    <div className="relative">
      <input
        id="newsletter-email"
        name="email"
        type="email"
        placeholder="Your email address"
        autoComplete="email"
        className="w-full bg-transparent border-b border-cream-300 text-cream-100 placeholder-cream-400 py-2 pr-10 focus:outline-none focus:border-sage-400 transition-colors"
      />

      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-cream-100 hover:text-sage-400 transition-colors cursor-pointer"
        aria-label="Subscribe"
      >
        <i className="ri-arrow-right-line text-xl"></i>
      </button>
    </div>

    <p className="text-xs text-cream-400">
      <a
        href="/privacy"
        className="hover:text-cream-200 transition-colors cursor-pointer"
      >
        Privacy Policy
      </a>
    </p>
  </form>
</div>

          {/* Column 3 - Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-cream-50">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Discover', 'Ingredients', 'Routines', 'Shop', 'Community', 'Learn', 'About'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-sm text-cream-200 hover:text-cream-50 transition-colors cursor-pointer"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-cream-50">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="/contact" className="text-sm text-cream-200 hover:text-cream-50 transition-colors cursor-pointer">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-cream-200 hover:text-cream-50 transition-colors cursor-pointer">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/accessibility" className="text-sm text-cream-200 hover:text-cream-50 transition-colors cursor-pointer">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="/community-guidelines" className="text-sm text-cream-200 hover:text-cream-50 transition-colors cursor-pointer">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-cream-100/10">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-xs text-cream-400 text-center">
              © 2025 Lorem Curae. Empowering authentic skincare journeys.
            </p>
            <div className="text-center">
              <a 
                href="https://readdy.ai/?origin=logo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cream-500 hover:text-cream-300 transition-colors cursor-pointer"
              >
                Website Builder
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;