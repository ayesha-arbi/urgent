// ============================================================
// pages/AboutPage.tsx
// Methodology, data sources, team, responsible AI notice
// ============================================================

import React from 'react';
import {
  CloudSun, Globe, Brain, Layers, AlertTriangle,
  ExternalLink, Sprout, Building2, Factory, Sun,
  Database, Cpu, Map, Wind,
} from 'lucide-react';
import { Divider, SectionLabel } from '../components/shared/ui';

interface DataSource { icon: React.ElementType; name: string; desc: string; url: string; free: boolean; }
const DATA_SOURCES: DataSource[] = [
  { icon: CloudSun,  name: 'Open-Meteo Forecast',     desc: 'Temperature, precipitation, wind speed, humidity, UV index, cloud cover', url: 'https://open-meteo.com', free: true },
  { icon: Wind,      name: 'Open-Meteo Air Quality',  desc: 'PM2.5, PM10, NO2, European AQI — no API key required', url: 'https://open-meteo.com/en/docs/air-quality-api', free: true },
  { icon: Map,       name: 'Open-Elevation API',       desc: 'Elevation in metres ASL via SRTM dataset', url: 'https://open-elevation.com', free: true },
  { icon: Globe,     name: 'Nominatim / OSM',          desc: 'Reverse geocoding for place names and country lookup', url: 'https://nominatim.openstreetmap.org', free: true },
  { icon: Database,  name: 'WorldPop (planned)',        desc: 'Population density grid — lightweight JSON lookup', url: 'https://worldpop.org', free: true },
];

interface ScoringFactor { category: string; Icon: React.ElementType; color: string; factors: string[] }
const SCORING_FACTORS: ScoringFactor[] = [
  { category: 'Agriculture', Icon: Sprout,   color: '#4ade80', factors: ['Temperature range (optimal 15–30°C)', 'Precipitation (mm/day)', 'UV index (photosynthesis proxy)', 'Population density (land competition)', 'Elevation (frost & altitude risk)'] },
  { category: 'Housing',     Icon: Building2,color: '#60a5fa', factors: ['AQI / air quality (liveability)', 'Urban proximity index', 'Elevation (flood risk proxy)', 'Population density (demand signal)', 'Precipitation (drainage pressure)'] },
  { category: 'Industry',    Icon: Factory,  color: '#fb923c', factors: ['PM2.5 / PM10 baseline', 'NO2 levels', 'Urban proximity (workforce & logistics)', 'Wind speed (natural ventilation)', 'Population density (labour access)'] },
  { category: 'Renewables',  Icon: Sun,      color: '#fbbf24', factors: ['UV index (solar irradiance proxy)', 'Cloud cover % (solar efficiency)', 'Wind speed km/h (turbine viability)', 'Population density (land availability)', 'Elevation (wind resource elevation gain)'] },
];

export function AboutPage() {
  return (
    <div style={{ padding: 28, overflowY: 'auto', height: '100%', maxWidth: 860 }}>

      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--z-font-display)', fontSize: 28, fontWeight: 700, color: 'var(--z-text-primary)', letterSpacing: '-0.03em', marginBottom: 10, lineHeight: 1.2 }}>
          About Zameendar<span style={{ color: 'var(--z-green-400)' }}>.ai</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--z-text-secondary)', lineHeight: 1.8, maxWidth: 600 }}>
          "Zameendar" (زمیندار) is an Urdu/Punjabi term for landowner or farmer — deeply rooted in South Asian land stewardship culture. Paired with .ai, it signals a modern intelligence layer for ancient land decisions.
        </p>
      </div>

      {/* Problem statement */}
      <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
        <SectionLabel>THE PROBLEM WE SOLVE</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
          {[
            { title: 'Traditional tools are expert-only', desc: 'ArcGIS, QGIS, and specialized agri-platforms require GIS expertise and costly licenses.' },
            { title: 'Farmers lack data access', desc: 'Smallholders and zamindars have no quick way to assess climate and pollution impact on their land.' },
            { title: 'Poor decisions are costly', desc: 'Climate volatility, water stress, and air quality crises make uninformed land use increasingly expensive.' },
            { title: 'One-click AI changes everything', desc: 'Zameendar.ai democratises land intelligence — no expertise needed, free APIs, instant results.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-md)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--z-text-primary)', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--z-text-muted)', lineHeight: 1.65 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring methodology */}
      <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
        <SectionLabel>SCORING METHODOLOGY</SectionLabel>
        <p style={{ fontSize: 12, color: 'var(--z-text-muted)', lineHeight: 1.7, marginBottom: 16, marginTop: 4 }}>
          Each location is scored 0–100 across four categories. An LLM (Claude/Gemini/Grok via Vercel AI SDK) dynamically weighs the environmental factors below, accounting for non-linear interactions — e.g., high UV is a positive for Renewables but neutral-to-negative for Agriculture above 40°C.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SCORING_FACTORS.map(({ category, Icon, color, factors }) => (
            <div key={category} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}20`, borderRadius: 'var(--z-radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon size={14} color={color} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--z-text-primary)' }}>{category}</span>
              </div>
              {factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--z-text-muted)', marginBottom: 4, lineHeight: 1.5 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
        <SectionLabel>DATA SOURCES</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
          {DATA_SOURCES.map(src => {
            const Icon = src.icon;
            return (
              <div key={src.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 'var(--z-radius-md)', transition: 'background var(--z-duration-fast)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--z-bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(74,222,128,0.08)', border: '1px solid var(--z-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon size={14} color="#4ade80" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--z-text-primary)' }}>{src.name}</span>
                    {src.free && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 'var(--z-radius-pill)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontFamily: 'var(--z-font-mono)', fontWeight: 700 }}>FREE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--z-text-muted)', lineHeight: 1.5 }}>{src.desc}</div>
                </div>
                <a href={src.url} target="_blank" rel="noreferrer" style={{ color: 'var(--z-text-faint)', flexShrink: 0, marginTop: 6 }}>
                  <ExternalLink size={12} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible AI */}
      <div style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 'var(--z-radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertTriangle size={16} color="#fbbf24" strokeWidth={2} />
          <SectionLabel>RESPONSIBLE AI NOTICE</SectionLabel>
        </div>
        <div style={{ fontSize: 12, color: 'var(--z-text-secondary)', lineHeight: 1.8 }}>
          Zameendar.ai is a decision-support tool, not a replacement for professional land surveys, soil testing, environmental impact assessments, or local planning regulations. AI scores are indicative and may be inaccurate for remote regions where environmental sensor data is sparse. Always consult qualified agronomists, urban planners, and environmental specialists before making significant land-use investment decisions.
        </div>
      </div>

      {/* Tech stack */}
      <div style={{ background: 'var(--z-bg-card)', border: '1px solid var(--z-border-subtle)', borderRadius: 'var(--z-radius-lg)', padding: '20px 24px', marginBottom: 8 }}>
        <SectionLabel>TECH STACK</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {['Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Leaflet.js', 'Recharts', 'Vercel AI SDK', 'Open-Meteo APIs', 'Nominatim OSM', 'Vercel Hobby'].map(t => (
            <span key={t} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 'var(--z-radius-pill)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--z-border-subtle)', color: 'var(--z-text-secondary)', fontFamily: 'var(--z-font-mono)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
