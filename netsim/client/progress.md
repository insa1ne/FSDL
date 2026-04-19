# NetSim — Project Progress Log

> **Course:** Full Stack Development Laboratory  
> **Institute:** Fr. C. Rodrigues Institute of Technology, Vashi, Navi Mumbai  
> **Department:** Computer Engineering  

---

## Overview

NetSim is a browser-based, real-time network topology visualiser and simulator inspired by Cisco Packet Tracer. It lets users design Star, Ring, and Bus topologies, drag-and-drop custom devices, assign IPs, simulate packet transmission with BFS pathfinding, toggle link failures, and calculate subnets — all on the client side with no backend dependency for the simulator itself.

---

## Tech Stack

### Core Framework
| Library / Tool | Version | Why it was chosen |
|---|---|---|
| **React** | 19 | Component-based UI; declarative rendering; huge ecosystem. Standard for interactive SPAs. |
| **Vite** | 8 | Extremely fast HMR and build times; native ESM-first bundler; ideal for rapid iteration on a React project. |

### Routing
| Library | Why |
|---|---|
| **react-router-dom** v7 | Client-side routing with `<BrowserRouter>`, `<Routes>`, and `<NavLink>`. Enables `PrivateRoute` pattern to guard `/dashboard`, `/simulator` etc. behind a login check. |

### State Management
| Library | Why |
|---|---|
| **Zustand** | Minimal boilerplate global store. Manages the entire simulator state — nodes, edges, activity log, selected node, packet source/target — without Redux ceremony. The flat action pattern (`set`, `get`) keeps topology generators and business rules co-located and easy to reason about. |

### Graph / Canvas Engine
| Library | Why |
|---|---|
| **@xyflow/react** (React Flow v12) | Purpose-built for node-edge graph UIs. Handles drag-to-reposition, zoom/pan, bezier edge rendering, handle snapping, and selection out of the box. Custom `nodeTypes` and `edgeTypes` allowed us to build PC, Router, Switch nodes and the animated `SimulationEdge` on top of it. |

### Animation
| Library | Why |
|---|---|
| **framer-motion** | Declarative keyframe animation via `<motion.div>`. Used for the packet dot that travels across the canvas, the lost-packet tooltip, feature card hover effects on the landing page, and dashboard card enter animations. The keyframes API accepts arrays, making multi-hop path animation trivial. |

### Forms & Validation
| Library | Why |
|---|---|
| **react-hook-form** | Performant uncontrolled form management; minimal re-renders. Used in Login and Register pages. |
| **zod** | Schema-first validation. Paired with `react-hook-form`'s `zodResolver` to give inline field errors on email format, password length, and confirm-password matching. |

### HTTP Client
| Library | Why |
|---|---|
| **axios** | Promise-based HTTP client with interceptor support. Wired up for future backend integration (Phase 2). Currently, auth is mocked via `localStorage`. |

### Styling
| Approach | Why |
|---|---|
| **Tailwind CSS v4** | Utility-first CSS via the new `@tailwindcss/vite` plugin. Used for layout, spacing, typography, and responsive grids across all pages. |
| **Inline `style={{}}`** | Used inside React Flow custom nodes and simulator overlay components to avoid Tailwind's JIT purging dynamic class names built from variables (e.g. avatar colors, node border colors based on device type). |
| **Global CSS (`index.css`)** | Used to override React Flow v12's CSS custom property variables (`--xy-controls-button-background-color` etc.), add the `@keyframes dash` edge animation, and import the Inter font. |

### Icons
| Library | Why |
|---|---|
| **lucide-react** | Clean, consistent SVG icon set. Tree-shakeable so only imported icons are bundled. Used throughout the UI — toolbar, sidebar, node cards, dialogs. |

### Fonts
| Source | Why |
|---|---|
| **Google Fonts — Inter** | Modern, highly legible variable font. Standard for developer tooling UIs. Loaded via `@import` in `index.css`. |

---

## Phase-by-Phase Work Log

