import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

export default function SellerApplicationStatusPage() {
  const [application] = useState({
    id: 'APP-2024-001',
    status: 'under_review',
    submittedDate: '2024-01-15',
    businessName: 'Radiant Skin Co.',
    businessType: 'products',
    estimatedReviewTime: '3-5 business days',
    reviewSteps: [
      { step: 'Application Received', completed: true, date: '2024-01-15' },
      { step: 'Document Verification', completed: true, date: '2024-01-16' },
      { step: 'Business Validation', completed: false, date: null },
      { step: 'Final Approval', completed: false, date: null }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review': return 'ri-time-line';
      case 'approved': return 'ri-check-line';
      case 'rejected': return 'ri-close-line';
      default: return 'ri-question-line';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Status</h1>
          <p className="text-lg text-gray-600">
            Track the progress of your seller application
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Application #{application.id}
                </h2>
                <p className="text-gray-600">
                  Submitted on {new Date(application.submittedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(application.status)}`}>
                <i className={`${getStatusIcon(application.status)} mr-2`}></i>
                {getStatusText(application.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 mb-1">Business Name</p>
                <p className="font-medium text-gray-900">{application.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Business Type</p>
                <p className="font-medium text-gray-900 capitalize">{application.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Review Time</p>
                <p className="font-medium text-gray-900">{application.estimatedReviewTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Progress</h3>
            
            <div className="space-y-6">
              {application.reviewSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : index === 2 
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <i className="ri-check-line text-sm"></i>
                    ) : index === 2 ? (
                      <i className="ri-time-line text-sm"></i>
                    ) : (
                      <i className="ri-more-line text-sm"></i>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h4 className={`font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.step}
                    </h4>
                    {step.date && (
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(step.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    {!step.completed && index === 2 && (
                      <p className="text-sm text-yellow-600">In Progress</p>
                    )}
                  </div>
                  
                  {index < application.reviewSteps.length - 1 && (
                    <div className={`w-px h-8 ml-4 ${
                      step.completed ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            
            {application.status === 'under_review' && (
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-0.5">
                    <i className="ri-information-line text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Application Under Review</h4>
                    <p className="text-blue-700 text-sm">
                      Our team is currently reviewing your application. We'll notify you via email 
                      once the review is complete. This typically takes 3-5 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 mt-0.5">
                    <i className="ri-mail-line text-yellow-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Check Your Email</h4>
                    <p className="text-yellow-700 text-sm">
                      We may reach out if we need additional information or documentation 
                      to complete your application review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application.status === 'approved' && (
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4 mt-0.5">
                    <i className="ri-check-line text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Congratulations!</h4>
                    <p className="text-green-700 text-sm">
                      Your seller application has been approved. You can now start setting up 
                      your store and adding products.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Link
                    to="/seller/dashboard"
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium whitespace-nowrap"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/seller/products/add"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium whitespace-nowrap"
                  >
                    Add Your First Product
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="ri-customer-service-line text-teal-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Contact Support</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Have questions about your application? Our support team is here to help.
                  </p>
                  <a
                    href="mailto:seller-support@nutrire.com"
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    seller-support@nutrire.com
                  </a>
                </div>
              </div>

              <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <i className="ri-question-line text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Seller FAQ</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Find answers to common questions about selling on Nutrire.
                  </p>
                  <Link
                    to="/seller/faq"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View FAQ →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}