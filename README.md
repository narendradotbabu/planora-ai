# Planora AI — Your Intelligent Event Planning Assistant

> *"Plan Smarter. Celebrate Better."*

🚀 **Live Deployment:** [https://narendradotbabu.github.io/planora-ai/](https://narendradotbabu.github.io/planora-ai/)  
📦 **GitHub Repository:** [https://github.com/narendradotbabu/planora-ai](https://github.com/narendradotbabu/planora-ai)

[![Build & Test](https://img.shields.io/badge/tests-30%20passed-success)](https://github.com/narendradotbabu/planora-ai/actions)
[![GitHub Pages](https://img.shields.io/badge/deployment-live%20on%20GitHub%20Pages-brightgreen)](https://narendradotbabu.github.io/planora-ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-blue)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-green)](https://nodejs.org/)

---

## 1. Project Overview & Challenge Vertical

**Planora AI** is a production-style, GenAI-augmented web application designed for comprehensive event organization. Whether orchestrating a grand wedding, a memorable birthday party, or an impactful community gathering, Planora AI translates complex logistical constraints, guest counts, and spending parameters into actionable, editable master plans.

### Challenge Vertical
- **Domain:** Smart Event Planning & Resource Optimization
- **Supported Event Classes:**
  1. **Weddings:** Multi-ceremony coordination, photography, styling, bridal logistics, and per-head catering formulas.
  2. **Birthday Parties:** Milestones, age-tailored entertainment, custom cake and decor scheduling, interactive games.
  3. **Community Events:** Fairs, festivals, civic fundraisers, volunteer delegation, safety clearances, and permit milestones.

---

## 2. Problem Statement & Target Personas

### The Problem
Event planning typically involves juggling fragmented spreadsheets, opaque vendor quotes, shifting guest headcounts, and volatile budgets. Manual planning frequently results in:
- Budget overruns from unexpected line items and absent contingency buffers.
- Missing critical vendor booking windows.
- Inflexible plans that fail when guest numbers change.
- Generic recommendations disconnected from regional traditions or accessibility constraints.

### Target Personas
1. **The Engaged Couple (DIY Wedding Planners):** Seeks structured guidance to allocate wedding budgets wisely while protecting high-priority elements like photography and gourmet dining.
2. **The Parent / Host (Birthday Organizer):** Needs quick, actionable themes, schedules, and decor recommendations that match their budget without endless research.
3. **The Community Lead / Civic Volunteer:** Requires transparent task delegation across volunteers, timeline milestones, and safety checklists for civic gatherings.

---

## 3. Key Features

| Feature | Description |
| :--- | :--- |
| **Multi-Step Wizard** | Guided 4-step wizard collecting event basics, financial bounds, stylistic preferences, and hard constraints with instant input validation. |
| **Intelligent Decision Engine** | Formulates complete event blueprints (overview, themes, budget allocations, dynamic timelines, vendor criteria, risk contingencies, and day-of run-of-show). |
| **Interactive Budget Planner** | Full ledger tracking estimated targets, vendor quotes, and actual paid expenses with category percentage charts, over-budget warnings, and priority-protected savings tips. |
| **Smart Dynamic Timeline** | Auto-calculated milestones keyed to the remaining days before the event. Features overdue detection and past-date retrospective support. |
| **Vendor & Supplier Manager** | Tracks vendor categories, quoted prices, booking stages (`To Research`, `Contacted`, `Quote Received`, `Booked`, `Paid`, `Cancelled`), advance deposits, and outstanding balances. |
| **Guest & RSVP Management** | Tracks RSVP confirmations, counts, dietary requirements, and seating arrangements without collecting sensitive personal data. |
| **Checklist & Task Delegation** | Granular task assignments, priority levels, deadlines, and volunteer role mapping. |
| **Personalized Idea Engine** | Creative inspiration across themes, decor, menus, and activities with interactive focus controls (*Affordable*, *Elegant*, *Traditional*, *Modern*, *Eco-Friendly*, *Family-Friendly*). |
| **Live Multi-Format Exports** | One-click export to printable master briefs (PDF-ready), budget CSV spreadsheets (Excel-compatible), plain-text task checklists, and clipboard summaries. |
| **Deterministic Fallback Engine** | Operates offline or without an AI API key using rule-based planning. Clearly tags output sources (`ai` vs. `rule-based`). |

---

## 4. Technical Architecture

Planora AI follows a decoupled architecture separating deterministic business arithmetic from GenAI creative modeling.

```
                      ┌───────────────────────────────────────┐
                      │          React 18 SPA (Vite)          │
                      │  • Tailwind CSS  • Recharts  • Zod    │
                      └──────────────────┬────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
         [REST API Requests]                          [Offline / Fallback]
                   │                                           │
                   ▼                                           ▼
      ┌─────────────────────────┐                 ┌─────────────────────────┐
      │  Express 4 / Node.js    │                 │ Local Browser Engine    │
      │  • Zod Schema Guard     │                 │ (Deterministic Rules)   │
      │  • Rate Limiting        │                 │ • Storage in            │
      │  • AI Provider Adapter  │                 │   localStorage          │
      └────────────┬────────────┘                 └─────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ Cloud GenAI API │ │ Rule Engine     │
│ (OpenAI/Gemini) │ │ (Fallback Core) │
└─────────────────┘ └─────────────────┘
```

---

## 5. Decision-Making Engine: The 10 Core Rules

1. **Rule 1 (Budget Constraints):** Over-budget allocations trigger real-time shortfall warnings and propose actionable cuts on non-core categories; the engine never quietly inflates the total budget.
2. **Rule 2 (Guest-Count Recalculations):** Guest count changes adjust variable unit costs (catering per-plate, invitation counts, extra meal safety margins) without scaling fixed overheads (hall rental, photography).
3. **Rule 3 (Time-Pressure Adaptation):** Compressed planning periods (<30 days or <7 days) condense the timeline into emergency execution milestones and flag unavailable vendor windows.
4. **Rule 4 (User Priority Protection):** Categories marked as high priority (e.g. Catering, Photography) are protected from savings cuts; reductions are distributed across non-priority categories.
5. **Rule 5 (Completed Task Preservation):** Completed tasks retain their status and are not re-suggested.
6. **Rule 6 (Existing Booking Anchors):** Confirmed pre-paid bookings are treated as fixed constraints in the budget and timeline.
7. **Rule 7 (Transparent Assumptions):** Missing optional details trigger reasonable defaults, clearly labeled in the plan summary.
8. **Rule 8 (Proportionate Risk Handling):** Evaluates venue type (outdoor rain risks), timeline compression, and buffer percentages to recommend tailored safeguards.
9. **Rule 9 (Objective Regional Customs):** Cultural or regional parameters are honored only when explicitly provided by the user.
10. **Rule 10 (Explainability & Grounding):** Every major recommendation highlights the underlying reasoning, estimated cost impact, and trade-offs.

---

## 6. AI Integration & Local Fallback

- **Provider-Agnostic Interface (`AIProvider`):** Abstracted through server-side adapters.
- **Strict Deterministic Arithmetic:** AI models never perform arithmetic calculations. Budgets, balances, timelines, and progress percentages are computed exclusively by verified TypeScript logic.
- **Graceful Fallback:** If `AI_API_KEY` is omitted, invalid, or rate-limited, the system seamlessly transitions to the built-in local planning engine and tags results with `Engine: Deterministic Rule Engine (Verified)`.

---

## 7. Budget Calculation Methodology

All budget computations use integer-precision math:
- **Baseline Allocations:** Event-type templates define baseline percentages across 11 core categories.
- **Priority Boosting:** Priority categories receive an intentional 5% percentage boost, with non-priority categories proportionately reduced and normalized to 100%.
- **Ledger Balancing:**
  $$\text{Remaining Balance} = \text{Total Budget} - \max(\text{Quoted Amount}, \text{Actual Paid})$$
- **Contingency Reservation:** Dedicated 5%–25% contingency reserve ensures safety against unplanned expenses.

---

## 8. Setup & Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24 LTS recommended)
- **npm:** v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/planora-ai.git
cd planora-ai

# Install root, server, and client dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

*(Optional)* Configure your AI API key in `server/.env`:
```env
PORT=3001
AI_PROVIDER=openai
AI_API_KEY=your_key_here
AI_MODEL=gpt-4
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
NODE_ENV=development
```
> **Note:** Planora AI works out-of-the-box without an AI API key using its built-in rule engine.

---

## 9. Development & Testing Commands

### Run Full Application (Client + Server Concurrently)
```bash
npm run dev
```
- **Client App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Run Individually
```bash
# Run server alone
npm run dev:server

# Run client alone
npm run dev:client
```

### Run Automated Test Suite
Planora AI includes 30 automated unit tests across frontend and backend modules:
```bash
# Run all tests (client + server)
npm test

# Run server tests only (20 tests)
npm run test:server

# Run client tests only (10 tests)
npm run test:client
```

### Production Build
```bash
npm run build
```

---

## 10. Demo Instructions & Sample Scenarios

Planora AI includes one-click demo pre-fill buttons on the **Create Event** wizard:
1. Open the application at [http://localhost:5173](http://localhost:5173).
2. Click **"Plan My Event"** or navigate to `/create`.
3. Click any of the **Quick Demo Fill** pills:
   - **💒 Royal Wedding:** 250 guests, ₹15,00,000 budget, heritage venue, custom food stations, live sangeet choreography.
   - **🎂 Kids Birthday:** 60 guests, ₹1,20,000 fixed budget, superhero theme, pizza bar, costumed entertainer.
   - **🎪 Eco Community Fest:** 400 attendees, ₹3,50,000 budget, outdoor park, zero-waste rules, volunteer task delegation.
4. Click **"Generate My Event Plan"** to view the generated workspace with budget charts, dynamic timeline, vendor directory, and run-of-show schedule.

---

## 11. Security, Privacy & Accessibility

- **Data Minimization:** No unnecessary personal info or government IDs are collected or stored.
- **Local Persistence:** Event plans are stored securely in browser `localStorage`.
- **Zero Secrets on Client:** AI API keys and provider tokens are confined to the server environment.
- **Accessibility:**
  - Semantic HTML landmarks (`<nav>`, `<main>`, `<header>`, `<footer>`, `<dialog>`).
  - ARIA attributes on modals and progress bars.
  - Visible focus rings (`focus:ring-2 focus:ring-primary-500`).
  - Reduced-motion CSS media query support.
  - Keyboard escape listeners on dialogs.

---

## 12. Known Limitations & Future Roadmap

- **Multi-Day Events:** Currently models single-day or peak celebration days; multi-day itinerary tabs are planned for v1.1.
- **Database Persistence:** Currently uses browser `localStorage` for demo portability; structured for PostgreSQL/Prisma integration.
- **Direct Vendor Integrations:** Does not fabricate vendor quotes or availability. Verified vendor marketplace APIs will be added in future releases.

---

## 13. License

Distributed under the [MIT License](./LICENSE).

&copy; 2026 Planora AI. Plan Smarter. Celebrate Better.
