
import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.title = 'Frequently Asked Questions | Lorem Curae';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find answers to common questions about Lorem Curae skincare platform, products, skin assessments, orders, and account management.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'FAQ, frequently asked questions, Lorem Curae help, skincare questions, product support, account help');
    }
  }, []);

  const faqData: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is Lorem Curae?',
      answer: 'Lorem Curae is a comprehensive skincare platform that provides personalized skincare recommendations based on scientific assessments. We combine dermatological expertise with AI technology to help you build effective, personalized skincare routines.'
    },
    {
      category: 'general',
      question: 'How does the skin assessment work?',
      answer: 'Our skin assessment uses a comprehensive survey that evaluates your skin type, concerns, lifestyle factors, and preferences. The results are analyzed using scientifically-backed algorithms to provide personalized product and routine recommendations.'
    },
    {
      category: 'general',
      question: 'Is Lorem Curae suitable for all skin types?',
      answer: 'Yes! Our platform is designed to work with all skin types, tones, and concerns. Our assessment includes questions about sensitivity, allergies, and specific conditions to ensure safe, effective recommendations for everyone.'
    },
    {
      category: 'general',
      question: 'How often should I retake the skin assessment?',
      answer: 'We recommend retaking the assessment every 3-6 months or when you experience significant changes in your skin, lifestyle, or skincare goals. Seasonal changes, hormonal shifts, and age can all affect your skin\'s needs.'
    },

    // Account & Profile
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top navigation or on any page. You\'ll need to provide your email, create a password, and complete our skin assessment to get personalized recommendations.'
    },
    {
      category: 'account',
      question: 'Can I change my profile information?',
      answer: 'Yes! You can update your profile information, skin assessment results, and preferences at any time through your account settings or the "My Skin" page.'
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'You can request account deletion through your account settings or by contacting our support team. Please note that this action cannot be undone, and all your data will be permanently removed.'
    },
    {
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a reset link. Follow the instructions in the email to create a new password.'
    },

    // Products & Recommendations
    {
      category: 'products',
      question: 'How are product recommendations personalized?',
      answer: 'Our recommendations are based on your skin assessment results, including skin type, concerns, sensitivities, and preferences. We also consider factors like climate, lifestyle, and budget to suggest the most suitable products.'
    },
    {
      category: 'products',
      question: 'Can I purchase products directly through Lorem Curae?',
      answer: 'Yes! Our marketplace features curated products from trusted brands. You can purchase recommended products directly through our platform with secure checkout and fast shipping.'
    },
    {
      category: 'products',
      question: 'What if a recommended product doesn\'t work for me?',
      answer: 'We understand that skincare is personal. If a product doesn\'t work, you can leave a review, update your preferences, and retake the assessment for new recommendations. Many products also offer satisfaction guarantees.'
    },
    {
      category: 'products',
      question: 'Are the products cruelty-free and vegan?',
      answer: 'We clearly label all products with their certifications and ingredients. You can filter products by preferences like cruelty-free, vegan, fragrance-free, and other criteria that matter to you.'
    },

    // Orders & Shipping
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status in your account dashboard under "Order History."'
    },
    {
      category: 'orders',
      question: 'What are the shipping costs and delivery times?',
      answer: 'Shipping costs vary by location and order size. Standard shipping is typically 3-7 business days, with expedited options available. Orders over $50 qualify for free standard shipping.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or canceled within 1 hour of placement. After that, please contact our support team immediately, and we\'ll do our best to help before the order ships.'
    },
    {
      category: 'orders',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unopened products in original packaging. Opened products may be returned if they caused an adverse reaction. Return shipping costs may apply.'
    },

    // Technical Support
    {
      category: 'technical',
      question: 'Why isn\'t the website loading properly?',
      answer: 'Try clearing your browser cache and cookies, or try a different browser. If issues persist, check your internet connection or contact our technical support team.'
    },
    {
      category: 'technical',
      question: 'Can I use Lorem Curae on my mobile device?',
      answer: 'Yes! Our platform is fully optimized for mobile devices and tablets. You can access all features through your mobile browser for a seamless experience.'
    },
    {
      category: 'technical',
      question: 'How do I update my communication preferences?',
      answer: 'Go to your account settings and select "Communication Preferences" to manage email notifications, newsletters, and promotional communications.'
    },
    {
      category: 'technical',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about how we collect, use, and protect your information.'
    }
  ];

  const categories = [
    { id: 'general', name: 'General', icon: 'ri-question-line' },
    { id: 'account', name: 'Account & Profile', icon: 'ri-user-line' },
    { id: 'products', name: 'Products', icon: 'ri-shopping-bag-line' },
    { id: 'orders', name: 'Orders & Shipping', icon: 'ri-truck-line' },
    { id: 'technical', name: 'Technical Support', icon: 'ri-settings-line' }
  ];

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqData.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-light text-forest-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about your skincare journey with Lorem Curae.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-forest-900 mb-4">Categories</h3>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                        activeTab === category.id
                          ? 'bg-sage-50 text-sage-700 border border-sage-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${category.icon} text-lg`}></i>
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-forest-900">
                    {categories.find(cat => cat.id === activeTab)?.name}
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredFAQs.map((faq, index) => (
                    <div key={index} className="p-6">
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between text-left cursor-pointer group"
                      >
                        <h3 className="text-lg font-medium text-forest-900 group-hover:text-forest-700 transition-colors">
                          {faq.question}
                        </h3>
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <i className={`ri-${openItems.has(index) ? 'subtract' : 'add'}-line text-gray-400 text-xl transition-transform`}></i>
                          </div>
                        </div>
                      </button>
                      
                      {openItems.has(index) && (
                        <div className="mt-4 pr-12">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-8 bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-customer-service-line text-sage-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-forest-900 mb-2">Still need help?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-forest-900 text-cream-50 rounded-lg hover:bg-forest-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-mail-line mr-2"></i>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
