# Frontend Implementation Plan: Phase 3 & 4

This document outlines the implementation plan for the frontend portion of the NetSim project, focusing on the requirements defined in Phase 3 (Core Pages) and Phase 4 (The Simulator). Since the repository currently lacks the basic project structure, the plan includes the initialization of the Vite React project and all necessary frontend dependencies.

## User Review Required

> [!IMPORTANT]
> The workspace is currently empty. The plan assumes we will create a `netsim/client` directory to house the frontend logic, or just a `client` directory at the root (`c:\FSDL\client`). I will initiate a new Vite React app inside `client` directory. Is that structure acceptable?

> [!NOTE]
> For the background "Spotlight effect" natively suggested as Aceternity UI, we can build a lightweight Framer Motion replica to save setting up full Aceternity boilerplates. Let me know if you strictly want true Aceternity components imported.

## Proposed Changes

---

### Project Setup (Phase 1 overlap)

First, we will initialize the Vite React application and install all essential core libraries.

#### [NEW] `client/package.json`
- Initialize Vite + React project.
- Install dependencies:
  - Routing: `react-router-dom`
  - State Management: `zustand`
  - Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
  - API: `axios`
  - Canvas / Graph: `@xyflow/react`
  - UI / Animations: `tailwindcss`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`

#### [NEW] `client/tailwind.config.js` & `client/postcss.config.js`
- Setup TailwindCSS utility configurations.

#### [NEW] `client/src/index.css`
- Apply Tailwind directives and fundamental app-wide CSS defaults.

---

### Phase 3 - Core Pages & Routing

#### [NEW] `client/src/App.jsx`
- Main application router with `BrowserRoutes`, mapping:
  - `/` -> `LandingPage`
  - `/login` -> `LoginPage`
  - `/register` -> `RegisterPage`
  - `/dashboard` -> `PrivateRoute` wrapping `DashboardPage`
  - `/simulator` -> `PrivateRoute` wrapping `SimulatorPage`
  - `/subnet-calculator` -> `SubnetCalcPage`
  - `/about` -> `AboutPage`

#### [NEW] `client/src/components/PrivateRoute.jsx`
- Route wrapper that intercepts invalid sessions, checking `localStorage.getItem('token')` to redirect users back to `/login`.

#### [NEW] `client/src/pages/LandingPage.jsx`
- 3 sections: Hero with dynamic star-topology simulation loop, features overview using interactive uiverse.io cards, and a Call-to-action button.

#### [NEW] `client/src/pages/LoginPage.jsx` & `client/src/pages/RegisterPage.jsx`
- Auth cards with `react-hook-form` + `zod` schema definitions handling frontend data validation before delegating (or faking) `axios` calls.

#### [NEW] `client/src/pages/DashboardPage.jsx`
- Splitting the layout structurally. Sidebar (common app shell matching all authenticated sections) and a right-content grid populating saved topology mockups/cards. 

---

### Phase 4 - The Simulator (Main Feature)

#### [NEW] `client/src/store/useSimulatorStore.js`
- Zustand store centralizing `nodes`, `edges`, generic topology generation logic (`generateStar`, `generateRing`, `generateBus`), layout state helpers, IP assignment workflows, and simulated link-failures toggle.

#### [NEW] `client/src/pages/SimulatorPage.jsx`
- The core orchestration interface. Uses `@xyflow/react` within a dark dot-grid `bg-slate-900` container. Integrates the top toolbar with Topology preset buttons and the IP configuration side-drawer. 

#### [NEW] `client/src/components/simulator/Nodes.jsx`
- Defined custom nodes for React Flow: `PCNode`, `RouterNode`, and `SwitchNode`. Each contains a customized Lucide icon layout, connection handles (`Handle`), and active IP display badge.

#### [NEW] `client/src/components/simulator/SimulationEdge.jsx`
- Custom `BezierEdge` handling link-up and link-down behaviors. Uses click handlers hooked to our Zustand store to trigger simulation failure states, disabling internal CSS `stroke-dashoffset` animations on down-links.

#### [NEW] `client/src/components/simulator/PacketAnimator.jsx`
- Handles the absolute position overlays. Uses BFS pathfinding executed via Zustand variables to discover the target node chain, chaining Framer Motion `<motion.div>` animations translating coordinates via React Flow's `useNodes` and `useViewport`. 

#### [NEW] `client/src/components/simulator/IpConfigDrawer.jsx`
- Slide-out list mapped to active nodes permitting sequential ".1, .2, .3" sub-net style IP address autofill overrides.

---

## Open Questions

- We currently lack the Express Server (Phase 2 backend). Is it okay to temporarily mock the authenticate routines and local-storage logic (for user JWT simulation tokens) so you can review Phase 3 and Phase 4 working smoothly end-to-end first?

## Verification Plan

### Automated Tests
- Linting standard React syntax checking with `npm run build` or Vite checks.

### Manual Verification
- We will start the development server using `npm run dev`.
- Through the browser test, we'll verify:
  1. The Landing page spotlight feature and continuous background loop.
  2. Trying unauthorized loads of `/simulator` redirects correctly.
  3. Filling out login forms displays schema-validation inline errors correctly.
  4. Utilizing the "Star", "Ring", "Bus" configurations safely re-renders the Canvas nodes without glitching.
  5. Generating failure bounds via clicking Links highlights edges as red.
  6. Simulating a Packet hop visually traverses edge lines properly.
