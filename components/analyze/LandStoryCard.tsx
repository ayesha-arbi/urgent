'use client';
import React, { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Share2, Copy, CheckCircle2, Sparkles, Globe, TrendingUp, MapPin } from 'lucide-react';
import type { LandStory } from '@/types';
import { Download, Share2, CheckCircle2, Sparkles, Globe, TrendingUp, MapPin } from 'lucide-react';
import { scoreColor } from '@/lib/utils';

interface LandStoryCardProps {
  story: LandStory;
  onClose?: () => void;
}

export function LandStoryCard({ story, onClose }: LandStoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      });
      const link = document.createElement('a');
      link.download = `land-story-${story.location.placeName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && story.shareUrl) {
      try {
        await navigator.share({
          title: `Land Story: ${story.location.placeName}`,
          text: story.narrative,
          url: story.shareUrl,
        });
        return;
      } catch { /* cancelled */ }
    }
    // Fallback: copy URL
    if (story.shareUrl) {
      await navigator.clipboard.writeText(story.shareUrl);
    }
  };

  const avgScore = Math.round(story.scores.reduce((a, b) => a + b.score, 0) / story.scores.length);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }} onClick={() => onClose?.()}>
      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '1px solid rgba(74, 222, 128, 0.2)',
          borderRadius: 20,
          padding: 32,
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 80px rgba(74, 222, 128, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#4ade80" />
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#4ade80',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Land Story
              </span>
            </div>
            <h2 style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {story.location.placeName}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
            }}>
              <MapPin size={10} />
              {story.location.country || 'Selected Location'}
              <span>·</span>
              {story.location.latLng.lat.toFixed(2)}°N, {story.location.latLng.lng.toFixed(2)}°E
            </div>
          </div>

          {/* Sustainability Score Badge */}
          <div style={{
            textAlign: 'center',
            padding: '12px 16px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              Sustainability
            </div>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: scoreColor(story.sustainabilityScore),
              lineHeight: 1,
            }}>
              {story.sustainabilityScore}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>/ 100</div>
          </div>
        </div>

        {/* Radar Chart Placeholder */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 24,
          padding: '20px 0',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <SimpleRadarChart scores={story.scores} avgScore={avgScore} />
        </div>

        {/* Narrative */}
        <div style={{
          padding: '16px 18px',
          background: 'rgba(74, 222, 128, 0.06)',
          border: '1px solid rgba(74, 222, 128, 0.15)',
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
            fontSize: 9,
            fontWeight: 700,
            color: '#4ade80',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <Globe size={10} />
            The Story
          </div>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7,
            margin: 0,
            fontStyle: 'italic',
          }}>
            "{story.narrative}"
          </p>
        </div>

        {/* Global Insights */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <TrendingUp size={10} />
            Global Impact Insights
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.globalInsights.map((insight, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <CheckCircle2 size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.6,
                }}>
                  {insight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: 10,
              color: '#4ade80',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74, 222, 128, 0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74, 222, 128, 0.15)';
            }}
          >
            <Download size={14} />
            Download Image
          </button>
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            <Share2 size={14} />
            Share
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple radar chart using SVG
function SimpleRadarChart({ scores, avgScore }: { scores: any[], avgScore: number }) {
  const size = 180;
  const center = size / 2;
  const radius = (size / 2) - 20;
  const angleStep = (Math.PI * 2) / scores.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = scores.map((s, i) => getPoint(i, s.score));
  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  // Background polygon (100%)
  const bgPoints = scores.map((_, i) => getPoint(i, 100));
  const bgPathData = bgPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  return (
    <div style={{ position: 'relative' }}>
      <svg width={size} height={size}>
        {/* Background */}
        <polygon
          points={bgPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Grid lines (50%, 75%) */}
        {[50, 75].map(level => {
          const gridPoints = scores.map((_, i) => getPoint(i, level));
          return (
            <polygon
              key={level}
              points={gridPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(74, 222, 128, 0.2)"
          stroke="#4ade80"
          strokeWidth="2"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={scores[i].color}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
          />
        ))}

        {/* Axis lines */}
        {scores.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Center score */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 800,
          color: scoreColor(avgScore),
          lineHeight: 1,
        }}>
          {avgScore}
        </div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Average
        </div>
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
        flexWrap: 'wrap',
      }}>
        {scores.map(s => (
          <div key={s.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>{s.label.slice(0, 8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
