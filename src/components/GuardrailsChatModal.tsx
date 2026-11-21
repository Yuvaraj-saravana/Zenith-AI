import React, { useState } from 'react';
import {
  Send,
  ShieldAlert,
  User,
  Bot,
  Sparkles,
  Key,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { FinancialProfile, SubscriptionItem, Transaction } from '../types/finance';
import { AdvisorService } from '../services/advisorService';

interface GuardrailsChatModalProps {
  profile: FinancialProfile;
  transactions: Transaction[];
  subscriptions: SubscriptionItem[];
  currencySymbol: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  isGuardrailDeflection?: boolean;
  source?: 'gemini' | 'engine';
  timestamp: string;
}

export const GuardrailsChatModal: React.FC<GuardrailsChatModalProps> = ({
  profile,
  transactions,
  subscriptions,
  currencySymbol,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: `Hello! I'm **Advisor AI**, your living money coach.\n\nI combine real-time ledger intelligence with deep personal finance principles. Ask me anything—from calculating your exact spending on Swiggy, to applying the **50/30/20 rule**, debt payoff strategies, compound interest projections, or simulating goal accelerations!\n\n*(You can also test my fiduciary guardrails or connect your own free Gemini API key using the button above).*`,
      timestamp: 'Just now',
      source: 'engine',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(AdvisorService.getStoredApiKey());
  const [keyInput, setKeyInput] = useState(AdvisorService.getStoredApiKey());
  const [keySavedToast, setKeySavedToast] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    AdvisorService.setStoredApiKey(keyInput);
    setGeminiApiKey(keyInput.trim());
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1500);
  };

  const handleClearApiKey = () => {
    AdvisorService.setStoredApiKey('');
    setGeminiApiKey('');
    setKeyInput('');
    setShowKeyModal(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await AdvisorService.getAdvisorResponse(
        query,
        profile,
        transactions,
        subscriptions,
        geminiApiKey
      );

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: response.text,
        isGuardrailDeflection: response.isGuardrailDeflection,
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Advisor AI chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'agent',
        text: `I encountered an unexpected issue while processing your question. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'engine',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    { label: '🛡️ Test Guardrail: "Which stock to buy today?"', text: 'Which stock should I buy today to double my money fast?' },
    { label: '📐 "Apply 50/30/20 rule to my income"', text: 'How does the 50/30/20 budgeting rule apply to my monthly income and living expenses?' },
    { label: '💳 "What are my highest expenses right now?"', text: 'Where is my money going? What are my highest spending categories?' },
    { label: '🍣 "How much did I spend on Swiggy and dining?"', text: 'How much did I spend on Swiggy and Food & Dining across recent transactions?' },
    { label: '🚨 "What is my emergency fund runway?"', text: 'What is my current emergency fund runway and how do I reach 6 months?' },
    { label: '📈 "How does compound interest double my money?"', text: 'Can you explain the Rule of 72 and how compound interest grows my monthly savings?' },
  ];

  // Helper to render basic markdown formatting cleanly
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-slate-900 dark:text-white text-sm mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-bold text-slate-900 dark:text-white text-xs mt-2 mb-1">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Table rows
      if (line.startsWith('|') && line.endsWith('|')) {
        // Skip separator row
        if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(line)) {
          return null;
        }
        const cells = line.split('|').slice(1, -1);
        return (
          <div key={idx} className="grid grid-cols-4 gap-1.5 py-1 px-2 text-[11px] bg-slate-100/60 dark:bg-slate-800/40 rounded border border-slate-200/50 dark:border-slate-700/50 my-0.5">
            {cells.map((cell, cIdx) => (
              <span key={cIdx} className="truncate font-medium">{cell.trim()}</span>
            ))}
          </div>
        );
      }
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().replace(/^[-*]\s+/, '');
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-0.5 ml-1">
            <span className="text-blue-500 font-bold">•</span>
            <span>{parseInlineBold(text)}</span>
          </div>
        );
      }
      // Blank line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return <div key={idx} className="my-0.5">{parseInlineBold(line)}</div>;
    });
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col h-[670px]">
        {/* Top Chat Toolbar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>Advisor AI</span>
                <span className="text-[10px] text-slate-400 font-normal">• Living Money Coach</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {geminiApiKey ? (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                <Sparkles className="h-3 w-3" />
                <span>Gemini 2.5 Active</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                <Sparkles className="h-3 w-3" />
                <span>Financial Engine Active</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Configure Google Gemini API Key"
            >
              <Key className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Gemini Key</span>
            </button>
          </div>
        </div>

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                {isAgent && (
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.isGuardrailDeflection
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                    }`}
                  >
                    {msg.isGuardrailDeflection ? <ShieldAlert className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isAgent
                      ? msg.isGuardrailDeflection
                        ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200'
                      : 'bg-blue-600 text-white font-medium shadow-sm'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                  <div className={`text-[10px] mt-2 flex items-center justify-between ${isAgent ? 'text-slate-400' : 'text-blue-100'}`}>
                    {isAgent && (
                      <span className="flex items-center space-x-1 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                        {msg.source === 'gemini' ? '✨ Google Gemini 2.5' : '⚡ Living Money Engine'}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {!isAgent && (
                  <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 italic py-2">
              <Bot className="h-4 w-4 text-blue-500 animate-spin" />
              <span>Advisor AI is evaluating your living finances with Gemini reasoning...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts directly above the text box */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Suggested Questions:
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-20 overflow-y-auto">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.text)}
                disabled={isTyping}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-xs disabled:opacity-40"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about spending, 50/30/20 budget, emergency runway, or safe investing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-blue-600 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-blue-500 transition cursor-pointer shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Google Gemini AI Integration</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Advisor AI works out-of-the-box using its built-in living financial reasoning engine. To empower it with live <strong>Google Gemini 2.5 Flash</strong> intelligence, enter your free Gemini API key below:
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <span>Get Free Key (Google AI Studio)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove Key
                  </button>
                )}
              </div>

              {keySavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Key saved! Connected to Gemini 2.5 Flash.</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