### Phase 1 — Project Initialisation
- Bootstrapped with `npx create-vite@latest` targeting the `c:\FSDL\netsim\client` directory.
- Installed all dependencies: `react-router-dom`, `zustand`, `react-hook-form`, `zod`, `axios`, `@xyflow/react`, `framer-motion`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.
- Configured `vite.config.js` with the `@tailwindcss/vite` plugin.
- Set up `index.css` with Tailwind v4 directives, Inter font, and base body styles.

---

### Phase 2 — App Shell & Routing (`App.jsx`)
- Configured `<BrowserRouter>` with routes for `/`, `/login`, `/register`, `/dashboard`, `/simulator`, `/subnet-calc`, `/about`.
- Implemented `PrivateRoute` wrapper that checks `localStorage.getItem('token')` — redirects to `/login` if not authenticated.
- Built the `Sidebar` component with `<NavLink>` active-class detection (dark indigo highlight for active route).

---

### Phase 3 — Core Pages

#### Landing Page (`LandingPage.jsx`)
- Fixed top navigation bar with blur backdrop.
- Hero section: two-column layout — left has headline, badge, CTA buttons; right renders `HeroSimulator`.
- `HeroSimulator`: a read-only React Flow canvas displaying a Star topology with flashing animated packet dots cycling between PCs, giving a live preview of the simulator without user interaction.
- Features section: three `FeatureCard` components with Framer Motion `whileHover` lift effect.

#### Auth Pages (`LoginPage.jsx`, `RegisterPage.jsx`)
- Glassmorphic card layout centered on a dark gradient background.
- `react-hook-form` + `zod` schema validation with inline error messages.
- On success, mock-stores `"mock-token"` in `localStorage` and navigates to `/dashboard`.

#### Dashboard (`DashboardPage.jsx`)
- Lists three mock saved topologies as animated cards (Framer Motion stagger).
- "New Topology" button navigates to `/simulator`.
- Delete button removes a card from local state.

---

### Phase 4 — Simulator Engine

#### Zustand Store (`useSimulatorStore.js`)
- `nodes`, `edges`: React Flow graph state.
- `onNodesChange`, `onEdgesChange`, `onConnect`: delegated to `@xyflow/react` helpers (`applyNodeChanges`, `applyEdgeChanges`, `addEdge`).
- **`addNode(type, position)`** — creates a node with auto-incremented ID, auto-assigned next available IP (scans existing IPs to find the first free `.x` suffix), writes a log entry.
- **`removeNode(nodeId)`** — deletes the node and all edges touching it.
- **`removeEdge(edgeId)`** — deletes a single edge.
- **`toggleEdgeFailure(edgeId)`** — flips `data.failed`; logs LINK UP / LINK DOWN event.
- **`generateStar / generateRing / generateBus`** — programmatically place nodes in geometric layouts and wire them.
- **`autoAssignIps(baseIp)`** — reassigns IPs sequentially from a base network.
- **`activityLog`** — append-only array (capped at 100) of `{ type, message, time }` objects. Types: `info`, `success`, `warning`, `error`.
- **`onConnect` validation** — prevents self-loops, duplicate edges; warns on PC-to-PC direct link.

#### Custom Nodes (`Nodes.jsx`)
- `PCNode`, `RouterNode`, `SwitchNode` — all backed by `GenericNode`.
- Per-type color palette (indigo/amber/teal) applied via inline styles to avoid purging.
- Four connection handles (Top, Bottom, Left, Right) on each node.
- Green/red status dot with glow effect.
- Click selects node in store (`setSelectedNode`); highlighted with a light-indigo border glow.
- `OFFLINE` overlay when `data.status === 'offline'`.

#### Custom Edge (`SimulationEdge.jsx`)
- Two `<path>` layers: grey base stroke + indigo dashed animated stroke (CSS `@keyframes dash`).
- Click on edge calls `toggleEdgeFailure` → edge turns red, base stroke only, "⚠ LINK DOWN" `EdgeLabelRenderer` label appears.
- Invisible wide `<path>` (strokeWidth 30, transparent) as hit target for easy clicking.

