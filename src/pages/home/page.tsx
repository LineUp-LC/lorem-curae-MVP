import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import WhyThisMattersSection from './components/WhyThisMattersSection';
import ConnectedSystemSection from './components/ConnectedSystemSection';
import DifferentiationSection from './components/DifferentiationSection';
import IngredientSection from './components/IngredientSection';
import TestimonialSection from './components/TestimonialSection';
import MarketplaceSection from './components/MarketplaceSection';
import QuizCTA from './components/QuizCTA';

/**
 * HomePage Component
 * 
 * All sections use Framer Motion for:
 * - Scroll-triggered animations (whileInView)
 * - Staggered reveals
 * - Hover interactions
 * - Premium, slow easing curves
 * 
 * Motion philosophy: soft, calm, intentional - never bouncy
 */

const HomePage = () => {
  return (
    <div className="lc-page">
      <style>{`
        .lc-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FDF8F5 0%, #FFF9F5 50%, #FFFBF8 100%);
          font-family: var(--lc-font-serif, 'Cormorant Garamond', Georgia, serif);
          color: #2D2A26;
        }
      `}</style>
      <Navbar variant="hero" />
      <main>
        <HeroSection />
        <WhyThisMattersSection />
        <ConnectedSystemSection />
        <DifferentiationSection />
        <IngredientSection />
        <TestimonialSection />
        <MarketplaceSection />
        <QuizCTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;