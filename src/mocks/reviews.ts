/**
 * Shared review mock data — canonical source of truth for review data
 * across all surfaces (ProductReviews, reviewerEvidence, etc.).
 */

export interface MockReview {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  skinType: string;
  skinConcerns: string[];
  complexion?: string;
  lifestyle?: string[];
  age: number;
  routineLength: string;
  usageDurationWeeks: number;
  /** Extended fields for enriched review surfaces */
  productName?: string;
  productImage?: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  usageDuration?: string;
  finalVerdict?: string;
  beforeAfterPhotos?: string[];
  sensitivity?: string;
}

/**
 * Reviews keyed by product ID.
 *
 * Currently only product 8 (Niacinamide Pore Refining Serum) has full
 * review data because the product-detail page defaults to that product.
 * Additional products can be added as the review system expands.
 */
export const reviewData: Record<number, MockReview[]> = {
  // Reviews for all products — same set used as generic reviews
  // until per-product review data is available
  0: [
    {
      id: 1,
      userName: 'Sarah M.',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Clear results for combination skin',
      content: 'I\'ve been using this serum for 3 months now and the difference has been significant. My T-zone is no longer oily by midday, and my cheeks feel hydrated. The texture is lightweight and absorbs quickly without any sticky residue. Perfect for my combination skin type!',
      date: '2024-01-15',
      verified: true,
      helpful: 24,
      skinType: 'combination',
      skinConcerns: ['Acne Prone', 'Lack of Hydration'],
      complexion: 'Type III',
      lifestyle: ['Active', 'Screen-heavy'],
      age: 29,
      routineLength: '3-6 months',
      usageDurationWeeks: 14,
    },
    {
      id: 2,
      userName: 'Jessica R.',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Great for sensitive skin',
      content: 'As someone with very sensitive skin, I was hesitant to try this. But it\'s been gentle and effective. No irritation at all, and I\'ve noticed my redness has decreased significantly. Takes time to see results but worth the patience.',
      date: '2024-01-10',
      verified: true,
      helpful: 18,
      skinType: 'sensitive',
      skinConcerns: ['Damaged Skin Barrier', 'Rosacea'],
      complexion: 'Type II',
      lifestyle: ['Low-stress', 'Indoor'],
      age: 25,
      routineLength: '6+ months',
      usageDurationWeeks: 28,
    },
    {
      id: 3,
      userName: 'Michael K.',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Finally found my holy grail serum',
      content: 'After trying countless serums, this one actually delivers. The niacinamide really helps with my enlarged pores, and the hyaluronic acid keeps my skin plump all day. Great for oily skin that needs hydration without heaviness.',
      date: '2024-01-08',
      verified: false,
      helpful: 31,
      skinType: 'oily',
      skinConcerns: ['Enlarged Pores', 'Congested skin'],
      complexion: 'Type IV',
      lifestyle: ['Active', 'Outdoor'],
      age: 32,
      routineLength: '1-3 months',
      usageDurationWeeks: 6,
    },
    {
      id: 4,
      userName: 'Emma L.',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Perfect match for combination acne-prone skin',
      content: 'This serum has made a real difference for my combination skin with persistent breakouts. It controls oil in my T-zone while keeping my cheeks moisturized. The acne-fighting ingredients work without over-drying. Highly recommend for similar skin types!',
      date: '2024-01-20',
      verified: true,
      helpful: 35,
      skinType: 'combination',
      skinConcerns: ['Acne Prone', 'Uneven Skin Tone', 'Enlarged Pores'],
      complexion: 'Type III',
      lifestyle: ['Active', 'Screen-heavy'],
      age: 26,
      routineLength: '3-6 months',
      usageDurationWeeks: 16,
    },
    {
      id: 5,
      userName: 'David C.',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Effective for dark spots and uneven tone',
      content: 'Been dealing with hyperpigmentation from old acne scars. This serum has noticeably faded the dark spots over 4 months of consistent use. The vitamin C and niacinamide combo works well. Patience is key with pigmentation issues.',
      date: '2024-01-12',
      verified: true,
      helpful: 22,
      skinType: 'combination',
      skinConcerns: ['Uneven Skin Tone', 'Scarring'],
      complexion: 'Type V',
      lifestyle: ['Active'],
      age: 30,
      routineLength: '3-6 months',
      usageDurationWeeks: 18,
    },
    {
      id: 6,
      userName: 'Lisa K.',
      userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'Good anti-aging benefits',
      content: 'At 45, I\'m always looking for products that help with fine lines and firmness. This serum has improved my skin texture and reduced some fine lines around my eyes. Takes consistent use to see results.',
      date: '2024-01-05',
      verified: true,
      helpful: 19,
      skinType: 'dry',
      skinConcerns: ['Signs of Aging', 'Dullness'],
      complexion: 'Type II',
      lifestyle: ['Low-stress'],
      age: 45,
      routineLength: '6+ months',
      usageDurationWeeks: 32,
    },
    {
      id: 7,
      userName: 'Priya S.',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&q=80',
      rating: 5,
      title: 'Works beautifully in humid summer weather',
      content: 'I live in a humid climate and most serums feel heavy or greasy on my skin by midday. This one is lightweight enough to handle the humidity without sliding off. Even in hot weather my skin feels balanced, not oily. The finish is matte but not drying. Absolutely love it for summer.',
      date: '2024-02-10',
      verified: true,
      helpful: 27,
      skinType: 'combination',
      skinConcerns: ['Enlarged Pores', 'Acne Prone'],
      complexion: 'Type IV',
      lifestyle: ['Active', 'Outdoor'],
      age: 28,
      routineLength: '3-6 months',
      usageDurationWeeks: 10,
    },
    {
      id: 8,
      userName: 'Natalie W.',
      userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&q=80',
      rating: 4,
      title: 'My dry skin in winter finally feels comfortable',
      content: 'Cold dry air in winter always leaves my skin tight and flaky. This serum has been a lifesaver — the rich moisturizing formula sinks in fast and keeps my skin comfortable all day. I layer it under a heavier cream when the temperature drops and it absorbs without any residue.',
      date: '2024-02-18',
      verified: true,
      helpful: 21,
      skinType: 'dry',
      skinConcerns: ['Lack of Hydration', 'Dullness'],
      complexion: 'Type II',
      lifestyle: ['Indoor', 'Low-stress'],
      age: 34,
      routineLength: '3-6 months',
      usageDurationWeeks: 12,
    },
  ],
};

