import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import AppLayout from '../components/feature/AppLayout';
import RequireAuth from '../components/feature/RequireAuth';

// ═══════════════════════════════════════════════════════════════
// PHASE 1 ACTIVE ROUTES — Lazy load components
// ═══════════════════════════════════════════════════════════════
const AuthCallbackPage = lazy(() => import('../pages/auth/callback/page'));
const HomePage = lazy(() => import('../pages/home/page'));
const DiscoverPage = lazy(() => import('../pages/discover/page'));
const IngredientsPage = lazy(() => import('../pages/ingredients/page'));
const RoutinesPage = lazy(() => import('../pages/routines/page'));
const RoutinesListPage = lazy(() => import('../pages/routines-list/page'));
const SettingsPage = lazy(() => import('../pages/settings/page'));
const AccountPage = lazy(() => import('../pages/account/page'));
const LoginPage = lazy(() => import('../pages/auth/login/page'));
const SignupPage = lazy(() => import('../pages/auth/signup/page'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password/page'));
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password/page'));
const VerifyEmailPage = lazy(() => import('../pages/auth/verify-email/page'));
const ProductDetailPage = lazy(() => import('../pages/product-detail/page'));
const DataAnonymizationPage = lazy(() => import('../pages/data-anonymization/page'));
const AIChatPage = lazy(() => import('../pages/ai-chat/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const SkinSurveyPage = lazy(() => import('../pages/skin-survey/page'));
const SkinSurveyAccountPage = lazy(() => import('../pages/skin-survey-account/page'));
const SurveyResultsPage = lazy(() => import('../pages/skin-survey/results/page'));
const CartPage = lazy(() => import('../pages/cart/page'));
const ScanPage = lazy(() => import('../pages/scan/page'));
const PrivacyPage = lazy(() => import('../pages/privacy/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const FAQPage = lazy(() => import('../pages/faq/page'));
const AccessibilityPage = lazy(() => import('../pages/accessibility/page'));
const CommunityGuidelinesPage = lazy(() => import('../pages/community-guidelines/page'));
const AdminProductsPage = lazy(() => import('../pages/admin/products/page'));

// ═══════════════════════════════════════════════════════════════
// DEFERRED IMPORTS — see Notion "Deferred Work Tracker" for trigger conditions
// ═══════════════════════════════════════════════════════════════
// DEFERRED: Phase 5 — Marketplace
// const MarketplacePage = lazy(() => import('../pages/marketplace/page'));
// const MarketplaceAllPage = lazy(() => import('../pages/marketplace/all/page'));
// const MarketplaceSuccessPage = lazy(() => import('../pages/marketplace/success/page'));
// const MarketplaceProductDetailPage = lazy(() => import('../pages/marketplace/product/page'));
// DEFERRED: Phase 5 — Community
// const CommunityPage = lazy(() => import('../pages/community/page'));
// const CommunityCreatePage = lazy(() => import('../pages/community/create/page'));
// DEFERRED: Post-Launch — Nutrition
// const NutritionPage = lazy(() => import('../pages/nutrition/page'));
// DEFERRED: Phase 5 — My Skin
// const MySkinPage = lazy(() => import('../pages/my-skin/page'));
// DEFERRED: Phase 5 — Profile
// const ProfileCustomizePage = lazy(() => import('../pages/profile/customize/page'));
// const ProfileViewPage = lazy(() => import('../pages/profile/view/page'));
// DEFERRED: Phase 5 — Reviews (standalone)
// const RetailerReviewsPage = lazy(() => import('../pages/retailer-reviews/page'));
// const ReviewsProductsPage = lazy(() => import('../pages/reviews-products/page'));
// DEFERRED: Phase 5 — Badges
// const BadgesPage = lazy(() => import('../pages/badges/page'));
// DEFERRED: Phase 5 — Subscription/Premium
// const SubscriptionPage = lazy(() => import('../pages/subscription/page'));
// const PremiumPackagesPage = lazy(() => import('../pages/premium-packages/page'));
// DEFERRED: Post-Launch — Services
// const ServicesPage = lazy(() => import('../pages/services/page'));
// const ServicesSearchPage = lazy(() => import('../pages/services/search/page'));
// const ServiceDetailPage = lazy(() => import('../pages/services/detail/page'));
// const ServicesComparePage = lazy(() => import('../pages/services/compare/page'));
// const ServicesBookingPage = lazy(() => import('../pages/services/booking/page'));
// const ServicesBookingSuccessPage = lazy(() => import('../pages/services/booking-success/page'));
// DEFERRED: Post-Launch — Storefront
// const StorefrontDetailPage = lazy(() => import('../pages/storefront/detail/page'));
// const StorefrontProductDetailsPage = lazy(() => import('../pages/storefront-product-details/page'));
// const StorefrontJoinPage = lazy(() => import('../pages/storefront/join/page'));
// const StorefrontRegisterPage = lazy(() => import('../pages/storefront/register/page'));
// DEFERRED: Post-Launch — Seller
// const SellerOnboardingPage = lazy(() => import('../pages/seller/onboarding/page'));
// const SellerDashboardPage = lazy(() => import('../pages/seller/dashboard/page'));
// const SellerApplicationStatusPage = lazy(() => import('../pages/seller/application-status/page'));
// DEFERRED: Post-Launch — Creator
// const CreatorOnboardingPage = lazy(() => import('../pages/creator/onboarding/page'));
// const CreatorDashboardPage = lazy(() => import('../pages/creator/dashboard/page'));
// const CreatorProductsPage = lazy(() => import('../pages/creator/products/page'));
// const CreatorPatchTestsPage = lazy(() => import('../pages/creator/patch-tests/page'));
// const CreatePatchTestPage = lazy(() => import('../pages/creator/patch-tests/create/page'));
// const CreatorAudiencePage = lazy(() => import('../pages/creator/audience/page'));
// const CreatorAnalyticsPage = lazy(() => import('../pages/creator/analytics/page'));
// const CreatorStorefrontPage = lazy(() => import('../pages/creator/storefront/page'));
// DEFERRED: Phase 5 — Affiliate
// const AffiliateDashboardPage = lazy(() => import('../pages/affiliate-dashboard/page'));
// const AffiliateRedirectPage = lazy(() => import('../pages/affiliate-redirect/page'));
// DEFERRED: Post-Launch — Data Impact
// const DataImpactPage = lazy(() => import('../pages/data-impact/page'));
// DEFERRED: Phase 3 — Ingredient Patch Test
// const IngredientPatchTestPage = lazy(() => import('../pages/ingredient-patch-test/page'));
// DEFERRED: Post-Launch — Waitlist (pre-launch artifacts, candidates for deletion)
// const WaitlistLandingPage = lazy(() => import('../pages/preview-of-waitlist-early-access-2025/page'));
// const MarketplaceWaitlistPage = lazy(() => import('../pages/preview-of-waitlist-early-access-2025-marketplace/page'));

const routes: RouteObject[] = [
  // ── No-layout routes (auth, admin, GDPR) ──
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/data-anonymization', element: <DataAnonymizationPage /> },
  { path: '/admin/products', element: <RequireAuth><AdminProductsPage /></RequireAuth> },
  { path: '/admin/products/:id', element: <RequireAuth><AdminProductsPage /></RequireAuth> },

  // DEFERRED: Post-Launch — Creator no-layout routes — see Notion "Deferred Work Tracker" for trigger condition
  // { path: '/creator/dashboard', element: <CreatorDashboardPage /> },
  // { path: '/creator/products', element: <CreatorProductsPage /> },
  // { path: '/creator/patch-tests', element: <CreatorPatchTestsPage /> },
  // { path: '/creator/patch-tests/create', element: <CreatePatchTestPage /> },
  // { path: '/creator/audience', element: <CreatorAudiencePage /> },
  // DEFERRED: Phase 5 — Affiliate redirect — see Notion "Deferred Work Tracker" for trigger condition
  // { path: '/affiliate-redirect/:id', element: <AffiliateRedirectPage /> },

  // ── Layout routes (Navbar + Footer persist across navigation) ──
  {
    element: <AppLayout />,
    children: [
      // ── Phase 1 Active ──
      { path: '/', element: <HomePage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/ingredients', element: <IngredientsPage /> },
      { path: '/routines', element: <RoutinesPage /> },
      { path: '/routines-list', element: <RoutinesListPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/product-detail', element: <ProductDetailPage /> },
      { path: '/product-detail/:id', element: <ProductDetailPage /> },
      { path: '/ai-chat', element: <AIChatPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/skin-survey', element: <SkinSurveyPage /> },
      { path: '/skin-survey-account', element: <SkinSurveyAccountPage /> },
      { path: '/skin-survey/results', element: <SurveyResultsPage /> },
      { path: '/cart', element: <CartPage /> },
      // ── Phase 4 Active ──
      { path: '/scan', element: <ScanPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/faq', element: <FAQPage /> },
      { path: '/accessibility', element: <AccessibilityPage /> },
      { path: '/community-guidelines', element: <CommunityGuidelinesPage /> },

      // ── Deferred Layout Routes ──
      // DEFERRED: Phase 5 — Marketplace — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/marketplace', element: <MarketplacePage /> },
      // { path: '/marketplace/all', element: <MarketplaceAllPage /> },
      // { path: '/marketplace/success', element: <MarketplaceSuccessPage /> },
      // { path: '/marketplace/product', element: <MarketplaceProductDetailPage /> },
      // { path: '/marketplace/product/:id', element: <MarketplaceProductDetailPage /> },
      // DEFERRED: Phase 5 — Community — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/community', element: <CommunityPage /> },
      // { path: '/community/create', element: <CommunityCreatePage /> },
      // DEFERRED: Post-Launch — Nutrition — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/nutrition', element: <NutritionPage /> },
      // DEFERRED: Phase 5 — My Skin — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/my-skin', element: <MySkinPage /> },
      // DEFERRED: Phase 5 — Profile — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/profile/customize', element: <ProfileCustomizePage /> },
      // { path: '/profile/view/:userId', element: <ProfileViewPage /> },
      // DEFERRED: Phase 5 — Reviews (standalone) — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/retailer-reviews', element: <RetailerReviewsPage /> },
      // { path: '/reviews-products', element: <ReviewsProductsPage /> },
      // DEFERRED: Phase 5 — Badges — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/badges', element: <BadgesPage /> },
      // DEFERRED: Phase 5 — Subscription/Premium — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/subscription', element: <SubscriptionPage /> },
      // { path: '/premium-packages', element: <PremiumPackagesPage /> },
      // DEFERRED: Post-Launch — Services — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/services', element: <ServicesPage /> },
      // { path: '/services/search', element: <ServicesSearchPage /> },
      // { path: '/services/compare', element: <ServicesComparePage /> },
      // { path: '/services/:id', element: <ServiceDetailPage /> },
      // { path: '/services/:id/booking', element: <ServicesBookingPage /> },
      // { path: '/services/booking-success', element: <ServicesBookingSuccessPage /> },
      // DEFERRED: Post-Launch — Storefront — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/storefront/:id', element: <StorefrontDetailPage /> },
      // { path: '/storefront-product-details', element: <StorefrontProductDetailsPage /> },
      // { path: '/storefront/join', element: <StorefrontJoinPage /> },
      // { path: '/storefront/register', element: <StorefrontRegisterPage /> },
      // DEFERRED: Post-Launch — Seller — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/seller/onboarding', element: <SellerOnboardingPage /> },
      // { path: '/seller/dashboard', element: <SellerDashboardPage /> },
      // { path: '/seller/application-status', element: <SellerApplicationStatusPage /> },
      // DEFERRED: Post-Launch — Creator — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/creator/onboarding', element: <CreatorOnboardingPage /> },
      // DEFERRED: Phase 5 — Affiliate — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/affiliate-dashboard', element: <AffiliateDashboardPage /> },
      // DEFERRED: Post-Launch — Data Impact — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/data-impact', element: <DataImpactPage /> },
      // DEFERRED: Phase 3 — Ingredient Patch Test — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/ingredient-patch-test', element: <IngredientPatchTestPage /> },
      // DEFERRED: Post-Launch — Waitlist (pre-launch artifacts) — see Notion "Deferred Work Tracker" for trigger condition
      // { path: '/preview-of-waitlist-early-access-2025', element: <WaitlistLandingPage /> },
      // { path: '/preview-of-waitlist-early-access-2025-marketplace', element: <MarketplaceWaitlistPage /> },
    ],
  },

  // — Catch-all: redirect to home —
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
