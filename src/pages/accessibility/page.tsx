import { useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const AccessibilityPage = () => {
  useEffect(() => {
    document.title = 'Accessibility Statement | Lorem Curae';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Lorem Curae\'s commitment to digital accessibility and inclusive design. Learn about our accessibility features and how to get support.');
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-lg shadow-sm p-8 lg:p-12" style={{ border: '1px solid rgba(232, 212, 204, 0.5)' }}>
            <header className="mb-12 text-center">
              <h1 className="text-3xl lg:text-4xl font-serif mb-4" style={{ color: '#2D2A26' }}>Accessibility Statement</h1>
              <p className="text-lg" style={{ color: '#6B635A' }}>Our commitment to inclusive skincare for everyone</p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Our Commitment</h2>
                <div className="space-y-4 leading-relaxed" style={{ color: '#6B635A' }}>
                  <p>
                    Lorem Curae is committed to ensuring digital accessibility for all users, including those with disabilities. 
                    We believe that everyone deserves access to personalized skincare guidance and education, regardless of their abilities.
                  </p>
                  <p>
                    We strive to make our platform accessible to the widest possible audience by adhering to recognized accessibility 
                    standards and continuously improving our user experience for all visitors.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Accessibility Standards</h2>
                <div className="space-y-4 leading-relaxed" style={{ color: '#6B635A' }}>
                  <p>Our website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.</p>
                  
                  <h3 className="text-xl font-medium" style={{ color: '#3D3A36' }}>Key Principles</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong style={{ color: '#2D2A26' }}>Perceivable:</strong> Information and user interface components must be presentable to users in ways they can perceive</li>
                    <li><strong style={{ color: '#2D2A26' }}>Operable:</strong> User interface components and navigation must be operable</li>
                    <li><strong style={{ color: '#2D2A26' }}>Understandable:</strong> Information and the operation of user interface must be understandable</li>
                    <li><strong style={{ color: '#2D2A26' }}>Robust:</strong> Content must be robust enough to be interpreted reliably by a wide variety of user agents</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Accessibility Features</h2>
                <div className="space-y-4 leading-relaxed" style={{ color: '#6B635A' }}>
                  <p>We have implemented several accessibility features to enhance your experience:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
                        <i className="ri-keyboard-line text-xl" style={{ color: '#C4704D' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>Keyboard Navigation</h4>
                      <p className="text-sm">Full keyboard navigation support with visible focus indicators and logical tab order.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
                        <i className="ri-contrast-line text-xl" style={{ color: '#7A8B7A' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>High Contrast</h4>
                      <p className="text-sm">Sufficient color contrast ratios to ensure text is readable for users with visual impairments.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
                        <i className="ri-text text-xl" style={{ color: '#C4704D' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>Screen Reader Support</h4>
                      <p className="text-sm">Semantic HTML structure and ARIA labels to support screen readers and other assistive technologies.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
                        <i className="ri-font-size-2 text-xl" style={{ color: '#7A8B7A' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>Scalable Text</h4>
                      <p className="text-sm">Text can be enlarged up to 200% using browser zoom without losing functionality or readability.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(232, 168, 136, 0.15)' }}>
                        <i className="ri-image-line text-xl" style={{ color: '#C4704D' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>Alternative Text</h4>
                      <p className="text-sm">Descriptive alt text for images and visual content to convey meaning to screen reader users.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#FDF8F5' }}>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
                        <i className="ri-error-warning-line text-xl" style={{ color: '#7A8B7A' }}></i>
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: '#2D2A26' }}>Clear Error Messages</h4>
                      <p className="text-sm">Descriptive error messages and form validation to help users understand and correct input errors.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Assistive Technology Compatibility</h2>
                <div className="space-y-4 leading-relaxed" style={{ color: '#6B635A' }}>
                  <p>Our platform has been tested with various assistive technologies to ensure compatibility:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
                    <li>Voice control software</li>
                    <li>Keyboard-only navigation</li>
                    <li>Magnification software</li>
                    <li>Switch access devices</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Feedback and Support</h2>
                <div className="space-y-4 leading-relaxed" style={{ color: '#6B635A' }}>
                  <p>
                    We welcome your feedback on the accessibility of Lorem Curae. If you encounter any barriers or have suggestions 
                    for improvement, please don't hesitate to contact us.
                  </p>
                  
                  <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(196, 112, 77, 0.05)', border: '1px solid rgba(196, 112, 77, 0.15)' }}>
                    <h4 className="font-semibold mb-3" style={{ color: '#2D2A26' }}>Contact Our Accessibility Team</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong style={{ color: '#2D2A26' }}>Email:</strong> accessibility@loremcurae.com</p>
                      <p><strong style={{ color: '#2D2A26' }}>Phone:</strong> +1 (555) 123-SKIN</p>
                      <p><strong style={{ color: '#2D2A26' }}>Response Time:</strong> We aim to respond to accessibility inquiries within 2 business days</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F8F4F0' }}>
                  <p className="text-sm" style={{ color: '#6B635A' }}>
                    <strong style={{ color: '#2D2A26' }}>Last Updated:</strong> January 2025<br/>
                    This accessibility statement will be reviewed and updated regularly to reflect our ongoing 
                    commitment to digital accessibility and any changes to our website or accessibility features.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccessibilityPage;