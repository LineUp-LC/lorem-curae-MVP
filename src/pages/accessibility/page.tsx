
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
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'accessibility, inclusive design, WCAG, screen reader, Lorem Curae accessibility, digital inclusion');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
            <header className="mb-12 text-center">
              <h1 className="text-3xl lg:text-4xl font-light text-forest-900 mb-4">Accessibility Statement</h1>
              <p className="text-gray-600 text-lg">Our commitment to inclusive skincare for everyone</p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Our Commitment</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
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
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Accessibility Standards</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Our website aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities.</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Key Principles</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Perceivable:</strong> Information and user interface components must be presentable to users in ways they can perceive</li>
                    <li><strong>Operable:</strong> User interface components and navigation must be operable</li>
                    <li><strong>Understandable:</strong> Information and the operation of user interface must be understandable</li>
                    <li><strong>Robust:</strong> Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Accessibility Features</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We have implemented several accessibility features to enhance your experience:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-keyboard-line text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">Keyboard Navigation</h4>
                      <p className="text-sm">Full keyboard navigation support with visible focus indicators and logical tab order.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-contrast-line text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">High Contrast</h4>
                      <p className="text-sm">Sufficient color contrast ratios to ensure text is readable for users with visual impairments.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-text text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">Screen Reader Support</h4>
                      <p className="text-sm">Semantic HTML structure and ARIA labels to support screen readers and other assistive technologies.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-font-size-2 text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">Scalable Text</h4>
                      <p className="text-sm">Text can be enlarged up to 200% using browser zoom without losing functionality or readability.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-image-line text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">Alternative Text</h4>
                      <p className="text-sm">Descriptive alt text for images and visual content to convey meaning to screen reader users.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-error-warning-line text-sage-600 text-xl"></i>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">Clear Error Messages</h4>
                      <p className="text-sm">Descriptive error messages and form validation to help users understand and correct input errors.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Assistive Technology Compatibility</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
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
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Third-Party Content</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    While we strive to ensure accessibility across our entire platform, some third-party content and 
                    external links may not fully meet our accessibility standards. We work with our partners to 
                    improve accessibility and encourage them to adopt inclusive design practices.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Ongoing Efforts</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Accessibility is an ongoing commitment. Our efforts include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Regular accessibility audits and testing</li>
                    <li>User feedback integration and continuous improvement</li>
                    <li>Team training on accessibility best practices</li>
                    <li>Collaboration with the disability community</li>
                    <li>Staying current with accessibility standards and guidelines</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Known Limitations</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We are aware of some areas where we continue to work on improvements:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Some complex interactive elements in our skin assessment tool</li>
                    <li>Certain video content that may lack captions</li>
                    <li>PDF documents that may not be fully accessible</li>
                  </ul>
                  <p>We are actively working to address these limitations in future updates.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Feedback and Support</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We welcome your feedback on the accessibility of Lorem Curae. If you encounter any barriers or have suggestions 
                    for improvement, please don't hesitate to contact us.
                  </p>
                  
                  <div className="bg-sage-50 p-6 rounded-lg border border-sage-200">
                    <h4 className="font-semibold text-forest-900 mb-3">Contact Our Accessibility Team</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> accessibility@loremcurae.com</p>
                      <p><strong>Phone:</strong> +1 (555) 123-SKIN</p>
                      <p><strong>Response Time:</strong> We aim to respond to accessibility inquiries within 2 business days</p>
                    </div>
                  </div>
                  
                  <p>
                    When reporting accessibility issues, please include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The web page or feature where you encountered the issue</li>
                    <li>A description of the problem</li>
                    <li>The assistive technology you were using (if applicable)</li>
                    <li>Your browser and operating system information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Alternative Formats</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    If you need information from our website in an alternative format, such as large print, audio, 
                    or a different file format, please contact us. We will work with you to provide the information 
                    you need in a format that works best for you.
                  </p>
                </div>
              </section>

              <section>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Last Updated:</strong> January 2025<br/>
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
