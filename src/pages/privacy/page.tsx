
import { useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const PrivacyPage = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Lorem Curae';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about Lorem Curae\'s privacy practices, data collection, and how we protect your personal information in our comprehensive privacy policy.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'privacy policy, data protection, personal information, Lorem Curae, skincare data, user privacy');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
            <header className="mb-12 text-center">
              <h1 className="text-3xl lg:text-4xl font-light text-forest-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600 text-lg">Last updated: January 2025</p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <h3 className="text-xl font-medium text-forest-800">Personal Information</h3>
                  <p>We collect information you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account registration details (name, email, password)</li>
                    <li>Skin survey responses and skin type assessments</li>
                    <li>Product preferences and skincare routine data</li>
                    <li>Community posts, reviews, and interactions</li>
                    <li>Purchase history and transaction information</li>
                    <li>Communication preferences and feedback</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-forest-800 mt-6">Automatically Collected Information</h3>
                  <p>When you use our services, we automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and interaction data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide personalized skincare recommendations</li>
                    <li>Create and maintain your skin profile</li>
                    <li>Process purchases and manage your account</li>
                    <li>Send you relevant product updates and educational content</li>
                    <li>Improve our services through analytics and research</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">3. Information Sharing</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">With Your Consent</h3>
                  <p>We share information when you explicitly consent, such as when participating in community features or product reviews.</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Service Providers</h3>
                  <p>We work with trusted third-party providers who help us operate our platform, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment processors for secure transactions</li>
                    <li>Cloud storage and hosting services</li>
                    <li>Analytics and marketing platforms</li>
                    <li>Customer support tools</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-forest-800">Legal Requirements</h3>
                  <p>We may disclose information when required by law or to protect our rights, users, or others.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">4. Data Security</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We implement robust security measures to protect your personal information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Secure data centers and infrastructure</li>
                  </ul>
                  <p>While we strive to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">5. Your Rights and Choices</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>You have several rights regarding your personal information:</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Access and Portability</h3>
                  <p>Request access to your personal data and receive a copy in a portable format.</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Correction</h3>
                  <p>Update or correct inaccurate personal information through your account settings.</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Deletion</h3>
                  <p>Request deletion of your account and associated data, subject to legal retention requirements.</p>
                  
                  <h3 className="text-xl font-medium text-forest-800">Communication Preferences</h3>
                  <p>Opt out of marketing communications while still receiving essential service updates.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">6. Cookies and Tracking</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We use cookies and similar technologies to enhance your experience:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                    <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements and content</li>
                  </ul>
                  <p>You can control cookie settings through your browser, though this may affect platform functionality.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">7. Children's Privacy</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Lorem Curae is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will take steps to delete such information promptly.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">8. International Data Transfers</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>Your information may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place for international transfers, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Adequacy decisions from relevant authorities</li>
                    <li>Standard contractual clauses</li>
                    <li>Certification schemes and codes of conduct</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">9. Changes to This Policy</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We may update this privacy policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes through email or prominent notices on our platform. Continued use of our services after such changes constitutes acceptance of the updated policy.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">10. Contact Information</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>If you have questions about this privacy policy or our data practices, please contact us:</p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p><strong>Email:</strong> privacy@loremcurae.com</p>
                    <p><strong>Address:</strong> Lorem Curae Privacy Office<br/>
                    123 Skincare Boulevard<br/>
                    Beauty District, CA 90210</p>
                    <p><strong>Phone:</strong> +1 (555) 123-SKIN</p>
                  </div>
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

export default PrivacyPage;
