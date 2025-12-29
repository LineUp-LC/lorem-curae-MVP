import { useLocation, Link } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sage-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-coral-100 rounded-full opacity-50 blur-3xl"></div>
      </div>
      
      {/* Large 404 background text */}
      <h1 className="absolute text-[12rem] md:text-[20rem] font-black text-sage-100/50 select-none pointer-events-none z-0 motion-safe:animate-pulse">
        404
      </h1>
      
      {/* Content */}
      <div className="relative z-10 motion-safe:animate-enter-up">
        {/* Icon */}
        <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-compass-3-line text-5xl text-sage-600"></i>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-serif text-forest-900 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-gray-500 font-mono text-sm mb-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
          {location.pathname}
        </p>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/"
            className="px-6 py-3 bg-sage-600 text-white rounded-xl font-medium transition-all duration-200 hover:bg-sage-700 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
          >
            <i className="ri-home-4-line"></i>
            Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-forest-700 border border-gray-200 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:border-sage-300 flex items-center gap-2"
          >
            <i className="ri-arrow-left-line"></i>
            Go Back
          </button>
        </div>
      </div>
      
      {/* Help text */}
      <p className="absolute bottom-8 text-sm text-gray-400 motion-safe:animate-enter-up" style={{ animationDelay: '200ms' }}>
        Need help? <Link to="/contact" className="text-sage-600 hover:text-sage-700 underline">Contact Support</Link>
      </p>
    </div>
  );
}