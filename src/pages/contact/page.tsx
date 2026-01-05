import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    document.title = 'Contact Us | Lorem Curae';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-serif mb-4" style={{ color: '#2D2A26' }}>Contact Us</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6B635A' }}>
              Have questions about your skincare journey? We're here to help you achieve your best skin.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.5)' }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2D2A26' }}>Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)', border: '1px solid rgba(122, 139, 122, 0.2)' }}>
                  <div className="flex items-center">
                    <i className="ri-check-line text-lg" style={{ color: '#7A8B7A' }}></i>
                    <p className="ml-3" style={{ color: '#5A6B5A' }}>Thank you! Your message has been sent successfully.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 77, 53, 0.08)', border: '1px solid rgba(139, 77, 53, 0.2)' }}>
                  <div className="flex items-center">
                    <i className="ri-error-warning-line text-lg" style={{ color: '#8B4D35' }}></i>
                    <p className="ml-3" style={{ color: '#8B4D35' }}>Sorry, there was an error sending your message. Please try again.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg transition-all"
                      style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#C4704D';
                        e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E8D4CC';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg transition-all"
                      style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#C4704D';
                        e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E8D4CC';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg transition-all"
                    style={{ border: '1px solid #E8D4CC', outline: 'none', color: formData.category ? '#2D2A26' : '#9A938A' }}
                  >
                    <option value="">Select a category</option>
                    <option value="general">General Inquiry</option>
                    <option value="product">Product Questions</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg transition-all"
                    style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#C4704D';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8D4CC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg transition-all resize-none"
                    style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#C4704D';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E8D4CC';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#C4704D' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.5)' }}>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2D2A26' }}>Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
                      <i className="ri-mail-line text-xl" style={{ color: '#C4704D' }}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#2D2A26' }}>Email Us</h3>
                      <p style={{ color: '#6B635A' }}>support@loremcurae.com</p>
                      <p className="text-sm mt-1" style={{ color: '#9A938A' }}>We respond within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
                      <i className="ri-phone-line text-xl" style={{ color: '#7A8B7A' }}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#2D2A26' }}>Call Us</h3>
                      <p style={{ color: '#6B635A' }}>+1 (555) 123-SKIN</p>
                      <p className="text-sm mt-1" style={{ color: '#9A938A' }}>Mon-Fri: 9am - 6pm EST</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(232, 168, 136, 0.15)' }}>
                      <i className="ri-map-pin-line text-xl" style={{ color: '#C4704D' }}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#2D2A26' }}>Visit Us</h3>
                      <p style={{ color: '#6B635A' }}>123 Skincare Street</p>
                      <p style={{ color: '#6B635A' }}>New York, NY 10001</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow-sm p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.5)' }}>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2D2A26' }}>Quick Answers</h2>
                <div className="space-y-4">
                  <a href="/faq" className="block p-4 rounded-lg transition-all cursor-pointer" style={{ backgroundColor: '#FDF8F5' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: '#2D2A26' }}>View our FAQ</span>
                      <i className="ri-arrow-right-line" style={{ color: '#C4704D' }}></i>
                    </div>
                  </a>
                  <a href="/community" className="block p-4 rounded-lg transition-all cursor-pointer" style={{ backgroundColor: '#FDF8F5' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: '#2D2A26' }}>Join our Community</span>
                      <i className="ri-arrow-right-line" style={{ color: '#C4704D' }}></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;