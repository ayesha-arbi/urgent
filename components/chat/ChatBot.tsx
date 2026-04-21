'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/chat',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m ZameendarAI. Ask me anything about land suitability analysis, how to use the platform, or interpreting your results.',
      }]);
    }
  };

  const handleClose = () => setIsOpen(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    append({ role: 'user', content: input });
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)',
          color: '#000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(74, 222, 128, 0.4)',
          zIndex: 9999,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = 'scale(1.05)';
          el.style.boxShadow = '0 6px 24px rgba(74, 222, 128, 0.5)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 16px rgba(74, 222, 128, 0.4)';
        }}
      >
        {isOpen ? <X size={24} strokeWidth={2.5} /> : <MessageCircle size={24} strokeWidth={2.5} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: 360,
            height: 500,
            background: 'var(--z-bg-surface)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 16,
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
              borderBottom: '1px solid var(--z-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle size={18} color="#000" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--z-text-primary)' }}>
                  ZameendarAI
                </div>
                <div style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                  Always here to help
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: '1px solid var(--z-border-subtle)',
                background: 'var(--z-bg-card)',
                color: 'var(--z-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)'
                      : 'var(--z-bg-raised)',
                    color: msg.role === 'user' ? '#000' : 'var(--z-text-primary)',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                    borderBottomLeftRadius: msg.role === 'user' ? 14 : 4,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: 'var(--z-bg-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: 'var(--z-text-secondary)' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            style={{
              padding: 12,
              borderTop: '1px solid var(--z-border-subtle)',
              display: 'flex',
              gap: 8,
              background: 'var(--z-bg-card)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--z-border-subtle)',
                background: 'var(--z-bg-raised)',
                color: 'var(--z-text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: 'none',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)'
                  : 'var(--z-bg-raised)',
                color: input.trim() && !isLoading ? '#000' : 'var(--z-text-muted)',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={e => {
                if (input.trim() && !isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
