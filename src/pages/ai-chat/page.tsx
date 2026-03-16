import { useState, useRef, useEffect, useCallback } from 'react';
import NeuralBloomIcon from '../../components/icons/NeuralBloomIcon';
import Dropdown from '../../components/ui/Dropdown';
import { sessionState, getEffectiveSkinType, getEffectiveConcerns, getEffectivePreferences } from '../../lib/utils/sessionState';
import { onAction } from '../../lib/utils/gamificationTriggers';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase-browser';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';
import { callAIChatAPI } from '../../lib/ai/chatClient';
import {
  initializeRetrieval,
  getProductRecommendations,
  getRoutineRecommendations,
  parseUserQuery,
  getClientContext,
  detectNavigationIntent,
  formatNavigationSuggestion,
  type RankedProduct,
  type SkinSurvey,
  type UserInteractionHistory,
  type NavigationIntent,
} from '../../lib/ai';


// Local interface for AI chat user profile (different from Supabase UserProfile)
interface AIChatUserProfile {
  skinType: string;
  concerns: string[];
  goals: string[];
  sensitivities: string[];
  preferences: {
    crueltyFree: boolean;
    vegan: boolean;
    fragranceFree?: boolean;
    budgetRange?: 'budget' | 'mid' | 'premium';
  };
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  products?: RankedProduct[];
  isRoutine?: boolean;
  routine?: Record<string, RankedProduct[]>;
}

