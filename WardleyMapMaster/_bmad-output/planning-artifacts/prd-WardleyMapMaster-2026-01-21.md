---
title: "Product Requirements Document (PRD) - WardleyMapMaster"
version: "1.0"
date: "2026-01-21"
author: "Bran"
status: "DRAFT - In Development"
phaseTarget: "MVP (Weeks 1-16)"
inputDocuments:
  - product-brief-WardleyMapMaster-2026-01-21.md
  - ux-design-specification.md
  - research/technical-wardleymap-research-2026-01-21.md
  - brainstorming-session-2026-01-21.md
---

# Product Requirements Document (PRD): WardleyMapMaster

**Project:** WardleyMapMaster - AI-powered Wardley Map to Architecture Translation Platform  
**Phase:** MVP (Minimum Viable Product)  
**Timeline:** 12-16 weeks  
**Target Launch:** Q2 2026

---

## Executive Summary

WardleyMapMaster is an AI-powered SaaS platform that translates strategic thinking (Wardley Maps) into actionable architecture (DDD bounded contexts, C4 diagrams, and SWOT analysis) in minutes, not hours.

**Core Value Proposition:**
- **Before:** 2-4 hours of manual work to go from strategy sketch to architecture blueprint
- **After:** 30 minutes with WardleyMapMaster's AI-powered analysis
- **Unique Differentiator:** Only platform that automatically generates DDD/C4 from Wardley Maps with transparent confidence scoring

**Success Metrics (MVP Gate):**
- ≥80% of users complete first map analysis in <10 minutes
- ≥70% of users rate analysis accuracy as "helpful" or "very helpful"
- ≥60% return within 30 days
- ≥1,000 users by end of Month 3
- ≥50 NPS score by Month 2

---

## Product Overview

### Vision Statement

*"Empower architects, founders, and teams to make better strategic decisions by translating their Wardley Maps into validated architecture in minutes, not hours."*

### Core Problem

Enterprise and startup teams spend 2-4 hours manually converting strategic maps (Wardley Maps) into architectural blueprints (DDD, C4, SWOT). This involves:
- Identifying bounded contexts from positioning
- Mapping strategic elements to architectural components
- Creating diagrams and documentation
- Validating decisions against frameworks

This work is repetitive, error-prone, and requires deep expertise in multiple frameworks.

### Core Solution

AI-powered analysis that:
1. **Understands** the Wardley Map (via user drawing + strategic context)
2. **Analyzes** strategic positioning against DDD patterns
3. **Generates** bounded contexts, C4 containers, and SWOT analysis
4. **Explains** reasoning with confidence scores (why each decision was made)
5. **Exports** as code scaffolds, diagrams, and documentation

### Target Customers

**6 Primary Personas:**

| Persona | Need | Use Case | API Preference |
|---------|------|----------|-----------------|
| **Architect (Alex)** | Speed + documentation | Design new systems 2x faster | Claude (cost-effective) |
| **Founder (Priya)** | Investor pitch readiness | Articulate product strategy | Gemini (cost-conscious) |
| **Beginner Learner (Jordan)** | Framework education | Learn DDD/C4 through examples | Claude (free tier) |
| **Educator (Sarah)** | Curriculum delivery | Teach architecture in class | Claude (volume discount) |
| **Enterprise (Michael)** | Governance + consistency | Enforce architectural patterns | Claude (enterprise contract) |
| **AI System** | Transparent reasoning | Integration + extensibility | Multi-provider support |

---

## Feature Specifications

### MVP Feature Set (Weeks 1-16)

#### Core Feature 1: Interactive SVG Canvas

**Description:** Collaborative drawing environment for Wardley Map creation and editing

**Acceptance Criteria:**
- ✅ Users can draw shapes (rectangles, circles, lines) on infinite canvas
- ✅ Shapes snap to 8px grid for alignment
- ✅ Drag-and-drop repositioning of shapes
- ✅ Text labeling for each shape (inline editing)
- ✅ Undo/Redo functionality (min 20 steps)
- ✅ SVG export preserves all data for re-opening
- ✅ Canvas renders at 60fps without lag (target: <16ms frame time)
- ✅ Supports maps with 50+ shapes without performance degradation
- ✅ Mobile responsiveness: Desktop-only in MVP (Phase 2: tablet/mobile)

