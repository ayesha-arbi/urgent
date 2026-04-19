'use client';

// ============================================================
// LandingPage.tsx
// Drop this in: src/components/landing/LandingPage.tsx
// ============================================================

import { useEffect, useRef } from 'react';
import { MapPin, Zap, ArrowRight, Sprout, Building2, Factory, Sun, Globe } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const CATEGORY_ITEMS = [
  {
    icon: Sprout,
    label: 'Agriculture',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    score: 82,
    desc: 'Farming potential from climate, precipitation, temperature & elevation data.',
  },
  {
    icon: Building2,
    label: 'Housing',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    score: 58,
    desc: 'Residential suitability based on air quality, livability & urban proximity.',
  },
  {
    icon: Factory,
    label: 'Industry',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    score: 43,
    desc: 'Commercial viability via infrastructure access & industrial climate fit.',
  },
  {
    icon: Sun,
    label: 'Renewables',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    score: 91,
    desc: 'Solar & wind potential from UV index, cloud cover & wind speed.',
  },
];

const DEMO_LOCATIONS = [
  { name: 'Sindh Plains', country: 'Pakistan', scores: [{ label: 'Agri', val: 82, color: '#4ade80' }, { label: 'Solar', val: 91, color: '#fbbf24' }] },
  { name: 'Nile Delta', country: 'Egypt', scores: [{ label: 'Agri', val: 88, color: '#4ade80' }, { label: 'House', val: 72, color: '#60a5fa' }] },
  { name: 'Atacama', country: 'Chile', scores: [{ label: 'Solar', val: 97, color: '#fbbf24' }, { label: 'Ind', val: 34, color: '#fb923c' }] },
  { name: 'Punjab Fields', country: 'Pakistan', scores: [{ label: 'Agri', val: 94, color: '#4ade80' }, { label: 'House', val: 71, color: '#60a5fa' }] },
  { name: 'Dutch Polders', country: 'Netherlands', scores: [{ label: 'Agri', val: 85, color: '#4ade80' }, { label: 'House', val: 88, color: '#60a5fa' }] },
  { name: 'Saharan Edge', country: 'Morocco', scores: [{ label: 'Solar', val: 95, color: '#fbbf24' }, { label: 'Agri', val: 18, color: '#4ade80' }] },
];

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const stylesInjected = useRef(false);

  // Inject CSS-only animations once
  useEffect(() => {
    if (stylesInjected.current) return;
    stylesInjected.current = true;

    const style = document.createElement('style');
    style.id = 'zameendar-landing-styles';
    style.textContent = `
      @keyframes zl-fadeUp {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes zl-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.45; transform: scale(0.75); }
      }
      @keyframes zl-scanline {
        from { transform: translateY(-360px); }
        to   { transform: translateY(360px); }
      }
      @keyframes zl-barAgri    { to { width: 82%; } }
      @keyframes zl-barHouse   { to { width: 58%; } }
      @keyframes zl-barInd     { to { width: 43%; } }
      @keyframes zl-barRenew   { to { width: 91%; } }
      @keyframes zl-slideIn {
        from { opacity: 0; transform: translateX(18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes zl-pinPulse {
        0%, 100% { r: 12; opacity: 0.55; }
        50%       { r: 20; opacity: 0; }
      }
      @keyframes zl-radarDraw {
        from { opacity: 0; transform: scale(0.15); transform-box: fill-box; transform-origin: center; }
        to   { opacity: 1; transform: scale(1); }
      }
      .zl-fadeUp-1 { animation: zl-fadeUp 0.75s 0.05s ease both; }
      .zl-fadeUp-2 { animation: zl-fadeUp 0.75s 0.15s ease both; }
      .zl-fadeUp-3 { animation: zl-fadeUp 0.75s 0.25s ease both; }
      .zl-fadeUp-4 { animation: zl-fadeUp 0.75s 0.35s ease both; }
      .zl-fadeUp-5 { animation: zl-fadeUp 0.75s 0.45s ease both; }
      .zl-pulse    { animation: zl-pulse 2s ease-in-out infinite; }
      .zl-pulse-d  { animation: zl-pulse 2s 0.6s ease-in-out infinite; }
      .zl-scanline { animation: zl-scanline 5s linear infinite; }
      .zl-bar-agri  { animation: zl-barAgri  1.4s 1.1s ease forwards; }
      .zl-bar-house { animation: zl-barHouse 1.4s 1.3s ease forwards; }
      .zl-bar-ind   { animation: zl-barInd   1.4s 1.5s ease forwards; }
      .zl-bar-renew { animation: zl-barRenew 1.4s 1.7s ease forwards; }
      .zl-slidein   { animation: zl-slideIn  0.9s 0.7s ease both; }
      .zl-radar     { animation: zl-radarDraw 1.6s 0.9s ease both; }

      .zl-step-card:hover  { border-color: var(--z-border-accent) !important; }
      .zl-cat-cell:hover   { background: var(--z-bg-raised) !important; }
      .zl-demo-card:hover  { border-color: var(--z-border-accent) !important; transform: translateY(-2px); }
      .zl-demo-card        { transition: border-color 0.2s, transform 0.2s; }
      .zl-primary-btn:hover { background: rgba(74,222,128,0.22) !important; }
      .zl-ghost-btn:hover  { border-color: var(--z-border-accent) !important; color: var(--z-green-400) !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById('zameendar-landing-styles')?.remove();
    };
  }, []);

  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'var(--z-bg-base)',
      color: 'var(--z-text-primary)',
      fontFamily: 'var(--z-font-body)',
    }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 55% 35% at 50% 55%, rgba(74,222,128,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 35% 25% at 20% 80%, rgba(251,191,36,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 80% 15%, rgba(45,212,191,0.07) 0%, transparent 60%)
          `,
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.035,
          backgroundImage: `linear-gradient(rgba(74,222,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Badge */}
        <div className="zl-fadeUp-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--z-font-mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--z-green-400)',
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 100,
          padding: '6px 16px', marginBottom: 28,
          position: 'relative',
        }}>
          <span className="zl-pulse" style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--z-green-400)', display: 'inline-block', flexShrink: 0,
          }} />
          AI-Powered Land Intelligence · زمیندار
        </div>

<div className="zl-fadeUp-2" style={{
  fontFamily: 'var(--z-font-display)',
  fontSize: 'clamp(40px, 5.5vw, 76px)',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  lineHeight: 1.05,
  color: 'var(--z-text-primary)',
  marginBottom: 24,
  position: 'relative',
}}>
  Zameendar<span style={{ color: 'var(--z-green-400)', fontWeight: 700 }}>.ai</span>
</div>

        {/* Sub */}
        <p className="zl-fadeUp-3" style={{
          fontSize: 15, color: 'var(--z-text-secondary)', lineHeight: 1.75,
          maxWidth: 560, margin: '0 auto 36px',
          position: 'relative',
        }}>
          Point anywhere on Earth — Zameendar.ai scores land suitability across Agriculture, Housing, Industry &amp; Renewables using live environmental data and AI. No GIS expertise needed.
        </p>

        {/* CTAs */}
        <div className="zl-fadeUp-4" style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          marginBottom: 56, position: 'relative',
        }}>
          <button
            className="zl-primary-btn"
            onClick={onEnterApp}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 26px', borderRadius: 'var(--z-radius-lg)',
              border: '1px solid rgba(74,222,128,0.4)',
              background: 'rgba(74,222,128,0.14)',
              color: 'var(--z-green-400)',
              cursor: 'pointer',
              fontFamily: 'var(--z-font-body)', fontSize: 13, fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            <Globe size={15} />
            Open the Map
            <ArrowRight size={14} />
          </button>
          <button
            className="zl-ghost-btn"
            onClick={onEnterApp}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 'var(--z-radius-lg)',
              border: '1px solid var(--z-border-subtle)',
              background: 'transparent',
              color: 'var(--z-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--z-font-body)', fontSize: 13, fontWeight: 500,
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            <Zap size={14} />
            Try a Demo
          </button>
        </div>

        {/* ── MAP MOCKUP ── */}
        <div className="zl-fadeUp-5" style={{
          width: '100%', maxWidth: 860, position: 'relative',
        }}>
          {/* Browser chrome */}
          <div style={{
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 'var(--z-radius-xl)',
            overflow: 'hidden',
          }}>
            {/* Topbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: 'var(--z-bg-raised)',
              borderBottom: '1px solid var(--z-border-subtle)',
            }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
              ))}
              <span style={{
                marginLeft: 10, fontFamily: 'var(--z-font-mono)', fontSize: 10,
                color: 'var(--z-text-faint)', background: 'var(--z-bg-surface)',
                borderRadius: 6, padding: '3px 12px',
              }}>zameendar.ai/analyze</span>
            </div>

            {/* Map body */}
            <div style={{ height: 340, background: 'var(--z-bg-surface)', position: 'relative', overflow: 'hidden' }}>
              {/* World map SVG */}
              <svg width="100%" height="340" viewBox="0 0 860 340" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <rect width="860" height="340" fill="var(--z-bg-surface)" />
                {/* Grid */}
                <g stroke="rgba(74,222,128,0.055)" strokeWidth="0.5">
                  {[60,120,180,240,300].map(y => <line key={y} x1="0" y1={y} x2="860" y2={y} />)}
                  {[86,172,258,344,430,516,602,688,774].map(x => <line key={x} x1={x} y1="0" x2={x} y2="340" />)}
                </g>
                {/* Continents */}
                <path d="M60 38 L160 33 L182 60 L200 80 L194 130 L170 158 L140 178 L108 198 L88 218 L68 198 L53 158 L48 118 L60 78 Z" fill="rgba(74,222,128,0.22)" stroke="rgba(74,222,128,0.18)" strokeWidth="0.5"/>
                <path d="M128 218 L170 213 L185 238 L190 278 L175 316 L154 335 L132 325 L118 295 L113 255 Z" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.14)" strokeWidth="0.5"/>
                <path d="M368 28 L420 23 L442 40 L450 64 L428 79 L398 73 L373 83 L358 68 L352 48 Z" fill="rgba(74,222,128,0.22)" stroke="rgba(74,222,128,0.18)" strokeWidth="0.5"/>
                <path d="M353 92 L420 88 L446 108 L456 158 L450 218 L428 278 L398 298 L373 278 L352 218 L342 158 L348 118 Z" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.14)" strokeWidth="0.5"/>
                <path d="M428 18 L620 13 L682 28 L702 53 L690 88 L650 108 L598 118 L558 128 L508 118 L468 98 L448 78 L428 58 Z" fill="rgba(74,222,128,0.22)" stroke="rgba(74,222,128,0.18)" strokeWidth="0.5"/>
                {/* Pakistan highlight */}
                <path d="M538 88 L592 83 L612 98 L618 128 L602 148 L570 153 L543 138 L533 113 Z" fill="rgba(74,222,128,0.45)" stroke="rgba(74,222,128,0.55)" strokeWidth="1"/>
                <path d="M648 113 L702 108 L722 128 L712 158 L678 163 L652 148 L642 128 Z" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.14)" strokeWidth="0.5"/>
                <path d="M678 228 L758 218 L800 238 L810 288 L788 318 L738 328 L688 308 L668 268 Z" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.14)" strokeWidth="0.5"/>

                {/* Active pin — Pakistan */}
                <circle cx="572" cy="116" r="18" fill="rgba(74,222,128,0.18)" className="zl-pulse" />
                <circle cx="572" cy="116" r="5.5" fill="var(--z-green-400)" />
                <circle cx="572" cy="116" r="2.5" fill="white" />
                <line x1="572" y1="122" x2="572" y2="148" stroke="rgba(74,222,128,0.35)" strokeWidth="1" strokeDasharray="2,2" />
                {/* Label */}
                <rect x="546" y="149" width="54" height="17" rx="4" fill="rgba(10,15,12,0.88)" stroke="rgba(74,222,128,0.28)" strokeWidth="0.5"/>
                <text x="573" y="161" fontFamily="var(--z-font-mono)" fontSize="9" fill="#4ade80" textAnchor="middle">Sindh, PK</text>

                {/* Secondary pin — Egypt */}
                <circle cx="393" cy="128" r="13" fill="rgba(251,191,36,0.15)" className="zl-pulse-d" />
                <circle cx="393" cy="128" r="4" fill="#fbbf24" />
                <circle cx="393" cy="128" r="2" fill="white" />

                {/* Scanline */}
                <rect x="0" y="-3" width="860" height="4" fill="rgba(74,222,128,0.05)" className="zl-scanline" />

                {/* Coordinates readout */}
                <rect x="14" y="14" width="148" height="36" rx="6" fill="rgba(10,15,12,0.88)" stroke="rgba(74,222,128,0.14)" strokeWidth="0.5"/>
                <text x="24" y="29" fontFamily="var(--z-font-mono)" fontSize="8" fill="rgba(74,222,128,0.45)">ACTIVE LOCATION</text>
                <text x="24" y="43" fontFamily="var(--z-font-mono)" fontSize="10" fill="#4ade80">25.89°N · 67.83°E</text>
              </svg>

              {/* Result panel overlay */}
              <div className="zl-slidein" style={{
                position: 'absolute', right: 14, top: 14, bottom: 14, width: 196,
                background: 'rgba(10,15,12,0.92)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--z-border-subtle)',
                borderRadius: 'var(--z-radius-lg)',
                padding: 16,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--z-text-faint)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Analysing Location
                  </div>
                  <div style={{ fontFamily: 'var(--z-font-display)', fontWeight: 700, fontSize: 13, color: 'var(--z-text-primary)' }}>
                    Sindh, Pakistan
                  </div>
                  <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', marginTop: 2 }}>
                    25.89°N · 67.83°E
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--z-border-subtle)' }} />

                {/* Score bars */}
                {[
                  { icon: Sprout,   label: 'Agriculture', color: '#4ade80', barClass: 'zl-bar-agri',  val: 82 },
                  { icon: Building2,label: 'Housing',     color: '#60a5fa', barClass: 'zl-bar-house', val: 58 },
                  { icon: Factory,  label: 'Industry',    color: '#fb923c', barClass: 'zl-bar-ind',   val: 43 },
                  { icon: Sun,      label: 'Renewables',  color: '#fbbf24', barClass: 'zl-bar-renew', val: 91 },
                ].map(({ icon: Icon, label, color, barClass, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      background: color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={10} color={color} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div className={barClass} style={{ height: '100%', width: 0, background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 10, fontWeight: 500, color, minWidth: 20, textAlign: 'right' }}>
                      {val}
                    </span>
                  </div>
                ))}

                <div style={{ height: 1, background: 'var(--z-border-subtle)' }} />

                {/* AI insight */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <span className="zl-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--z-green-400)', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 8, letterSpacing: '0.12em', color: 'var(--z-green-400)', textTransform: 'uppercase' }}>
                      AI Insight
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--z-text-secondary)', lineHeight: 1.55 }}>
                    Strong solar potential. Consider drought-resistant crops given Tharparkar proximity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid var(--z-border-subtle)',
        borderBottom: '1px solid var(--z-border-subtle)',
      }}>
        {[
          { num: '12K+',  label: 'Locations analysed' },
          { num: '4',     label: 'Suitability categories' },
          { num: '<3s',   label: 'To AI insights' },
        ].map(({ num, label }, i) => (
          <div key={i} style={{
            padding: '32px 24px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--z-border-subtle)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--z-font-display)', fontSize: 42, fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--z-green-400)', lineHeight: 1,
            }}>{num}</div>
            <div style={{
              fontFamily: 'var(--z-font-mono)', fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--z-text-faint)', marginTop: 6,
            }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '72px 40px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--z-green-400)', marginBottom: 12 }}>
          How It Works
        </div>
        <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 40 }}>
          Three steps to land clarity.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { num: '01', icon: MapPin,   color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  title: 'Click any location', desc: 'Tap anywhere on the world map or search by name. We handle the coordinates — you just point.' },
            { num: '02', icon: Zap,      color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  title: 'Live data fetches',   desc: 'Real-time temperature, air quality, elevation & population from open data APIs — instantly.' },
            { num: '03', icon: Globe,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  title: 'AI scores & insights',desc: 'Our LLM weighs every factor and returns 0–100 scores + a plain-language action plan.' },
          ].map(({ num, icon: Icon, color, bg, title, desc }) => (
            <div
              key={num}
              className="zl-step-card"
              style={{
                background: 'var(--z-bg-card)',
                border: '1px solid var(--z-border-subtle)',
                borderRadius: 'var(--z-radius-lg)',
                padding: '24px 22px',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 12, right: 18,
                fontFamily: 'var(--z-font-mono)', fontSize: 56, fontWeight: 300,
                color: 'rgba(74,222,128,0.055)', lineHeight: 1, userSelect: 'none',
              }}>{num}</span>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--z-text-primary)' }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--z-text-secondary)', lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: 'var(--z-bg-card)', borderTop: '1px solid var(--z-border-subtle)', borderBottom: '1px solid var(--z-border-subtle)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--z-green-400)', marginBottom: 12 }}>
            What We Score
          </div>
          <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 36 }}>
            Four lenses, one click.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, background: 'var(--z-border-subtle)' }}>
            {CATEGORY_ITEMS.map(({ icon: Icon, label, color, bg, score, desc }) => (
              <div
                key={label}
                className="zl-cat-cell"
                style={{
                  background: 'var(--z-bg-card)',
                  padding: '32px 28px',
                  cursor: 'default',
                  transition: 'background 0.25s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color={color} strokeWidth={2} />
                </div>
                <div style={{ fontFamily: 'var(--z-font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color, marginBottom: 8 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--z-text-secondary)', lineHeight: 1.7, marginBottom: 16, maxWidth: 340 }}>
                  {desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 10, color: 'var(--z-text-faint)' }}>Example score</span>
                  <span style={{
                    fontFamily: 'var(--z-font-mono)', fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 100,
                    background: color + '18', color,
                  }}>{score} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RADAR + FEATURES ── */}
      <section style={{ padding: '72px 40px' }}>
        <div style={{
          maxWidth: 980, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--z-green-400)', marginBottom: 12 }}>
              Visual Analytics
            </div>
            <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 'clamp(22px, 2.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Radar charts that speak for themselves.
            </div>
            <p style={{ fontSize: 14, color: 'var(--z-text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
              Compare suitability across all four categories at a glance. No spreadsheets, no jargon — just visual intelligence you can act on.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Interactive radar chart for every analysis',
                'Color-coded map markers — green means go',
                '"Why this score?" explanation per category',
                'One-click AI action plan generation',
                'Session history — revisit any past analysis',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--z-text-secondary)', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--z-green-400)', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Radar card */}
          <div style={{
            background: 'var(--z-bg-card)',
            border: '1px solid var(--z-border-subtle)',
            borderRadius: 'var(--z-radius-xl)',
            padding: 28,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          }}>
            <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--z-text-faint)' }}>
              Sindh, Pakistan — Suitability Profile
            </div>
            <svg width="210" height="210" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
              {/* BG rings */}
              {[
                'M110,30 L190,80 L190,140 L110,190 L30,140 L30,80',
                'M110,50 L170,80 L170,130 L110,170 L50,130 L50,80',
                'M110,70 L150,88 L150,122 L110,150 L70,122 L70,88',
                'M110,90 L130,98 L130,112 L110,130 L90,112 L90,98',
              ].map((d, i) => <polygon key={i} points={d} fill="none" stroke="rgba(74,222,128,0.07)" strokeWidth="0.5"/>)}
              {/* Axes */}
              <g stroke="rgba(74,222,128,0.09)" strokeWidth="0.5">
                <line x1="110" y1="110" x2="110" y2="30"/>
                <line x1="110" y1="110" x2="190" y2="80"/>
                <line x1="110" y1="110" x2="190" y2="140"/>
                <line x1="110" y1="110" x2="110" y2="190"/>
                <line x1="110" y1="110" x2="30" y2="140"/>
                <line x1="110" y1="110" x2="30" y2="80"/>
              </g>
              {/* Data polygon */}
              <polygon
                className="zl-radar"
                points="110,44 176,86 110,164 44,113"
                fill="rgba(74,222,128,0.12)"
                stroke="#4ade80"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Dots */}
              <circle cx="110" cy="44"  r="4" fill="#4ade80"/>
              <circle cx="176" cy="86"  r="4" fill="#fbbf24"/>
              <circle cx="110" cy="164" r="4" fill="#fb923c"/>
              <circle cx="44"  cy="113" r="4" fill="#60a5fa"/>
              {/* Labels */}
              <text x="110" y="21"  fontFamily="var(--z-font-mono)" fontSize="9.5" fill="#4ade80"  textAnchor="middle">Agri 82</text>
              <text x="203" y="88"  fontFamily="var(--z-font-mono)" fontSize="9.5" fill="#fbbf24" textAnchor="start">Solar 91</text>
              <text x="110" y="204" fontFamily="var(--z-font-mono)" fontSize="9.5" fill="#fb923c" textAnchor="middle">Ind 43</text>
              <text x="17"  cy="116" fontFamily="var(--z-font-mono)" fontSize="9.5" fill="#60a5fa" textAnchor="end">House 58</text>
            </svg>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[['#4ade80','Agriculture'],['#60a5fa','Housing'],['#fb923c','Industry'],['#fbbf24','Renewables']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--z-font-mono)', fontSize: 9.5, color: 'var(--z-text-faint)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: c, display: 'inline-block' }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO LOCATIONS ── */}
      <section style={{ background: 'var(--z-bg-card)', borderTop: '1px solid var(--z-border-subtle)', borderBottom: '1px solid var(--z-border-subtle)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--z-green-400)', marginBottom: 12 }}>
            Try It Now
          </div>
          <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 32 }}>
            Explore demo locations.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {DEMO_LOCATIONS.map(({ name, country, scores }) => (
              <div
                key={name}
                className="zl-demo-card"
                onClick={onEnterApp}
                style={{
                  background: 'var(--z-bg-raised)',
                  border: '1px solid var(--z-border-subtle)',
                  borderRadius: 'var(--z-radius-md)',
                  padding: '18px 20px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4 }}>
                  <MapPin size={12} color="var(--z-green-400)" strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--z-text-primary)' }}>{name}</span>
                </div>
                <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', marginBottom: 12 }}>{country}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {scores.map(({ label, val, color }) => (
                    <span key={label} style={{
                      fontFamily: 'var(--z-font-mono)', fontSize: 9, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 4,
                      background: color + '15', color,
                    }}>{label} {val}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 500, height: 250,
          background: 'radial-gradient(ellipse, rgba(74,222,128,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--z-green-400)', marginBottom: 16, position: 'relative' }}>
          Start Exploring
        </div>
        <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16, position: 'relative' }}>
          Your land decision starts here.
        </div>
        <p style={{ fontSize: 14, color: 'var(--z-text-secondary)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.75, position: 'relative' }}>
          No signup. No GIS expertise. No cost. Click a location and let AI do the rest.
        </p>
        <button
          className="zl-primary-btn"
          onClick={onEnterApp}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 'var(--z-radius-lg)',
            border: '1px solid rgba(74,222,128,0.4)',
            background: 'rgba(74,222,128,0.14)',
            color: 'var(--z-green-400)',
            cursor: 'pointer',
            fontFamily: 'var(--z-font-body)', fontSize: 15, fontWeight: 700,
            transition: 'background 0.2s',
            position: 'relative',
          }}
        >
          <Globe size={17} />
          Open the Map
          <ArrowRight size={15} />
        </button>
        <div style={{ marginTop: 20, fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', position: 'relative' }}>
          Built in 48hrs · Powered by Open-Meteo, OSM &amp; Google Gemini
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{
        background: 'var(--z-bg-card)',
        borderTop: '1px solid var(--z-border-subtle)',
        padding: '28px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 20,
      }}>
        <div style={{ fontFamily: 'var(--z-font-display)', fontWeight: 800, fontSize: 15, color: 'var(--z-text-primary)' }}>
          Zameendar<span style={{ color: 'var(--z-green-400)' }}>.ai</span>
          <span style={{ fontFamily: 'var(--z-font-mono)', fontWeight: 300, fontSize: 11, color: 'var(--z-text-faint)', marginLeft: 8 }}>زمیندار</span>
        </div>
        <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', maxWidth: 420, textAlign: 'center', lineHeight: 1.65 }}>
          AI-assisted insights only. Not a substitute for professional surveys, environmental assessments, or local regulatory compliance.
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['About', 'Data Sources', 'GitHub'].map(l => (
            <span key={l} style={{ fontFamily: 'var(--z-font-mono)', fontSize: 10, color: 'var(--z-text-faint)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
