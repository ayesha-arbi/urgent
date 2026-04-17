// ============================================================
// WorldMap Component - Leaflet interactive map
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { DEMO_LOCATIONS } from '@/lib/mockData';
import type { LatLng, AnalyzePhase } from '@/types';

interface MapClickHandlerProps {
  onLocationSelect: (latLng: LatLng, name?: string) => void;
  phase: AnalyzePhase;
}

function MapClickHandler({ onLocationSelect, phase }: MapClickHandlerProps) {
  const isLoading = phase === 'loading_data' || phase === 'loading_ai';

  useMapEvents({
    click(e) {
      if (isLoading) return;
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

interface WorldMapProps {
  onLocationSelect: (latLng: LatLng, name?: string) => void;
  selectedLat?: number;
  selectedLng?: number;
  phase: AnalyzePhase;
}

export function WorldMap({ onLocationSelect, selectedLat, selectedLng, phase }: WorldMapProps) {
  const [mounted, setMounted] = useState(false);
  const isLoading = phase === 'loading_data' || phase === 'loading_ai';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#07090f' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--z-font-mono)', fontSize: 11, color: 'var(--z-text-muted)',
        }}>
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={18}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%', background: '#07090f' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapClickHandler onLocationSelect={onLocationSelect} phase={phase} />

      {/* Demo location markers */}
      {DEMO_LOCATIONS.map((loc) => (
        <Marker
          key={loc.name}
          position={[loc.lat, loc.lng]}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--z-font-body)' }}>
              <strong style={{ color: 'var(--z-text-primary)' }}>{loc.name}</strong><br />
              <span style={{ color: 'var(--z-text-secondary)', fontSize: 12 }}>{loc.country}</span><br />
              <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 11, color: 'var(--z-green-400)' }}>
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Selected location marker */}
      {selectedLat !== undefined && selectedLng !== undefined && (
        <Marker position={[selectedLat, selectedLng]}>
          <Popup>
            <div style={{ fontFamily: 'var(--z-font-body)' }}>
              <strong>Selected Location</strong><br />
              <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 11 }}>
                {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7,9,15,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          zIndex: 1000,
        }}>
          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '3px solid rgba(74,222,128,0.12)',
              borderTopColor: '#4ade80', borderRadius: '50%',
              animation: 'z-spin 0.9s linear infinite',
            }} />
          </div>
          <div style={{
            fontFamily: 'var(--z-font-mono)',
            fontSize: 11,
            color: 'var(--z-green-400)',
            letterSpacing: '0.1em',
          }}>
            {phase === 'loading_data' ? 'FETCHING DATA...' : 'ANALYSING...'}
          </div>
        </div>
      )}

      {/* Click hint */}
      {phase === 'idle' && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(13,17,23,0.9)',
          border: '1px solid var(--z-border-mild)',
          borderRadius: 'var(--z-radius-pill)',
          padding: '8px 16px',
          fontSize: 12,
          color: 'var(--z-text-muted)',
          fontFamily: 'var(--z-font-mono)',
          zIndex: 1000,
        }}>
          Click anywhere to analyse · Or select a demo pin
        </div>
      )}
    </MapContainer>
  );
}