**Technical Requirements:**
- React + SVG.js rendering engine
- Visx for complex chart interactions
- State management: Zustand for canvas state
- Export format: SVG + JSON metadata for re-opening

**User Flow:**
```
1. User lands on canvas (blank or empty)
2. User draws shapes (rectangles for components, lines for dependencies)
3. User labels each shape with context name
4. User can undo/redo as needed
5. Canvas auto-saves to browser local storage every 5 seconds
```

---

#### Core Feature 2: Strategic Context Input

**Description:** User provides business context that informs AI analysis

**Acceptance Criteria:**
- ✅ Textarea input for strategic context (min 100 chars, max 2000 chars)
- ✅ Placeholder text guides user: "Describe your business problem, goals, and constraints"
- ✅ Character counter visible (helps limit scope)
- ✅ Context input auto-saves to browser (recover on page reload)
- ✅ Optional: upload existing context from previous analysis
- ✅ Validation: Alert if context is too short (<50 chars suggests more detail)

**UI/UX:**
- Input positioned below canvas or in right sidebar
- Clear label: "Strategic Context"
- Example text: "We're building an e-commerce platform. Key challenges: scaling user service, managing product catalog, real-time inventory sync with warehouse."

---

#### Core Feature 3: Pattern Selection

**Description:** User selects which frameworks to apply to analysis (Climate or Doctrine for MVP)

**Acceptance Criteria:**
- ✅ Visual pattern selector (card-based UI)
- ✅ Two options visible: Climate Pattern, Doctrine Pattern
- ✅ Each card includes:
  - Pattern name + description
  - Visual icon/diagram
  - "Best for:" use case text
  - Radio button or toggle selection
- ✅ Default selection: Climate Pattern
- ✅ User can change selection before analysis (not locked)
- ✅ Help icon links to pattern explanation (in-app tooltip or external link)
- ✅ Deferred patterns show "Coming in Phase 2" badge (Triple Diamond, etc.)

**Climate Pattern Card Example:**
```
┌─────────────────────────────┐
│ 🌡️  Climate Pattern         │
│ Apply business forces       │
│ (genesis → custom → commodity) │
│                             │
│ Best for: Value chain &     │
│ strategic positioning       │
│ [○] Select                  │
└─────────────────────────────┘
```

**Doctrine Pattern Card Example:**
```
┌─────────────────────────────┐
│ 📜 Doctrine Pattern         │
│ Apply shared principles     │
│ & best practices           │
│                             │
│ Best for: Governance &      │
│ consistency                 │
│ [○] Select                  │
└─────────────────────────────┘
```

---

#### Core Feature 4: AI-Powered Analysis (The Magic Button)

**Description:** One-click analysis that generates DDD/C4 architecture from map + context

**Acceptance Criteria:**
- ✅ "Analyze" button prominently displayed (primary blue button)
- ✅ Button disabled until map has ≥3 shapes (prevents empty analysis)
- ✅ Button disabled until context has ≥50 characters
- ✅ On click: Button → "Analyzing..." state with spinner
- ✅ API call to FastAPI backend with: map data (SVG JSON), context text, selected pattern
- ✅ Backend calls Claude 3.5 Sonnet API with prompt engineered for DDD analysis
- ✅ Results stream back to frontend in real-time (server-sent events)
- ✅ Analysis completes in ≤30 seconds (90th percentile)
- ✅ On error: User-friendly error message + retry option
- ✅ Timeout: If analysis takes >60 seconds, show "Taking longer than expected" + cancel option

**Analysis Pipeline:**
1. **Phase 1 (0-5s):** Wardley Map Analysis - Identify positioning, strategic intent
2. **Phase 2 (5-15s):** DDD Analysis - Extract bounded contexts, aggregate roots
3. **Phase 3 (15-25s):** C4 Mapping - Convert to containers/components
4. **Phase 4 (25-30s):** Code Generation - Create code scaffolds + documentation

