// ============================================================
// components/layout/TopBar.tsx
// Top header — page title + quick actions
// ============================================================

import React from 'react';
import { MapPin, RotateCcw, Zap } from 'lucide-react';
import type { Page, AnalyzePhase } from '../../types';

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',         subtitle: 'Overview of your land analyses' },
  analyze:   { title: 'Analyse Land',      subtitle: 'Click the map to score any location on Earth' },
  about:     { title: 'About Zameendar.ai', subtitle: 'Methodology, data sources, and team' },
};

interface TopBarProps {
  currentPage: Page;
  analyzePhase: AnalyzePhase;
  onNavigateAnalyze: () => void;
  onReset: () => void;
}

export function TopBar({ currentPage, analyzePhase, onNavigateAnalyze, onReset }: TopBarProps) {
  const { title, subtitle } = PAGE_TITLES[currentPage];
  const showReset = currentPage === 'analyze' && analyzePhase !== 'idle';

  return (
    <header style={{
      height: 'var(--z-header-h)',
      borderBottom: '1px solid var(--z-border-subtle)',
      background: 'var(--z-bg-surface)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: 'var(--z-font-display)', fontWeight: 700,
          fontSize: 17, color: 'var(--z-text-primary)',
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 11, color: 'var(--z-text-muted)', marginTop: 3, fontFamily: 'var(--z-font-mono)' }}>
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {showReset && (
          <button
            onClick={onReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 'var(--z-radius-md)',
              border: '1px solid var(--z-border-mild)', background: 'transparent',
              color: 'var(--z-text-secondary)', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--z-font-body)',
              transition: 'all var(--z-duration-fast)',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--z-border-strong)'; el.style.color = 'var(--z-text-primary)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--z-border-mild)'; el.style.color = 'var(--z-text-secondary)'; }}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}

        {currentPage !== 'analyze' && (
          <button
            onClick={onNavigateAnalyze}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 'var(--z-radius-md)',
              border: '1px solid rgba(74,222,128,0.35)',
              background: 'rgba(74,222,128,0.08)',
              color: 'var(--z-green-400)', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--z-font-body)', fontWeight: 600,
              transition: 'all var(--z-duration-fast)',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(74,222,128,0.15)'; el.style.borderColor = 'rgba(74,222,128,0.5)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(74,222,128,0.08)'; el.style.borderColor = 'rgba(74,222,128,0.35)'; }}
          >
            <Zap size={13} />
            Analyse Location
          </button>
        )}
      </div>
    </header>
  );
}
