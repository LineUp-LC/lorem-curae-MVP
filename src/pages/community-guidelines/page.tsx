
import { useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const CommunityGuidelinesPage = () => {
  useEffect(() => {
    document.title = 'Community Guidelines | Lorem Curae';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Lorem Curae community guidelines for respectful, safe, and supportive skincare discussions. Learn about our community standards and expectations.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'community guidelines, Lorem Curae community, skincare community, community standards, safe space');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
            <header className="mb-12 text-center">
              <h1 className="text-3xl lg:text-4xl font-light text-forest-900 mb-4">Community Guidelines</h1>
              <p className="text-gray-600 text-lg">Building a supportive and inclusive skincare community</p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Our Community Values</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Lorem Curae is built on the belief that everyone deserves to feel confident in their skin. 
                    Our community is a safe space where members can share experiences, learn from each other, 
                    and support one another on their skincare journeys.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-heart-line text-sage-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-forest-900 mb-2">Inclusivity</h3>
                      <p className="text-sm text-gray-600">All skin types, tones, and concerns are welcome and celebrated.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-shield-check-line text-sage-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-forest-900 mb-2">Safety</h3>
                      <p className="text-sm text-gray-600">Evidence-based advice and responsible sharing of skincare information.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-group-line text-sage-600 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-forest-900 mb-2">Support</h3>
                      <p className="text-sm text-gray-600">Encouraging and constructive interactions that help everyone succeed.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Community Standards</h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-xl font-medium text-green-800 mb-3 flex items-center">
                      <i className="ri-check-line mr-2"></i>
                      What We Encourage
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-green-700">
                      <li>Sharing personal experiences with products and routines</li>
                      <li>Asking questions and seeking advice from the community</li>
                      <li>Supporting others with encouragement and helpful tips</li>
                      <li>Sharing progress photos and celebrating achievements</li>
                      <li>Discussing ingredients, products, and skincare science</li>
                      <li>Recommending products that worked for you (with context)</li>
                      <li>Being patient and understanding with newcomers</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-xl font-medium text-red-800 mb-3 flex items-center">
                      <i className="ri-close-line mr-2"></i>
                      What We Don't Allow
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-red-700">
                      <li>Harassment, bullying, or personal attacks</li>
                      <li>Discrimination based on skin type, appearance, or background</li>
                      <li>Spam, self-promotion, or excessive commercial content</li>
                      <li>Sharing medical advice or diagnosing skin conditions</li>
                      <li>Posting graphic or disturbing images without warnings</li>
                      <li>Sharing personal information of other users</li>
                      <li>Spreading misinformation about skincare or health</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Content Guidelines</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  
                  <h3 className="text-xl font-medium text-forest-800">Photos and Images</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Progress photos are welcome and encouraged</li>
                    <li>Include content warnings for severe skin conditions</li>
                    <li>Respect others' privacy - only share your own photos</li>
                    <li>Avoid heavily filtered or edited images when showing results</li>
                  </ul>

                  <h3 className="text-xl font-medium text-forest-800 mt-6">Product Discussions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide context when recommending products (skin type, concerns, etc.)</li>
                    <li>Disclose any affiliations or sponsored content</li>
                    <li>Focus on helpful, honest reviews rather than excessive promotion</li>
                    <li>Remember that what works for you may not work for everyone</li>
                  </ul>

                  <h3 className="text-xl font-medium text-forest-800 mt-6">Advice and Recommendations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Share personal experiences rather than medical advice</li>
                    <li>Encourage consulting professionals for serious concerns</li>
                    <li>Be clear about what worked for your specific situation</li>
                    <li>Avoid making universal claims about products or ingredients</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Reporting and Moderation</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Our moderation team works to maintain a positive environment for all community members. 
                    We review reported content and take appropriate action when guidelines are violated.
                  </p>

                  <h3 className="text-xl font-medium text-forest-800">How to Report</h3>
                  <p>If you encounter content that violates our guidelines:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use the "Report" button on posts or comments</li>
                    <li>Contact our moderation team directly at community@loremcurae.com</li>
                    <li>Provide specific details about the violation</li>
                  </ul>

                  <h3 className="text-xl font-medium text-forest-800 mt-6">Enforcement Actions</h3>
                  <p>Depending on the severity and frequency of violations, actions may include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Content removal</li>
                    <li>Warning messages</li>
                    <li>Temporary restrictions on posting</li>
                    <li>Account suspension</li>
                    <li>Permanent community ban for severe violations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Professional Boundaries</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Reminder</h3>
                    <p className="text-yellow-700">
                      Lorem Curae community members are not medical professionals. While we encourage 
                      sharing experiences and support, serious skin conditions should always be evaluated 
                      by qualified dermatologists or healthcare providers.
                    </p>
                  </div>

                  <h3 className="text-xl font-medium text-forest-800">When to Seek Professional Help</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sudden or severe skin changes</li>
                    <li>Persistent rashes or irritation</li>
                    <li>Signs of infection or allergic reactions</li>
                    <li>Concerns about moles or skin growths</li>
                    <li>Conditions that significantly impact quality of life</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Privacy and Safety</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <h3 className="text-xl font-medium text-forest-800">Protecting Your Privacy</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Don't share personal information like addresses or phone numbers</li>
                    <li>Use privacy settings to control who can see your posts</li>
                    <li>Be cautious about sharing detailed personal routines or schedules</li>
                    <li>Report any attempts to solicit personal information</li>
                  </ul>

                  <h3 className="text-xl font-medium text-forest-800 mt-6">Safe Interactions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Keep conversations public when possible</li>
                    <li>Be wary of users offering "exclusive" products or treatments</li>
                    <li>Trust your instincts - report uncomfortable interactions</li>
                    <li>Remember that not everyone online has good intentions</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Appeals Process</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    If you believe your content was removed or your account was restricted in error, 
                    you can appeal the decision:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Contact our appeals team at appeals@loremcurae.com</li>
                    <li>Include your username and details about the action taken</li>
                    <li>Explain why you believe the action was incorrect</li>
                    <li>We will review appeals within 3-5 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-forest-900 mb-4">Contact Us</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Have questions about these guidelines or need to report an issue? 
                    We're here to help maintain our positive community environment.
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-forest-900 mb-3">Community Support</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> community@loremcurae.com</p>
                      <p><strong>Response Time:</strong> 24-48 hours</p>
                      <p><strong>Emergency Reports:</strong> Use in-platform reporting for immediate attention</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-sage-800 mb-3">Thank You</h3>
                  <p className="text-sage-700">
                    Thank you for being part of the Lorem Curae community. Together, we're building 
                    a space where everyone can learn, grow, and feel confident in their skincare journey. 
                    Your participation helps make this community a welcoming place for all.
                  </p>
                </div>
              </section>

              <section>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Last Updated:</strong> January 2025<br/>
                    These guidelines may be updated periodically. We will notify the community 
                    of any significant changes through platform announcements.
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

export default CommunityGuidelinesPage;
