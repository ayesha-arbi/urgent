// ============================================================
// Sidebar Component
// ============================================================

'use client';

import React from 'react';
import {
  LayoutDashboard, MapPin, Info, Leaf,
  Clock, ChevronRight, Globe,
} from 'lucide-react';
import type { Page, AnalysisSession } from '@/types';
import { formatRelativeTime, scoreColor } from '@/lib/utils';

interface NavItem {
  id: Page;
  label: string;
  Icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyse Land', Icon: MapPin },
  { id: 'about', label: 'About', Icon: Info },
];

interface SidebarProps {
  currentPage: Page;
  recentSessions: AnalysisSession[];
  onNavigate: (page: Page) => void;
  onSessionClick: (session: AnalysisSession) => void;
}

export function Sidebar({ currentPage, recentSessions, onNavigate, onSessionClick }: SidebarProps) {
  return (
    <aside style={{
      width: 'var(--z-sidebar-w)',
      background: 'var(--z-bg-surface)',
      borderRight: '1px solid var(--z-border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--z-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Leaf size={18} color="#052e16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--z-font-display)',
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--z-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Zameendar<span style={{ color: 'var(--z-green-400)' }}>.ai</span>
            </div>
            <div style={{
              fontFamily: 'var(--z-font-mono)',
              fontSize: 9,
              color: 'var(--z-text-faint)',
              letterSpacing: '0.1em',
              marginTop: 1,
            }}>
              زمیندار · LAND AI
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '10px 10px 0' }}>
        <div style={{
          fontFamily: 'var(--z-font-mono)',
          fontSize: 9,
          color: 'var(--z-text-faint)',
          letterSpacing: '0.1em',
          padding: '6px 8px',
          marginBottom: 4,
        }}>
          NAVIGATION
        </div>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 'var(--z-radius-md)',
                border: 'none',
                background: active ? 'rgba(74,222,128,0.1)' : 'transparent',
                color: active ? 'var(--z-green-400)' : 'var(--z-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--z-font-body)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                marginBottom: 2,
                textAlign: 'left',
                transition: 'all var(--z-duration-fast)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--z-bg-hover)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--z-text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--z-text-secondary)';
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              {label}
              {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </button>
          );
        })}
      </nav>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div style={{
          padding: '16px 10px 0',
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 8px 8px',
            fontFamily: 'var(--z-font-mono)',
            fontSize: 9,
            color: 'var(--z-text-faint)',
            letterSpacing: '0.1em',
          }}>
            <Clock size={10} />
            RECENT ANALYSES
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {recentSessions.slice(0, 6).map(session => {
              const topScore = session.result.scores.reduce((a, b) => a.score > b.score ? a : b);
              return (
                <button
                  key={session.id}
                  onClick={() => onSessionClick(session)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--z-radius-md)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 2,
                    transition: 'background var(--z-duration-fast)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--z-bg-hover)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--z-text-primary)' }}>
                      {session.location.placeName}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: 'var(--z-font-mono)',
                      color: scoreColor(topScore.score),
                      fontWeight: 600,
                    }}>
                      {topScore.score}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--z-text-muted)' }}>{session.location.country}</span>
                    <span style={{ fontSize: 10, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)' }}>
                      {formatRelativeTime(session.timestamp)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--z-border-subtle)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--z-text-faint)' }}>
          <Globe size={10} />
          <span style={{ fontFamily: 'var(--z-font-mono)', letterSpacing: '0.05em' }}>v1.0 · MVP</span>
        </div>
      </div>
    </aside>
  );
}
