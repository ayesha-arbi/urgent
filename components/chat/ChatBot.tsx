'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useRole, ROLE_CONFIG } from '@/lib/role-context';
import ReactMarkdown from 'react-markdown';

// ── Types ─────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

let msgCounter = 0;
const uid = () => `msg-${++msgCounter}-${Date.now()}`;

export function ChatBot({ currentResult }: { currentResult?: any }) {
  const [isOpen, setIsOpen]          = useState(false);
  const [input, setInput]            = useState('');
  const [messages, setMessages]      = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef               = useRef<HTMLDivElement>(null);
  const inputRef                     = useRef<HTMLInputElement>(null);
  const abortRef                     = useRef<AbortController | null>(null);
  const { role }                     = useRole();

  const config      = role ? ROLE_CONFIG[role] : null;
  const accentColor = config?.accentColor ?? '#4ade80';

  // ── Welcome message ───────────────────────────────────────
  const welcomeText =
    config?.chatWelcome ??
    "Hello! I'm ZameendarAI. Ask me anything about land suitability or how to use the platform.";

  const makeWelcome = useCallback((): ChatMessage => ({
    id     : uid(),
    role   : 'assistant',
    content: welcomeText,
  }), [welcomeText]);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Re-greet when role changes while panel is open
  useEffect(() => {
    if (!isOpen) return;
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([makeWelcome()]);
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Open handler ──────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) setMessages([makeWelcome()]);
  };

  // ── Send message with manual streaming ───────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text };
    const assistantId          = uid();

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setIsStreaming(true);

    // Build history for the API (exclude the empty assistant placeholder)
    const history = [...messages, userMsg].map(m => ({
      role   : m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          messages: history,
          role,
          context : currentResult,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(errText);
      }

      const reader    = res.body.getReader();
      const decoder   = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          if (line.startsWith('0:')) {
            try {
              const parsed = JSON.parse(line.slice(2));
              if (typeof parsed === 'string') accumulated += parsed;
            } catch {
              accumulated += line.slice(2);
            }
          } else if (
            line.startsWith('d:') ||
            line.startsWith('e:') ||
            line === ''
          ) {
            // skip control lines
          } else if (!line.startsWith('data:')) {
            accumulated += line;
          }
        }

        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
        );
      }

      // Final flush for any trailing content
      const trailing = decoder.decode();
      if (trailing) accumulated += trailing;
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content: accumulated || '...' } : m
        )
      );

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[ChatBot] Stream error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, role, isStreaming, currentResult]);

  // ── Submit handler ────────────────────────────────────────
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    sendMessage(trimmed);
  };

  return (
    <>
      {/* ── Scoped markdown styles for assistant bubbles only ── */}
      <style>{`
        .z-chat-md p            { margin: 0 0 6px 0; }
        .z-chat-md p:last-child { margin-bottom: 0; }
        .z-chat-md ul,
        .z-chat-md ol           { margin: 4px 0 6px 16px; padding: 0; }
        .z-chat-md li           { margin-bottom: 2px; }
        .z-chat-md strong       { font-weight: 700; }
        .z-chat-md em           { font-style: italic; }
        .z-chat-md code         {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 12px;
          background: rgba(255,255,255,0.1);
          padding: 1px 4px;
          border-radius: 3px;
        }
        .z-chat-md pre          {
          background: rgba(0,0,0,0.3);
          padding: 8px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 6px 0;
        }
        .z-chat-md pre code     { background: none; padding: 0; }
        .z-chat-md h1,
        .z-chat-md h2,
        .z-chat-md h3           { font-weight: 700; margin: 8px 0 4px; font-size: 13px; }
        .z-chat-md a            { color: #4ade80; text-decoration: underline; }
        .z-chat-md blockquote   {
          border-left: 2px solid rgba(255,255,255,0.2);
          margin: 4px 0;
          padding-left: 8px;
          opacity: 0.8;
        }
      `}</style>

      {/* FAB */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`,
          color: '#000', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${accentColor}66`,
          zIndex: 9999, transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {isOpen
          ? <X size={24} strokeWidth={2.5} />
          : <MessageCircle size={24} strokeWidth={2.5} />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24,
          width: 360, height: 500,
          background: 'var(--z-bg-surface)',
          border: '1px solid var(--z-border-subtle)',
          borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999, overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}10 100%)`,
            borderBottom: '1px solid var(--z-border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={18} color="#000" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--z-text-primary)' }}>
                  ZameendarAI
                </div>
                <div style={{ fontSize: 11, color: accentColor }}>
                  {config ? `Mode: ${config.label}` : 'General Assistant'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: '1px solid var(--z-border-subtle)',
                background: 'var(--z-bg-card)', color: 'var(--z-text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                  fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                  background: msg.role === 'user'
                    ? `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`
                    : 'var(--z-bg-raised)',
                  color: msg.role === 'user' ? '#000' : 'var(--z-text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? 4  : 14,
                  borderBottomLeftRadius:  msg.role === 'user' ? 14 : 4,
                  borderRight: (isStreaming && msg.role === 'assistant' && msg.content !== '')
                    ? `2px solid ${accentColor}`
                    : 'none',
                }}>
                  {msg.content ? (
                    msg.role === 'assistant' ? (
                      // ── ReactMarkdown for assistant messages only ──
                      <div className="z-chat-md">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      // ── Plain text for user messages ──
                      msg.content
                    )
                  ) : (
                    // ── Spinner while waiting for first chunk ──
                    <Loader2 size={14} style={{ animation: 'z-spin 1s linear infinite' }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            style={{
              padding: 12, borderTop: '1px solid var(--z-border-subtle)',
              display: 'flex', gap: 8, background: 'var(--z-bg-card)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isStreaming}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--z-border-subtle)',
                background: 'var(--z-bg-raised)', color: 'var(--z-text-primary)',
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none',
                background: input.trim() && !isStreaming
                  ? `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`
                  : 'var(--z-bg-raised)',
                color: input.trim() && !isStreaming ? '#000' : 'var(--z-text-muted)',
                cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}