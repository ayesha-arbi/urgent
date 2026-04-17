// ============================================================
// pages/AnalyzePage.tsx
// Split layout: map (left) + results panel (right)
// ============================================================

import React from 'react';
import { WorldMap } from '../components/map/WorldMap';
import { ResultsPanel } from '../components/analyze/ResultsPanel';
import type { AppState } from '../types';
import type { LatLng, SuitabilityCategory } from '../types';

interface AnalyzePageProps {
  state: AppState;
  onLocationSelect: (latLng: LatLng, name?: string) => void;
  onToggleCategory: (cat: SuitabilityCategory) => void;
  onRetry: () => void;
}

export function AnalyzePage({ state, onLocationSelect, onToggleCategory, onRetry }: AnalyzePageProps) {
  const { analyzePhase, selectedLocation, envPayload, currentResult, expandedCategory, error } = state;

  const handleDemoClick = (name: string, lat: number, lng: number) => {
    onLocationSelect({ lat, lng }, name);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: '100%', overflow: 'hidden' }}>
      {/* Map */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <WorldMap
          onLocationSelect={onLocationSelect}
          selectedLat={selectedLocation?.latLng.lat}
          selectedLng={selectedLocation?.latLng.lng}
          phase={analyzePhase}
        />
      </div>

      {/* Results panel */}
      <div style={{
        borderLeft: '1px solid var(--z-border-subtle)',
        background: 'var(--z-bg-surface)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Location header */}
        {selectedLocation && (
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--z-border-subtle)',
            flexShrink: 0, background: 'var(--z-bg-raised)',
          }}>
            <div style={{ fontFamily: 'var(--z-font-mono)', fontSize: 9, color: 'var(--z-text-faint)', letterSpacing: '0.1em', marginBottom: 4 }}>
              ANALYSING LOCATION
            </div>
            <div style={{ fontFamily: 'var(--z-font-display)', fontWeight: 700, fontSize: 17, color: 'var(--z-text-primary)', letterSpacing: '-0.02em' }}>
              {selectedLocation.placeName}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
              <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 10, color: 'var(--z-text-faint)' }}>
                {selectedLocation.country}
              </span>
              <span style={{ fontFamily: 'var(--z-font-mono)', fontSize: 10, color: 'var(--z-text-faint)' }}>
                {selectedLocation.latLng.lat.toFixed(4)}°N · {selectedLocation.latLng.lng.toFixed(4)}°E
              </span>
            </div>
          </div>
        )}

        {/* Scrollable results */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ResultsPanel
            phase={analyzePhase}
            result={currentResult}
            envPayload={envPayload}
            expandedCategory={expandedCategory}
            onToggleCategory={onToggleCategory}
            onDemoClick={handleDemoClick}
            error={error}
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  );
}