#### Device Palette (`DevicePalette.jsx`)
- Left sidebar (80 px wide) listing PC, Router, Switch tiles.
- HTML5 drag-and-drop: `draggable` + `onDragStart` sets the device type.
- `onDrop` on the canvas wrapper calls `screenToFlowPosition` (React Flow hook) to convert screen coordinates to flow canvas coordinates, then calls `addNode`.

#### Node Properties Panel (`NodePropertiesPanel.jsx`)
- Absolutely positioned overlay on the canvas (top-right corner, inside the canvas div).
- Shows: type, label, IP, status, node ID.
- **Edit mode**: inline inputs for hostname and IP with IP format validation.
- **Offline/Online toggle**: calls `updateNodeData({ status })` and logs the event.
- **Delete**: calls `removeNode`.

#### IP Config Drawer (`IpConfigDrawer.jsx`)
- Slide-in panel from the right edge of the canvas.
- Auto-assign: validates base IP with regex, calls `autoAssignIps`, shows success/error inline feedback.
- Per-node manual assignment: renders an input for each canvas node, wired to `updateNodeIp`.

#### Activity Log (`ActivityLog.jsx`)
- Bottom panel (160 px tall), monospace font.
- Displays last 100 log entries in reverse-chronological order (newest first).
- Color-coded by type: blue `ℹ`, green `✓`, amber `⚠`, red `✕`.
- "Clear" button resets the log array in store.

#### Packet Animator (`PacketAnimator.jsx`)
The most technically complex component. Key approach:

1. **BFS pathfinding** — builds an adjacency map from the current edge list, runs BFS from `src` to `dst`.
2. **SVG path sampling** — for each hop in the BFS path, finds the rendered `<path>` element of the corresponding edge in the DOM using `document.querySelector('.react-flow__edge[data-id="…"] path')`, then calls `getPointAtLength()` at 40 evenly-spaced intervals to sample the actual bezier curve geometry.
3. **Coordinate conversion** — sampled points are in React Flow's internal flow-coordinate space. Converts to screen pixels: `screenX = flowX × viewport.zoom + viewport.x`.
4. **Direction correction** — if an edge's `source` is the BFS-path target (i.e. traversal is backwards through the edge), the sampled points array is reversed.
5. **Failed-link detection** — if a link along the path has `data.failed === true`, animation stops at the midpoint of that hop and the "Packet Lost" tooltip appears.
6. **Framer Motion keyframes** — the full array of screen-pixel coordinates (all hops concatenated) is passed as `x[]` / `y[]` keyframe arrays to `<motion.div>`.
7. Uses `requestAnimationFrame` double-tick before building the keyframes to guarantee React Flow has already rendered/updated the edge SVG elements.

#### Simulator Page (`SimulatorPage.jsx`)
- Layout: `Sidebar` | `DevicePalette` | `ReactFlow canvas` (with `NodePropertiesPanel` overlay and `IpConfigDrawer` overlay) | `ActivityLog`.
- **Drag-drop wiring**: `onDragOver` + `onDrop` handlers on the canvas wrapper call `screenToFlowPosition` and `addNode`.
- **Delete key handler**: `keydown` listener deletes `selectedNodeId` if not typing in an input.
- **Packet Send Modal**: opens on "Ping / Send Packet" click; two `<select>` dropdowns for source and target; on confirm, starts the `PacketAnimator`.
- **Toast system**: lightweight timed notification (3.5 s) rendered as an absolutely-positioned div, typed as `info/success/warning/error`.
- **Topology presets toolbar**: Star / Ring / Bus buttons + Clear, followed by Speed picker (Slow/Normal/Fast pill toggle), Send Packet button, IP Config button, and Fit-View button.
- React Flow `<Controls>` positioned `bottom-right`; `<MiniMap>` above it, also `bottom-right`.

---

### Phase 5 — Subnet Calculator (`SubnetCalcPage.jsx`)
- Pure client-side IPv4 subnetting via bitwise string manipulation (no library).
- Inputs: IP address text field + CIDR prefix slider (`/0` – `/32`).
- Outputs: Network Address, Broadcast Address, Subnet Mask, First/Last host, Total usable hosts.
- Visual binary layout: renders all 32 bits split into four colour-coded octets; a vertical red divider marks the network/host boundary at the prefix length.
- "Split Subnet (+1 bit)" button: increments the prefix by 1, halving the subnet (mirrors VLSM design).
- All computed using `useMemo` — recalculates instantly on every slider move.

