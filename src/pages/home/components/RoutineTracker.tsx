import { Link } from 'react-router-dom';

// Unsplash - organized skincare routine, morning bathroom setup
const ROUTINE_IMAGE = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=80';

export default function RoutineTracker() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pain Point Callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-coral-50 text-coral-700 rounded-full text-sm font-medium mb-4">
            <i className="ri-error-warning-line"></i>
            Tracking Troubles
          </span>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You tried a new product, broke out three days later, and now you can't remember 
            what else changed that week. Was it the serum? The stress? The pizza?
          </p>
        </div>

        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
            <i className="ri-calendar-check-line"></i>
            Consistency Tracking
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
            Routine Tracking
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Build and track your perfect routine with our guided builder. 
            Know exactly what's working—and what's causing problems.
          </p>
          
          {/* Why Tracking Matters */}
          <div className="inline-block bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500 text-left max-w-md mx-auto">
            <p className="text-sm font-semibold text-blue-900 mb-2">Why Tracking Matters</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Skincare results take 4-8 weeks to show</li>
              <li>• Memory is unreliable for tracking reactions</li>
              <li>• Data helps you see patterns you'd miss</li>
            </ul>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto mb-12">
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={ROUTINE_IMAGE}
              alt="Organized skincare routine with products arranged neatly"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Floating Features */}
          <div className="absolute -bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-orange-600"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Conflict Detection</p>
                <p className="text-xs text-gray-500">Avoid bad ingredient combos</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-fire-line text-green-600"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Streak Tracking</p>
                <p className="text-xs text-gray-500">Stay consistent</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/routines"
            className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Build Your Routine</span>
            <i className="ri-arrow-right-line text-xl"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}