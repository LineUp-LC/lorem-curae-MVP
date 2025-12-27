import { useState } from 'react';

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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue, productName, noteContent);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, product?: string, note?: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      return `Based on your notes about ${product || 'this product'}, I recommend:\n\n1. Continue using it consistently for at least 4-6 weeks to see full results\n2. Apply it on clean, dry skin for better absorption\n3. Consider pairing it with a hydrating serum if you experience any dryness\n4. Track your progress with weekly photos to monitor improvements\n\nWould you like specific product recommendations to complement your routine?`;
    }
    
    if (lowerQuery.includes('side effect') || lowerQuery.includes('irritation')) {
      return `If you're experiencing irritation with ${product || 'this product'}, here's what I suggest:\n\n1. Reduce usage frequency (try every other day)\n2. Apply a thin layer of moisturizer first as a buffer\n3. Ensure you're using SPF during the day\n4. If irritation persists after 1 week, discontinue use\n\nWould you like me to recommend gentler alternatives?`;
    }
    
    if (lowerQuery.includes('how long') || lowerQuery.includes('when')) {
      return `For ${product || 'most skincare products'}, you can typically expect:\n\n• Initial changes: 2-4 weeks\n• Visible improvements: 4-8 weeks\n• Optimal results: 8-12 weeks\n\nConsistency is key! Keep tracking your progress in your notes, and I'll help you analyze the results.`;
    }
    
    if (lowerQuery.includes('ingredient') || lowerQuery.includes('contains')) {
      return `Great question about ingredients! ${product || 'This product'} likely contains active ingredients that work best when:\n\n1. Used consistently at the same time each day\n2. Applied to slightly damp skin for better penetration\n3. Followed by a moisturizer to lock in benefits\n4. Protected with SPF during daytime use\n\nWould you like me to explain any specific ingredients?`;
    }
    
    return `Thank you for your question about ${product || 'your skincare'}! Based on your notes, I can see you're making progress. Here are some personalized tips:\n\n1. Keep documenting your observations - your notes are very helpful!\n2. Be patient - skincare results take time\n3. Stay consistent with your routine\n4. Consider taking progress photos weekly\n\nIs there anything specific you'd like to know more about?`;
  };

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
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
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
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
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
                      ? 'bg-forest-800 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-forest-800/10 flex items-center justify-center">
                        <i className="ri-robot-2-line text-forest-800 text-xs"></i>
                      </div>
                      <span className="text-xs font-medium text-forest-800">AI Assistant</span>
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
                    <div className="w-6 h-6 rounded-full bg-forest-800/10 flex items-center justify-center">
                      <i className="ri-robot-2-line text-forest-800 text-xs"></i>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-forest-800 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-forest-800 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-forest-800 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    className="px-3 py-1 bg-cream-100 text-forest-800 text-xs rounded-full hover:bg-forest-800 hover:text-white transition-colors cursor-pointer"
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
                className="w-10 h-10 rounded-lg bg-forest-800 text-white flex items-center justify-center hover:bg-forest-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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