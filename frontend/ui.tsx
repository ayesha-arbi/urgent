// ============================================================
// components/shared/ui.tsx — Reusable primitives
// StatCard, Badge, SectionLabel, Skeleton, Divider, Pill
// ============================================================

import React from 'react';

// ── StatCard ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  accent?: string;
  sub?: string;
}
export function StatCard({ label, value, Icon, accent = '#4ade80', sub }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 'var(--z-radius-lg)',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--z-text-muted)', fontFamily: 'var(--z-font-mono)', letterSpacing: '0.06em' }}>
          {label.toUpperCase()}
        </span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={accent} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 26, fontWeight: 700, color: 'var(--z-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--z-text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps { label: string; color: string; }
export function Badge({ label, color }: BadgeProps) {
  return (
    <span style={{
      fontSize: 9, padding: '3px 8px', borderRadius: 'var(--z-radius-pill)',
      background: color + '20', color, fontFamily: 'var(--z-font-mono)',
      fontWeight: 700, letterSpacing: '0.08em', display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

// ── SectionLabel ──────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--z-font-mono)', fontSize: 9,
      color: 'var(--z-text-faint)', letterSpacing: '0.12em',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ h = '14px', w = '100%', radius = '6px', delay = '0s' }: { h?: string; w?: string; radius?: string; delay?: string }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'rgba(255,255,255,0.05)',
      animation: `z-shimmer 1.4s ease-in-out ${delay} infinite`,
    }} />
  );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider({ margin = '16px 0' }: { margin?: string }) {
  return <div style={{ height: 1, background: 'var(--z-border-subtle)', margin }} />;
}

// ── Pill ─────────────────────────────────────────────────────
interface PillProps { icon: React.ReactNode; label: string; value: string; valueColor?: string; }
export function Pill({ icon, label, value, valueColor }: PillProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 10px', borderRadius: 'var(--z-radius-pill)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--z-border-subtle)',
      fontSize: 11,
    }}>
      <span style={{ color: 'var(--z-text-muted)', display: 'flex' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor || 'var(--z-text-secondary)' }}>{value}</span>
    </div>
  );
}

// ── ScoreRing ─────────────────────────────────────────────────
interface ScoreRingProps { score: number; color: string; size?: number; }
export function ScoreRing({ score, color, size = 44 }: ScoreRingProps) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--z-font-display)', fontSize: size * 0.28, fontWeight: 700, color }}>
        {score}
      </div>
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ Icon, title, subtitle, action }: { Icon: React.ElementType; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon size={22} color="var(--z-text-muted)" strokeWidth={1.5} />
      </div>
      <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--z-text-primary)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--z-text-muted)', maxWidth: 260, lineHeight: 1.6 }}>{subtitle}</div>
      {action}
    </div>
  );
}
