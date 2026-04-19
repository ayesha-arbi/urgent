'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';

import { DEMO_LOCATIONS } from '@/lib/mockData';
import type { LatLng, AnalyzePhase } from '@/types';

interface WorldMapProps {
  onLocationSelect: (latLng: LatLng, name?: string) => void;
  selectedLat?: number;
  selectedLng?: number;
  phase: AnalyzePhase;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 20,
  lng: 0,
};

export function WorldMap({
  onLocationSelect,
  selectedLat,
  selectedLng,
  phase,
}: WorldMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const isLoading = phase === 'loading_data' || phase === 'loading_ai';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (isLoading || !e.latLng) return;

      onLocationSelect({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    },
    [isLoading, onLocationSelect]
  );

  if (!mounted) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 12,
          color: 'var(--z-text-muted)',
        }}>
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#111111' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#0d0d0d' }],
            },
          ],
        }}
      >
        {/* Demo markers */}
        {DEMO_LOCATIONS.map((loc) => (
          <Marker
            key={loc.name}
            position={{ lat: loc.lat, lng: loc.lng }}
            onClick={() => setActiveMarker(loc.name)}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE,
              scale: 6,
              fillColor: '#4ade80',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            }}
          >
            {activeMarker === loc.name && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: '4px 0' }}>
                  <strong>{loc.name}</strong><br />
                  <span style={{ color: '#888' }}>{loc.country}</span>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Selected marker */}
        {selectedLat !== undefined && selectedLng !== undefined && (
          <Marker
            position={{ lat: selectedLat, lng: selectedLng }}
            onClick={() => setActiveMarker('selected')}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4ade80',
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#ffffff',
            }}
          >
            {activeMarker === 'selected' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: '4px 0' }}>
                  <strong>Selected Location</strong><br />
                  <span style={{ color: '#888' }}>
                    {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
                  </span>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,10,10,0.8)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              background: 'var(--z-bg-raised)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 'var(--z-radius-lg)',
            }}>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid var(--z-border-subtle)',
                borderTopColor: 'var(--z-green-400)',
                borderRadius: '50%',
                animation: 'z-spin 0.8s linear infinite',
              }} />
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--z-green-400)',
              }}>
                {phase === 'loading_data' ? 'Fetching data...' : 'Analysing...'}
              </span>
            </div>
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