---

### Phase 6 — About Page (`AboutPage.jsx`)
- College header with Building2 icon.
- "What We Built" section with project description.
- 4-card team grid: avatar initials with per-member accent colours (inline style hex values to avoid purging).
- Mentor card with indigo border glow.
- Attribution footer quoting the course name.

---

### Phase 7 — Bug Fixes & Polish

| Issue | Root Cause | Fix Applied |
|---|---|---|
| All template literals rendered as literal strings (`PC \${i+1}`) | Files originally written via PowerShell heredoc, which interpreted `${}` as PS variable expansion | Rewrote all dynamic strings using string concatenation (`'PC ' + (i+1)`) in store; rewrote component class expressions using ternary or inline styles |
| `animate-in slide-in-from-right` class not working | Tailwind `tailwindcss-animate` plugin not installed | Replaced with inline CSS `position: absolute` transition |
| Zoom controls rendering as white/light buttons on dark canvas | React Flow v12 uses CSS custom properties; `background: … !important` can't override variables | Overrode `--xy-controls-button-background-color` and sibling variables in `index.css` |
| Zoom controls overlapping device palette (bottom-left) | Default `position` of `<Controls>` is `bottom-left` | Added `position="bottom-right"` prop; `<MiniMap>` also moved to `bottom-right` |
| Packet animation traveled in straight lines | `getPixel()` interpolated between node center coordinates only | Replaced with SVG `getPointAtLength()` DOM sampling on each edge's rendered path, converted from flow to screen coordinates via viewport transform |
| `Github` icon missing from lucide-react | Icon renamed/removed in the installed version | Replaced with `Globe` icon |
| Google Fonts `@import` CSS warning | `@import` must precede all rules; it was placed after `@import "tailwindcss"` | Moved Google Fonts `@import` to the first line of `index.css` |

---

## File Structure

```
netsim/client/
├── src/
│   ├── App.jsx                          # Router + PrivateRoute
│   ├── main.jsx                         # ReactDOM entry
│   ├── index.css                        # Tailwind + global styles + RF overrides
│   │
│   ├── store/
│   │   └── useSimulatorStore.js         # Zustand store (full simulator state)
│   │
│   ├── components/
│   │   ├── Sidebar.jsx                  # Navigation sidebar
│   │   ├── HeroSimulator.jsx            # Read-only RF canvas for landing page
│   │   └── simulator/
│   │       ├── Nodes.jsx                # PCNode, RouterNode, SwitchNode
│   │       ├── SimulationEdge.jsx       # Custom edge with failure toggle
│   │       ├── PacketAnimator.jsx       # BFS + SVG path sampling animation
│   │       ├── DevicePalette.jsx        # Drag-to-canvas device sidebar
│   │       ├── NodePropertiesPanel.jsx  # Click-node inspect/edit overlay
│   │       ├── IpConfigDrawer.jsx       # IP assignment side drawer
│   │       └── ActivityLog.jsx          # Bottom event log panel
│   │
│   └── pages/
│       ├── LandingPage.jsx
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── DashboardPage.jsx
│       ├── SimulatorPage.jsx            # Main simulator layout
│       ├── SubnetCalcPage.jsx
│       └── AboutPage.jsx
│
├── vite.config.js
├── package.json
└── progress.md                          # ← this file
```

---

## Known Limitations / Future Work

- **No persistent backend yet** — topology saves are mocked in-memory only; auth uses a dummy `localStorage` token.
- **Routing table simulation** — the BFS pathfinder treats the graph as unweighted and undirected. A realistic router simulation would implement distance-vector or link-state routing.
- **VLAN support** — not implemented; switches currently bridge all traffic.
- **IPv6** — only IPv4 is supported in the subnet calculator.
- **Packet loss % simulation** — links can only be fully up or fully down; no random loss %.
- **Save/Load topologies** — requires Phase 2 backend (Node.js + MongoDB) to be integrated via the existing `axios` instance.
