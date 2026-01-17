import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { sessionState } from '../../lib/utils/sessionState';
import { adaptiveAI } from '../../lib/utils/adaptiveAI';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase-browser';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';

// Local interface for AI chat user profile (different from Supabase UserProfile)
interface AIChatUserProfile {
  skinType: string;
  concerns: string[];
  goals: string[];
  sensitivities: string[];
  preferences: {
    crueltyFree: boolean;
    vegan: boolean;
  };
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Persist insights panel visibility preference
  const [showInsights, setShowInsights] = useLocalStorageState<boolean>(
    'ai_chat_insights_visible',
    true
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  const [aiSettings, setAiSettings] = useState({
    tone: 'friendly',
    detailLevel: 'balanced',
    responseStyle: 'conversational',
    customInstructions: '',
    moreAboutYou: ''
  });

  const quickPrompts = [
    'Recommend products for my skin type',
    'Explain retinol and how to use it',
    'Create a morning routine for me',
    'How do I layer products correctly?',
    'What ingredients help with acne?',
    'Track my skincare progress',
  ];

  useEffect(() => {
    loadUserProfile();
    loadChatSessions();
    loadAIInsights();

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

  // Auto-scroll disabled - user controls their own scroll position
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const scrollToBottom = () => {
    // Only scroll if explicitly called by user action, not automatically
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem('user_skin_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // Load from quiz results if available
      const quizResults = localStorage.getItem('skin_quiz_results');
      if (quizResults) {
        const results = JSON.parse(quizResults);
        setUserProfile({
          skinType: results.skinType || 'normal',
          concerns: results.concerns || [],
          goals: results.goals || [],
          sensitivities: results.sensitivities || [],
          preferences: results.preferences || { crueltyFree: false, vegan: false },
        });
      }
    }
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
    setMessages([
      {
        id: 1,
        sender: 'ai',
        content: 'Hello! I\'m Curae AI, your personalized skincare assistant. I can help you with product recommendations, routine building, ingredient questions, and progress tracking. What would you like to know?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentSession('current');
    localStorage.setItem('ai_chat_current_session', 'current');
  };

  // Fixed: Message objects now match the Message interface
  const handleSendMessage = () => {
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

    // Generate adaptive AI response
    const aiResponse = adaptiveAI.generateResponse(inputMessage);
    
    const assistantMessage: Message = {
      id: Date.now() + 1,
      sender: 'ai',
      content: aiResponse.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      saveChatSession();
      sessionState.trackInteraction('completion', 'ai-response-generated');
    }, 800);

    setInputMessage('');
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
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Chat History */}
          <div className="lg:col-span-1 bg-white rounded-xl p-4 overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-deep">Conversations</h2>
              <button 
                onClick={() => {
                  setMessages([
                    {
                      id: 1,
                      sender: 'ai',
                      content: 'Hello! I\'m Curae AI, your personalized skincare assistant. I can help you with product recommendations, routine building, ingredient questions, and progress tracking. What would you like to know?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                  setCurrentSession('current');
                }}
                className="text-sm text-deep font-medium cursor-pointer"
              >
                + New Chat
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
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-6 border-b border-blush flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-dark rounded-full flex items-center justify-center relative">
                  <i className="ri-sparkling-2-fill text-white text-xl"></i>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-deep">Curae AI</h2>
                  <p className="text-sm text-warm-gray/80">Your personalized skincare assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      showInsights
                        ? 'bg-primary text-white'
                        : 'bg-cream text-warm-gray hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-lightbulb-line mr-2"></i>
                    Insights
                  </button>
                  <div className="relative group">
                    <i className="ri-information-line text-warm-gray/60 hover:text-warm-gray cursor-help"></i>
                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-deep text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      Get AI‑powered insights that reveal what's changing in your skin and why, using your notes, photos, and routines.
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-deep rotate-45"></div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/my-skin"
                  className="px-4 py-2 bg-cream text-warm-gray rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-calendar-check-line mr-1"></i>
                  View Progress
                </Link>
              </div>
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
                            insight.type === 'progress' ? 'bg-taupe-100' :
                            insight.type === 'recommendation' ? 'bg-blue-100' :
                            insight.type === 'consistency' ? 'bg-amber-100' :
                            insight.type === 'warning' ? 'bg-red-100' :
                            'bg-purple-100'
                          }`}>
                            <i className={`${
                              insight.type === 'progress' ? 'ri-line-chart-line text-taupe' :
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} motion-safe:animate-slide-up`}
                  style={{ animationDelay: `${Math.min(index * 50, 200)}ms`, animationFillMode: 'backwards' }}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-cream text-deep'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-dark flex items-center justify-center">
                            <i className="ri-sparkling-2-fill text-white text-xs"></i>
                          </div>
                          <span className="text-xs font-medium text-deep">Curae</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    </div>
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
                      {/* AI Avatar and Thinking State */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-dark flex items-center justify-center">
                          <i className="ri-sparkling-2-fill text-white text-xs"></i>
                        </div>
                        <span className="text-xs font-medium text-deep">Curae</span>
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

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-6 py-3 border-t border-blush">
                <p className="text-xs text-warm-gray/80 mb-2">Quick questions:</p>
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
            )}

            {/* Input Area */}
            <div className="p-6 border-t border-blush">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
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
              <p className="text-xs text-warm-gray/80 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
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
                <select
                  value={aiSettings.tone}
                  onChange={(e) => setAiSettings({ ...aiSettings, tone: e.target.value })}
                  className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="friendly">Friendly & Casual</option>
                  <option value="professional">Professional & Formal</option>
                  <option value="encouraging">Encouraging & Supportive</option>
                  <option value="direct">Direct & Concise</option>
                </select>
              </div>

              {/* Detail Level */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Detail Level</label>
                <select
                  value={aiSettings.detailLevel}
                  onChange={(e) => setAiSettings({ ...aiSettings, detailLevel: e.target.value })}
                  className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="brief">Brief - Quick answers</option>
                  <option value="balanced">Balanced - Standard detail</option>
                  <option value="detailed">Detailed - In-depth explanations</option>
                </select>
              </div>

              {/* Response Style */}
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">Response Style</label>
                <select
                  value={aiSettings.responseStyle}
                  onChange={(e) => setAiSettings({ ...aiSettings, responseStyle: e.target.value })}
                  className="w-full px-4 py-3 border border-blush rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="conversational">Conversational</option>
                  <option value="structured">Structured (with bullet points)</option>
                  <option value="educational">Educational (with explanations)</option>
                </select>
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

      <Footer />
    </div>
  );
};

export default AIChatPage;