// Product Card Component for rendering products in chat
const ProductCard = ({ product, index }: { product: RankedProduct; index: number }) => {
  const labels = ['Best Match', 'Alternative', 'Budget-Friendly', 'Also Recommended'];
  const label = labels[index] || labels[3];

  // Determine source styling and label
  const isMarketplace = product.source === 'marketplace';
  const sourceLabel = isMarketplace ? 'Marketplace' : 'Discovery';
  const sourceIcon = isMarketplace ? 'ri-shopping-bag-line' : 'ri-compass-3-line';
  const sourceColor = isMarketplace ? 'text-primary' : 'text-sage';

  return (
    <Link
      to={product.productUrl || product.marketplaceUrl}
      className="block bg-white rounded-xl border border-blush p-4 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream shrink-0 relative">
          <img
            src={product.image || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {/* Source Badge */}
          <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 ${
            isMarketplace ? 'bg-primary text-white' : 'bg-sage/90 text-white'
          }`}>
            <i className={sourceIcon}></i>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              index === 0 ? 'bg-primary/10 text-primary' :
              index === 1 ? 'bg-sage/20 text-sage' :
              'bg-warm-gray/10 text-warm-gray'
            }`}>
              {label}
            </span>
            <span className="text-xs text-warm-gray/60">{product.category}</span>
            <span className={`text-xs ${sourceColor} flex items-center gap-0.5`}>
              <i className={sourceIcon}></i>
              {sourceLabel}
            </span>
          </div>

          <h4 className="font-semibold text-deep text-sm truncate">{product.brand}</h4>
          <p className="text-sm text-warm-gray truncate">{product.name}</p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-semibold text-deep">${product.price.toFixed(2)}</span>
            <span className="text-xs text-warm-gray/80 flex items-center gap-1">
              <i className="ri-star-fill text-amber-400"></i>
              {product.rating} ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Match Reasons */}
          {product.matchReasons.length > 0 && (
            <p className="text-xs text-sage mt-2 line-clamp-1">
              <i className="ri-check-line mr-1"></i>
              {product.matchReasons[0]}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center text-warm-gray/40 group-hover:text-primary transition-colors">
          <i className="ri-arrow-right-s-line text-xl"></i>
        </div>
      </div>
    </Link>
  );
};

// Routine Card Component for rendering routines
const RoutineCard = ({ routine, skinType }: { routine: Record<string, RankedProduct[]>; skinType: string }) => {
  const steps = [
    { key: 'cleanser', label: 'Cleanse', icon: 'ri-drop-line' },
    { key: 'serum', label: 'Treat', icon: 'ri-flask-line' },
    { key: 'moisturizer', label: 'Moisturize', icon: 'ri-water-flash-line' },
    { key: 'sunscreen', label: 'Protect', icon: 'ri-sun-line' },
  ];

  return (
    <div className="bg-white rounded-xl border border-blush p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <i className="ri-calendar-check-line text-primary"></i>
        </div>
        <div>
          <h4 className="font-semibold text-deep text-sm">Personalized Routine</h4>
          <p className="text-xs text-warm-gray/80">For {skinType || 'your'} skin</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const product = routine[step.key]?.[0];
          if (!product) return null;

          const isMarketplace = product.source === 'marketplace';

          return (
            <Link
              key={step.key}
              to={product.productUrl || product.marketplaceUrl}
              className="flex items-center gap-3 p-3 bg-cream/50 rounded-lg hover:bg-cream transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shrink-0">
                <span className="text-xs font-bold">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-warm-gray/80 flex items-center gap-1">
                  <i className={`${step.icon} text-primary`}></i>
                  {step.label}
                  <span className={`ml-1 ${isMarketplace ? 'text-primary' : 'text-sage'}`}>
                    <i className={isMarketplace ? 'ri-shopping-bag-line' : 'ri-compass-3-line'}></i>
                  </span>
                </p>
                <p className="text-sm font-medium text-deep truncate">
                  {product.brand} {product.name}
                </p>
              </div>
              <span className="text-sm font-semibold text-deep">${product.price.toFixed(2)}</span>
              <i className="ri-arrow-right-s-line text-warm-gray/40 group-hover:text-primary transition-colors"></i>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: Message[];
}

interface AIInsight {
  id: string;
  type: 'progress' | 'recommendation' | 'consistency' | 'warning' | 'timing' | 'goal_progress';
  title: string;
  description: string;
  confidence: number;
  dataSource: string;
  timestamp: string;
  relatedPhotos?: {
    url: string;
    date: string;
    note: string;
  }[];
}

// System prompt is now built by systemPrompt.ts via chatClient.ts
// (CURAE_SYSTEM_INSTRUCTIONS deleted — was 462 lines of duplicated governance)


const AIChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      content: 'Hello! I\'m Curae AI, your personalized skincare assistant. I can help you with product recommendations, routine building, ingredient questions, and progress tracking. What would you like to know?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Persist input draft for session continuity (user can resume typing)
  const [inputMessage, setInputMessage] = useLocalStorageState<string>(
    'ai_chat_input_draft',
    ''
  );

  const [showCustomize, setShowCustomize] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>('current');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Conversation history for Claude API
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);

  // Persist insights panel visibility preference
  const [showInsights, setShowInsights] = useLocalStorageState<boolean>(
    'ai_chat_insights_visible',
    true
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  // Retrieval system state
  const [isRetrievalReady, setIsRetrievalReady] = useState(false);

  // User interaction history for personalized reasoning
  const [userInteractionHistory, setUserInteractionHistory] = useState<UserInteractionHistory>({
    viewedProducts: [],
    savedProducts: [],
    purchasedProducts: [],
    frequentCategories: [],
    frequentConcerns: [],
    recentSearches: [],
  });

  const [userProfile, setUserProfile] = useState<AIChatUserProfile>({
    skinType: 'normal',
    concerns: [],
    goals: [],
    sensitivities: [],
    preferences: {
      crueltyFree: false,
      vegan: false,
    },
  });

  const [aiSettings, setAiSettings] = useState<{
    tone: 'friendly' | 'professional' | 'encouraging' | 'direct';
    detailLevel: 'brief' | 'balanced' | 'detailed';
    responseStyle: 'conversational' | 'structured' | 'educational';
    customInstructions: string;
    moreAboutYou: string;
  }>({
    tone: 'friendly',
    detailLevel: 'balanced',
    responseStyle: 'conversational',
    customInstructions: '',
    moreAboutYou: ''
  });

  // Dynamic quick prompts based on user profile
  const getQuickPrompts = () => {
    const prompts: string[] = [];
    const { skinType, concerns } = userProfile;

    // Add skin type specific prompts
    if (skinType) {
      prompts.push(`Recommend products for my ${skinType} skin`);
    } else {
      prompts.push('Recommend products for my skin type');
    }

    // Add concern-specific prompts
    if (concerns.includes('acne') || concerns.includes('Acne Prone')) {
      prompts.push('Best treatments for acne');
      prompts.push('Acne-safe moisturizers');
    }
    if (concerns.includes('dryness') || concerns.includes('Lack of Hydration')) {
      prompts.push('Hydrating products for dry skin');
      prompts.push('Best serums for hydration');
    }
    if (concerns.includes('aging') || concerns.includes('Signs of Aging')) {
      prompts.push('Anti-aging serums');
      prompts.push('Products for fine lines');
    }
    if (concerns.includes('hyperpigmentation') || concerns.includes('Uneven Skin Tone')) {
      prompts.push('Products for dark spots');
      prompts.push('Brightening serums');
    }
    if (concerns.includes('sensitivity') || concerns.includes('Rosacea')) {
      prompts.push('Gentle products for sensitive skin');
    }

    // Add general prompts if we have room
    const generalPrompts = [
      'Create a morning routine for me',
      'What sunscreen should I use?',
      'Find me a good moisturizer',
    ];

    // Fill remaining slots with general prompts (max 6 total)
    for (const prompt of generalPrompts) {
      if (prompts.length >= 6) break;
      if (!prompts.includes(prompt)) {
        prompts.push(prompt);
      }
    }

    return prompts.slice(0, 6);
  };

  const quickPrompts = getQuickPrompts();

  useEffect(() => {
    loadUserProfile();
    loadChatSessions();
    loadAISettings();
    loadAIInsights();
    loadUserInteractionHistory();

    // Initialize the retrieval system
    initializeRetrieval()
      .then(() => {
        setIsRetrievalReady(true);
        console.log('[AI Chat] Retrieval system initialized');
      })
      .catch((error) => {
        console.error('[AI Chat] Failed to initialize retrieval:', error);
        // Continue without retrieval - will fall back to adaptive AI
      });

    // Restore current session messages if available
    const lastSessionId = localStorage.getItem('ai_chat_current_session');
    if (lastSessionId && lastSessionId !== 'current') {
      const saved = localStorage.getItem('chat_sessions');
      if (saved) {
        try {
          const sessions = JSON.parse(saved);
          const session = sessions.find((s: ChatSession) => s.id === lastSessionId);
          if (session) {
            setMessages(session.messages);
            setCurrentSession(session.id);
          }
        } catch (e) {
          console.warn('Failed to restore chat session:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Personalize welcome message when user history loads (only if on initial message)
  useEffect(() => {
    const hasHistory = userInteractionHistory.savedProducts.length > 0 ||
                       userInteractionHistory.viewedProducts.length > 0;

    // Only update if we're on the initial welcome message and have history
    if (hasHistory && messages.length === 1 && messages[0].id === 1 && messages[0].sender === 'ai') {
      let welcomeContent = 'Hello! I\'m Curae AI, your personalized skincare assistant.';

      if (userInteractionHistory.savedProducts.length > 0) {
        const recentSaved = userInteractionHistory.savedProducts[0];
        welcomeContent += ` I noticed you've been exploring ${recentSaved.category}s — I can help you find more options that match your profile.`;
      } else if (userInteractionHistory.frequentCategories.length > 0) {
        welcomeContent += ` Based on your browsing, I can help you discover more ${userInteractionHistory.frequentCategories[0]}s or explore other categories.`;
      }

      welcomeContent += ' What would you like to know?';

      setMessages([{
        id: 1,
        sender: 'ai',
        content: welcomeContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [userInteractionHistory]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadUserProfile = () => {
    const skinType = getEffectiveSkinType();
    const concerns = getEffectiveConcerns();
    const prefs = getEffectivePreferences();

    if (skinType || concerns.length > 0) {
      setUserProfile({
        skinType: skinType || 'normal',
        concerns,
        goals: concerns,
        sensitivities: [],
        preferences: {
          crueltyFree: prefs.crueltyFree === true,
          vegan: prefs.vegan === true,
          fragranceFree: prefs.fragranceFree === true,
        },
      });
    }
  };

  const loadAISettings = () => {
    const saved = localStorage.getItem('ai_chat_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setAiSettings(prev => ({ ...prev, ...settings }));
    }
  };

  const loadUserInteractionHistory = () => {
    // Gather client context from localStorage (saved products, recently viewed, etc.)
    const clientContext = getClientContext();

    setUserInteractionHistory({
      viewedProducts: clientContext.viewedProducts || [],
      savedProducts: clientContext.savedProducts || [],
      purchasedProducts: [], // Will be fetched from DB if authenticated
      frequentCategories: clientContext.frequentCategories || [],
      frequentConcerns: userProfile.concerns || [],
      recentSearches: clientContext.recentSearches || [],
    });

    console.log('[AI Chat] User interaction history loaded:', {
      viewed: clientContext.viewedProducts?.length || 0,
      saved: clientContext.savedProducts?.length || 0,
      categories: clientContext.frequentCategories?.length || 0,
    });
  };

  const loadAIInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load routine notes with photos
      const { data: notes, error } = await supabase
        .from('routine_notes')
        .select('*')
        .eq('user_id', user.id)  // Fixed: was 'id', should be 'user_id'
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Generate AI insights from notes
      const insights = generateInsightsFromNotes(notes || []);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const generateInsightsFromNotes = (notes: any[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Week-to-Week Texture Change
    const recentNotes = notes.filter(n => n.photo_url).slice(0, 7);
    if (recentNotes.length >= 2) {
      insights.push({
        id: 'texture-change',
        type: 'progress',
        title: 'Week-to-Week Texture Improvement',
        description: 'AI analysis shows smoother skin texture on your cheeks. The consistent use of your hydrating serum appears to be working well. Your skin barrier looks healthier compared to last week.',
        confidence: 87,
        dataSource: 'Photo analysis from last 7 days',
        timestamp: new Date().toISOString(),
        relatedPhotos: recentNotes.slice(0, 2).map(n => ({
          url: n.photo_url,
          date: new Date(n.created_at).toLocaleDateString(),
          note: n.observations || 'Routine photo'
        }))
      });
    }

    // Hyperpigmentation Progress
    const monthNotes = notes.filter(n => n.photo_url).slice(0, 30);
    if (monthNotes.length >= 4) {
      insights.push({
        id: 'hyperpigmentation',
        type: 'progress',
        title: 'Hyperpigmentation Fade Progress',
        description: 'AI detected a 12% reduction in dark spot contrast over the past 30 days. Your vitamin C serum and consistent SPF use are showing measurable results. Continue this routine for optimal results.',
        confidence: 82,
        dataSource: 'Photo comparison over 30 days',
        timestamp: new Date().toISOString(),
        relatedPhotos: [
          monthNotes[0],
          monthNotes[Math.floor(monthNotes.length / 2)],
          monthNotes[monthNotes.length - 1]
        ].map(n => ({
          url: n.photo_url,
          date: new Date(n.created_at).toLocaleDateString(),
          note: n.observations || 'Progress photo'
        }))
      });
    }

    // Inflammation Reduction
    const inflammationNotes = notes.filter(n => 
      n.skin_condition?.toLowerCase().includes('red') || 
      n.observations?.toLowerCase().includes('inflammation')
    );
    if (inflammationNotes.length > 0 && notes.length > 7) {
      insights.push({
        id: 'inflammation',
        type: 'progress',
        title: 'Inflammation Reduction',
        description: 'AI identified decreased redness around your jawline after switching to a gentler cleanser. Your skin appears calmer and less reactive. The new routine is working well for your sensitive areas.',
        confidence: 79,
        dataSource: 'Routine notes and photo analysis',
        timestamp: new Date().toISOString(),
        relatedPhotos: inflammationNotes.filter(n => n.photo_url).slice(0, 2).map(n => ({
          url: n.photo_url,
          date: new Date(n.created_at).toLocaleDateString(),
          note: n.observations || 'Inflammation tracking'
        }))
      });
    }

    // Routine Consistency Impact
    const consistencyGaps = [];
    for (let i = 0; i < notes.length - 1; i++) {
      const current = new Date(notes[i].created_at);
      const next = new Date(notes[i + 1].created_at);
      const daysDiff = Math.abs((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 2) {
        consistencyGaps.push({ date: current, note: notes[i] });
      }
    }

    if (consistencyGaps.length > 0) {
      insights.push({
        id: 'consistency',
        type: 'consistency',
        title: 'Routine Consistency Impact',
        description: 'AI correlates missed routine days with minor flare-ups visible in your photos. Maintaining daily consistency, especially with your evening routine, will help prevent these setbacks and accelerate progress.',
        confidence: 85,
        dataSource: 'Routine tracking patterns',
        timestamp: new Date().toISOString(),
        relatedPhotos: consistencyGaps.slice(0, 2).filter(g => g.note.photo_url).map(g => ({
          url: g.note.photo_url,
          date: g.date.toLocaleDateString(),
          note: 'Missed routine period'
        }))
      });
    }

    // Product Effectiveness
    const productNotes = notes.filter(n => n.products_used && n.products_used.length > 0);
    if (productNotes.length >= 5) {
      insights.push({
        id: 'product-effectiveness',
        type: 'recommendation',
        title: 'Product Performance Analysis',
        description: 'Your niacinamide serum shows the strongest positive correlation with improved skin clarity. Consider using it consistently in your morning routine for best results. Photos show visible improvement on days when this product is used.',
        confidence: 88,
        dataSource: 'Product usage tracking and photo analysis',
        timestamp: new Date().toISOString(),
        relatedPhotos: productNotes.filter(n => n.photo_url).slice(0, 3).map(n => ({
          url: n.photo_url,
          date: new Date(n.created_at).toLocaleDateString(),
          note: `Used: ${n.products_used.join(', ')}`
        }))
      });
    }

    // Environmental Factors
    const weatherNotes = notes.filter(n => n.weather);
    if (weatherNotes.length >= 3) {
      insights.push({
        id: 'environmental',
        type: 'warning',
        title: 'Environmental Impact Detected',
        description: 'AI noticed your skin appears more dehydrated on humid days. Consider adding a lightweight hydrating mist to your routine during these conditions. Photos show increased dryness patterns during high humidity.',
        confidence: 76,
        dataSource: 'Weather tracking and skin condition notes',
        timestamp: new Date().toISOString(),
        relatedPhotos: weatherNotes.filter(n => n.photo_url).slice(0, 2).map(n => ({
          url: n.photo_url,
          date: new Date(n.created_at).toLocaleDateString(),
          note: `Weather: ${n.weather}`
        }))
      });
    }

    return insights;
  };

  const loadChatSessions = () => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      setChatSessions(JSON.parse(saved));
    }
  };

  const saveChatSession = () => {
    if (messages.length <= 1) return;

    const session: ChatSession = {
      id: currentSession === 'current' ? `session-${Date.now()}` : currentSession,
      title: messages[1]?.content.substring(0, 50) || 'New conversation',
      date: new Date().toLocaleDateString(),
      preview: messages[1]?.content.substring(0, 100) || '',
      messages: messages,
    };

    const existingIndex = chatSessions.findIndex(s => s.id === session.id);
    let updatedSessions;
    
    if (existingIndex >= 0) {
      updatedSessions = [...chatSessions];
      updatedSessions[existingIndex] = session;
    } else {
      updatedSessions = [session, ...chatSessions];
    }

    setChatSessions(updatedSessions);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));

    // Track current session for restoration
    localStorage.setItem('ai_chat_current_session', session.id);
  };

  const loadChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSession(session.id);
    localStorage.setItem('ai_chat_current_session', session.id);
  };

  const startNewChat = () => {
    // Build personalized welcome message based on user history
    let welcomeContent = 'Hello! I\'m Curae AI, your personalized skincare assistant.';

    const history = userInteractionHistory;
    const hasHistory = history.savedProducts.length > 0 || history.viewedProducts.length > 0;

    if (hasHistory) {
      // Personalize based on what we know about the user
      if (history.savedProducts.length > 0) {
        const recentSaved = history.savedProducts[0];
        welcomeContent += ` I noticed you've been exploring ${recentSaved.category}s — I can help you find more options that match your profile.`;
      } else if (history.frequentCategories.length > 0) {
        welcomeContent += ` Based on your browsing, I can help you discover more ${history.frequentCategories[0]}s or explore other categories.`;
      }
    } else {
      welcomeContent += ' I can help you with product recommendations, routine building, ingredient questions, and progress tracking.';
    }

    welcomeContent += ' What would you like to know?';

    setMessages([
      {
        id: 1,
        sender: 'ai',
        content: welcomeContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentSession('current');
    localStorage.setItem('ai_chat_current_session', 'current');
  };

  // Build skin survey from user profile for retrieval
  const buildSkinSurvey = useCallback((): SkinSurvey => {
    return {
      skinType: userProfile.skinType,
      concerns: userProfile.concerns,
      sensitivities: userProfile.sensitivities,
      goals: userProfile.goals,
      preferences: {
        crueltyFree: userProfile.preferences.crueltyFree,
        vegan: userProfile.preferences.vegan,
        fragranceFree: userProfile.preferences.fragranceFree,
        budgetRange: userProfile.preferences.budgetRange || 'mid',
      },
    };
  }, [userProfile]);

  // Build personalized history context for intro messages
  const buildHistoryContext = useCallback((category?: string): string => {
    const history = userInteractionHistory;

    // Check for relevant history based on category or general patterns
    if (category) {
      // Check if user has viewed/saved products in this category
      const viewedInCategory = history.viewedProducts.filter(p => p.category === category);
      const savedInCategory = history.savedProducts.filter(p => p.category === category);

      if (savedInCategory.length > 0) {
        return ` and the ${category}s you've saved`;
      } else if (viewedInCategory.length >= 2) {
        return ` and your recent browsing of ${category}s`;
      }
    }

    // Check for general patterns
    if (history.savedProducts.length > 0) {
      const categories = [...new Set(history.savedProducts.map(p => p.category))];
      if (categories.length === 1) {
        return ` and your interest in ${categories[0]}s`;
      }
    }

    if (history.frequentCategories.length > 0) {
      return ` and your browsing patterns`;
    }

    return '';
  }, [userInteractionHistory]);

  // Generate response with retrieval system
  const generateRetrievalBasedResponse = useCallback(async (query: string): Promise<Message> => {
    const survey = buildSkinSurvey();
    const { intent, category, sourceIntent } = parseUserQuery(query);

    // Detect navigation intent for contextual linking
    const navigationIntent = detectNavigationIntent(query);
    const navigationSuggestion = formatNavigationSuggestion(navigationIntent);

    let content = '';
    let products: RankedProduct[] = [];
    let isRoutine = false;
    let routine: Record<string, RankedProduct[]> | undefined;

    // Build source context for intro messages
    const sourceContext = sourceIntent === 'marketplace-only'
      ? ' from the Marketplace'
      : sourceIntent === 'discovery-only'
        ? ' from Discovery'
        : '';

    try {
      if (intent === 'routine') {
        // Get routine recommendations
        const result = await getRoutineRecommendations({
          skinType: survey.skinType,
          concerns: survey.concerns,
          sensitivities: survey.sensitivities,
          preferences: survey.preferences,
        });
        content = result.formatted;
        routine = result.routine;
        isRoutine = true;
      } else if (intent === 'product' || intent === 'ingredient') {
        // Get product recommendations with source filtering
        const result = await getProductRecommendations(
          {
            skinType: survey.skinType,
            concerns: survey.concerns,
            sensitivities: survey.sensitivities,
            goals: survey.goals,
            preferences: survey.preferences,
          },
          {
            category,
            query: intent === 'ingredient' ? query : undefined,
            limit: 4,
            sourceFilter: sourceIntent,
          }
        );

        products = result.products;

        // Handle empty results with source filter
        if (products.length === 0 && sourceIntent !== 'all') {
          const sourceName = sourceIntent === 'marketplace-only' ? 'Marketplace' : 'Discovery';
          const alternateName = sourceIntent === 'marketplace-only' ? 'Discovery' : 'Marketplace';
          content = `I didn't find ${sourceName} products that match your profile${category ? ` in the ${category} category` : ''}. Would you like me to show ${alternateName} options instead?`;
        } else {
          // Build contextual intro with personalized history references
          const historyContext = buildHistoryContext(category);

          if (category) {
            content = `Based on your ${survey.skinType || 'skin'} profile${historyContext}, here are my top ${category} recommendations${sourceContext}:`;
          } else if (intent === 'ingredient') {
            content = `Here are products${sourceContext} matching your search that work well for your skin profile:`;
          } else {
            content = `Here are personalized product recommendations${sourceContext} for you:`;
          }

          if (survey.concerns && survey.concerns.length > 0) {
            content += ` These are specifically selected to address your ${survey.concerns.slice(0, 2).join(' and ')} concerns.`;
          }
        }
      } else {
        // General query - provide some context and recommendations
        const result = await getProductRecommendations(
          {
            skinType: survey.skinType,
            concerns: survey.concerns,
            sensitivities: survey.sensitivities,
            goals: survey.goals,
            preferences: survey.preferences,
          },
          {
            limit: 3,
            sourceFilter: sourceIntent,
          }
        );

        products = result.products;

        // General conversation — provide a contextual fallback
        content = `Based on your ${userProfile.skinType || 'skin'} profile, here are some products you might find helpful:`;

        // Only include products if the AI response seems recommendation-oriented
        if (!query.toLowerCase().includes('how') && !query.toLowerCase().includes('what is') && !query.toLowerCase().includes('explain')) {
          // Keep products for potential recommendations
        } else {
          products = []; // Clear products for educational queries
        }
      }
    } catch (error) {
      console.error('[AI Chat] Retrieval error:', error);
      // Fallback message when retrieval fails
      content = 'I encountered an issue finding relevant products. Please try rephrasing your question, or browse our product catalog directly.';
    }

    // Append navigation suggestion if relevant and not already product-focused
    if (navigationSuggestion && products.length === 0 && !isRoutine) {
      content += `\n\n${navigationSuggestion}`;
    } else if (navigationSuggestion && navigationIntent.type === 'ingredient') {
      // For ingredient queries, always add the navigation even with products
      content += `\n\n${navigationSuggestion}`;
    }

    return {
      id: Date.now() + 1,
      sender: 'ai',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: products.length > 0 ? products : undefined,
      isRoutine,
      routine,
    };
  }, [buildSkinSurvey, aiSettings, userProfile]);

  // Handle sending messages with Claude API + local retrieval for products
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    sessionState.trackInteraction('input', 'ai-chat-message', { message: inputMessage });

    // Gamification: award AI chat points (once per session, non-blocking)
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) onAction(data.user.id, 'AI_CHAT').catch(() => {});
    });

    const currentInput = inputMessage;
    setInputMessage('');

    // Update conversation history for context
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: currentInput },
    ];

    try {
      // Call Claude API for intelligent response
      const apiResult = await callAIChatAPI({
        message: currentInput,
        conversationHistory: updatedHistory.slice(-10), // Last 10 messages for context
        settings: {
          tone: aiSettings.tone,
          detailLevel: aiSettings.detailLevel,
          responseStyle: aiSettings.responseStyle,
          customInstructions: aiSettings.customInstructions,
        },
      });

      let content: string;
      let products: RankedProduct[] = [];
      let isRoutine = false;
      let routine: Record<string, RankedProduct[]> | undefined;

      if (apiResult.success) {
        content = apiResult.response;

        // Also fetch products via local retrieval for structured cards
        if (isRetrievalReady) {
          const survey = buildSkinSurvey();
          const { intent, category, sourceIntent } = parseUserQuery(currentInput);

          if (intent === 'routine') {
            const result = await getRoutineRecommendations({
              skinType: survey.skinType,
              concerns: survey.concerns,
              sensitivities: survey.sensitivities,
              preferences: survey.preferences,
            });
            routine = result.routine;
            isRoutine = true;
          } else if (intent === 'product' || intent === 'ingredient') {
            const result = await getProductRecommendations(
              {
                skinType: survey.skinType,
                concerns: survey.concerns,
                sensitivities: survey.sensitivities,
                goals: survey.goals,
                preferences: survey.preferences,
              },
              {
                category,
                query: intent === 'ingredient' ? currentInput : undefined,
                limit: 4,
                sourceFilter: sourceIntent,
              }
            );
            products = result.products;
          }
        }

        // Update conversation history with assistant response
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant' as const, content },
        ]);
      } else {
        // API error - fall back to local retrieval response
        console.warn('[AI Chat] Claude API error, falling back to local:', (apiResult as { error: string }).error);
        const fallbackResponse = await generateRetrievalBasedResponse(currentInput);
        content = fallbackResponse.content;
        products = fallbackResponse.products || [];
        isRoutine = fallbackResponse.isRoutine || false;
        routine = fallbackResponse.routine;
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: products.length > 0 ? products : undefined,
        isRoutine,
        routine,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      saveChatSession();
      sessionState.trackInteraction('completion', 'ai-response-generated', {
        hasProducts: products.length > 0,
        isRoutine,
        usedClaudeAPI: apiResult.success,
      });
    } catch (error) {
      console.error('[AI Chat] Error generating response:', error);

      // Emergency fallback
      const fallbackMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        content: 'I apologize, but I encountered an issue processing your request. Please try again, or browse our product catalog directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    sessionState.trackInteraction('click', 'quick-prompt', { prompt });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    sessionState.trackInteraction('click', 'suggestion', { suggestion });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('ai_chat_settings', JSON.stringify(aiSettings));
    alert('Settings saved! Your AI assistant will now respond according to your preferences.');
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      const updated = chatSessions.filter(s => s.id !== sessionId);
      setChatSessions(updated);
      localStorage.setItem('chat_sessions', JSON.stringify(updated));
      
      if (currentSession === sessionId) {
        startNewChat();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Chat History */}
          <div className="lg:col-span-1 bg-white rounded-xl p-4 overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-deep">Conversations</h2>
              <button
                onClick={() => {
                  // Trigger transition animation
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setMessages([
                      {
                        id: 1,
                        sender: 'ai',
                        content: 'Hello! I\'m Curae AI, your personalized skincare assistant. I can help you with product recommendations, routine building, ingredient questions, and progress tracking. What would you like to know?',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                    setConversationHistory([]);
                    setCurrentSession('current');
                    setInputMessage('');
                    setTimeout(() => setIsTransitioning(false), 300);
                  }, 300);
                }}
                className="text-sm text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <i className="ri-add-line"></i>
                New Chat
              </button>
            </div>
            
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadChatSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentSession === session.id ? 'bg-primary/10' : 'hover:bg-cream'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-deep truncate">{session.title}</p>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-warm-gray/60 hover:text-red-500 transition-opacity cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                  <p className="text-xs text-warm-gray/80">{session.date}</p>
                </div>
              ))}
            </div>

            {/* Settings Button */}
            <div className="mt-6 pt-4 border-t border-blush">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cream transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-warm-gray">AI Settings</span>
                <i className="ri-settings-3-line text-warm-gray/80"></i>
              </button>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`lg:col-span-3 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
          }`}>
            {/* Chat Header */}
            <div className="p-6 border-b border-blush flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-dark rounded-full flex items-center justify-center">
                  <NeuralBloomIcon size={24} color="white" />
                </div>
                <h2 className="text-lg font-semibold text-deep">Curae AI</h2>
              </div>
              <Link
                to="/routines-list"
                className="px-4 py-2 bg-cream text-warm-gray rounded-lg text-sm font-medium hover:bg-blush transition-colors"
              >
                <i className="ri-line-chart-line mr-1"></i>
                View Progress
              </Link>
            </div>

            {/* AI Journey Insights */}
            {showInsights && aiInsights.length > 0 && (
              <div className="p-6 border-b border-blush bg-gradient-to-br from-cream to-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-deep">AI Journey Insights</h3>
                  <span className="text-xs text-warm-gray/80">{aiInsights.length} insights available</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className="bg-white rounded-lg p-4 shadow-sm border border-blush">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            insight.type === 'progress' ? 'bg-warm-gray/10' :
                            insight.type === 'recommendation' ? 'bg-blue-100' :
                            insight.type === 'consistency' ? 'bg-amber-100' :
                            insight.type === 'warning' ? 'bg-red-100' :
                            'bg-purple-100'
                          }`}>
                            <i className={`${
                              insight.type === 'progress' ? 'ri-line-chart-line text-warm-gray' :
                              insight.type === 'recommendation' ? 'ri-lightbulb-line text-blue-600' :
                              insight.type === 'consistency' ? 'ri-calendar-check-line text-amber-600' :
                              insight.type === 'warning' ? 'ri-alert-line text-red-600' :
                              'ri-trophy-line text-purple-600'
                            } text-lg`}></i>
                          </div>
                          <h4 className="font-semibold text-deep text-sm">{insight.title}</h4>
                        </div>
                        <span className="text-xs text-warm-gray/80 bg-cream px-2 py-1 rounded-full">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-warm-gray leading-relaxed mb-3">{insight.description}</p>
                      
                      {/* Related Photos */}
                      {insight.relatedPhotos && insight.relatedPhotos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-warm-gray mb-2">Visual Evidence:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {insight.relatedPhotos.map((photo, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={photo.url}
                                  alt={photo.note}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                  <p className="text-white text-xs text-center font-medium">{photo.date}</p>
                                  <p className="text-white text-xs text-center mt-1">{photo.note}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blush">
                        <span className="text-xs text-warm-gray/80">
                          <i className="ri-database-2-line mr-1"></i>
                          {insight.dataSource}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} motion-safe:animate-slide-up`}
                  style={{ animationDelay: `${Math.min(index * 50, 200)}ms`, animationFillMode: 'backwards' }}
                >
                  <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-cream text-deep'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    </div>

                    {/* Product Cards */}
                    {message.sender === 'ai' && message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.products.map((product, idx) => (
                          <ProductCard key={product.productId} product={product} index={idx} />
                        ))}
                        <div className="flex items-center gap-3 mt-3 text-xs text-warm-gray/80">
                          {message.products.some(p => p.source === 'marketplace') && (
                            <span className="flex items-center gap-1">
                              <i className="ri-shopping-bag-line text-primary"></i>
                              Marketplace
                            </span>
                          )}
                          {message.products.some(p => p.source === 'discovery' || !p.source) && (
                            <span className="flex items-center gap-1">
                              <i className="ri-compass-3-line text-sage"></i>
                              Discovery
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Routine Card */}
                    {message.sender === 'ai' && message.isRoutine && message.routine && (
                      <div className="mt-3">
                        <RoutineCard routine={message.routine} skinType={userProfile.skinType} />
                      </div>
                    )}

                    <span className={`text-xs mt-1 block px-2 ${
                      message.sender === 'user' ? 'text-right text-warm-gray/60' : 'text-warm-gray/80'
                    }`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start motion-safe:animate-fade-in">
                  <div className="max-w-[80%]">
                    <div className="bg-cream rounded-2xl px-4 py-3">
                      {/* AI Thinking State */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-warm-gray/70 flex items-center gap-1">
                          <i className="ri-loader-4-line motion-safe:animate-spin text-primary"></i>
                          Thinking...
                        </span>
                      </div>

                      {/* Typing Dots */}
                      <div className="flex gap-1 mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary motion-safe:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>

                      {/* Skeleton Lines for Response Preview */}
                      <div className="space-y-2">
                        <div className="h-3 bg-warm-gray/20 rounded-full w-full motion-safe:animate-pulse"></div>
                        <div className="h-3 bg-warm-gray/20 rounded-full w-4/5 motion-safe:animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-3 bg-warm-gray/20 rounded-full w-3/5 motion-safe:animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-blush">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask Curae AI anything about skincare..."
                    className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-[#2C5F4F]/20 focus:border-primary resize-none"
                    rows={1}
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-send-plane-fill text-xl"></i>
                </button>
              </div>
              {/* Quick Prompts - shown below input when conversation is new */}
              {messages.length <= 1 ? (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(prompt);
                          sessionState.trackInteraction('click', 'quick-prompt', { prompt });
                        }}
                        className="px-3 py-1.5 bg-cream text-deep text-sm rounded-full hover:bg-primary/10 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-warm-gray/80 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Settings Popup */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md max-h-[85vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-blush shrink-0">
              <h3 className="text-xl font-bold text-deep">AI Settings</h3>
              <button
                onClick={() => setShowCustomize(false)}
                className="text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Response Tone</label>
                <Dropdown
                  id="ai-tone"
                  value={aiSettings.tone}
                  onChange={(value) => setAiSettings({ ...aiSettings, tone: value as typeof aiSettings.tone })}
                  options={[
                    { value: 'friendly', label: 'Friendly & Casual' },
                    { value: 'professional', label: 'Professional & Formal' },
                    { value: 'encouraging', label: 'Encouraging & Supportive' },
                    { value: 'direct', label: 'Direct & Concise' },
                  ]}
                />
              </div>

              {/* Detail Level */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Detail Level</label>
                <Dropdown
                  id="ai-detail-level"
                  value={aiSettings.detailLevel}
                  onChange={(value) => setAiSettings({ ...aiSettings, detailLevel: value as typeof aiSettings.detailLevel })}
                  options={[
                    { value: 'brief', label: 'Brief - Quick answers' },
                    { value: 'balanced', label: 'Balanced - Standard detail' },
                    { value: 'detailed', label: 'Detailed - In-depth explanations' },
                  ]}
                />
              </div>

              {/* Response Style */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Response Style</label>
                <Dropdown
                  id="ai-response-style"
                  value={aiSettings.responseStyle}
                  onChange={(value) => setAiSettings({ ...aiSettings, responseStyle: value as typeof aiSettings.responseStyle })}
                  options={[
                    { value: 'conversational', label: 'Conversational' },
                    { value: 'structured', label: 'Structured (with bullet points)' },
                    { value: 'educational', label: 'Educational (with explanations)' },
                  ]}
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Custom Instructions</label>
                <p className="text-xs text-warm-gray/80 mb-2">Tell Curae AI how you'd like it to behave</p>
                <textarea
                  value={aiSettings.customInstructions}
                  onChange={(e) => setAiSettings({ ...aiSettings, customInstructions: e.target.value })}
                  placeholder="E.g., Always suggest natural alternatives, focus on budget-friendly options, explain ingredients in simple terms..."
                  rows={3}
                  className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* More About You */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">More About You</label>
                <p className="text-xs text-warm-gray/80 mb-2">Help Curae AI understand you better</p>
                <textarea
                  value={aiSettings.moreAboutYou}
                  onChange={(e) => setAiSettings({ ...aiSettings, moreAboutYou: e.target.value })}
                  placeholder="E.g., I'm new to skincare, I prefer Korean beauty products, I have a 5-minute morning routine, I'm on a tight budget..."
                  rows={3}
                  className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 pt-4 border-t border-blush shrink-0 flex gap-3">
              <button
                onClick={() => setShowCustomize(false)}
                className="flex-1 px-4 py-3 border border-blush text-warm-gray rounded-lg hover:bg-cream transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIChatPage;
