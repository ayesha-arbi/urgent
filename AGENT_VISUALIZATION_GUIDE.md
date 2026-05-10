# 🤖 ZameendarAI: Agent Visualization Guide

This guide explains how to implement the "Agent Pipeline" visualization for the land analysis process. Since the `/api/analyze` route is a single request, we will use a **simulated timed sequence** to make the AI's "thought process" visible and interactive for the user.

## 🛠️ The Pipeline Architecture
The analysis is performed by three specialized AI agents in a linear chain. Your goal is to visualize these transitions.

| Phase | Agent | Role | Visual Description |
| :--- | :--- | :--- | :--- |
| **1** | **Data Orchestrator** | Fetches Weather, Geo, and Web Data | "Gathering environmental signatures..." |
| **2** | **Suitability Scorer** | Calculates the 0-100 scores | "Running multi-category suitability models..." |
| **3** | **Factor Analyst** | Distills the 5-6 critical drivers | "Analyzing key constraints and enablers..." |
| **4** | **Strategy Agent** | Generates actionable recommendations | "Mapping results to global sustainability goals..." |

---

## 🚀 Implementation Strategy (Frontend)

Since we are using a single API call, don't wait for the API to tell you when to switch phases. Instead, **trigger the visual states based on a timer** that approximates the AI's processing time.

### 1. State Management
Add a `currentAgentStep` state to the `analyze` phase.
```tsx
const [agentStep, setAgentStep] = useState(0); 
// 0: Idle, 1: Orchestrator, 2: Scorer, 3: Analyst, 4: Strategist
```

### 2. The Timed Sequence
When `handleLocationSelect` is called and the phase becomes `loading_ai`, start a timer sequence:

```tsx
// Suggested timing mapping (total ~12-15 seconds)
const STEPS = [
  { label: 'Data Orchestrator', duration: 3000, msg: 'Fetching environmental signatures...' },
  { label: 'Suitability Scorer', duration: 4000, msg: 'Running multi-category suitability models...' },
  { label: 'Factor Analyst', duration: 3000, msg: 'Analyzing key constraints and enablers...' },
  { label: 'Strategy Agent', duration: 3000, msg: 'Mapping results to global sustainability goals...' },
];

// In your loading logic:
setAnalyzePhase('loading_ai');
let current = 1;
const interval = setInterval(() => {
  current++;
  setAgentStep(current);
  if (current >= STEPS.length) clearInterval(interval);
}, 3000); // Average transition every 3 seconds
```

### 3. UI Component Ideas
*   **The Stepper**: Create 4 small circles. Use the `accentColor` from the `UserRole` to make the active circle glow/pulse.
*   **The Status Text**: Display the `msg` from the `STEPS` array under the spinner.
*   **The "Agent Card"**: Instead of a spinner, show a small card with an icon (e.g., 🔍 $\rightarrow$ ⚖️ $\rightarrow$ 🧬 $\rightarrow$ 🎯) that slides in as the step changes.

---

## 🎨 Styling Tips
- **Animations**: Use `transition: all 0.3s ease` for the step transitions.
- **Pulsing Effect**: Add a CSS keyframe animation to the active agent icon to show it is "thinking."
- **Colors**: Use the `CATEGORY_COLOR` constants from `lib/utils` to color-code the agents if they align with specific land uses.

**Goal**: Make the user feel the complexity of the AI pipeline, even if the API is just one big JSON response!
