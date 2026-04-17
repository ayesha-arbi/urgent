// ============================================================
// ResultsPanel Component
// ============================================================

'use client';

import React from 'react';
import {
  Thermometer, Droplets, Wind, Eye, Sun, Users, Mountain,
  Sprout, Building2, Factory, ChevronDown, ChevronUp,
  AlertTriangle, Zap, CheckCircle2, Layers,
} from 'lucide-react';
import type { SuitabilityResult, EnvPayload, SuitabilityCategory, AnalyzePhase } from '@/types';
import { Pill, Badge, SectionLabel, ScoreRing, Skeleton } from '@/components/shared/ui';
import { scoreColor, scoreLabel, aqiColor, aqiLabel, CATEGORY_COLOR } from '@/lib/utils';

const CATEGORY_ICONS: Record<SuitabilityCategory, React.ElementType> = {
  Agriculture: Sprout, Housing: Building2, Industry: Factory, Renewables: Sun,
};

function EnvStrip({ env }: { env: EnvPayload }) {
  const { weather: w, airQuality: aq, geo: g } = env;
  const pills = [
    { icon: <Thermometer size={11} />, label: 'TEMP', value: `${Math.round(w.temperature)}°C` },
    { icon: <Droplets size={11} />, label: 'PRECIP', value: `${w.precipitation.toFixed(1)}mm` },
    { icon: <Wind size={11} />, label: 'WIND', value: `${Math.round(w.windSpeed)}km/h` },
    { icon: <Eye size={11} />, label: 'HUMIDITY', value: `${Math.round(w.humidity)}%` },
    { icon: <Sun size={11} />, label: 'UV', value: `${Math.round(w.uvIndex)}` },
    { icon: <Users size={11} />, label: 'POP/KM²', value: g.populationDensity > 999 ? `${(g.populationDensity / 1000).toFixed(1)}k` : String(Math.round(g.populationDensity)) },
    { icon: <Mountain size={11} />, label: 'ELEV', value: `${Math.round(g.elevation)}m` },
    { icon: <div style={{ fontSize: 9, fontWeight: 700, color: aqiColor(aq.aqi) }}>AQI</div>, label: '', value: `${Math.round(aq.aqi)} · ${aqiLabel(aq.aqi)}`, valueColor: aqiColor(aq.aqi) },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>LIVE ENVIRONMENTAL DATA</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {pills.map(p => (
          <Pill key={p.label} icon={p.icon} label={p.label || ''} value={p.value} valueColor={p.valueColor} />
        ))}
      </div>
    </div>
  );
}

function ScoreBars({ scores, expandedCategory, onToggle }: {
  scores: SuitabilityResult['scores'];
  expandedCategory: SuitabilityCategory | null;
  onToggle: (cat: SuitabilityCategory) => void;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 'var(--z-radius-lg)',
      padding: '18px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionLabel>SUITABILITY SCORES</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          {scores.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--z-font-display)',
                fontSize: 15,
                fontWeight: 700,
                color: scoreColor(s.score),
                lineHeight: 1,
              }}>{s.score}</div>
              <div style={{
                fontFamily: 'var(--z-font-mono)',
                fontSize: 8,
                color: 'var(--z-text-faint)',
                marginTop: 2,
              }}>{s.label.slice(0, 3).toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {scores.map(s => {
        const CatIcon = CATEGORY_ICONS[s.label];
        return (
          <div key={s.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CatIcon size={13} color={s.color} strokeWidth={2} />
              <span style={{ fontSize: 12, color: 'var(--z-text-secondary)', flex: 1 }}>{s.label}</span>
              <Badge label={scoreLabel(s.score)} color={scoreColor(s.score)} />
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                boxShadow: `0 0 8px ${s.color}35`,
                width: `${s.score}%`,
                transition: 'width 0.9s var(--z-spring)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreCard({ score, expanded, onToggle }: {
  score: SuitabilityResult['scores'][0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const CatIcon = CATEGORY_ICONS[score.label];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${expanded ? score.color + '30' : 'var(--z-border-subtle)'}`,
      borderRadius: 'var(--z-radius-lg)',
      marginBottom: 8,
      overflow: 'hidden',
    }}>
      <div onClick={onToggle} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '13px 16px',
        cursor: 'pointer',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: score.color + '14',
          border: `1px solid ${score.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <CatIcon size={17} color={score.color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--z-text-primary)' }}>{score.label}</span>
            <Badge label={scoreLabel(score.score)} color={scoreColor(score.score)} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--z-text-muted)', lineHeight: 1 }}>{score.summary}</div>
        </div>
        <ScoreRing score={score.score} color={score.color} size={42} />
        <div style={{ color: 'var(--z-text-faint)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${score.color}18` }}>
          <p style={{ fontSize: 12, color: 'var(--z-text-secondary)', lineHeight: 1.75, margin: '12px 0' }}>
            {score.explanation}
          </p>
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: 'var(--z-font-mono)',
              fontSize: 9,
              color: 'var(--z-text-faint)',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>KEY FACTORS</div>
            {score.keyFactors.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 7,
                fontSize: 11,
                color: 'var(--z-text-muted)',
                marginBottom: 5,
                lineHeight: 1.5,
              }}>
                <Layers size={10} color={score.color} style={{ flexShrink: 0, marginTop: 2 }} />
                {f}
              </div>
            ))}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--z-font-mono)',
              fontSize: 9,
              color: 'var(--z-text-faint)',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>RECOMMENDED ACTIONS</div>
            {score.actions.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 7,
                fontSize: 11,
                color: 'var(--z-text-secondary)',
                marginBottom: 6,
                lineHeight: 1.5,
              }}>
                <CheckCircle2 size={11} color={score.color} style={{ flexShrink: 0, marginTop: 1 }} />
                {a}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState({ phase }: { phase: AnalyzePhase }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#4ade80',
          animation: 'z-pulse 1s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'var(--z-font-mono)',
          fontSize: 10,
          color: '#4ade80',
          letterSpacing: '0.1em',
        }}>
          {phase === 'loading_data' ? 'FETCHING ENVIRONMENTAL DATA...' : 'RUNNING AI ANALYSIS...'}
        </span>
      </div>
      <Skeleton h="110px" w="100%" delay="0s" />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton h="14px" w="80%" delay="0.1s" />
        <Skeleton h="14px" w="65%" delay="0.2s" />
        <Skeleton h="14px" w="88%" delay="0.3s" />
      </div>
    </div>
  );
}