/**
 * Get reviews for a product. Falls back to the generic set (key 0)
 * when no product-specific reviews exist.
 */
export function getReviewsForProduct(productId: number): MockReview[] {
  return reviewData[productId] ?? reviewData[0] ?? [];
}

/**
 * Enriched reviews for the full-page reviews surface (reviews-products).
 * Includes pros/cons, verdicts, and progress photos.
 */
export const enrichedProductReviews: MockReview[] = [
  {
    id: 1,
    userName: 'Sarah M.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&q=80',
    rating: 5,
    title: 'A significant improvement for my combination skin',
    content: "After 3 months of consistent use, this serum has completely transformed my skin. My T-zone used to be an oil slick by noon, but now it stays balanced all day. The acne on my chin has cleared up significantly, and my hyperpigmentation from old breakouts is fading. The texture is lightweight and layers perfectly under moisturizer. I apply 3-4 drops morning and night, and one bottle lasts about 6 weeks. Worth every penny!",
    date: '2024-01-20',
    verified: true,
    helpful: 45,
    skinType: 'combination',
    skinConcerns: ['Acne & Breakouts', 'Hyperpigmentation', 'Large Pores'],
    complexion: 'Type III - Medium',
    sensitivity: 'moderate',
    lifestyle: ['Active lifestyle', 'Screen time heavy'],
    age: 29,
    routineLength: '3-6 months',
    usageDurationWeeks: 12,
    productName: 'Advanced Niacinamide Serum',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
    pros: ['Reduced oiliness', 'Cleared acne', 'Faded dark spots', 'Lightweight texture'],
    cons: ['Takes 6-8 weeks to see full results', 'Slight tingling first week'],
    wouldRecommend: true,
    usageDuration: '3 months',
    finalVerdict: 'If you have combination skin with breakout concerns, this serum is worth the patience — real results after consistent use.',
    beforeAfterPhotos: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop&q=80'],
  },
  {
    id: 2,
    userName: 'Jessica R.',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&q=80',
    rating: 4,
    title: 'Great for sensitive skin, gentle yet effective',
    content: "As someone with reactive sensitive skin, I was nervous to try this. Started with every other night and gradually increased to nightly use. No irritation whatsoever! My redness has decreased noticeably, and my skin feels more resilient. The formula is very gentle - no burning or stinging that I usually get with active ingredients. My skin looks calmer and more even-toned after 2 months of use.",
    date: '2024-01-18',
    verified: true,
    helpful: 32,
    skinType: 'sensitive',
    skinConcerns: ['Sensitivity', 'Redness', 'Uneven Skin Tone'],
    complexion: 'Type II - Fair',
    sensitivity: 'high',
    lifestyle: ['Indoor work environment', 'High stress levels'],
    age: 25,
    routineLength: '6+ months',
    usageDurationWeeks: 8,
    productName: 'Advanced Niacinamide Serum',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
    pros: ['Very gentle formula', 'Reduced redness', 'No irritation', 'Calming effect'],
    cons: ['Results take time', 'Wish it came in larger size'],
    wouldRecommend: true,
    usageDuration: '2 months',
    finalVerdict: 'A gentle option for anyone with reactive skin who needs effective ingredients without the irritation.',
  },
  {
    id: 3,
    userName: 'Michael K.',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&q=80',
    rating: 5,
    title: 'Finally found my holy grail for oily skin',
    content: "This serum has been effective for controlling oil production without over-drying. I have very oily skin with enlarged pores, and this has been a lifesaver. Within 4 weeks, my pores looked visibly smaller, and the oil control lasts all day. I use it twice daily after cleansing. The niacinamide concentration is perfect - strong enough to be effective but not irritating. My skin texture has improved dramatically.",
    date: '2024-01-15',
    verified: false,
    helpful: 38,
    skinType: 'oily',
    skinConcerns: ['Large Pores', 'Excess Oil', 'Uneven Texture'],
    complexion: 'Type IV - Olive',
    sensitivity: 'low',
    lifestyle: ['Active lifestyle', 'Outdoor work environment'],
    age: 32,
    routineLength: '1-3 months',
    usageDurationWeeks: 16,
    productName: 'Advanced Niacinamide Serum',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
    pros: ['Excellent oil control', 'Minimized pores', 'Improved texture', 'Long-lasting effects'],
    cons: ['Bottle could be bigger', 'Dropper sometimes gets sticky'],
    wouldRecommend: true,
    usageDuration: '4 months',
    finalVerdict: 'For oily skin that needs pore control without dryness, this delivers — my texture has never been smoother.',
  },
  {
    id: 4,
    userName: 'Emma L.',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&q=80',
    rating: 4,
    title: 'Effective for hyperpigmentation and aging concerns',
    content: "At 42, I was looking for something to address both pigmentation and fine lines. This serum has definitely helped with both! My melasma patches have lightened considerably over 3 months, and I've noticed my skin looks more plump and smooth. The formula plays well with my other anti-aging products. I use it in my morning routine under vitamin C serum and sunscreen.",
    date: '2024-01-12',
    verified: true,
    helpful: 28,
    skinType: 'dry',
    skinConcerns: ['Hyperpigmentation', 'Fine Lines & Wrinkles', 'Dryness & Dehydration'],
    complexion: 'Type III - Medium',
    sensitivity: 'moderate',
    lifestyle: ['Frequently wears makeup', 'Sun exposure daily'],
    age: 42,
    routineLength: '6+ months',
    usageDurationWeeks: 12,
    productName: 'Advanced Niacinamide Serum',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
    pros: ['Faded dark spots', 'Improved skin texture', 'Works with other products', 'Anti-aging benefits'],
    cons: ['Takes patience to see results', 'Price point is high'],
    wouldRecommend: true,
    usageDuration: '3 months',
    finalVerdict: 'At 42, finding something that addresses both pigmentation and fine lines is rare — this serum does both with consistent use.',
  },
  {
    id: 5,
    userName: 'David C.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&q=80',
    rating: 3,
    title: 'Good product but not miraculous for me',
    content: "I had high expectations based on other reviews, but the results have been more subtle for me. I do see some improvement in my skin texture and my breakouts are less frequent, but it hasn't been the dramatic transformation I hoped for. My combination skin still gets oily in the T-zone, though maybe less than before. It's a decent product, just not the miracle cure I expected.",
    date: '2024-01-10',
    verified: true,
    helpful: 22,
    skinType: 'combination',
    skinConcerns: ['Acne & Breakouts', 'Large Pores'],
    complexion: 'Type V - Brown',
    sensitivity: 'low',
    lifestyle: ['Active lifestyle', 'Screen time heavy', 'High stress levels'],
    age: 24,
    routineLength: '1-3 months',
    usageDurationWeeks: 6,
    productName: 'Advanced Niacinamide Serum',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&q=80',
    pros: ['Gentle on skin', 'Some texture improvement', 'Good ingredients'],
    cons: ['Results slower than expected', 'T-zone still oily', 'Expensive for subtle results'],
    wouldRecommend: false,
    usageDuration: '6 weeks',
    finalVerdict: 'Decent product, but if you expect dramatic results for combination skin, temper your expectations — improvements were subtle for me.',
  },
];
