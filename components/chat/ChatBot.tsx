'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { useRole, ROLE_CONFIG } from '@/lib/role-context';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { role } = useRole();

  const config = role ? ROLE_CONFIG[role] : null;
  const accentColor = config?.accentColor ?? '#4ade80';

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
    // send role to the API route on every request
    body: { role },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Reset + re-greet whenever role changes
  useEffect(() => {
    if (!isOpen) return;
    const welcome = config?.chatWelcome
      ?? "Hello! I'm ZameendarAI. Ask me anything about land suitability or how to use the platform.";
    setMessages([{ id: 'welcome', role: 'assistant', content: welcome }]);
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome = config?.chatWelcome
        ?? "Hello! I'm ZameendarAI. Ask me anything about land suitability or how to use the platform.";
      setMessages([{ id: 'welcome', role: 'assistant', content: welcome }]);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    append({ role: 'user', content: input });
    setInput('');
  };

  return (
    <>
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`,
          color: '#000', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${accentColor}66`,
          zIndex: 9999, transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {isOpen ? <X size={24} strokeWidth={2.5} /> : <MessageCircle size={24} strokeWidth={2.5} />}
      </button>

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
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--z-text-primary)' }}>ZameendarAI</div>
                <div style={{ fontSize: 11, color: accentColor }}>
                  {config ? `Mode: ${config.label}` : 'General Assistant'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              width: 28, height: 28, borderRadius: 6,
              border: '1px solid var(--z-border-subtle)',
              background: 'var(--z-bg-card)', color: 'var(--z-text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                  fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                  background: msg.role === 'user'
                    ? `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`
                    : 'var(--z-bg-raised)',
                  color: msg.role === 'user' ? '#000' : 'var(--z-text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                  borderBottomLeftRadius: msg.role === 'user' ? 14 : 4,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14, background: 'var(--z-bg-raised)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: 'var(--z-text-secondary)' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} style={{
            padding: 12, borderTop: '1px solid var(--z-border-subtle)',
            display: 'flex', gap: 8, background: 'var(--z-bg-card)',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--z-border-subtle)',
                background: 'var(--z-bg-raised)', color: 'var(--z-text-primary)',
                fontSize: 13, outline: 'none',
              }}
            />
            <button type="submit" disabled={isLoading || !input.trim()} style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: input.trim() && !isLoading
                ? `linear-gradient(135deg, ${accentColor} 0%, #2dd4bf 100%)`
                : 'var(--z-bg-raised)',
              color: input.trim() && !isLoading ? '#000' : 'var(--z-text-muted)',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}