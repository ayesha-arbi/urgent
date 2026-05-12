'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Sprout, Building2, Factory, Sun, Globe,
  MapPin, ChevronRight, Play, Zap, BarChart3, Layers,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

/* ─── tiny hook: intersection-based reveal ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── animated counter ─── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── floating orb ─── */
const Orb = ({ style }: { style: React.CSSProperties }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
    ...style,
  }} />
);

/* ─── gradient text ─── */
const GradText = ({ children, gradient }: { children: React.ReactNode; gradient: string }) => (
  <span style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* nav transparency on scroll */
  const navOpaque = scrollY > 40;

  /* reveal blocks */
  const stats = useReveal();
  const features = useReveal();
  const how = useReveal();
  const cta = useReveal();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090a',
      color: '#f0f0f0',
      fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif",
      overflowX: 'hidden',
    }}>
      {/* ── Google Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(74,222,128,0.3); }
          50% { border-color: rgba(74,222,128,0.7); }
        }

        .hero-title {
          animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.1s;
        }
        .hero-sub {
          animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.22s;
        }
        .hero-cta {
          animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.34s;
        }
        .hero-badge {
          animation: fadeIn 0.7s ease both;
          animation-delay: 0s;
        }
        .hero-mockup {
          animation: fadeUp 1.1s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.5s;
        }

        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 26px;
          background: #4ade80;
          color: #08090a;
          border: none;
          border-radius: 100px;
          font-family: inherit;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          position: relative;
          z-index: 1;
        }
        .btn-primary:hover {
          background: #6ee7a0;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(74,222,128,0.3);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 26px;
          background: transparent;
          color: #f0f0f0;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          font-family: inherit;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .btn-ghost:hover {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.05);
          transform: translateY(-1px);
        }

        .feature-card {
          padding: 32px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: border-color 0.3s, background 0.3s, transform 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
          transform: translateY(-4px);
        }
        .feature-card:hover::before { opacity: 1; }

        .use-case-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          font-size: 14px;
          color: #d4d4d4;
          transition: border-color 0.25s, background 0.25s;
        }
        .use-case-pill:hover {
          border-color: rgba(74,222,128,0.3);
          background: rgba(74,222,128,0.05);
        }

        .step-card {
          padding: 36px 32px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .step-card:hover {
          border-color: rgba(74,222,128,0.25);
        }

        .nav-link {
          font-size: 14px;
          color: #a5a5a5;
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: #f0f0f0; }

        .tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          background: rgba(74,222,128,0.08);
          border: 1px solid rgba(74,222,128,0.18);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #4ade80;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .glow-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74,222,128,0.4), transparent);
        }

        /* Score bar anim */
        @keyframes scoreReveal {
          0% { width: 0%; }
          100% { width: var(--target-w); }
        }
        .score-bar {
          height: 6px;
          border-radius: 3px;
          animation: scoreReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-delay: 0.6s;
          width: 0%;
        }

        /* Video play button */
        .play-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(74,222,128,0.15);
          border: 2px solid rgba(74,222,128,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(8px);
        }
        .play-btn:hover {
          background: rgba(74,222,128,0.25);
          transform: scale(1.08);
          box-shadow: 0 0 32px rgba(74,222,128,0.3);
        }
      `}</style>

      {/* ══════════ NAV ══════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        background: navOpaque ? 'rgba(8,9,10,0.85)' : 'transparent',
        backdropFilter: navOpaque ? 'blur(20px)' : 'none',
        borderBottom: navOpaque ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s',
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
          Zameendar<span style={{ color: '#4ade80' }}>.ai</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'How it works', 'Use cases'].map(l => (
            <span key={l} className="nav-link">{l}</span>
          ))}
        </div>

        <button className="btn-primary" onClick={onEnterApp} style={{ padding: '10px 20px', fontSize: 14 }}>
          Open App <ArrowRight size={14} />
        </button>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        {/* bg orbs */}
        <Orb style={{ width: 600, height: 600, top: -100, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)' }} />
        <Orb style={{ width: 400, height: 400, bottom: 0, right: -100, background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)' }} />
        <Orb style={{ width: 300, height: 300, top: 200, left: -50, background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />

        {/* grid lines bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-badge" style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <span className="tag-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-ring 2s ease-out infinite' }} />
              AI-Powered Land Intelligence
            </span>
          </div>

          <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(44px, 7vw, 82px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24 }}>
            <GradText gradient="linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)">
              Understand any land<br />
            </GradText>
            <GradText gradient="linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a78bfa 100%)">
              in under 3 seconds.
            </GradText>
          </h1>

          <p className="hero-sub" style={{ fontSize: 18, color: '#8a8a8a', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7, fontWeight: 300 }}>
            Click anywhere on the map. Get instant AI scores for agriculture, housing, industry, and renewable energy.
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onEnterApp}>
              <Globe size={17} />
              Start Exploring
            </button>
            <button className="btn-ghost" onClick={onEnterApp}>
              <Play size={15} />
              Watch Demo
            </button>
          </div>

          <p className="hero-cta" style={{ marginTop: 20, fontSize: 13, color: '#555', fontWeight: 400 }}>
            No signup required · No GIS expertise needed
          </p>
        </div>

        {/* ── HERO MOCKUP — replaced SVG with image.png ── */}
        <div className="hero-mockup" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1040, margin: '64px auto 0' }}>
          {/* outer glow border */}
          <div style={{ position: 'relative', borderRadius: 20, padding: 1, background: 'linear-gradient(135deg, rgba(74,222,128,0.3), rgba(96,165,250,0.2), rgba(167,139,250,0.15))' }}>
            <div style={{ borderRadius: 19, overflow: 'hidden', background: '#0e1012', position: 'relative' }}>
              {/* top bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['#ff5f56','#ffbd2e','#27c93f'].map(c => <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 12, marginLeft: 8 }}>
                  <MapPin size={12} color="#4ade80" style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 12, color: '#555' }}>zameendar.ai</span>
                </div>
              </div>

              {/* ── APP SCREENSHOT ── */}
              <img
                src="/image.png"
                alt="Zameendar.ai app screenshot"
                style={{ width: '100%', display: 'block', maxHeight: 560, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* bottom glow */}
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 60, background: 'rgba(74,222,128,0.08)', filter: 'blur(30px)', borderRadius: '50%' }} />
        </div>
      </section>

      <div className="glow-line" />


      {/* ══════════ STATS ══════════ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 40px', background: 'rgba(255,255,255,0.01)' }}>
        <div ref={stats.ref} className={`reveal ${stats.visible ? 'visible' : ''}`} style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { value: 4, suffix: '', label: 'Categories scored', sub: 'Agriculture · Housing · Industry · Renewables' },
            { value: 3, suffix: 's', label: 'Time to insight', sub: 'Real-time API data fetched instantly' },
            { value: 100, suffix: '%', label: 'Free to use', sub: 'No credit card, no signup' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 52, fontWeight: 800, color: '#4ade80', lineHeight: 1, marginBottom: 8 }}>
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#d4d4d4', marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 12, color: '#4a4a4a' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <span className="tag-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>What we analyze</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
              Four lenses.<br />
              <GradText gradient="linear-gradient(90deg, #4ade80, #22d3ee)">One smart score.</GradText>
            </h2>
            <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, maxWidth: 400 }}>
              Every click on the map triggers a live data pipeline — climate, elevation, air quality, and solar — synthesised by AI into actionable intelligence.
            </p>
          </div>

          <div ref={features.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { Icon: Sprout, title: 'Agriculture', desc: 'Climate, rainfall, soil proxies, elevation suitability', color: '#4ade80', delay: '0s' },
              { Icon: Building2, title: 'Housing', desc: 'Air quality, livability, urban proximity, climate', color: '#60a5fa', delay: '0.1s' },
              { Icon: Factory, title: 'Industry', desc: 'Infrastructure access, industrial climate compatibility', color: '#fb923c', delay: '0.2s' },
              { Icon: Sun, title: 'Renewables', desc: 'UV index, wind speed, cloud cover potential', color: '#fbbf24', delay: '0.3s' },
            ].map((f, i) => (
              <div key={f.title} className={`feature-card reveal reveal-delay-${i + 1} ${features.visible ? 'visible' : ''}`} style={{ transitionDelay: f.delay }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${f.color}20` }}>
                  <f.Icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#e5e5e5', fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>How it works</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Three steps to clarity
            </h2>
          </div>

          <div ref={how.ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', top: 52, left: '16.5%', right: '16.5%', height: 1, background: 'linear-gradient(90deg, rgba(74,222,128,0.3), rgba(96,165,250,0.2), rgba(167,139,250,0.3))', zIndex: 0 }} />

            {[
              { num: '01', Icon: MapPin, title: 'Pick a location', desc: 'Click anywhere on the interactive map or search by city name. We handle the coordinates automatically.', color: '#4ade80', delay: '0s' },
              { num: '02', Icon: BarChart3, title: 'Data loads live', desc: 'Real-time weather, air quality, elevation, and population density fetched from global APIs in milliseconds.', color: '#60a5fa', delay: '0.15s' },
              { num: '03', Icon: Layers, title: 'AI insight delivered', desc: 'Our model weighs every factor and returns scores with human-readable recommendations — no expertise required.', color: '#a78bfa', delay: '0.3s' },
            ].map((step, i) => (
              <div key={step.num} className={`step-card reveal reveal-delay-${i + 1} ${how.visible ? 'visible' : ''}`} style={{ transitionDelay: step.delay, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${step.color}12`, border: `1px solid ${step.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <step.Icon size={20} color={step.color} />
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800, color: `${step.color}18`, lineHeight: 1, marginBottom: 12 }}>{step.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: "'Syne', sans-serif", color: '#e5e5e5' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECONDARY IMAGE SECTION ══════════ */}
      <section style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* ── feature screenshot ── */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img
              src="/image.png"
              alt="Zameendar.ai feature view"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
            {/* decorative corner accents */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, borderTop: '2px solid rgba(74,222,128,0.3)', borderLeft: '2px solid rgba(74,222,128,0.3)', borderRadius: '20px 0 0 0', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, borderBottom: '2px solid rgba(96,165,250,0.2)', borderRight: '2px solid rgba(96,165,250,0.2)', borderRadius: '0 0 20px 0', pointerEvents: 'none' }} />
          </div>

          <div>
            <span className="tag-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>Live data</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
              Real-time intelligence,<br />not static guesswork.
            </h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, marginBottom: 28 }}>
              Zameendar.ai fetches live environmental and infrastructure data for every coordinate — so the score you see reflects today's conditions, not a five-year-old survey.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['OpenWeather · live climate & UV data', 'IQAir · real-time air quality index', 'Open-Elevation · terrain & slope data', 'Claude AI · synthesised scoring engine'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronRight size={12} color="#4ade80" />
                  </div>
                  <span style={{ fontSize: 14, color: '#888' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ USE CASES ══════════ */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="tag-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>Built for everyone</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Who uses Zameendar.ai
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: Sprout, label: 'Farmers evaluating new land' },
              { icon: Building2, label: 'Real estate developers' },
              { icon: Globe, label: 'Government planners & zoning' },
              { icon: BarChart3, label: 'Investors assessing potential' },
              { icon: Layers, label: 'Environmental consultants' },
              { icon: Sun, label: 'Renewable energy researchers' },
            ].map(item => (
              <div key={item.label} className="use-case-pill">
                <item.icon size={16} color="#4ade80" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section ref={cta.ref} style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Orb style={{ width: 700, height: 400, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(ellipse, rgba(74,222,128,0.09) 0%, transparent 70%)' }} />

        <div className={`reveal ${cta.visible ? 'visible' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, position: 'relative', overflow: 'hidden', animation: cta.visible ? 'borderGlow 3s ease-in-out infinite' : 'none' }}>
            {/* top strip */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 2, background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />

            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
              Ready to explore?
            </h2>
            <p style={{ fontSize: 16, color: '#666', maxWidth: 380, margin: '0 auto 36px', lineHeight: 1.7 }}>
              No signup. No GIS expertise. No cost. Just click the map and let the AI do the rest.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={onEnterApp} style={{ padding: '16px 32px', fontSize: 16 }}>
                <Globe size={18} />
                Open the Map
              </button>
              <button className="btn-ghost" onClick={onEnterApp}>
                View Demo <ArrowRight size={15} />
              </button>
            </div>
            <p style={{ marginTop: 24, fontSize: 12, color: '#333' }}>Powered by Claude AI · Live environmental APIs</p>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#e5e5e5' }}>Zameendar.ai</span>
          <span style={{ fontSize: 16, color: '#333' }}>زمیندار</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} className="nav-link" style={{ fontSize: 13 }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#333' }}>
          AI insights for exploratory purposes only. © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}