**Confidence Scoring:**
- Each output (context, container, relationship) gets confidence score (0-100%)
- Scoring based on: training data similarity, pattern match strength, reasoning clarity
- Confidence used to determine badge color:
  - 85-100%: 🟢 Green (Emerald-600) - High confidence, use immediately
  - 70-84%: 🟡 Amber (Amber-500) - Good confidence, review recommended
  - 50-69%: 🟠 Orange (Amber-100) - Medium confidence, needs human review
  - <50%: 🔴 Red (Red-600) - Low confidence, needs expert review

---

#### Core Feature 5: Progressive Results Display

**Description:** Analysis results stream in real-time as ChatGPT-style progressive text

**Acceptance Criteria:**
- ✅ Results appear incrementally (not all at once)
- ✅ Each bounded context/container appears with:
  - Name (streamed character-by-character)
  - Confidence badge (appears after name)
  - Reasoning explanation (appears below, indented, slightly dimmed)
  - Quick actions: View Details, Edit, Mark Helpful/Unhelpful
- ✅ Vertical scrolling for long analyses
- ✅ Final summary: "Analysis complete. Generated X contexts across Y containers."
- ✅ Time-saved message: "You saved ~2 hours vs. manual analysis 🎉"
- ✅ Results persist until user starts new analysis or closes browser

**Results Card Example:**
```
┌─────────────────────────────────────────┐
│ 📦 User Service                   85% ✓  │
│ Reasoning: "Wardley map shows 'user    │
│ management' at top. That's a bounded   │
│ context. 85% similar to 'User' context │
│ patterns in training data."            │
│                                         │
│ [View Details] [Edit] [👍] [👎]        │
└─────────────────────────────────────────┘
```

---

#### Core Feature 6: Analysis Result Details

**Description:** Drill-down view for each generated bounded context/container

**Acceptance Criteria:**
- ✅ Click context name → drawer/modal with details:
  - Full name + description
  - Confidence score + reasoning
  - Suggested aggregate roots
  - Related contexts/containers
  - Code scaffold (directory structure)
  - Suggested API boundaries
- ✅ User can edit context name/description inline (no modal needed)
- ✅ Edit state persists until user explicitly saves
- ✅ Changes reflected in export (if exported after edit)
- ✅ "Revert to AI" button restores original AI-generated description

**Detail Panel Content:**
```
┌─────────────────────────────────────────┐
│ 📦 User Service                         │
│                                         │
│ Confidence: 85%                         │
│ Reasoning: [Full text]                 │
│                                         │
│ Aggregate Roots:                        │
│ - User                                  │
│ - UserProfile                           │
│ - UserPermission                        │
│                                         │
│ Related Contexts:                       │
│ - Auth Service (contains login logic)   │
│ - Notification Service (notifies user)  │
│                                         │
│ Code Structure:                         │
│ ```                                     │
│ src/services/user-service/              │
│   ├── aggregates/User.ts                │
│   ├── entities/UserProfile.ts           │
│   ├── repositories/UserRepository.ts    │
│   └── UserService.ts                    │
│ ```                                     │
│                                         │
│ [✏️ Edit] [↩️ Revert] [Close]           │
└─────────────────────────────────────────┘
```

---

#### Core Feature 7: Export & Sharing

**Description:** One-click export of analysis in multiple formats

**Acceptance Criteria:**
- ✅ "Export" button visible after analysis complete
- ✅ Export formats (all downloadable as .zip):
  - **C4 PlantUML Diagram:** Ready-to-render C4 architecture diagram
  - **DDD Bounded Context Map:** Visual representation of contexts + relationships
  - **Code Scaffold:** Directory structure + empty TypeScript files matching architecture
  - **Analysis Report:** Markdown document with all contexts, confidence scores, reasoning
  - **SVG Map + Analysis:** Original map + analysis overlay (for sharing)
