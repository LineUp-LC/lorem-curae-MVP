
const EducationHub = () => {
  const articles = [
    {
      id: 1,
      title: 'Understanding Ingredients',
      excerpt: 'Deep dive into skincare ingredients and their benefits for different skin types.',
      type: 'Guide',
      readTime: '12 min read',
      icon: 'ri-flask-line',
      color: 'bg-sage-100 text-sage-700',
      link: '/ingredients'
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-sage-50 via-cream-50 to-terracotta-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-sage-600 to-forest-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <i className="ri-book-open-line text-3xl text-white"></i>
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-6">
            Learn At Your Own Pace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover evidence-based skincare knowledge, expert insights, and practical guides to help you make informed decisions about your skin health.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={article.link}
              className="group cursor-pointer block max-w-md"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 flex items-center justify-center ${article.color} rounded-2xl`}>
                    <i className={`${article.icon} text-3xl`}></i>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {article.type}
                    </span>
                    <span className="text-sm text-sage-600 font-medium">
                      {article.readTime}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-forest-900 mb-4 group-hover:text-sage-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sage-600 font-medium group-hover:text-sage-700 transition-colors">
                  <span className="mr-2">Explore</span>
                  <i className="ri-arrow-right-line text-lg group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/about"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-sage-600 to-forest-700 text-white rounded-full font-medium hover:from-sage-700 hover:to-forest-800 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
          >
            <span>Explore All Resources</span>
            <i className="ri-arrow-right-up-line text-xl"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EducationHub;
