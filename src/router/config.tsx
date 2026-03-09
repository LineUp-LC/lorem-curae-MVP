import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import AppLayout from '../components/feature/AppLayout';
import RequireAuth from '../components/feature/RequireAuth';

// Lazy load components
const AuthCallbackPage = lazy(() => import('../pages/auth/callback/page'));
const HomePage = lazy(() => import('../pages/home/page'));
const DiscoverPage = lazy(() => import('../pages/discover/page'));
const IngredientsPage = lazy(() => import('../pages/ingredients/page'));
const RoutinesPage = lazy(() => import('../pages/routines/page'));
const RoutinesListPage = lazy(() => import('../pages/routines-list/page'));
const MarketplacePage = lazy(() => import('../pages/marketplace/page'));
const MarketplaceAllPage = lazy(() => import('../pages/marketplace/all/page'));
const MarketplaceSuccessPage = lazy(() => import('../pages/marketplace/success/page'));
const MarketplaceProductDetailPage = lazy(() => import('../pages/marketplace/product/page'));
const CommunityPage = lazy(() => import('../pages/community/page'));
const CommunityCreatePage = lazy(() => import('../pages/community/create/page'));
const NutritionPage = lazy(() => import('../pages/nutrition/page'));
const MySkinPage = lazy(() => import('../pages/my-skin/page'));
const SettingsPage = lazy(() => import('../pages/settings/page'));
const AccountPage = lazy(() => import('../pages/account/page'));
const ProfileCustomizePage = lazy(() => import('../pages/profile/customize/page'));
const ProfileViewPage = lazy(() => import('../pages/profile/view/page'));
const RetailerReviewsPage = lazy(() => import('../pages/retailer-reviews/page'));
const ReviewsProductsPage = lazy(() => import('../pages/reviews-products/page'));
const BadgesPage = lazy(() => import('../pages/badges/page'));
const SubscriptionPage = lazy(() => import('../pages/subscription/page'));
const PremiumPackagesPage = lazy(() => import('../pages/premium-packages/page'));
const LoginPage = lazy(() => import('../pages/auth/login/page'));
const SignupPage = lazy(() => import('../pages/auth/signup/page'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password/page'));
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password/page'));
const VerifyEmailPage = lazy(() => import('../pages/auth/verify-email/page'));
const ProductDetailPage = lazy(() => import('../pages/product-detail/page'));

const ServicesPage = lazy(() => import('../pages/services/page'));
const ServicesSearchPage = lazy(() => import('../pages/services/search/page'));
const ServiceDetailPage = lazy(() => import('../pages/services/detail/page'));
const ServicesComparePage = lazy(() => import('../pages/services/compare/page'));
const ServicesBookingPage = lazy(() => import('../pages/services/booking/page'));
const ServicesBookingSuccessPage = lazy(() => import('../pages/services/booking-success/page'));
const StorefrontDetailPage = lazy(() => import('../pages/storefront/detail/page'));
const StorefrontProductDetailsPage = lazy(() => import('../pages/storefront-product-details/page'));
const StorefrontJoinPage = lazy(() => import('../pages/storefront/join/page'));
const StorefrontRegisterPage = lazy(() => import('../pages/storefront/register/page'));
const SellerOnboardingPage = lazy(() => import('../pages/seller/onboarding/page'));
const SellerDashboardPage = lazy(() => import('../pages/seller/dashboard/page'));
const SellerApplicationStatusPage = lazy(() => import('../pages/seller/application-status/page'));
const CreatorOnboardingPage = lazy(() => import('../pages/creator/onboarding/page'));
const CreatorDashboardPage = lazy(() => import('../pages/creator/dashboard/page'));
const CreatorProductsPage = lazy(() => import('../pages/creator/products/page'));
const CreatorPatchTestsPage = lazy(() => import('../pages/creator/patch-tests/page'));
const CreatePatchTestPage = lazy(() => import('../pages/creator/patch-tests/create/page'));
const CreatorAudiencePage = lazy(() => import('../pages/creator/audience/page'));
const CreatorAnalyticsPage = lazy(() => import('../pages/creator/analytics/page'));
const CreatorStorefrontPage = lazy(() => import('../pages/creator/storefront/page'));
const AffiliateDashboardPage = lazy(() => import('../pages/affiliate-dashboard/page'));
const AffiliateRedirectPage = lazy(() => import('../pages/affiliate-redirect/page'));
const DataImpactPage = lazy(() => import('../pages/data-impact/page'));
const DataAnonymizationPage = lazy(() => import('../pages/data-anonymization/page'));
const IngredientPatchTestPage = lazy(() => import('../pages/ingredient-patch-test/page'));
const AIChatPage = lazy(() => import('../pages/ai-chat/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const WaitlistLandingPage = lazy(() => import('../pages/preview-of-waitlist-early-access-2025/page'));
const MarketplaceWaitlistPage = lazy(() => import('../pages/preview-of-waitlist-early-access-2025-marketplace/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const SkinSurveyPage = lazy(() => import('../pages/skin-survey/page'));
const SkinSurveyAccountPage = lazy(() => import('../pages/skin-survey-account/page'));
const SurveyResultsPage = lazy(() => import('../pages/skin-survey/results/page'));
const CartPage = lazy(() => import('../pages/cart/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const FAQPage = lazy(() => import('../pages/faq/page'));
const AccessibilityPage = lazy(() => import('../pages/accessibility/page'));
const CommunityGuidelinesPage = lazy(() => import('../pages/community-guidelines/page'));
const AdminProductsPage = lazy(() => import('../pages/admin/products/page'));

const routes: RouteObject[] = [
  // — No-layout routes (auth, creator dashboards, etc.) —
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/creator/dashboard', element: <CreatorDashboardPage /> },
  { path: '/creator/products', element: <CreatorProductsPage /> },
  { path: '/creator/patch-tests', element: <CreatorPatchTestsPage /> },
  { path: '/creator/patch-tests/create', element: <CreatePatchTestPage /> },
  { path: '/creator/audience', element: <CreatorAudiencePage /> },
  { path: '/affiliate-redirect/:id', element: <AffiliateRedirectPage /> },
  { path: '/data-anonymization', element: <DataAnonymizationPage /> },
  { path: '/admin/products', element: <RequireAuth><AdminProductsPage /></RequireAuth> },
  { path: '/admin/products/:id', element: <RequireAuth><AdminProductsPage /></RequireAuth> },

  // — Layout routes (Navbar + Footer persist across navigation) —
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/ingredients', element: <IngredientsPage /> },
      { path: '/routines', element: <RoutinesPage /> },
      { path: '/routines-list', element: <RoutinesListPage /> },
      { path: '/marketplace', element: <MarketplacePage /> },
      { path: '/marketplace/all', element: <MarketplaceAllPage /> },
      { path: '/marketplace/success', element: <MarketplaceSuccessPage /> },
      { path: '/marketplace/product', element: <MarketplaceProductDetailPage /> },
      { path: '/marketplace/product/:id', element: <MarketplaceProductDetailPage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/community/create', element: <CommunityCreatePage /> },
      { path: '/nutrition', element: <NutritionPage /> },
      { path: '/my-skin', element: <MySkinPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/profile/customize', element: <ProfileCustomizePage /> },
      { path: '/profile/view/:userId', element: <ProfileViewPage /> },
      { path: '/retailer-reviews', element: <RetailerReviewsPage /> },
      { path: '/reviews-products', element: <ReviewsProductsPage /> },
      { path: '/badges', element: <BadgesPage /> },
      { path: '/subscription', element: <SubscriptionPage /> },
      { path: '/premium-packages', element: <PremiumPackagesPage /> },
      { path: '/product-detail', element: <ProductDetailPage /> },
      { path: '/product-detail/:id', element: <ProductDetailPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/services/search', element: <ServicesSearchPage /> },
      { path: '/services/compare', element: <ServicesComparePage /> },
      { path: '/services/:id', element: <ServiceDetailPage /> },
      { path: '/services/:id/booking', element: <ServicesBookingPage /> },
      { path: '/services/booking-success', element: <ServicesBookingSuccessPage /> },
      { path: '/storefront/:id', element: <StorefrontDetailPage /> },
      { path: '/storefront-product-details', element: <StorefrontProductDetailsPage /> },
      { path: '/storefront/join', element: <StorefrontJoinPage /> },
      { path: '/storefront/register', element: <StorefrontRegisterPage /> },
      { path: '/seller/onboarding', element: <SellerOnboardingPage /> },
      { path: '/seller/dashboard', element: <SellerDashboardPage /> },
      { path: '/seller/application-status', element: <SellerApplicationStatusPage /> },
      { path: '/creator/onboarding', element: <CreatorOnboardingPage /> },
      { path: '/affiliate-dashboard', element: <AffiliateDashboardPage /> },
      { path: '/data-impact', element: <DataImpactPage /> },
      { path: '/ingredient-patch-test', element: <IngredientPatchTestPage /> },
      { path: '/ai-chat', element: <AIChatPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/preview-of-waitlist-early-access-2025', element: <WaitlistLandingPage /> },
      { path: '/preview-of-waitlist-early-access-2025-marketplace', element: <MarketplaceWaitlistPage /> },
      { path: '/skin-survey', element: <SkinSurveyPage /> },
      { path: '/skin-survey-account', element: <SkinSurveyAccountPage /> },
      { path: '/skin-survey/results', element: <SurveyResultsPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/faq', element: <FAQPage /> },
      { path: '/accessibility', element: <AccessibilityPage /> },
      { path: '/community-guidelines', element: <CommunityGuidelinesPage /> },
    ],
  },

  // — Catch-all —
  { path: '*', element: <NotFoundPage /> },
];

export default routes;
