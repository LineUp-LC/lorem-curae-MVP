import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');

  useEffect(() => {
    document.title = 'FAQ | Lorem Curae';
  }, []);

  const categories = [
    { id: 'general', name: 'General', icon: 'ri-question-line' },
    { id: 'skincare', name: 'Skincare', icon: 'ri-heart-pulse-line' },
    { id: 'products', name: 'Products', icon: 'ri-store-2-line' },
    { id: 'account', name: 'Account', icon: 'ri-user-line' },
    { id: 'subscription', name: 'Subscription', icon: 'ri-vip-crown-line' },
  ];

  const faqs: Record<string, Array<{ question: string; answer: string }>> = {
    general: [
      { question: 'What is Lorem Curae?', answer: 'Lorem Curae is a personalized skincare platform that helps you discover products and routines tailored to your unique skin type and concerns. We combine science-backed recommendations with community insights.' },
      { question: 'How does the skin quiz work?', answer: 'Our skin quiz asks questions about your skin type, concerns, lifestyle, and preferences. Based on your answers, our algorithm creates a personalized profile and recommends products specifically suited to your needs.' },
      { question: 'Is Lorem Curae free to use?', answer: 'Yes! Basic features are free. We also offer Plus and Premium subscriptions for advanced features like unlimited routines, AI consultations, and exclusive discounts.' },
    ],
    skincare: [
      { question: 'How do I determine my skin type?', answer: 'Our skin quiz helps identify your skin type based on factors like oiliness, sensitivity, and how your skin feels throughout the day. You can also consult with a dermatologist for professional assessment.' },
      { question: 'What ingredients should I avoid?', answer: 'This depends on your skin type and sensitivities. Our ingredient library provides detailed information about common ingredients and their effects on different skin types.' },
      { question: 'How often should I update my skincare routine?', answer: 'We recommend reassessing your routine seasonally or when you notice changes in your skin. Our platform tracks your progress and suggests adjustments as needed.' },
    ],
    products: [
      { question: 'How are products selected for recommendations?', answer: 'Products are matched based on your skin profile, ingredient compatibility, community reviews, and efficacy data. We prioritize products that address your specific concerns.' },
      { question: 'Are all products on Lorem Curae cruelty-free?', answer: 'We highlight cruelty-free and vegan products with badges. You can filter products by these criteria in our discover section.' },
      { question: 'Can I purchase products directly through Lorem Curae?', answer: 'Yes! Our marketplace connects you directly with verified sellers and indie brands. All purchases are secure and many products have member discounts.' },
    ],
    account: [
      { question: 'How do I reset my password?', answer: 'Click "Forgot password" on the login page, enter your email, and follow the link sent to your inbox to create a new password.' },
      { question: 'Can I delete my account?', answer: 'Yes, you can delete your account from Settings. This will permanently remove all your data including routines, reviews, and purchase history.' },
      { question: 'How do I update my skin profile?', answer: 'Go to My Skin in your account dashboard, or retake the skin quiz to update your profile with new information.' },
    ],
    subscription: [
      { question: 'What\'s included in Premium?', answer: 'Premium includes unlimited AI consultations, exclusive product discounts (up to 20%), advanced analytics, priority support, and access to all routines and features.' },
      { question: 'Can I cancel my subscription anytime?', answer: 'Yes, you can cancel at any time from your account settings. You\'ll retain access until the end of your billing period.' },
      { question: 'Is there a free trial?', answer: 'Yes! New users can try Premium features free for 7 days. No credit card required for the trial period.' },
    ],
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-serif mb-4" style={{ color: '#2D2A26' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B635A' }}>
              Find answers to common questions about Lorem Curae
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#C4704D' : 'white',
                  color: activeCategory === cat.id ? 'white' : '#6B635A',
                  border: activeCategory === cat.id ? 'none' : '1px solid rgba(232, 212, 204, 0.5)',
                }}
              >
                <i className={cat.icon}></i>
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs[activeCategory]?.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden transition-all"
                style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium pr-4" style={{ color: '#2D2A26' }}>{faq.question}</span>
                  <i
                    className={`ri-arrow-down-s-line text-xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    style={{ color: '#C4704D' }}
                  ></i>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5">
                    <p className="leading-relaxed" style={{ color: '#6B635A' }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-16 text-center p-8 rounded-2xl" style={{ backgroundColor: 'rgba(196, 112, 77, 0.05)', border: '1px solid rgba(196, 112, 77, 0.1)' }}>
            <h2 className="text-2xl font-serif mb-4" style={{ color: '#2D2A26' }}>Still have questions?</h2>
            <p className="mb-6" style={{ color: '#6B635A' }}>Our support team is here to help you</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors cursor-pointer"
              style={{ backgroundColor: '#C4704D' }}
            >
              <i className="ri-mail-line"></i>
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;