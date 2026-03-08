/**
 * ProductGuideChat
 *
 * Floating page-level AI helper for the Product Detail page.
 * Renders as a bottom-right NeuralBloomIcon button that expands into
 * a chat panel with highlighted responses, navigation chips, and
 * contextual starter questions.
 */

import { useState, useRef, useEffect } from 'react';
import { generateModalChatResponse, type ModalChatContext, type NavigationTarget } from '../../lib/utils/modalChatResponder';
import { deriveConditions } from '../../lib/environment/productKnowledge';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';

// ---------------------------------------------------------------------------
// Highlight helper (mirrors EnvironmentFitModal implementation)
// ---------------------------------------------------------------------------

const HL_CLASS = 'font-semibold text-primary-700';

function highlightResponse(
  text: string,
  phrases: string[],
  maxHighlights = 6,
): React.ReactNode {
  const filtered = [...new Set(phrases)].filter(Boolean);
  if (filtered.length === 0 || !text) return text;

  const sorted = filtered.sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let count = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (count >= maxHighlights) break;
    if (match.index > lastIndex) segments.push(text.slice(lastIndex, match.index));
    segments.push(
      <span key={`hl-${match.index}`} className={HL_CLASS}>{match[0]}</span>,
    );
    lastIndex = match.index + match[0].length;
    count++;
  }

  if (lastIndex < text.length) segments.push(text.slice(lastIndex));
  return segments.length > 0 ? <>{segments}</> : text;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductGuideChatProps {
  chatContext: ModalChatContext;
  /** Called when a navigation chip is tapped — parent handles scrolling / tab switching. */
  onNavigate?: (target: NavigationTarget) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  highlights?: string[];
}

export default function ProductGuideChat({ chatContext, onNavigate }: ProductGuideChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [lastFollowUp, setLastFollowUp] = useState<string | null>(null);
  const [lastNavTarget, setLastNavTarget] = useState<NavigationTarget | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive conditions for starter chips
  const conditions = deriveConditions(chatContext.env);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = (text?: string) => {
    const question = (text || input).trim();
    if (!question) return;

    const userMsg: ChatMessage = { role: 'user', text: question };
    const { response, highlightPhrases: hl, suggestedFollowUp, navigationTarget } =
      generateModalChatResponse(question, chatContext);
    const assistantMsg: ChatMessage = { role: 'assistant', text: response, highlights: hl };

    setMessages(prev => [...prev.slice(-5), userMsg, assistantMsg]);
    setInput('');
    setLastFollowUp(suggestedFollowUp || null);
    setLastNavTarget(navigationTarget || null);
  };

  const handleFollowUpTap = (followUp: string) => {
    handleSend(followUp);
  };

  const handleNavTap = (target: NavigationTarget) => {
    onNavigate?.(target);
    setLastNavTarget(null);
  };

  // Build condition-aware starter chip
  const conditionQuestion = conditions.length > 0
    ? `Is this good for ${
        conditions[0] === 'humid' ? 'humidity'
        : conditions[0] === 'dry_air' ? 'dry air'
        : conditions[0] === 'high_uv' ? 'strong sun'
        : conditions[0] === 'cold' ? 'cold weather'
        : conditions[0] === 'hot' ? 'heat'
        : 'my conditions'
      }?`
    : null;

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Expanded chat panel */}
      <div
        className={`w-80 max-h-[420px] bg-white rounded-2xl shadow-2xl border border-blush/40 flex flex-col transition-all duration-200 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none h-0 overflow-hidden'
        }`}
        role="dialog"
        aria-label="Product Guide"
        aria-hidden={!isOpen}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-blush/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <NeuralBloomIcon size={12} />
            </div>
            <span className="text-xs font-semibold text-deep">Product Guide</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Product Guide"
            className="w-6 h-6 flex items-center justify-center text-warm-gray/50 hover:text-deep rounded-full hover:bg-cream transition-all cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0">
          {messages.length > 0 ? (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-1.5 mt-0.5 flex-shrink-0">
                      <NeuralBloomIcon size={9} />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/10 text-deep rounded-br-sm'
                      : 'bg-cream/60 text-warm-gray border border-blush/30 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' && msg.highlights && msg.highlights.length > 0
                      ? highlightResponse(msg.text, msg.highlights)
                      : msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[10px] text-warm-gray/50 italic">
                Ask anything about this product — ingredients, how it fits your skin, environment, or concerns.
              </p>
              {/* Starter chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'How does this fit my skin?',
                  ...(conditionQuestion ? [conditionQuestion] : []),
                  'Tell me about the ingredients',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[10px] text-primary hover:text-dark bg-primary/5 px-2.5 py-1 rounded-full border border-primary/15 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chips area (nav + follow-up) */}
        {messages.length > 0 && (lastNavTarget || lastFollowUp) && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {lastNavTarget && (
              <button
                onClick={() => handleNavTap(lastNavTarget)}
                className="text-[11px] text-deep hover:text-primary bg-cream/60 px-3 py-1.5 rounded-full border border-blush/30 transition-colors cursor-pointer flex items-center gap-1"
              >
                <i className="ri-arrow-down-s-line text-xs"></i>
                {lastNavTarget.label}
              </button>
            )}
            {lastFollowUp && (
              <button
                onClick={() => handleFollowUpTap(lastFollowUp)}
                className="text-[11px] text-primary hover:text-dark bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 transition-colors cursor-pointer"
              >
                {lastFollowUp}
              </button>
            )}
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 pb-3 pt-1 flex items-center gap-2 border-t border-blush/20 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask about this product..."
            aria-label="Ask a question about this product"
            className="flex-1 text-xs text-deep bg-white border border-blush/50 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
          />
          <button
            onClick={() => handleSend()}
            disabled={input.trim().length === 0}
            aria-label="Send message"
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
              input.trim().length > 0
                ? 'bg-primary text-white hover:bg-dark cursor-pointer'
                : 'bg-gray-200 text-warm-gray/60 cursor-not-allowed'
            }`}
          >
            <i className="ri-send-plane-fill text-[10px]" />
          </button>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close Product Guide' : 'Open Product Guide'}
        aria-expanded={isOpen}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isOpen
            ? 'bg-primary text-white scale-90'
            : 'bg-primary text-white hover:bg-dark hover:scale-105'
        }`}
      >
        {isOpen
          ? <i className="ri-close-line text-xl"></i>
          : <NeuralBloomIcon size={20} color="white" />
        }
      </button>
    </div>
  );
}
