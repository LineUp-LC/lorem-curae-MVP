import { useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import SmartProductSearch from './components/SmartProductSearch';
import PersonalizedAIGuidance from './components/PersonalizedAIGuidance';
import ProductComparison from './components/ProductComparison';
import QuizCTA from './components/QuizCTA';
import IngredientCarousel from './components/IngredientCarousel';
import RoutineTracker from './components/RoutineTracker';
import MarketplaceSection from './components/MarketplaceSection';
import CommunityStories from './components/CommunityStories';
import TrustBanner from './components/TrustBanner';

const HomePage = () => {
  useEffect(() => {
    // Add FAQ structured data
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Lorem Curae?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lorem Curae is a comprehensive personalized skincare platform that combines smart product finding, ingredient intelligence, AI guidance, routine tracking, and a curated marketplace to help you discover products perfect for your unique skin."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Smart Product Finder work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our Smart Product Finder uses your skin assessment results, concerns, and preferences to recommend products from verified retailers. You can compare products, read reviews from similar skin types, and earn Curae Points when you shop through our affiliate links."
          }
        },
        {
          "@type": "Question",
          "name": "What are Curae Points?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Curae Points are our rewards system. Earn points exclusively by shopping through our affiliate links. Redeem points for exclusive perks, early access to features, and discounts."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Ingredient Intelligence library work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our comprehensive ingredient library provides detailed information about skincare ingredients including benefits, potential concerns, and scientific research. Learn how ingredients work together and which ones to avoid based on your skin type."
          }
        },
        {
          "@type": "Question",
          "name": "Can I track my skincare routine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Create personalized morning and evening routines with our guided builder. Get smart conflict detection to avoid ingredient interactions and optimize product order. Track progress with photos, notes, and skin condition logs."
          }
        }
      ]
    };

    // Add Organization structured data
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Lorem Curae",
      "url": "https://loremcurae.com",
      "logo": "https://loremcurae.com/logo.png",
      "description": "Personalized skincare platform powered by science and community. Smart product finder, ingredient intelligence, AI guidance, routine tracking, and curated marketplace.",
      "sameAs": [
        "https://facebook.com/loremcurae",
        "https://instagram.com/loremcurae",
        "https://twitter.com/loremcurae"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-7546",
        "contactType": "Customer Service",
        "email": "support@loremcurae.com",
        "availableLanguage": "English"
      }
    };

    // Add WebSite structured data
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Lorem Curae",
      "url": "https://loremcurae.com",
      "description": "Personalized skincare platform with smart product finder, ingredient intelligence, AI guidance, and rewards program",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://loremcurae.com/discover?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.text = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    const websiteScript = document.createElement('script');
    websiteScript.type = 'application/ld+json';
    websiteScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(websiteScript);

    return () => {
      document.head.removeChild(faqScript);
      document.head.removeChild(orgScript);
      document.head.removeChild(websiteScript);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main>
        <HeroSection />
        <SmartProductSearch />
        <PersonalizedAIGuidance />
        <ProductComparison />
        <QuizCTA />
        <IngredientCarousel />
        <RoutineTracker />
        <MarketplaceSection />
        <CommunityStories />
        <TrustBanner />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
