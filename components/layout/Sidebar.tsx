'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, MapPin, Info, Leaf,
  Clock, Globe, ChevronRight, Home,
  TrendingUp, Sparkles,
} from 'lucide-react';
import type { Page, AnalysisSession } from '@/types';
import { formatRelativeTime, scoreColor } from '@/lib/utils';

interface NavItem {
  id: Page;
  label: string;
  Icon: React.ElementType;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'landing',   label: 'Home',      Icon: Home,            description: 'Back to start' },
  { id: 'dashboard', label: 'Dashboard', Icon: TrendingUp,      description: 'Overview & stats' },
  { id: 'analyze',   label: 'Analyse',   Icon: MapPin,          description: 'Land intelligence' },
  { id: 'about',     label: 'About',     Icon: Info,            description: 'How it works' },
];

interface SidebarProps {
  currentPage: Page;
  recentSessions: AnalysisSession[];
  onNavigate: (page: Page) => void;
  onSessionClick: (session: AnalysisSession) => void;
}

/* ── tiny score dot ── */
function ScoreDot({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 28, height: 20, borderRadius: 6,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      fontSize: 10, fontWeight: 700, color,
      letterSpacing: '-0.01em', flexShrink: 0,
    }}>
      {score}
    </span>
  );
}

export function Sidebar({ currentPage, recentSessions, onNavigate, onSessionClick }: SidebarProps) {
  const [hoveredNav, setHoveredNav] = useState<Page | null>(null);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  return (
    <aside style={{
      width: 'var(--z-sidebar-w)',
      background: 'var(--z-bg-surface)',
      borderRight: '1px solid var(--z-border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* subtle top-right glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180,
        background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── LOGO ── */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--z-border-subtle)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* icon */}
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(34,211,238,0.15) 100%)',
            border: '1px solid rgba(74,222,128,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative',
          }}>
            <Leaf size={17} color="#4ade80" strokeWidth={2.5} />
            {/* live pulse */}
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 8, height: 8, borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 0 2px var(--z-bg-surface)',
            }} />
          </div>

          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 15,
              color: 'var(--z-text-primary)',
              letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              Zameendar<span style={{ color: '#4ade80' }}>.ai</span>
            </div>
            <div style={{
              fontSize: 10, color: 'var(--z-text-muted)',
              marginTop: 3, letterSpacing: '0.01em',
            }}>
              زمیندار · Land Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        padding: '12px 10px',
        borderBottom: '1px solid var(--z-border-subtle)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: 'var(--z-text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0 8px 8px',
        }}>
          Navigation
        </div>

        {NAV_ITEMS.map(({ id, label, Icon, description }) => {
          const active = currentPage === id;
          const hovered = hoveredNav === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              onMouseEnter={() => setHoveredNav(id)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                border: 'none',
                background: active
                  ? 'linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(34,211,238,0.06) 100%)'
                  : hovered ? 'var(--z-bg-hover)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease',
                marginBottom: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* active left bar */}
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 2px 2px 0',
                  background: 'linear-gradient(180deg, #4ade80, #22d3ee)',
                }} />
              )}

              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: active
                  ? 'rgba(74,222,128,0.12)'
                  : hovered ? 'var(--z-bg-card)' : 'transparent',
                border: active ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}>
                <Icon
                  size={15}
                  color={active ? '#4ade80' : hovered ? 'var(--z-text-primary)' : 'var(--z-text-secondary)'}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--z-text-primary)' : 'var(--z-text-secondary)',
                  lineHeight: 1, marginBottom: 2,
                  transition: 'color 0.15s',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: active ? 'rgba(74,222,128,0.6)' : 'var(--z-text-muted)',
                  lineHeight: 1,
                  transition: 'color 0.15s',
                }}>
                  {description}
                </div>
              </div>

              {active && (
                <ChevronRight size={12} color="rgba(74,222,128,0.5)" style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── RECENT SESSIONS ── */}
      {recentSessions.length > 0 ? (
        <div style={{
          padding: '12px 10px',
          flex: 1, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 8px 10px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 10, color: 'var(--z-text-muted)',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <Clock size={11} />
              Recent
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: 'var(--z-text-muted)',
              background: 'var(--z-bg-card)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 5, padding: '1px 6px',
            }}>
              {Math.min(recentSessions.length, 8)}
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, marginRight: -4, paddingRight: 4 }}>
            {recentSessions.slice(0, 8).map(session => {
              const topScore = session.result.scores.reduce((a, b) => a.score > b.score ? a : b);
              const isHovered = hoveredSession === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => onSessionClick(session)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid transparent',
                    background: isHovered ? 'var(--z-bg-hover)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    marginBottom: 2,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* location icon dot */}
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: isHovered ? 'rgba(74,222,128,0.08)' : 'var(--z-bg-card)',
                      border: `1px solid ${isHovered ? 'rgba(74,222,128,0.2)' : 'var(--z-border-subtle)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      <MapPin size={12} color={isHovered ? '#4ade80' : 'var(--z-text-muted)'} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: 'var(--z-text-primary)',
                        lineHeight: 1, marginBottom: 3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {session.location.placeName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--z-text-muted)' }}>
                          {session.location.country}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--z-border-subtle)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'var(--z-text-faint)' }}>
                          {formatRelativeTime(session.timestamp)}
                        </span>
                      </div>
                    </div>

                    <ScoreDot score={topScore.score} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* empty state */
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 16px', gap: 10,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="var(--z-text-muted)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--z-text-secondary)', marginBottom: 4 }}>
              No analyses yet
            </div>
            <div style={{ fontSize: 11, color: 'var(--z-text-muted)', lineHeight: 1.5 }}>
              Click the map to get started
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid var(--z-border-subtle)',
        position: 'relative', zIndex: 1,
      }}>
        {/* AI powered badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px',
          background: 'rgba(74,222,128,0.04)',
          border: '1px solid rgba(74,222,128,0.1)',
          borderRadius: 9, marginBottom: 10,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80',
            flexShrink: 0,
            boxShadow: '0 0 6px rgba(74,222,128,0.5)',
          }} />
          <span style={{ fontSize: 11, color: 'rgba(74,222,128,0.7)', fontWeight: 500, flex: 1 }}>
            Zameendar
          </span>
          <Sparkles size={11} color="rgba(74,222,128,0.4)" />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Globe size={11} color="var(--z-text-muted)" />
            <span style={{ fontSize: 10, color: 'var(--z-text-muted)' }}>v1.0 · Live data</span>
          </div>
          <span style={{
            fontSize: 9, color: 'var(--z-text-faint)',
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 4, padding: '2px 6px',
            fontWeight: 600, letterSpacing: '0.04em',
          }}>
            BETA
          </span>
        </div>
      </div>
    </aside>
  );
}