- ✅ Share button generates shareable link (unique URL, valid 7 days)
- ✅ Shared link is read-only (shows original map + analysis, not editable)
- ✅ Export progress indicator (generating files...)
- ✅ Download as single ZIP or individual files

**Export Dialog:**
```
┌─────────────────────────────────────────┐
│ Export Analysis Results                 │
│                                         │
│ ✓ C4 PlantUML Diagram                   │
│ ✓ DDD Bounded Context Map               │
│ ✓ Code Scaffold (TypeScript)            │
│ ✓ Analysis Report (Markdown)            │
│ ✓ SVG Map                               │
│                                         │
│ [Download as ZIP] [Share Link]          │
│ Generating... 40%                       │
└─────────────────────────────────────────┘
```

---

#### Core Feature 8: Global Contextual Chatbot

**Description:** Always-available AI assistant for questions about the analysis or DDD/C4/SWOT

**Acceptance Criteria:**
- ✅ Floating chat button (bottom-right, "?" icon)
- ✅ Click button → chat drawer slides up
- ✅ User can ask questions about:
  - Current analysis: "Why did you create User Service as a separate context?"
  - Frameworks: "What's the difference between aggregate root and entity?"
  - Best practices: "How do I handle cross-boundary communication?"
- ✅ Chatbot has context of current analysis (can reference context names, map contents)
- ✅ Responses are streaming (progressive text, ChatGPT-style)
- ✅ Chat history persists during session (cleared on page reload)
- ✅ Suggested questions appear if chat is empty:
  - "Explain this bounded context"
  - "What's aggregate root?"
  - "How to integrate Service A and Service B?"
- ✅ Chat powered by Claude 3.5 Sonnet (same session, shared context)
- ✅ Minimize/expand chat drawer
- ✅ Clear chat history option

**Chatbot UI:**
```
┌─────────────────────────────┐
│ 🤖 WardleyMap Assistant     │
├─────────────────────────────┤
│ Hi! I'm here to help you    │
│ understand your analysis.   │
│                             │
│ Suggested questions:        │
│ • Explain User Service      │
│ • What's an aggregate root? │
│ • How do I scale this?      │
│                             │
│ Your question...            │
│ [Send]                      │
└─────────────────────────────┘
```

---

#### Core Feature 9: Multi-AI Provider Support

**Description:** Users bring their own API keys to use different AI providers

**Acceptance Criteria:**
- ✅ Settings page with AI provider management
- ✅ Supported providers (MVP):
  - **Claude (Anthropic):** Default, recommended
  - **Gemini (Google):** Cost-effective alternative
  - **Doubao (ByteDance):** Chinese market support
- ✅ User can add API key for each provider
- ✅ Keys stored securely (encrypted in browser localStorage, not sent to backend)
- ✅ User can select which provider to use for analysis
- ✅ Cost transparency: Show estimated cost per analysis ($0.10-$0.50)
- ✅ Fallback logic: If selected provider fails, suggest switching
- ✅ Rate limiting: Prevent abuse (max 100 analyses/day per user)
- ✅ API key validation before saving (test call with minimal prompt)

**Settings UI:**
```
┌─────────────────────────────────────┐
│ AI Provider Configuration            │
│                                     │
│ [✓] Claude (Recommended)            │
│     API Key: sk-...****             │
│     Estimated cost: $0.15/analysis  │
│     [Edit] [Remove]                 │
│                                     │
│ [ ] Gemini                          │
│     API Key: [Not configured]       │
│     Estimated cost: $0.08/analysis  │
│     [Setup]                         │
│                                     │
│ [ ] Doubao                          │
│     API Key: [Not configured]       │
│     Estimated cost: $0.05/analysis  │
│     [Setup]                         │
│                                     │
│ Rate limit: 42/100 analyses used    │
└─────────────────────────────────────┘
```

---

#### Core Feature 10: Analysis History & Saved Maps

**Description:** Users can save, load, and reanalyze previous work

**Acceptance Criteria:**
- ✅ History page lists all user's analyses (sorted by recency)
- ✅ Each history entry shows:
  - Map thumbnail (SVG preview)
  - Title (editable)
  - Date created
  - Pattern used (Climate/Doctrine)
  - Confidence summary (avg confidence %)
  - Quick actions: Open, Re-analyze, Share, Delete
