import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import {
  sendChatMessage,
  isSafetyResult,
  type ChatResponse,
  type EvidenceCitation,
  type RecommendationAudience,
} from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: EvidenceCitation[];
  isEmergency?: boolean;
}

interface ChatWidgetProps {
  isDarkMode: boolean;
  audience?: RecommendationAudience;
}

const COPY = {
  openLabel: 'Open guideline assistant',
  closeLabel: 'Close guideline assistant',
  title: 'Guideline Assistant',
  subtitle: 'Answers are grounded in retrieved guideline evidence only.',
  placeholder: 'Ask about concussion recovery guidelines…',
  send: 'Send',
  intro:
    'Ask a short question about concussion recovery guidelines (e.g. "How soon can I return to sport?"). I only answer from the guideline sources in this system. I do not diagnose or give medical clearance — for symptom concerns, use Daily Check-in.',
  emergency:
    'This assistant does not evaluate emergency symptoms. Please use the Daily Check-in symptom questions, and seek immediate medical care if you selected a red-flag symptom.',
  noEvidence:
    'No matching guideline evidence was found for this question, so no answer is shown.',
  error: 'Could not reach the assistant. Please try again.',
  unavailable:
    'The guideline evidence service is starting up. Please try the question again in a moment.',
} as const;

export default function ChatWidget({ isDarkMode, audience = 'general' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const copy = COPY;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isSending) return;

    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: question }]);
    setIsSending(true);

    try {
      const result = await sendChatMessage({ question, audience });
      if (isSafetyResult(result)) {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', text: copy.emergency, isEmergency: true },
        ]);
      } else {
        const chatResult = result as ChatResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text:
              chatResult.status === 'no_evidence_found'
                ? copy.noEvidence
                : chatResult.status === 'evidence_unavailable'
                  ? copy.unavailable
                  : chatResult.answer,
            citations: chatResult.citations,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: copy.error }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? copy.closeLabel : copy.openLabel}
        aria-expanded={isOpen}
        className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 ${
          isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={copy.title}
          className={`fixed bottom-24 right-6 z-[60] flex h-[32rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
            isDarkMode ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`border-b px-4 py-3 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{copy.title}</div>
            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{copy.subtitle}</div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className={`rounded-xl p-3 text-xs leading-relaxed ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                {copy.intro}
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isEmergency
                        ? 'border border-red-400 bg-red-50 text-red-800'
                        : isDarkMode
                          ? 'bg-white/10 text-slate-100'
                          : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>…</div>
            )}
          </div>

          <div className={`flex items-center gap-2 border-t p-3 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={copy.placeholder}
              disabled={isSending}
              className={`h-11 flex-1 rounded-full border px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                isDarkMode ? 'border-white/15 bg-white/5 text-white placeholder:text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              aria-label={copy.send}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
