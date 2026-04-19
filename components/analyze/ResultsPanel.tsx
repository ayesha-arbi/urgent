'use client';

import React from 'react';
import {
  Thermometer, Droplets, Wind, Eye, Sun, Users, Mountain,
  Sprout, Building2, Factory, ChevronDown, ChevronUp,
  AlertTriangle, Zap, CheckCircle2, Layers, Sparkles,
  BarChart3, TrendingUp,
} from 'lucide-react';
import type { SuitabilityResult, EnvPayload, SuitabilityCategory, AnalyzePhase } from '@/types';
import { Pill, Badge, SectionLabel, ScoreRing, Skeleton } from '@/components/shared/ui';
import { scoreColor, scoreLabel, aqiColor, aqiLabel, CATEGORY_COLOR } from '@/lib/utils';

const CATEGORY_ICONS: Record<SuitabilityCategory, React.ElementType> = {
  Agriculture: Sprout,
  Housing: Building2,
  Industry: Factory,
  Renewables: Sun,
};

/* ─────────────────────────────────────────────
   ENV STRIP
───────────────────────────────────────────── */
function EnvStrip({ env }: { env: EnvPayload }) {
  const { weather: w, airQuality: aq, geo: g } = env;

  const metrics = [
    { icon: Thermometer, label: 'Temp',   value: `${Math.round(w.temperature)}°C`,  color: '#fb923c' },
    { icon: Droplets,    label: 'Rain',   value: `${w.precipitation.toFixed(1)}mm`, color: '#60a5fa' },
    { icon: Wind,        label: 'Wind',   value: `${Math.round(w.windSpeed)} km/h`, color: '#a78bfa' },
    { icon: Eye,         label: 'Humid',  value: `${Math.round(w.humidity)}%`,      color: '#22d3ee' },
    { icon: Sun,         label: 'UV',     value: `${Math.round(w.uvIndex)}`,         color: '#fbbf24' },
    { icon: Mountain,    label: 'Elev',   value: `${Math.round(g.elevation)}m`,      color: '#4ade80' },
  ];

  const aqiVal = Math.round(aq.aqi);
  const aqiC   = aqiColor(aq.aqi);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 700, color: 'var(--z-text-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <BarChart3 size={11} />
          Live Environmental Data
        </div>
        {/* AQI badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 6,
          background: `${aqiC}12`,
          border: `1px solid ${aqiC}25`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: aqiC }}>AQI</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: aqiC }}>{aqiVal}</span>
          <span style={{ fontSize: 9, color: `${aqiC}80` }}>{aqiLabel(aq.aqi)}</span>
        </div>
      </div>

      {/* metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            padding: '10px 10px 8px',
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 10,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <m.icon size={11} color={m.color} strokeWidth={2} />
              <span style={{ fontSize: 9, color: 'var(--z-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {m.label}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--z-text-primary)', lineHeight: 1 }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* population row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', marginTop: 8,
        background: 'var(--z-bg-card)',
        border: '1px solid var(--z-border-subtle)',
        borderRadius: 10,
      }}>
        <Users size={12} color="var(--z-text-muted)" />
        <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>Population density</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--z-text-primary)', marginLeft: 'auto' }}>
          {g.populationDensity > 999
            ? `${(g.populationDensity / 1000).toFixed(1)}k`
            : Math.round(g.populationDensity)
          }/km²
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCORE OVERVIEW BAR
───────────────────────────────────────────── */
function ScoreOverview({ scores }: { scores: SuitabilityResult['scores'] }) {
  const best = scores.reduce((a, b) => a.score > b.score ? a : b);

  return (
    <div style={{
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 14,
      padding: '18px',
      marginBottom: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* bg glow behind best score */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${best.color}0a 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--z-text-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <TrendingUp size={11} />
          Suitability Overview
        </div>
        {/* best category badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 6,
          background: `${best.color}12`,
          border: `1px solid ${best.color}25`,
          fontSize: 10, fontWeight: 600, color: best.color,
        }}>
          <Sparkles size={10} />
          Best: {best.label}
        </div>
      </div>

      {/* 4 inline score blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {scores.map(s => {
          const CatIcon = CATEGORY_ICONS[s.label];
          return (
            <div key={s.label} style={{
              textAlign: 'center', padding: '10px 6px',
              background: 'var(--z-bg-surface)',
              border: `1px solid ${s.color}18`,
              borderRadius: 10,
            }}>
              <CatIcon size={13} color={s.color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.score}
              </div>
              <div style={{ fontSize: 9, color: 'var(--z-text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label.slice(0, 4)}
              </div>
            </div>
          );
        })}
      </div>

      {/* bar chart */}
      {scores.map(s => (
        <div key={s.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--z-text-secondary)' }}>{s.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Badge label={scoreLabel(s.score)} color={scoreColor(s.score)} />
            </div>
          </div>
          <div style={{
            height: 5, background: 'rgba(255,255,255,0.05)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
              width: `${s.score}%`,
              transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: `0 0 8px ${s.color}40`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCORE CARD (expandable)
───────────────────────────────────────────── */
function ScoreCard({ score, expanded, onToggle }: {
  score: SuitabilityResult['scores'][0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const CatIcon = CATEGORY_ICONS[score.label];

  return (
    <div style={{
      background: 'var(--z-bg-card)',
      border: `1px solid ${expanded ? score.color + '28' : 'var(--z-border-subtle)'}`,
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxShadow: expanded ? `0 0 0 1px ${score.color}10, 0 4px 16px ${score.color}08` : 'none',
    }}>
      {/* header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* left accent bar when expanded */}
        {expanded && (
          <div style={{
            position: 'absolute', left: 0, top: '15%', bottom: '15%',
            width: 3, borderRadius: '0 2px 2px 0',
            background: `linear-gradient(180deg, ${score.color}, ${score.color}50)`,
          }} />
        )}

        {/* icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: `${score.color}10`,
          border: `1px solid ${score.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CatIcon size={17} color={score.color} strokeWidth={2} />
        </div>

        {/* text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--z-text-primary)', fontFamily: "'Syne', sans-serif" }}>
              {score.label}
            </span>
            <Badge label={scoreLabel(score.score)} color={scoreColor(score.score)} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--z-text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {score.summary}
          </div>
        </div>

        {/* ring + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <ScoreRing score={score.score} color={score.color} size={40} />
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: expanded ? `${score.color}12` : 'var(--z-bg-surface)',
            border: `1px solid ${expanded ? score.color + '25' : 'var(--z-border-subtle)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            {expanded
              ? <ChevronUp size={13} color={score.color} />
              : <ChevronDown size={13} color="var(--z-text-muted)" />
            }
          </div>
        </div>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: `1px solid ${score.color}12`,
        }}>
          <p style={{
            fontSize: 12, color: 'var(--z-text-secondary)',
            lineHeight: 1.75, margin: '14px 0 16px',
          }}>
            {score.explanation}
          </p>

          {/* 2-col layout: factors + actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* key factors */}
            <div style={{
              padding: '12px',
              background: 'var(--z-bg-surface)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 10,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: 'var(--z-text-muted)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Layers size={10} />
                Key Factors
              </div>
              {score.keyFactors.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  fontSize: 11, color: 'var(--z-text-secondary)',
                  marginBottom: 6, lineHeight: 1.5,
                }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: score.color, flexShrink: 0, marginTop: 5,
                  }} />
                  {f}
                </div>
              ))}
            </div>

            {/* actions */}
            <div style={{
              padding: '12px',
              background: 'var(--z-bg-surface)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 10,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: 'var(--z-text-muted)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <CheckCircle2 size={10} />
                Actions
              </div>
              {score.actions.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  fontSize: 11, color: 'var(--z-text-secondary)',
                  marginBottom: 6, lineHeight: 1.5,
                }}>
                  <CheckCircle2 size={11} color={score.color} style={{ flexShrink: 0, marginTop: 1 }} />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING STATE
───────────────────────────────────────────── */
function LoadingState({ phase }: { phase: AnalyzePhase }) {
  const isData = phase === 'loading_data';
  return (
    <div style={{ padding: '24px 20px' }}>
      {/* status row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', marginBottom: 24,
        background: 'rgba(74,222,128,0.05)',
        border: '1px solid rgba(74,222,128,0.15)',
        borderRadius: 10,
      }}>
        <div style={{
          width: 14, height: 14, flexShrink: 0,
          border: '2px solid rgba(74,222,128,0.2)',
          borderTopColor: '#4ade80',
          borderRadius: '50%',
          animation: 'z-spin 0.8s linear infinite',
        }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 2 }}>
            {isData ? 'Fetching live data…' : 'Running AI analysis…'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(74,222,128,0.5)' }}>
            {isData ? 'Weather · Air quality · Elevation' : 'Scoring all four categories'}
          </div>
        </div>
      </div>

      {/* skeleton grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {[0,1,2,3,4,5].map(i => (
          <Skeleton key={i} h="60px" w="100%" delay={`${i * 0.07}s`} />
        ))}
      </div>
      <Skeleton h="140px" w="100%" delay="0.1s" />
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton h="60px" w="100%" delay="0.2s" />
        <Skeleton h="60px" w="100%" delay="0.3s" />
        <Skeleton h="60px" w="100%" delay="0.4s" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   IDLE STATE
───────────────────────────────────────────── */
function IdleState({ onDemoClick }: { onDemoClick: (name: string, lat: number, lng: number) => void }) {
  const demos = [
    { name: 'Lahore',    country: 'PK', lat: 31.5497, lng: 74.3436 },
    { name: 'Iowa',      country: 'US', lat: 41.878,  lng: -93.0977 },
    { name: 'Sahara',    country: 'DZ', lat: 23.4162, lng: 25.6628 },
    { name: 'Nile Delta',country: 'EG', lat: 30.7748, lng: 31.2357 },
  ];

  const categories: [string, React.ElementType, string][] = [
    ['Agriculture', Sprout,   '#4ade80'],
    ['Housing',     Building2,'#60a5fa'],
    ['Industry',    Factory,  '#fb923c'],
    ['Renewables',  Sun,      '#fbbf24'],
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '32px 20px', gap: 20,
    }}>
      {/* icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'rgba(74,222,128,0.08)',
        border: '1px solid rgba(74,222,128,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Zap size={24} color="#4ade80" strokeWidth={1.5} />
        {/* pulse ring */}
        <div style={{
          position: 'absolute', inset: -6,
          borderRadius: 20, border: '1px solid rgba(74,222,128,0.12)',
          animation: 'z-pulse 2.5s ease-in-out infinite',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 17, fontWeight: 800,
          color: 'var(--z-text-primary)',
          letterSpacing: '-0.02em', marginBottom: 6,
        }}>
          Select a location
        </div>
        <div style={{ fontSize: 12, color: 'var(--z-text-muted)', lineHeight: 1.65, maxWidth: 240 }}>
          Click anywhere on the map or try a demo below to get instant AI land scores.
        </div>
      </div>

      {/* category badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        {categories.map(([lbl, Icon, clr]) => (
          <div key={lbl} style={{
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 10,
            padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: `${clr}10`,
              border: `1px solid ${clr}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={13} color={clr} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--z-text-secondary)' }}>
              {lbl}
            </span>
          </div>
        ))}
      </div>

      {/* divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--z-border-subtle)' }} />
        <span style={{
          fontSize: 9, fontWeight: 700, color: 'var(--z-text-muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Demo locations
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--z-border-subtle)' }} />
      </div>

      {/* demo pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
        {demos.map(d => (
          <button
            key={d.name}
            onClick={() => onDemoClick(d.name, d.lat, d.lng)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--z-border-subtle)',
              background: 'var(--z-bg-card)',
              color: 'var(--z-text-secondary)',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'rgba(74,222,128,0.3)';
              el.style.color = '#4ade80';
              el.style.background = 'rgba(74,222,128,0.06)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'var(--z-border-subtle)';
              el.style.color = 'var(--z-text-secondary)';
              el.style.background = 'var(--z-bg-card)';
            }}
          >
            <span style={{ fontSize: 9, color: 'var(--z-text-muted)', fontWeight: 500 }}>{d.country}</span>
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
interface ResultsPanelProps {
  phase: AnalyzePhase;
  result: SuitabilityResult | null;
  envPayload: EnvPayload | null;
  expandedCategory: SuitabilityCategory | null;
  onToggleCategory: (cat: SuitabilityCategory) => void;
  onDemoClick: (name: string, lat: number, lng: number) => void;
  error: string | null;
  onRetry: () => void;
}

export function ResultsPanel({
  phase, result, envPayload, expandedCategory,
  onToggleCategory, onDemoClick, error, onRetry,
}: ResultsPanelProps) {

  if (phase === 'idle') return <IdleState onDemoClick={onDemoClick} />;

  if (phase === 'loading_data' || phase === 'loading_ai') {
    return <LoadingState phase={phase} />;
  }

  if (phase === 'error') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          padding: '24px 20px', textAlign: 'center',
          background: 'rgba(248,113,113,0.05)',
          border: '1px solid rgba(248,113,113,0.15)',
          borderRadius: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>
            Analysis failed
          </div>
          <div style={{ fontSize: 12, color: 'var(--z-text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>
            {error}
          </div>
          <button
            onClick={onRetry}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1px solid rgba(248,113,113,0.25)',
              background: 'rgba(248,113,113,0.08)',
              color: '#f87171', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ padding: '16px 18px' }}>
      {/* env data */}
      {envPayload && <EnvStrip env={envPayload} />}

      {/* score overview */}
      <ScoreOverview scores={result.scores} />

      {/* section label */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--z-text-muted)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 10,
      }}>
        <Layers size={11} />
        Category Breakdown
      </div>

      {/* expandable cards */}
      {result.scores.map(s => (
        <ScoreCard
          key={s.label}
          score={s}
          expanded={expandedCategory === s.label}
          onToggle={() => onToggleCategory(s.label)}
        />
      ))}

      {/* AI Insight */}
      <div style={{
        background: 'rgba(74,222,128,0.04)',
        border: '1px solid rgba(74,222,128,0.12)',
        borderRadius: 12, padding: '16px', marginTop: 10, marginBottom: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* corner accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 60, height: 60,
          background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={13} color="#4ade80" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI Insight
            </div>
          </div>
          <div style={{
            marginLeft: 'auto',
            width: 8, height: 8, borderRadius: '50%',
            background: '#4ade80',
            animation: 'z-pulse 2s ease-in-out infinite',
          }} />
        </div>

        <p style={{
          fontSize: 12, color: 'var(--z-text-secondary)',
          lineHeight: 1.75, margin: 0,
        }}>
          {result.overallInsight}
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 9,
        padding: '11px 13px',
        background: 'rgba(251,191,36,0.04)',
        border: '1px solid rgba(251,191,36,0.1)',
        borderRadius: 10,
        fontSize: 11, color: 'var(--z-text-muted)',
        lineHeight: 1.6,
      }}>
        <AlertTriangle size={12} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
        {result.disclaimer}
      </div>
    </div>
  );
}