- ✅ Users can load saved map into canvas (restores all shapes, labels, relationships)
- ✅ Users can re-analyze with different pattern
- ✅ Storage: Browser localStorage for MVP (simple, no server needed)
- ✅ Max 20 saved analyses (localStorage limit ~5MB)
- ✅ Export history: Download all analyses as ZIP
- ✅ Delete analysis: Removes from history

**History Page:**
```
┌──────────────────────────────────────────┐
│ 📚 Your Analyses                         │
│                                          │
│ [🔍 Search] [📥 Export All] [🧹 Clear]  │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 📦 E-Commerce Platform - 2026-01-21 │ │
│ │ Climate Pattern | Avg: 78% confidence│ │
│ │ [Open] [Re-analyze] [Share] [Delete]│ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 🏢 Internal Tooling - 2026-01-19    │ │
│ │ Doctrine Pattern | Avg: 85% confiden│ │
│ │ [Open] [Re-analyze] [Share] [Delete]│ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

#### Core Feature 11: Guided Onboarding

**Description:** First-time user tutorial that walks through creating and analyzing a Wardley Map

**Acceptance Criteria:**
- ✅ Triggered on first visit (no saved analyses in history)
- ✅ Interactive tutorial (4-5 steps):
  1. "Welcome to WardleyMapMaster" + value prop
  2. "Draw your first map" (guided canvas editing)
  3. "Add context" (textarea guidance)
  4. "Select a pattern" (highlights pattern selector)
  5. "Click Analyze" (shows analysis happening)
  6. "Explore results" (highlights details, export)
- ✅ Each step shows:
  - Highlighted UI element (spotlight overlay)
  - Explanation text
  - "Next" button
  - "Skip tutorial" option
- ✅ Skipping tutorial sets flag (don't show again)
- ✅ Progress indicator (Step 1/6)
- ✅ Tutorial can be restarted from Help menu

**Tutorial Dialog:**
```
┌─────────────────────────────────────────┐
│ Welcome to WardleyMapMaster!            │
│                                         │
│ Learn to go from strategy → architecture│
│ in 5 minutes.                           │
│                                         │
│ This tutorial shows you:                │
│ • Drawing Wardley Maps                  │
│ • Adding strategic context              │
│ • Generating DDD/C4 architecture        │
│ • Exporting results                     │
│                                         │
│ [Start Tutorial] [Skip] [Help]          │
└─────────────────────────────────────────┘
```

---

#### Core Feature 12: Help & Documentation

**Description:** In-app help system and links to external docs

**Acceptance Criteria:**
- ✅ Help button in header (? icon)
- ✅ Help menu includes:
  - Keyboard shortcuts (Ctrl+Z undo, Ctrl+S save, etc.)
  - Video tutorials (linked to YouTube channel)
  - Framework explainers (Wardley Maps, DDD, C4, SWOT)
  - FAQ
  - Contact support
- ✅ Context-sensitive help:
  - Hover elements for inline tooltips
  - Info icons next to complex features
- ✅ Keyboard shortcuts printed in help menu
- ✅ Link to external docs (hosted separately)

---

### Out-of-Scope for MVP (Phase 2+)

❌ **Real-time collaboration** (multiple users editing same map simultaneously)
❌ **JPEG/PNG import with OCR** (user can't upload existing maps as images)
❌ **Gameplay pattern** (advanced pattern for strategic games)
❌ **Triple Diamond pattern** (complex strategy pattern)
❌ **Code-level C4** (generating actual code implementations)
❌ **Mobile editing** (tablet/mobile users can view, not edit)
❌ **Database integration** (auto-loading from enterprise systems)
❌ **Version control** (branch/merge map versions)
❌ **Team workspaces** (multi-user projects with permissions)
❌ **Advanced analytics** (usage tracking, heatmaps)

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Canvas rendering | 60 FPS | Frame time <16ms, no jank on 50+ shapes |
| Analysis latency | <30 seconds (P90) | From "Analyze" click to complete results |
| Page load | <2 seconds (P90) | Time to interactive (first paint) |
| Export generation | <5 seconds | Generating ZIP with all formats |
| Chat response | <3 seconds (P90) | First token from Claude API |

### Scalability

- **Concurrent Users:** Support 1,000+ concurrent users without degradation
- **Storage:** ~500MB per 10,000 users (localStorage + history)
- **API Rate Limiting:** 100 analyses/user/day (prevent abuse)
- **Backend:** Auto-scale FastAPI server (load-based)

### Security & Privacy

- **Authentication:** Email/password or SSO (Phase 2)
- **API Keys:** Encrypted in browser (not sent to backend)
- **Data Encryption:** HTTPS for all traffic, AES-256 at rest
- **GDPR Compliance:** User data deletion on request, no tracking
- **Prompt Injection Protection:** Sanitize user inputs before sending to Claude API
- **Rate Limiting:** DDoS protection via Vercel CDN

### Accessibility (WCAG 2.1 AA Compliance)

- ✅ All text meets AAA contrast (7:1 minimum)
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Screen reader support (semantic HTML, ARIA labels)
- ✅ Focus indicators visible (blue outline)
- ✅ Color-blind safe (icons + color for status)
- ✅ Responsive design (mobile viewing, Phase 2 editing)
- ✅ Alt text for all images

### Browser Support

- **Desktop (MVP):**
  - Chrome/Edge 90+
  - Safari 14+
  - Firefox 88+
- **Tablet/Mobile (Phase 2):**
  - iOS Safari 14+
  - Android Chrome 90+

### Reliability

- **Uptime:** 99.5% SLA (4.5 hours downtime/month max)
- **Error Handling:** User-friendly error messages, never show stack traces
- **Recovery:** Auto-retry failed API calls (exponential backoff)
- **Monitoring:** Real-time error tracking (Sentry), performance monitoring (Datadog)

---

## Data Model & API Specifications

### Core Data Entities

#### Wardley Map

```typescript
interface WardleyMap {
  id: string;                    // Unique identifier
  userId: string;                // Owner of map
  title: string;                 // User-provided title
  description?: string;          // Optional description
  shapes: Shape[];               // Canvas shapes (rectangles, circles, lines)
  relationships: Relationship[]; // Dependencies between shapes
  svgData: string;              // SVG string for export
  jsonData: object;             // JSON representation for re-opening
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;            // Shared maps are public/read-only
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  label: string;                // Component name
  x: number;                    // Position
  y: number;
  width: number;
  height: number;
  fill: string;                 // Color (hex)
  metadata?: object;            // Custom properties
}

