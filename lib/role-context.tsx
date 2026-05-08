'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'farmer' | 'planner' | 'energy' | 'investor' | null;

interface RoleContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue>({ role: null, setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);

/* ── Per-role config consumed by ChatBot & LandingPage ── */
export const ROLE_CONFIG = {
  farmer: {
    label: 'Small Farmer / Zameendar',
    accentColor: '#4ade80',
    heroHeadline: 'Find the Perfect Land for Your Crops',
    heroSub: 'Soil fertility, irrigation potential, and climate suitability — all in one place.',
    ctaLabel: 'Analyze My Land',
    chatWelcome: "Hello, Zameendar! 🌱 I'm here to help you assess soil quality, irrigation potential, and the best crops for your land. What location would you like to analyze?",
    systemPrompt: `You are ZameendarAI, a land intelligence assistant specialized for small farmers and landowners (zameendars) in Pakistan and South Asia.
Your focus: soil fertility, crop suitability, irrigation sources, seasonal climate, yield projections.
Always give practical, field-level advice. Use simple language. When relevant, mention local crops (wheat, sugarcane, cotton, rice). Be encouraging and actionable.`,
  },
  planner: {
    label: 'Urban Planner',
    accentColor: '#60a5fa',
    heroHeadline: 'Data-Driven Decisions for Urban Development',
    heroSub: 'Zoning, infrastructure readiness, and environmental impact analysis at your fingertips.',
    ctaLabel: 'Explore Zones',
    chatWelcome: "Hello! 🏙️ I'm ZameendarAI for urban planning. I can help you assess zoning suitability, infrastructure readiness, population density, and environmental constraints. Which area are you evaluating?",
    systemPrompt: `You are ZameendarAI, a land intelligence assistant specialized for urban planners.
Your focus: zoning regulations, infrastructure capacity, population density, environmental impact assessments, land-use compatibility.
Provide structured, data-informed answers. Reference urban planning best practices. Be precise and professional.`,
  },
  energy: {
    label: 'Renewable Energy Developer',
    accentColor: '#fbbf24',
    heroHeadline: 'Identify Prime Sites for Clean Energy',
    heroSub: 'Solar irradiance, wind patterns, grid proximity — find where clean energy thrives.',
    ctaLabel: 'Find Energy Sites',
    chatWelcome: "Hello! ☀️ I'm ZameendarAI for renewable energy. I can help you evaluate solar irradiance, wind speeds, elevation profiles, and grid proximity for your project. Which region are you targeting?",
    systemPrompt: `You are ZameendarAI, a land intelligence assistant specialized for renewable energy developers.
Your focus: solar irradiance indices, wind speed and direction, land elevation, grid infrastructure proximity, land availability and acquisition.
Be technical and precise. Provide comparative analysis when possible. Reference Pakistan's NEPRA framework when relevant.`,
  },
  investor: {
    label: 'Investor / Policymaker',
    accentColor: '#a78bfa',
    heroHeadline: 'Maximize ROI with Intelligent Land Analytics',
    heroSub: 'Composite value scores, risk indices, and development potential — all in one report.',
    ctaLabel: 'View Investment Report',
    chatWelcome: "Hello! 📊 I'm ZameendarAI for investors and policymakers. I can help you evaluate land value scores, risk indices, regulatory overviews, and development potential. Which area or project are you assessing?",
    systemPrompt: `You are ZameendarAI, a land intelligence assistant specialized for investors and policymakers.
Your focus: composite land value scores, risk and hazard indices, development potential ratings, regulatory landscape, ROI projections.
Be analytical and concise. Present data comparatively. Highlight risks and opportunities clearly. Use financial and policy terminology.`,
  },
} as const;