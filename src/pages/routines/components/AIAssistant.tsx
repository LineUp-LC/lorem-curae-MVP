import { useState, useCallback } from 'react';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import type { ConversationMessage } from '../../../lib/ai/types';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  productName?: string;
  noteContent?: string;
}

export default function AIAssistant({ productName, noteContent }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi! I'm your skincare AI assistant. I can help you with recommendations, answer questions about ${productName || 'your products'}, and provide personalized advice based on your notes. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const question = inputValue;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build conversation history from current messages (including the new user message)
      const conversationHistory: ConversationMessage[] = [
        ...messages.slice(1).map(m => ({
          role: (m.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: question },
      ];

      // Build chat context with product + note data
      const ctx = buildAIContext('chat', {
        page: {
          mode: 'chat',
          conversationHistory,
        },
      });

      // Enrich question with product/note context for the AI
      let enrichedQuestion = question;
      if (productName) {
        enrichedQuestion += ` (Context: the user is asking about the product "${productName}")`;
      }
      if (noteContent) {
        enrichedQuestion += ` (User's notes: "${noteContent}")`;
      }

      const result = await requestAIInsight(ctx, {
        skipCache: true,
        question: enrichedQuestion,
      });

      const responseText = result.success
        ? result.insight
        : result.fallbackInsight || 'I was unable to generate a response right now. Please try again in a moment.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Something went wrong. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, messages, productName, noteContent]);

  const quickPrompts = [
    'How long until I see results?',
    'Any side effects to watch for?',
    'Recommend complementary products',
    'Explain the key ingredients',
  ];

  return (
    <div className="relative">
      {/* AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2C5F4F] to-[#3D7A63] text-white rounded-full hover:shadow-lg transition-all cursor-pointer group"
        title="Chat with AI Assistant"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <i className="ri-robot-2-line text-lg"></i>
        </div>
        <span className="font-medium text-sm whitespace-nowrap">AI Assistant</span>
        <div className="w-2 h-2 rounded-full bg-taupe-400 motion-safe:animate-pulse"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2C5F4F] to-[#3D7A63] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <i className="ri-robot-2-line text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold">Skincare AI Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <div className="w-2 h-2 rounded-full bg-taupe-400"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-cream-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-deep text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-deep/10 flex items-center justify-center">
                        <i className="ri-robot-2-line text-deep text-xs"></i>
                      </div>
                      <span className="text-xs font-medium text-deep">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-deep/10 flex items-center justify-center">
                      <i className="ri-robot-2-line text-deep text-xs"></i>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-deep motion-safe:animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-deep motion-safe:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-deep motion-safe:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(prompt)}
                    className="px-3 py-1 bg-cream-100 text-deep text-xs rounded-full hover:bg-deep hover:text-white transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-lg bg-deep text-white flex items-center justify-center hover:bg-deep-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}