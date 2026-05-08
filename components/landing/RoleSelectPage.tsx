'use client';

import { useState } from 'react';
import {
  Sprout, Building2, Sun, BarChart3,
  ArrowRight, ChevronRight, Globe,
} from 'lucide-react';

/* ─── Role definitions ─── */
export type UserRole = 'farmer' | 'planner' | 'energy' | 'investor';

interface Role {
  id: UserRole;
  icon: React.ElementType;
  label: string;
  urdu: string;
  tagline: string;
  focus: string[];
  accentColor: string;
  glowColor: string;
}

const ROLES: Role[] = [
  {
    id: 'farmer',
    icon: Sprout,
    label: 'Small Farmer / Zameendar',
    urdu: 'کسان / زمیندار',
    tagline: 'Is this land good for crops?',
    focus: ['Soil & fertility scores', 'Irrigation potential', 'Crop yield projections', 'Climate suitability'],
    accentColor: '#4ade80',
    glowColor: 'rgba(74,222,128,0.15)',
  },
  {
    id: 'planner',
    icon: Building2,
    label: 'Urban Planner',
    urdu: 'شہری منصوبہ ساز',
    tagline: 'How should this area develop?',
    focus: ['Zoning & density data', 'Infrastructure readiness', 'Environmental impact', 'Population density'],
    accentColor: '#60a5fa',
    glowColor: 'rgba(96,165,250,0.15)',
  },
  {
    id: 'energy',
    icon: Sun,
    label: 'Renewable Energy Developer',
    urdu: 'قابل تجدید توانائی',
    tagline: 'Where does clean energy thrive?',
    focus: ['Solar irradiance index', 'Wind speed & elevation', 'Grid proximity', 'Land availability'],
    accentColor: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.15)',
  },
  {
    id: 'investor',
    icon: BarChart3,
    label: 'Investor / Policymaker',
    urdu: 'سرمایہ کار / پالیسی ساز',
    tagline: 'What is the ROI potential?',
    focus: ['Composite land value score', 'Risk & hazard index', 'Development potential', 'Regulatory overview'],
    accentColor: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.15)',
  },
];

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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
interface RoleSelectPageProps {
  onRoleSelected: (role: UserRole) => void;
}

export function RoleSelectPage({ onRoleSelected }: RoleSelectPageProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [confirming, setConfirming] = useState(false);

  const selectedRole = ROLES.find(r => r.id === selected);

  function handleStart() {
    if (!selected) return;
    setConfirming(true);
    setTimeout(() => onRoleSelected(selected), 600);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090a',
      color: '#f0f0f0',
      fontFamily: "'Syne', 'DM Sans', system-ui, sans-serif",
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>

      {/* ── Font import + styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes scaleOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.04); }
        }

        .rs-header  { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both 0.05s; }
        .rs-sub     { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both 0.15s; }
        .rs-grid    { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both 0.25s; }
        .rs-cta     { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both 0.35s; }

        .role-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .role-card:hover {
          border-color: rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.04);
          transform: translateY(-3px);
        }
        .role-card.selected {
          transform: translateY(-4px);
        }

        .focus-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 11px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          font-size: 12px;
          color: #888;
          white-space: nowrap;
        }

        .btn-start {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: #4ade80;
          color: #08090a;
          border: none;
          border-radius: 100px;
          font-family: inherit;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s, opacity 0.2s;
        }
        .btn-start:not(:disabled):hover {
          background: #6ee7a0;
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(74,222,128,0.35);
        }
        .btn-start:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

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

        .page-exit {
          animation: scaleOut 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
      `}</style>

      {/* ── Background orbs ── */}
      <Orb style={{ width: 700, height: 500, top: -120, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(74,222,128,0.1) 0%, transparent 70%)' }} />
      <Orb style={{ width: 400, height: 400, bottom: 0, right: -80, background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)' }} />
      <Orb style={{ width: 300, height: 300, top: 200, left: -60, background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)' }} />

      {/* grid lines */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Content ── */}
      <div className={confirming ? 'page-exit' : ''} style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
            Zameendar<span style={{ color: '#4ade80' }}>.ai</span>
          </span>
        </div>

        {/* Header */}
        <div className="rs-header" style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span className="tag-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-ring 2s ease-out infinite' }} />
              Personalize your experience
            </span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 16 }}>
            <GradText gradient="linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)">
              I am a...
            </GradText>
          </h1>
        </div>

        <p className="rs-sub" style={{ textAlign: 'center', fontSize: 17, color: '#666', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>
          Select your role so we can tailor insights, scores, and recommendations specifically for you.
        </p>

        {/* Role Cards Grid */}
        <div className="rs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 44 }}>
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`role-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(role.id)}
                style={{
                  borderColor: isSelected ? role.accentColor + '55' : undefined,
                  background: isSelected ? role.glowColor : undefined,
                  boxShadow: isSelected ? `0 0 0 1px ${role.accentColor}33, 0 20px 60px ${role.accentColor}18` : undefined,
                }}
              >
                {/* Top accent strip when selected */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg, transparent, ${role.accentColor}, transparent)`, borderRadius: 2 }} />
                )}

                {/* Selection checkmark */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 16, right: 16, width: 22, height: 22, borderRadius: '50%', background: role.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="#08090a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 14, background: isSelected ? `${role.accentColor}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${isSelected ? role.accentColor + '30' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: 'all 0.25s' }}>
                  <Icon size={22} color={isSelected ? role.accentColor : '#777'} />
                </div>

                {/* Label */}
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: isSelected ? '#f0f0f0' : '#d4d4d4', marginBottom: 4, letterSpacing: '-0.01em' }}>
                  {role.label}
                </h3>
                <p style={{ fontSize: 12, color: '#555', marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
                  {role.urdu}
                </p>

                {/* Tagline */}
                <p style={{ fontSize: 13, color: isSelected ? '#aaa' : '#555', marginBottom: 18, lineHeight: 1.5, fontWeight: 300 }}>
                  "{role.tagline}"
                </p>

                {/* Focus pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {role.focus.map(f => (
                    <span key={f} className="focus-pill" style={{ borderColor: isSelected ? `${role.accentColor}20` : undefined, color: isSelected ? '#aaa' : undefined }}>
                      <ChevronRight size={10} color={isSelected ? role.accentColor : '#555'} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="rs-cta" style={{ textAlign: 'center' }}>

          {/* Selected role preview */}
          {selectedRole && (
            <div style={{ marginBottom: 24, animation: 'fadeIn 0.4s ease both', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedRole.accentColor }} />
              <span style={{ fontSize: 14, color: '#888' }}>
                Insights tailored for <span style={{ color: selectedRole.accentColor, fontWeight: 600 }}>{selectedRole.label}</span>
              </span>
            </div>
          )}

          <button
            className="btn-start"
            disabled={!selected}
            onClick={handleStart}
            style={selected && selectedRole ? {
              background: selectedRole.accentColor,
              boxShadow: selected ? `0 14px 40px ${selectedRole.accentColor}35` : undefined,
            } : {}}
          >
            <Globe size={18} />
            Start Your Journey
            <ArrowRight size={16} />
          </button>

          <p style={{ marginTop: 20, fontSize: 12, color: '#333' }}>
            No signup required · You can change your role anytime
          </p>
        </div>

      </div>
    </div>
  );
}