interface Relationship {
  id: string;
  sourceId: string;             // Shape ID
  targetId: string;             // Shape ID
  type: 'dependency' | 'composition'; // Relationship type
  label?: string;
}
```

#### Analysis Result

```typescript
interface AnalysisResult {
  id: string;
  mapId: string;
  userId: string;
  pattern: 'climate' | 'doctrine';
  strategicContext: string;
  boundedContexts: BoundedContext[];
  c4Containers: C4Container[];
  confidence: number;           // Average confidence 0-100
  reasoning: string;            // Human-readable explanation
  exportedFormats: ExportFormat[];
  createdAt: Date;
  sharingToken?: string;        // For public sharing
  shareExpiresAt?: Date;
}

interface BoundedContext {
  id: string;
  name: string;
  description: string;
  confidence: number;           // 0-100
  reasoning: string;            // Why this context
  aggregateRoots: string[];     // Suggested AR names
  relatedContexts: string[];    // References to other contexts
  status: 'ai-generated' | 'user-edited'; // Track edits
}

interface C4Container {
  id: string;
  name: string;
  description: string;
  technology?: string;          // Tech recommendation (e.g., "Node.js API")
  containedAggregates: string[];
  dependencies: string[];       // Other containers
  confidence: number;
  reasoning: string;
}

