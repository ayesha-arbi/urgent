// ============================================================
// components/map/WorldMap.tsx
// SVG world map with clickable pins and coordinate detection
// [INTEGRATE] Replace with react-leaflet MapContainer:
//   import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
//   npm install react-leaflet leaflet @types/leaflet
// ============================================================

import React, { useRef, useCallback, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { LatLng } from '../../types';
import { DEMO_LOCATIONS } from '../../data/mockData';
import type { AnalyzePhase } from '../../types';

interface WorldMapProps {
  onLocationSelect: (latLng: LatLng, name?: string) => void;
  selectedLat?: number;
  selectedLng?: number;
  phase: AnalyzePhase;
}

export function WorldMap({ onLocationSelect, selectedLat, selectedLng, phase }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [clickedXY, setClickedXY] = useState<{ x: number; y: number } | null>(null);
  const isLoading = phase === 'loading_data' || phase === 'loading_ai';

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Don't fire if clicking a pin button
    if ((e.target as HTMLElement).closest('[data-pin]')) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lng = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;
    setClickedXY({ x, y });
    onLocationSelect({ lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 });
  }, [onLocationSelect]);

  return (
    <div
      ref={mapRef}
      onClick={handleMapClick}
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: '#07090f', overflow: 'hidden',
        cursor: isLoading ? 'wait' : 'crosshair',
        userSelect: 'none',
      }}
    >
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Equator + prime meridian reference lines */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(74,222,128,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(74,222,128,0.06)', pointerEvents: 'none' }} />

      {/* Continent SVG outlines */}
      <svg
        viewBox="0 0 1000 500"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}
        preserveAspectRatio="none"
      >
        {/* North America */}
        <path fill="#4ade80" d="M190 138 Q202 108 242 114 Q268 107 278 130 Q296 120 308 145 Q320 170 298 184 Q278 200 254 192 Q230 200 210 186 Q190 175 186 158 Z" />
        {/* Central America */}
        <path fill="#4ade80" d="M230 192 Q248 188 258 202 Q264 218 252 228 Q240 238 228 228 Q218 218 220 205 Z" />
        {/* South America */}
        <path fill="#4ade80" d="M264 210 Q290 202 312 215 Q338 230 342 262 Q348 300 328 328 Q308 356 280 348 Q252 342 240 312 Q228 278 236 248 Q244 222 264 210 Z" />
        {/* Europe */}
        <path fill="#4ade80" d="M465 128 Q490 118 512 124 Q530 130 534 148 Q538 166 520 176 Q500 186 480 178 Q460 170 457 152 Q453 136 465 128 Z" />
        {/* Africa */}
        <path fill="#4ade80" d="M468 188 Q496 178 518 188 Q544 200 548 230 Q554 266 538 298 Q522 330 498 344 Q474 356 452 340 Q430 322 428 290 Q426 254 438 224 Q450 196 468 188 Z" />
        {/* Middle East / Arabia */}
        <path fill="#4ade80" d="M548 175 Q572 168 592 178 Q610 188 614 208 Q618 228 600 236 Q580 244 562 232 Q544 220 544 200 Z" />
        {/* South Asia */}
        <path fill="#4ade80" d="M600 185 Q636 176 662 190 Q684 204 682 228 Q680 252 658 262 Q636 272 614 258 Q592 244 592 220 Q592 198 600 185 Z" />
        {/* Southeast Asia */}
        <path fill="#4ade80" d="M680 195 Q706 186 724 198 Q740 210 738 230 Q736 250 718 258 Q700 266 684 252 Q668 238 670 216 Z" />
        {/* East Asia */}
        <path fill="#4ade80" d="M702 148 Q740 138 770 150 Q794 162 796 185 Q798 208 776 220 Q752 232 726 220 Q700 208 697 186 Q694 165 702 148 Z" />
        {/* Russia / Central Asia */}
        <path fill="#4ade80" d="M500 98 Q580 86 660 94 Q720 100 748 118 Q764 132 752 148 Q738 164 710 168 Q672 174 636 162 Q600 152 568 160 Q536 168 510 158 Q484 148 480 130 Q476 112 500 98 Z" />
        {/* Australia */}
        <path fill="#4ade80" d="M740 298 Q776 286 810 294 Q838 302 842 326 Q846 350 824 364 Q802 378 776 368 Q750 358 740 334 Q730 312 740 298 Z" />
      </svg>

      {/* Lat/lng axis labels */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'rgba(74,222,128,0.2)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        0° PRIME MERIDIAN
      </div>
      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'rgba(74,222,128,0.2)', pointerEvents: 'none', transformOrigin: 'left center', whiteSpace: 'nowrap' }}>
        0° EQUATOR
      </div>

      {/* Demo Pins */}
      {DEMO_LOCATIONS.map(pin => (
        <button
          key={pin.name}
          data-pin="true"
          onClick={e => { e.stopPropagation(); onLocationSelect({ lat: pin.lat, lng: pin.lng }, pin.name); setClickedXY(null); }}
          onMouseEnter={() => setHovered(pin.name)}
          onMouseLeave={() => setHovered(null)}
          style={{
            position: 'absolute',
            left: `${pin.pinX}%`,
            top: `${pin.pinY}%`,
            transform: hovered === pin.name ? 'translate(-50%, -110%) scale(1.15)' : 'translate(-50%, -100%)',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            zIndex: 10, transition: 'transform 0.15s var(--z-spring)',
          }}
        >
          <div style={{
            width: 24, height: 24,
            borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
            background: 'rgba(74,222,128,0.14)', border: '1.5px solid #4ade80',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hovered === pin.name ? '0 0 16px rgba(74,222,128,0.5)' : '0 0 8px rgba(74,222,128,0.25)',
            transition: 'box-shadow 0.15s',
          }}>
            <MapPin size={10} color="#4ade80" strokeWidth={2.5} style={{ transform: 'rotate(45deg)' }} />
          </div>
          {/* Tooltip */}
          {hovered === pin.name && (
            <div style={{
              position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--z-bg-raised)', border: '1px solid var(--z-border-accent)',
              borderRadius: 'var(--z-radius-sm)', padding: '4px 10px',
              fontSize: 11, color: 'var(--z-text-primary)', whiteSpace: 'nowrap',
              fontFamily: 'var(--z-font-mono)', pointerEvents: 'none',
              boxShadow: 'var(--z-shadow-md)',
            }}>
              {pin.name}, {pin.country}
            </div>
          )}
        </button>
      ))}

      {/* Custom clicked pin */}
      {clickedXY && (
        <div style={{
          position: 'absolute', left: clickedXY.x, top: clickedXY.y,
          transform: 'translate(-50%, -100%)', zIndex: 20, pointerEvents: 'none',
          animation: 'z-pinpop 0.4s var(--z-spring)',
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
            background: 'rgba(251,191,36,0.18)', border: '2px solid #fbbf24',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(251,191,36,0.45)',
          }}>
            <Navigation size={11} color="#fbbf24" strokeWidth={2.5} style={{ transform: 'rotate(45deg)' }} />
          </div>
        </div>
      )}

      {/* Coord badge */}
      {selectedLat !== undefined && selectedLng !== undefined && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 30,
          background: 'rgba(13,17,23,0.92)', border: '1px solid var(--z-border-accent)',
          borderRadius: 'var(--z-radius-md)', padding: '6px 12px',
          fontFamily: 'var(--z-font-mono)', fontSize: 11, color: 'var(--z-green-400)',
          backdropFilter: 'blur(8px)',
        }}>
          {selectedLat.toFixed(4)}°N · {selectedLng.toFixed(4)}°E
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(7,9,15,0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '3px solid rgba(74,222,128,0.12)',
              borderTopColor: '#4ade80', borderRadius: '50%',
              animation: 'z-spin 0.9s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 6,
              border: '2px solid rgba(45,212,191,0.12)',
              borderBottomColor: '#2dd4bf', borderRadius: '50%',
              animation: 'z-spin 1.3s linear infinite reverse',
            }} />
          </div>
          <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 11, color: 'var(--z-green-400)', letterSpacing: '0.1em' }}>
            {phase === 'loading_data' ? 'FETCHING ENVIRONMENTAL DATA...' : 'RUNNING AI ANALYSIS...'}
          </div>
        </div>
      )}

      {/* Click hint (idle only) */}
      {phase === 'idle' && !clickedXY && (
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, background: 'rgba(13,17,23,0.88)',
          border: '1px solid var(--z-border-mild)', borderRadius: 'var(--z-radius-pill)',
          padding: '7px 20px', fontSize: 12, color: 'var(--z-text-muted)',
          backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
          fontFamily: 'var(--z-font-mono)',
        }}>
          Click anywhere to analyse · or select a demo pin
        </div>
      )}
    </div>
  );
}