function IdleState({ onDemoClick }: { onDemoClick: (name: string, lat: number, lng: number) => void }) {
  const demos = [
    { name: 'Lahore', country: 'Pakistan', lat: 31.5497, lng: 74.3436 },
    { name: 'Iowa Plains', country: 'USA', lat: 41.878, lng: -93.0977 },
    { name: 'Sahara', country: 'Algeria', lat: 23.4162, lng: 25.6628 },
    { name: 'Nile Delta', country: 'Egypt', lat: 30.7748, lng: 31.2357 },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '32px 24px',
      gap: 20,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(74,222,128,0.08)',
        border: '1px solid var(--z-border-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={26} color="#4ade80" strokeWidth={1.5} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--z-font-display)',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--z-text-primary)',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>Select a location</div>
        <div style={{ fontSize: 12, color: 'var(--z-text-muted)', lineHeight: 1.7, maxWidth: 260 }}>
          Click anywhere on the map to score land suitability across Agriculture, Housing, Industry, and Renewables.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        {([['Agriculture', Sprout, '#4ade80'], ['Housing', Building2, '#60a5fa'], ['Industry', Factory, '#fb923c'], ['Renewables', Sun, '#fbbf24']] as [string, React.ElementType, string][]).map(([label, Icon, color]) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 'var(--z-radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Icon size={14} color={color} strokeWidth={2} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--z-text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)', letterSpacing: '0.08em' }}>OR TRY A DEMO</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
        {demos.map(d => (
          <button
            key={d.name}
            onClick={() => onDemoClick(d.name, d.lat, d.lng)}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--z-radius-pill)',
              border: '1px solid var(--z-border-mild)',
              background: 'transparent',
              color: 'var(--z-text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'var(--z-font-body)',
              transition: 'all var(--z-duration-fast)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'rgba(74,222,128,0.35)';
              el.style.color = '#4ade80';
              el.style.background = 'rgba(74,222,128,0.06)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'var(--z-border-mild)';
              el.style.color = 'var(--z-text-muted)';
              el.style.background = 'transparent';
            }}
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  phase, result, envPayload, expandedCategory, onToggleCategory, onDemoClick, error, onRetry
}: ResultsPanelProps) {
  if (phase === 'idle') return <IdleState onDemoClick={onDemoClick} />;
  if (phase === 'loading_data' || phase === 'loading_ai') {
    return <div style={{ padding: '20px' }}><LoadingState phase={phase} /></div>;
  }
  if (phase === 'error') {
    return (
      <div style={{
        padding: 24, margin: 16,
        background: 'rgba(248,113,113,0.05)',
        border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: 'var(--z-radius-lg)',
        textAlign: 'center',
      }}>
        <AlertTriangle size={28} color="#f87171" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: '#f87171', marginBottom: 6 }}>Analysis failed</div>
        <div style={{ fontSize: 12, color: 'var(--z-text-muted)', marginBottom: 16 }}>{error}</div>
        <button
          onClick={onRetry}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--z-radius-md)',
            border: '1px solid rgba(248,113,113,0.3)',
            background: 'transparent',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ padding: '16px 20px' }}>
      {envPayload && <EnvStrip env={envPayload} />}
      <ScoreBars scores={result.scores} expandedCategory={expandedCategory} onToggle={onToggleCategory} />
      <SectionLabel>CATEGORY BREAKDOWN</SectionLabel>
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
        border: '1px solid rgba(74,222,128,0.14)',
        borderRadius: 'var(--z-radius-lg)',
        padding: '16px 18px',
        marginTop: 8,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#4ade80',
            animation: 'z-pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--z-font-mono)',
            fontSize: 9,
            color: '#4ade80',
            letterSpacing: '0.12em',
          }}>
            AI SYNTHESIS · {new Date(result.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--z-text-secondary)', lineHeight: 1.8, margin: 0 }}>
          {result.overallInsight}
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 14px',
        background: 'rgba(251,191,36,0.04)',
        border: '1px solid rgba(251,191,36,0.1)',
        borderRadius: 'var(--z-radius-md)',
        fontSize: 10,
        color: 'var(--z-text-muted)',
        lineHeight: 1.6,
        marginBottom: 8,
      }}>
        <AlertTriangle size={12} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
        {result.disclaimer}
      </div>
    </div>
  );
}