interface ExportFormat {
  type: 'c4-plantuml' | 'ddd-map' | 'code-scaffold' | 'report' | 'svg';
  url: string;                  // S3 download link
  generatedAt: Date;
}
```

### API Endpoints (MVP)

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

#### Maps
- `GET /api/maps` - List user's saved maps
- `POST /api/maps` - Create new map
- `GET /api/maps/:id` - Get map details + shapes
- `PUT /api/maps/:id` - Update map (shapes, title)
- `DELETE /api/maps/:id` - Delete map
- `GET /api/maps/:id/history` - View map edit history

#### Analysis
- `POST /api/analysis/analyze` - Trigger AI analysis
  - Request: `{ mapId, strategicContext, pattern }`
  - Response: `{ resultId, confidence, boundedContexts[], c4Containers[] }`
  - Streaming: SSE for progressive results
- `GET /api/analysis/:resultId` - Get analysis details
- `PUT /api/analysis/:resultId` - Update analysis (user edits)
- `GET /api/analysis/:resultId/export` - Generate export formats

#### Sharing
- `GET /api/share/:token` - Get public analysis (read-only)
- `POST /api/share/:resultId` - Generate sharing token
- `DELETE /api/share/:token` - Revoke public link

#### User Settings
- `GET /api/settings/provider-keys` - Get configured AI providers
- `POST /api/settings/provider-keys` - Add/update provider API key (encrypted)
- `DELETE /api/settings/provider-keys/:provider` - Remove provider

#### Admin (Phase 2)
- `GET /api/admin/metrics` - Usage metrics (MAU, analyses/day, etc.)
- `GET /api/admin/users` - User list + details
- `POST /api/admin/users/:id/suspend` - Suspend abusive user

---

## User Flows

### Flow 1: New User - First Analysis

```
1. User lands on WardleyMapMaster.com
2. System detects first visit (no history)
3. Onboarding modal appears: "Welcome! Let's create your first analysis"
4. User is guided through:
   - Drawing simple 3-shape map
   - Adding example context
   - Selecting pattern
   - Clicking Analyze
