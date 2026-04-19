'use client';

import { useState, useEffect, useCallback } from 'react';
import { LandingPage } from '@/components/landing/LandingPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { WorldMap } from '@/components/map/WorldMap';
import { ResultsPanel } from '@/components/analyze/ResultsPanel';
import {
  LayoutDashboard, MapPin, Info, Sprout, Building2, Factory, Sun,
  TrendingUp, Award, Globe, Zap, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { StatCard, Badge, SectionLabel, ScoreRing } from '@/components/shared/ui';
import { scoreColor, scoreLabel, formatRelativeTime, CATEGORY_COLOR } from '@/lib/utils';
import { DEMO_LOCATIONS } from '@/lib/mockData';
import type {
  Page, AnalysisSession, SuitabilityCategory, LatLng,
  SuitabilityResult, EnvPayload, AnalyzePhase,
} from '@/types';

const CATEGORY_ICONS: Record<SuitabilityCategory, React.ElementType> = {
  Agriculture: Sprout,
  Housing: Building2,
  Industry: Factory,
  Renewables: Sun,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>('idle');
  const [selectedLocation, setSelectedLocation] = useState<{
    latLng: LatLng;
    placeName: string;
    country: string;
    region: string;
  } | null>(null);
  const [envPayload, setEnvPayload] = useState<EnvPayload | null>(null);
  const [currentResult, setCurrentResult] = useState<SuitabilityResult | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<SuitabilityCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []))
      .catch(console.error);
  }, []);

  const handleLocationSelect = useCallback(async (latLng: LatLng, name?: string) => {
    setSelectedLocation({ latLng, placeName: name || 'Loading...', country: '', region: '' });
    setAnalyzePhase('loading_data');
    setError(null);

    try {
      const geoRes = await fetch(`/api/geo?lat=${latLng.lat}&lng=${latLng.lng}`);
      const geoData = await geoRes.json();

      const [weatherRes, airQualityRes] = await Promise.all([
        fetch(`/api/weather?lat=${latLng.lat}&lng=${latLng.lng}`),
        fetch(`/api/airquality?lat=${latLng.lat}&lng=${latLng.lng}`),
      ]);

      const weather = await weatherRes.json();
      const airQuality = await airQualityRes.json();

      const location = {
        latLng,
        placeName: name || geoData.placeName || 'Selected Location',
        country: geoData.country || '',
        region: geoData.region || '',
      };

      setSelectedLocation(location);
      setEnvPayload({
        location,
        weather,
        airQuality,
        geo: {
          populationDensity: geoData.populationDensity,
          elevation: geoData.elevation,
          urbanProximity: geoData.urbanProximity,
        },
      });

      setAnalyzePhase('loading_ai');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: latLng.lat, lng: latLng.lng, locationName: name }),
      });

      const analyzeData = await analyzeRes.json();

      if (analyzeData.success) {
        setCurrentResult(analyzeData.data);
        const newSession: AnalysisSession = {
          id: `session_${Date.now()}`,
          location,
          result: analyzeData.data,
          timestamp: new Date().toISOString(),
        };
        setSessions(prev => [newSession, ...prev].slice(0, 50));
        setAnalyzePhase('success');
      } else {
        throw new Error(analyzeData.error || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to analyse location');
      setAnalyzePhase('error');
    }
  }, []);

  const handleToggleCategory = (cat: SuitabilityCategory) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const handleDemoClick = (name: string, lat: number, lng: number) => {
    handleLocationSelect({ lat, lng }, name);
  };

  const handleSessionClick = (session: AnalysisSession) => {
    setCurrentResult(session.result);
    setEnvPayload({
      location: session.location,
      weather: { temperature: 25, precipitation: 1, windSpeed: 12, humidity: 55, uvIndex: 5, cloudCover: 30 },
      airQuality: { aqi: 50, pm25: 12, pm10: 25, no2: 10 },
      geo: { populationDensity: 100, elevation: 200, urbanProximity: 50 },
    });
    setSelectedLocation(session.location);
    setAnalyzePhase('success');
    setCurrentPage('analyze');
  };

  const handleRetry = () => {
    if (selectedLocation) handleLocationSelect(selectedLocation.latLng);
  };

  const handleEnterApp = () => {
    setCurrentPage('dashboard');
  };

  const totalAnalyses = sessions.length;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.result.scores.reduce((a, b) => a + b.score, 0) / s.result.scores.length, 0) / sessions.length)
    : 0;
  const topCategory = (() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      const top = s.result.scores.reduce((a, b) => a.score > b.score ? a : b);
      counts[top.label] = (counts[top.label] || 0) + 1;
    });
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : 'Renewables';
  })();

  const categoryAvgs: Record<SuitabilityCategory, number> = { Agriculture: 0, Housing: 0, Industry: 0, Renewables: 0 };
  if (sessions.length > 0) {
    const sums: Record<SuitabilityCategory, number> = { Agriculture: 0, Housing: 0, Industry: 0, Renewables: 0 };
    sessions.forEach(s => s.result.scores.forEach(sc => { sums[sc.label] = (sums[sc.label] || 0) + sc.score; }));
    (Object.keys(sums) as SuitabilityCategory[]).forEach(k => { categoryAvgs[k] = Math.round(sums[k] / sessions.length); });
  }

  if (currentPage === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentPage={currentPage}
        recentSessions={sessions}
        onNavigate={setCurrentPage}
        onSessionClick={handleSessionClick}
      />

      <main style={{ flex: 1, overflow: 'hidden', background: 'var(--z-bg-base)' }}>
        {currentPage === 'dashboard' && (
          <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
            {/* Hero */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(45,212,191,0.04) 100%)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 'var(--z-radius-xl)',
              padding: '24px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
            }}>
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--z-text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}>
                  Point anywhere on Earth.
                </div>
                <div style={{ fontSize: 14, color: 'var(--z-text-secondary)', lineHeight: 1.5, maxWidth: 450 }}>
                  AI-powered land suitability scoring across Agriculture, Housing, Industry, and Renewables.
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('analyze')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 'var(--z-radius-lg)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  background: 'rgba(74,222,128,0.08)',
                  color: 'var(--z-green-400)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Zap size={16} />
                Start Analysing
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Analyses" value={totalAnalyses} Icon={LayoutDashboard} accent="#4ade80" sub="This session" />
              <StatCard label="Avg Score" value={`${avgScore}/100`} Icon={TrendingUp} accent="#60a5fa" sub="All categories" />
              <StatCard label="Top Category" value={topCategory} Icon={Award} accent="#fbbf24" sub="Most suitable" />
              <StatCard label="Locations" value={sessions.length} Icon={Globe} accent="#2dd4bf" sub="Unique coords" />
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
              {/* Recent Analyses */}
              <div style={{
                background: 'var(--z-bg-card)',
                border: '1px solid var(--z-border-subtle)',
                borderRadius: 'var(--z-radius-lg)',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <SectionLabel>Recent Analyses</SectionLabel>
                  <button
                    onClick={() => setCurrentPage('analyze')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: 'var(--z-green-400)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    NEW <ArrowRight size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sessions.slice(0, 6).map(session => {
                    const topScore = session.result.scores.reduce((a, b) => a.score > b.score ? a : b);
                    const CatIcon = CATEGORY_ICONS[topScore.label];
                    return (
                      <div
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px', borderRadius: 'var(--z-radius-md)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--z-bg-hover)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: CATEGORY_COLOR[topScore.label] + '12',
                          border: `1px solid ${CATEGORY_COLOR[topScore.label]}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <CatIcon size={16} color={CATEGORY_COLOR[topScore.label]} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--z-text-primary)' }}>
                              {session.location.placeName}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                              {session.location.country}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Badge label={scoreLabel(topScore.score)} color={scoreColor(topScore.score)} />
                            <span style={{ fontSize: 10, color: 'var(--z-text-muted)' }}>Best: {topScore.label}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: scoreColor(topScore.score),
                            lineHeight: 1,
                          }}>{topScore.score}</div>
                          <div style={{ fontSize: 10, color: 'var(--z-text-faint)', marginTop: 2 }}>
                            {formatRelativeTime(session.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--z-text-muted)', fontSize: 13 }}>
                      No analyses yet. Click the map to start.
                    </div>
                  )}
                </div>
              </div>

              {/* Category Averages */}
              <div style={{
                background: 'var(--z-bg-card)',
                border: '1px solid var(--z-border-subtle)',
                borderRadius: 'var(--z-radius-lg)',
                padding: '20px',
              }}>
                <SectionLabel>Category Averages</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
                  {(Object.entries(categoryAvgs) as [SuitabilityCategory, number][]).map(([cat, avg]) => {
                    const CatIcon = CATEGORY_ICONS[cat];
                    const color = CATEGORY_COLOR[cat];
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <CatIcon size={14} color={color} strokeWidth={2} />
                          <span style={{ fontSize: 13, color: 'var(--z-text-secondary)', flex: 1 }}>{cat}</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color }}>
                            {avg || '–'}
                          </span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${avg}%`,
                            background: color,
                            borderRadius: 3,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 18, padding: '12px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 'var(--z-radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--z-text-secondary)', lineHeight: 1.5 }}>
                      AI-assisted insights only. Not a substitute for professional surveys.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Locations */}
            <div style={{
              background: 'var(--z-bg-card)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 'var(--z-radius-lg)',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <SectionLabel>Explore Demo Locations</SectionLabel>
                <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                  Click to analyse instantly
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {DEMO_LOCATIONS.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => handleDemoClick(loc.name, loc.lat, loc.lng)}
                    style={{
                      background: 'var(--z-bg-raised)',
                      border: '1px solid var(--z-border-subtle)',
                      borderRadius: 'var(--z-radius-md)',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = 'var(--z-border-mild)';
                      el.style.background = 'rgba(74,222,128,0.04)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = 'var(--z-border-subtle)';
                      el.style.background = 'var(--z-bg-raised)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <MapPin size={13} color="var(--z-green-400)" strokeWidth={2} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--z-text-primary)' }}>{loc.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                      {loc.country}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--z-text-faint)', marginTop: 4 }}>
                      {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'analyze' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', height: '100%' }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <WorldMap
                onLocationSelect={handleLocationSelect}
                selectedLat={selectedLocation?.latLng.lat}
                selectedLng={selectedLocation?.latLng.lng}
                phase={analyzePhase}
              />
            </div>
            <div style={{
              borderLeft: '1px solid var(--z-border-subtle)',
              background: 'var(--z-bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {selectedLocation && (
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--z-border-subtle)',
                  flexShrink: 0,
                  background: 'var(--z-bg-raised)',
                }}>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--z-text-muted)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    Analysing Location
                  </div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: 'var(--z-text-primary)',
                    letterSpacing: '-0.02em',
                  }}>
                    {selectedLocation.placeName}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                      {selectedLocation.country}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--z-text-muted)' }}>
                      {selectedLocation.latLng.lat.toFixed(4)}°N · {selectedLocation.latLng.lng.toFixed(4)}°E
                    </span>
                  </div>
                </div>
              )}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <ResultsPanel
                  phase={analyzePhase}
                  result={currentResult}
                  envPayload={envPayload}
                  expandedCategory={expandedCategory}
                  onToggleCategory={handleToggleCategory}
                  onDemoClick={handleDemoClick}
                  error={error}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          </div>
        )}

        {currentPage === 'about' && (
          <div style={{ padding: '48px', maxWidth: 760, overflowY: 'auto', height: '100%' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 32,
                fontWeight: 800,
                color: 'var(--z-text-primary)',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>About Zameendar.ai</div>
              <div style={{ fontSize: 15, color: 'var(--z-text-secondary)', lineHeight: 1.6 }}>
                AI-powered land suitability analysis for informed decision-making.
              </div>
            </div>

            <div style={{
              background: 'var(--z-bg-card)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 'var(--z-radius-lg)',
              padding: '24px',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                What It Does
              </div>
              <p style={{ fontSize: 14, color: 'var(--z-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Zameendar.ai helps you evaluate any location on Earth for four different land uses:
                Agriculture, Housing, Industry, and Renewables. Click anywhere on the map and get
                instant AI-powered suitability scores based on real environmental data.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { name: 'Agriculture', desc: 'Farming potential based on climate, water, soil proxies', icon: Sprout, color: '#4ade80' },
                  { name: 'Housing', desc: 'Residential suitability considering livability factors', icon: Building2, color: '#60a5fa' },
                  { name: 'Industry', desc: 'Commercial viability with infrastructure proximity', icon: Factory, color: '#fb923c' },
                  { name: 'Renewables', desc: 'Solar and wind energy potential assessment', icon: Sun, color: '#fbbf24' },
                ].map(item => (
                  <div key={item.name} style={{
                    padding: '16px',
                    background: 'var(--z-bg-raised)',
                    border: '1px solid var(--z-border-subtle)',
                    borderRadius: 'var(--z-radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <item.icon size={18} color={item.color} strokeWidth={2} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--z-text-primary)' }}>{item.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--z-text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--z-bg-card)',
              border: '1px solid var(--z-border-subtle)',
              borderRadius: 'var(--z-radius-lg)',
              padding: '24px',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                Data Sources
              </div>
              <ul style={{ fontSize: 14, color: 'var(--z-text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
                <li><strong style={{ color: 'var(--z-text-primary)' }}>Open-Meteo</strong> — Real-time weather and air quality data</li>
                <li><strong style={{ color: 'var(--z-text-primary)' }}>Nominatim (OSM)</strong> — Reverse geocoding and location names</li>
                <li><strong style={{ color: 'var(--z-text-primary)' }}>Open-Elevation</strong> — Elevation data</li>
                <li><strong style={{ color: 'var(--z-text-primary)' }}>Google Gemini</strong> — AI analysis and scoring via Vercel AI SDK</li>
              </ul>
            </div>

            <div style={{
              padding: '18px',
              background: 'rgba(74,222,128,0.05)',
              border: '1px solid rgba(74,222,128,0.12)',
              borderRadius: 'var(--z-radius-lg)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--z-text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--z-green-400)' }}>Disclaimer:</strong> This tool provides AI-assisted insights for exploratory purposes only.
                It is not a substitute for professional land surveys, environmental assessments, or compliance with local regulations.
                Always consult qualified professionals before making land use decisions.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
