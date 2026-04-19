import React from 'react';

/* ═══════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  accent: string;
  sub?: string;
  trend?: { value: string; up: boolean };
}

export function StatCard({ label, value, Icon, accent, sub, trend }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 'var(--z-radius-lg)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle top-left corner accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 64, height: 64,
        background: `radial-gradient(circle at top left, ${accent}0d 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: `${accent}10`,
          border: `1px solid ${accent}1e`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={accent} strokeWidth={2} />
        </div>

        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700,
            color: trend.up ? '#4ade80' : '#f87171',
            background: trend.up ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${trend.up ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
            padding: '2px 7px', borderRadius: 6,
          }}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {/* bottom row: value + label */}
      <div>
        <div style={{
          fontSize: 26, fontWeight: 800,
          color: 'var(--z-text-primary)',
          letterSpacing: '-0.03em', lineHeight: 1,
          fontFamily: "'Syne', sans-serif",
          marginBottom: 5,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 500,
          color: 'var(--z-text-secondary)',
          lineHeight: 1,
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: 10, color: 'var(--z-text-muted)',
            marginTop: 5, lineHeight: 1.4,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BADGE
═══════════════════════════════════════════ */
interface BadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'sm' }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'md' ? '4px 10px' : '2px 7px',
      borderRadius: 6,
      background: `${color}10`,
      border: `1px solid ${color}22`,
      color,
      fontSize: size === 'md' ? 12 : 10,
      fontWeight: 700,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   PILL  (env data chip)
═══════════════════════════════════════════ */
interface PillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

export function Pill({ icon, label, value, valueColor }: PillProps) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 9px',
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 8,
    }}>
      <span style={{ color: 'var(--z-text-muted)', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {label && (
        <span style={{
          fontSize: 9, color: 'var(--z-text-muted)',
          fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: valueColor ?? 'var(--z-text-primary)',
      }}>
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION LABEL
═══════════════════════════════════════════ */
export function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 10, fontWeight: 700,
      color: 'var(--z-text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12,
    }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{icon}</span>}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCORE RING  (SVG circle progress)
═══════════════════════════════════════════ */
interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, color, size = 44, strokeWidth = 3.5 }: ScoreRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {/* track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* progress */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
      />
      {/* score text */}
      <text
        x={cx} y={cy + 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        fill={color}
        fontFamily="'Syne', sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   DIVIDER
═══════════════════════════════════════════ */
export function Divider({ margin = '16px 0', accent = false }: { margin?: string; accent?: boolean }) {
  return (
    <div style={{
      height: 1,
      background: accent
        ? 'linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent)'
        : 'var(--z-border-subtle)',
      margin,
    }} />
  );
}

/* ═══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
interface SkeletonProps {
  h: string;
  w?: string;
  delay?: string;
  radius?: string;
}

export function Skeleton({ h, w = '100%', delay = '0s', radius }: SkeletonProps) {
  return (
    <div style={{
      height: h, width: w,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '400% 100%',
      borderRadius: radius ?? 'var(--z-radius-md)',
      animation: 'z-shimmer 1.6s ease-in-out infinite',
      animationDelay: delay,
    }} />
  );
}

/* ═══════════════════════════════════════════
   ICON BOX  (reusable colored icon container)
═══════════════════════════════════════════ */
interface IconBoxProps {
  Icon: React.ElementType;
  color: string;
  size?: number;
  boxSize?: number;
  radius?: number;
}

export function IconBox({ Icon, color, size = 16, boxSize = 32, radius = 8 }: IconBoxProps) {
  return (
    <div style={{
      width: boxSize, height: boxSize, borderRadius: radius, flexShrink: 0,
      background: `${color}10`,
      border: `1px solid ${color}1e`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={size} color={color} strokeWidth={2} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   LIVE DOT  (animated status indicator)
═══════════════════════════════════════════ */
interface LiveDotProps {
  color?: string;
  size?: number;
}

export function LiveDot({ color = '#4ade80', size = 8 }: LiveDotProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', background: color,
        opacity: 0.4,
        animation: 'z-pulse 2s ease-in-out infinite',
      }} />
      <span style={{
        position: 'relative', display: 'inline-flex',
        width: size, height: size,
        borderRadius: '50%', background: color,
      }} />
    </span>
  );
}

/* ═══════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════ */
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', gap: 12, textAlign: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--z-bg-card)',
        border: '1px solid var(--z-border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
      }}>
        <Icon size={20} color="var(--z-text-muted)" strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--z-text-secondary)', fontFamily: "'Syne', sans-serif" }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 11, color: 'var(--z-text-muted)', lineHeight: 1.6, maxWidth: 220 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TOOLTIP LABEL  (small floating label)
═══════════════════════════════════════════ */
export function TooltipLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      padding: '2px 6px',
      background: 'var(--z-bg-card)',
      border: '1px solid var(--z-border-subtle)',
      borderRadius: 5,
      fontSize: 10, fontWeight: 600,
      color: 'var(--z-text-secondary)',
      letterSpacing: '0.02em',
    }}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════
   GHOST BUTTON
═══════════════════════════════════════════ */
interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ElementType;
  size?: 'sm' | 'md';
  danger?: boolean;
}

export function GhostButton({ children, onClick, icon: Icon, size = 'md', danger = false }: GhostButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const color = danger ? '#f87171' : 'var(--z-text-secondary)';
  const hoverColor = danger ? '#f87171' : 'var(--z-text-primary)';
  const hoverBg = danger ? 'rgba(248,113,113,0.08)' : 'var(--z-bg-hover)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '6px 10px' : '8px 14px',
        borderRadius: 8,
        border: '1px solid var(--z-border-subtle)',
        background: hovered ? hoverBg : 'transparent',
        color: hovered ? hoverColor : color,
        cursor: 'pointer',
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} />}
      {children}
    </button>
  );
}