5. Analysis runs, results stream in
6. System shows: "Great work! You saved ~2 hours 🎉"
7. User clicks Export → Downloads ZIP
8. User encouraged to save map (history feature)
```

### Flow 2: Returning User - Iterative Analysis

```
1. User logs in
2. History page shows saved analyses
3. User clicks "Open" on saved analysis
4. Map reloads into canvas
5. User modifies map (add/remove shapes)
6. User changes strategic context (textarea)
7. User tries different pattern (Climate → Doctrine)
8. User clicks Analyze
9. Results update with new pattern's insights
10. User compares confidence scores
11. User exports results → Gets DDD + C4 diagrams
12. User shares link with team
```

### Flow 3: Exploring Results - Detail Drilling

```
1. Analysis complete, results showing
2. User reads first context summary
3. User clicks context name → Detail panel opens
4. User sees: Full description, confidence score, aggregate roots, related contexts
5. User clicks "View Code" → See TypeScript scaffold
6. User wants to rename context
7. User clicks Edit → Makes changes inline
8. User saves changes
9. User exports again → Export includes edited names
```

### Flow 4: Multi-AI Provider - Cost Optimization

```
1. User has analyzed 10 maps with Claude
2. Claude API hitting cost limit ($50/month)
3. User goes to Settings
4. User adds Gemini API key (cheaper alternative)
5. User selects Gemini for next analysis
6. Analysis runs with Gemini instead
7. Results are similar confidence/quality
8. User saves $0.07 per analysis with Gemini
```

---

## Success Metrics & MVP Gate

### Leading Indicators (Measure weekly)

| Metric | Target | Why It Matters |
|--------|--------|-----------------|
| Time to first analysis | ≤10 minutes for 80% users | Speed = delight |
| Onboarding completion | ≥70% complete tutorial | Product clarity |
| Pattern usage | ≥70% use both patterns | Exploring features |
| Analysis accuracy | ≥70% rate "helpful" | Core value delivered |

### Lagging Indicators (Measure monthly)

| Metric | Target | Why It Matters |
|--------|--------|-----------------|
| 30-day retention | ≥60% return | Product habit-forming |
| Maps per active user | ≥5 maps | Engagement |
| Export rate | ≥50% export results | Value extraction |
| NPS score | ≥50 | Customer satisfaction |

### MVP Success Gate

**All criteria must be ≥ target to proceed to Phase 2:**

✅ **80% of first-time users complete analysis in <10 minutes**
✅ **70% of analyses rated ≥3/5 for accuracy**
✅ **60% of users return within 30 days**
✅ **1,000+ sign-ups by end of Month 3**
✅ **NPS ≥50 at Month 2**

If any metric misses target: Debug + iterate for 2 weeks before proceeding to Phase 2.

---

## Implementation Timeline (16 weeks)

### Week 1-4: Foundation & Core Canvas

- Setup React + Tailwind + SVG.js project
- Build interactive canvas (draw, snap, undo/redo)
- Authentication (email/password)
- Save/load maps from localStorage

### Week 5-8: AI Analysis Pipeline

- FastAPI backend + Claude API integration
- Implement analysis endpoint (map → DDD analysis)
- Progressive results streaming (SSE)
- Confidence scoring logic
- Pattern selection (Climate/Doctrine)

### Week 9-12: Results & Export

- Build results display (streaming UI)
- Export pipeline (C4, DDD, code scaffold, markdown report)
- Detail panels + editing
- History management
- Share/public links

### Week 13-16: Polish & Launch

- Global chatbot integration
- Guided onboarding tutorial
- Multi-AI provider support
- Settings/preferences page
- Help documentation
- Performance optimization
- Beta testing with 100 users
- Launch to public

---

## Dependencies & Risks

### Technical Dependencies

| Component | Status | Risk |
|-----------|--------|------|
| Claude API | Available | Reliability (99.9% SLA sufficient) |
| Vercel (frontend hosting) | Available | None - industry standard |
| Railway/Render (backend) | Available | Cold starts on low traffic (acceptable) |
| Supabase (database) | Optional (MVP uses localStorage) | Phase 2 migration needed |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| AI analysis inaccuracy | Medium | High | Include manual review UX, confidence scoring transparent |
| User adoption slow | Medium | High | Strong onboarding, free tier to build habit |
| API costs higher than budgeted | Low | Medium | Implement rate limiting, cost transparency |
| Competition (Architecturizr, etc.) | Medium | Medium | Focus on AI differentiation + speed |

---

## Phase 2+ Roadmap (Not in MVP)

### Phase 2 (Months 5-8)
- Real-time collaboration (multiple users on same map)
- Mobile/tablet editing (responsive UI)
- Image import + OCR (upload existing maps)
- Doctrine pattern + Triple Diamond
- Team workspaces + permissions

### Phase 3 (Months 9-12)
- Integrations (Confluence, Slack, GitHub)
- Advanced analytics (usage heatmaps, recommendations)
- Code generation (actual TypeScript scaffolds)
- Enterprise SSO (SAML, OAuth)

### Phase 4 (Months 13+)
- Marketplace (patterns + templates)
- AI-powered recommendations (pattern suggestions)
- Custom patterns (user-defined frameworks)
- On-premise deployment

---

## Appendix: Glossary

| Term | Definition |
|------|-----------|
| **Bounded Context** | Domain-driven design concept; a clear boundary around a group of related entities |
| **Climate Pattern** | Wardley Map pattern identifying business forces (genesis → custom → commodity) |
| **Doctrine Pattern** | Wardley Map pattern for shared principles and best practices |
| **C4 Model** | Hierarchical architecture diagram (Context → Container → Component → Code) |
| **DDD** | Domain-Driven Design; approach to modeling complex software systems |
| **Aggregate Root** | Entity that manages internal consistency of an aggregate in DDD |
| **Confidence Score** | AI-generated probability that a decision is correct (0-100%) |
| **Wardley Map** | Strategic positioning diagram showing component position + visibility |

---

**PRD Status:** DRAFT - Awaiting design review and technical feasibility assessment  
**Next Step:** Architecture Document (system design for implementation)

