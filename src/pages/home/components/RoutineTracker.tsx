export default function RoutineTracker() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
            Routine Tracking
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Build and track your perfect routine. Create personalized morning and evening skincare routines with our guided builder. Get smart conflict detection to avoid ingredient interactions and optimize product order for maximum effectiveness.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto mb-12">
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://readdy.ai/api/search-image?query=professional%20clean%20skincare%20routine%20tracking%20interface%20dashboard%20showing%20organized%20morning%20and%20evening%20schedule%20with%20product%20cards%20time%20slots%20progress%20bars%20minimalist%20white%20background%20sage%20green%20accent%20colors%20modern%20UI%20design%20realistic%20app%20screenshot%20style%20detailed%20product%20organization%20system&width=1200&height=600&seq=routine-tracking-demo-interface-v2&orientation=landscape"
              alt="Routine Tracking interface showing morning and evening skincare schedule with product organization and progress monitoring"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        <div className="text-center">
          <a
            href="/routines"
            className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
          >
            <span>Build Your Routine</span>
            <i className="ri-arrow-right-line text-xl"></i>
          </a>
        </div>
      </div>
    </section>
  );
}