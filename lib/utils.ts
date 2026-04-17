// ============================================================
// Utility functions for Zameendar.ai
// ============================================================

import type { SuitabilityCategory } from '@/types';

export const CATEGORY_COLOR: Record<SuitabilityCategory, string> = {
  Agriculture: '#4ade80',
  Housing: '#60a5fa',
  Industry: '#fb923c',
  Renewables: '#fbbf24',
};

export function scoreColor(score: number): string {
  if (score >= 75) return '#4ade80'; // green
  if (score >= 50) return '#fbbf24'; // yellow
  if (score >= 25) return '#fb923c'; // orange
  return '#f87171'; // red
}

export function scoreLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Poor';
}

export function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#4ade80';
  if (aqi <= 100) return '#fbbf24';
  if (aqi <= 150) return '#fb923c';
  return '#f87171';
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy (Sensitive)';
  return 'Unhealthy';
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
