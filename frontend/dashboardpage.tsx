// ============================================================
// pages/DashboardPage.tsx
// Overview: stat cards, recent analyses, leaderboard, category trends
// ============================================================

import React from 'react';
import {
  BarChart3, MapPin, Sprout, Building2, Factory, Sun,
  TrendingUp, Award, Clock, Zap, ArrowRight, Activity,
  Globe, AlertTriangle,
} from 'lucide-react';
import type { AnalysisSession, SuitabilityCategory } from '../types';
import { StatCard, Badge, SectionLabel, ScoreRing, Divider } from '../components/shared/ui';
import { scoreColor, scoreLabel, formatRelativeTime, CATEGORY_COLOR } from '../lib/utils';
import { DEMO_LOCATIONS } from '../data/mockData';

const CATEGORY_ICONS: Record<SuitabilityCategory, React.ElementType> = {
  Agriculture: Sprout,
  Housing:     Building2,
  Industry:    Factory,
  Renewables:  Sun,
};

interface DashboardPageProps {
  sessions: AnalysisSession[];
  onAnalyzeDemo: (name: string, lat: number, lng: number) => void;
  onViewSession: (session: AnalysisSession) => void;
  onNavigateAnalyze: () => void;
}

export function DashboardPage({ sessions, onAnalyzeDemo, onViewSession, onNavigateAnalyze }: DashboardPageProps) {
  // Compute stats
  const totalAnalyses = sessions.length;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.result.scores.reduce((a, b) => a + b.score, 0) / s.result.scores.length, 0) / sessions.length)
    : 0;
  const topCategory = (() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => { const top = s.result.scores.reduce((a, b) => a.score > b.score ? a : b); counts[top.label] = (counts[top.label] || 0) + 1; });
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : 'Renewables';
  })();

  // Category averages across all sessions
  const categoryAvgs: Record<SuitabilityCategory, number> = { Agriculture: 0, Housing: 0, Industry: 0, Renewables: 0 };
  if (sessions.length > 0) {
    const sums: Record<SuitabilityCategory, number> = { Agriculture: 0, Housing: 0, Industry: 0, Renewables: 0 };
    sessions.forEach(s => s.result.scores.forEach(sc => { sums[sc.label] = (sums[sc.label] || 0) + sc.score; }));
    (Object.keys(sums) as SuitabilityCategory[]).forEach(k => { categoryAvgs[k] = Math.round(sums[k] / sessions.length); });
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      {/* Hero strip */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(45,212,191,0.05) 100%)',
        border: '1px solid var(--z-border-accent)',
        borderRadius: 'var(--z-radius-xl)',
        padding: '22px 28px',
        marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 20,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 20, fontWeight: 700, color: 'var(--z-text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Point anywhere on Earth.
          </div>
          <div style={{ fontSize: 13, color: 'var(--z-text-secondary)', lineHeight: 1.6, maxWidth: 400 }}>
            AI-powered land suitability scoring across Agriculture, Housing, Industry, and Renewables — using live environmental data.
          </div>
        </div>
        <button
          onClick={onNavigateAnalyze}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 'var(--z-radius-lg)',
            border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.12)',
            color: 'var(--z-green-400)', cursor: 'pointer',
            fontFamily: 'var(--z-font-body)', fontSize: 13, fontWeight: 600,
            flexShrink: 0, whiteSpace: 'nowrap',
            transition: 'all var(--z-duration-fast)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.12)'; }}
        >
          <Zap size={15} />
          Start Analysing
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Analyses" value={totalAnalyses} Icon={BarChart3} accent="#4ade80" sub="Sessions this run" />
        <StatCard label="Avg Score" value={`${avgScore}/100`} Icon={TrendingUp} accent="#60a5fa" sub="Across all categories" />
        <StatCard label="Top Category" value={topCategory} Icon={Award} accent="#fbbf24" sub="Most suitable use" />
        <StatCard label="Locations Covered" value={sessions.length} Icon={Globe} accent="#2dd4bf" sub="Unique coordinates" />
      </div>

      {/* Two-column: recent + category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 28 }}>

        {/* Recent Analyses */}
        <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionLabel>RECENT ANALYSES</SectionLabel>
            <button onClick={onNavigateAnalyze} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--z-green-400)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--z-font-mono)' }}>
              NEW <ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sessions.slice(0, 6).map(session => {
              const topScore = session.result.scores.reduce((a, b) => a.score > b.score ? a : b);
              const CatIcon = CATEGORY_ICONS[topScore.label];
              return (
                <div
                  key={session.id}
                  onClick={() => onViewSession(session)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--z-radius-md)',
                    cursor: 'pointer', transition: 'background var(--z-duration-fast)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--z-bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: CATEGORY_COLOR[topScore.label] + '15', border: `1px solid ${CATEGORY_COLOR[topScore.label]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CatIcon size={15} color={CATEGORY_COLOR[topScore.label]} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--z-text-primary)' }}>{session.location.placeName}</span>
                      <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>{session.location.country}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge label={scoreLabel(topScore.score)} color={scoreColor(topScore.score)} />
                      <span style={{ fontSize: 10, color: 'var(--z-text-faint)' }}>Best: {topScore.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--z-font-display)', fontWeight: 700, fontSize: 20, color: scoreColor(topScore.score), lineHeight: 1 }}>{topScore.score}</div>
                    <div style={{ fontSize: 9, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)', marginTop: 3 }}>{formatRelativeTime(session.timestamp)}</div>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--z-text-muted)', fontSize: 13 }}>
                No analyses yet. Start by clicking the map.
              </div>
            )}
          </div>
        </div>

        {/* Category averages */}
        <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px' }}>
          <SectionLabel>CATEGORY AVERAGES</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            {(Object.entries(categoryAvgs) as [SuitabilityCategory, number][]).map(([cat, avg]) => {
              const CatIcon = CATEGORY_ICONS[cat];
              const color = CATEGORY_COLOR[cat];
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <CatIcon size={13} color={color} strokeWidth={2} />
                    <span style={{ fontSize: 12, color: 'var(--z-text-secondary)', flex: 1 }}>{cat}</span>
                    <span style={{ fontFamily: 'var(--z-font-mono)', fontWeight: 700, fontSize: 12, color }}>{avg || '–'}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avg}%`, background: color, borderRadius: 3, transition: 'width 0.8s var(--z-spring)', boxShadow: `0 0 8px ${color}40` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <Divider margin="20px 0 16px" />

          {/* Disclaimer */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '10px 12px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 'var(--z-radius-md)' }}>
            <AlertTriangle size={13} color="#fbbf24" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 10, color: 'var(--z-text-muted)', lineHeight: 1.6 }}>
              AI-assisted insights only. Not a substitute for professional surveys or local regulations.
            </span>
          </div>
        </div>
      </div>

      {/* Quick demo locations */}
      <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionLabel>EXPLORE DEMO LOCATIONS</SectionLabel>
          <span style={{ fontSize: 10, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)' }}>Click to analyse instantly</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {DEMO_LOCATIONS.map(loc => (
            <button
              key={loc.name}
              onClick={() => onAnalyzeDemo(loc.name, loc.lat, loc.lng)}
              style={{
                background: 'var(--z-bg-raised)', border: '1px solid var(--z-border-subtle)',
                borderRadius: 'var(--z-radius-md)', padding: '12px 14px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all var(--z-duration-fast)',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--z-border-accent)'; el.style.background = 'rgba(74,222,128,0.04)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'var(--z-border-subtle)'; el.style.background = 'var(--z-bg-raised)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MapPin size={12} color="var(--z-green-400)" strokeWidth={2} />
                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--z-text-primary)' }}>{loc.name}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--z-text-muted)', fontFamily: 'var(--z-font-mono)' }}>{loc.country}</div>
              <div style={{ fontSize: 9, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)', marginTop: 3 }}>{loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
