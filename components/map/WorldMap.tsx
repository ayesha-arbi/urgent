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
      <div style={{ width: '100%', height: '100%', background: '#07090f' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 11,
          color: 'gray',
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
            { elementType: "geometry", stylers: [{ color: "#07090f" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#07090f" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
          ],
        }}
      >
        {/* Demo markers */}
        {DEMO_LOCATIONS.map((loc) => (
          <Marker
            key={loc.name}
            position={{ lat: loc.lat, lng: loc.lng }}
            onClick={() => setActiveMarker(loc.name)}
          >
            {activeMarker === loc.name && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <strong>{loc.name}</strong><br />
                  {loc.country}<br />
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
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
          >
            {activeMarker === 'selected' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>
                  <strong>Selected Location</strong><br />
                  {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
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
            background: 'rgba(7,9,15,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: '#4ade80',
            fontSize: 12,
          }}>
            {phase === 'loading_data' ? 'FETCHING DATA...' : 'ANALYSING...'}
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
}