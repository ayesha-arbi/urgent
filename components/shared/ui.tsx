// ============================================================
// Shared UI Components
// ============================================================

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  accent: string;
  sub?: string;
}

export function StatCard({ label, value, Icon, accent, sub }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 'var(--z-radius-lg)',
      padding: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${accent}15`,
        border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={17} color={accent} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 20, fontWeight: 700, color: 'var(--z-text-primary)', marginTop: 2 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 10, color: 'var(--z-text-muted)', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

interface BadgeProps {
  label: string;
  color: string;
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      padding: '2px 7px',
      borderRadius: 'var(--z-radius-pill)',
      background: `${color}15`,
      border: `1px solid ${color}30`,
      color: color,
      fontSize: 9,
      fontWeight: 600,
      fontFamily: 'var(--z-font-mono)',
      letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  );
}

interface PillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

export function Pill({ icon, label, value, valueColor }: PillProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 9px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 'var(--z-radius-pill)',
    }}>
      <span style={{ color: 'var(--z-text-muted)' }}>{icon}</span>
      <span style={{ fontSize: 9, color: 'var(--z-text-faint)', fontFamily: 'var(--z-font-mono)' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: valueColor || 'var(--z-text-primary)', fontFamily: 'var(--z-font-mono)' }}>{value}</span>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--z-font-mono)',
      fontSize: 9,
      color: 'var(--z-text-faint)',
      letterSpacing: '0.12em',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
}

export function ScoreRing({ score, color, size = 42 }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={16}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={16}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s var(--z-spring)' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 3}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill={color}
        fontFamily="var(--z-font-display)"
      >
        {score}
      </text>
    </svg>
  );
}

export function Divider({ margin = '16px 0' }: { margin?: string }) {
  return (
    <div style={{
      height: 1,
      background: 'var(--z-border-subtle)',
      margin,
    }} />
  );
}

interface SkeletonProps {
  h: string;
  w?: string;
  delay?: string;
}

export function Skeleton({ h, w = '100%', delay = '0s' }: SkeletonProps) {
  return (
    <div style={{
      height: h,
      width: w,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      borderRadius: 'var(--z-radius-md)',
      animation: 'z-shimmer 1.2s ease-in-out infinite',
      animationDelay: delay,
    }} />
  );
}
