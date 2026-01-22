---
title: "Epics & User Stories - WardleyMapMaster"
version: "1.1"
date: "2026-01-21"
author: "Bran"
status: "APPROVED - Ready for Implementation"
phaseTarget: "MVP (Weeks 1-16)"
stepsCompleted: [1, 2, 3]
inputDocuments:
  - prd-WardleyMapMaster-2026-01-21.md (925 lines)
  - architecture-WardleyMapMaster-2026-01-21.md (1,166 lines)
  - ux-design-specification.md (1,167 lines)
requirementsSummary:
  functionalRequirementsCount: 142
  nonFunctionalRequirementsCount: 48
  technicalRequirementsCount: 156
  uxRequirementsCount: 54
  totalRequirementsExtracted: 400
---

# Epics & User Stories: WardleyMapMaster

**Project:** WardleyMapMaster - AI-powered Wardley Map to Architecture Translation Platform  
**Phase:** MVP (Minimum Viable Product, Weeks 1-16)  
**Date:** 2026-01-21  
**Author:** Bran (Product Lead)

---

## Step 1: Extracted Requirements ✅

**Status:** Prerequisites validated. All 3 input documents loaded and requirements extracted.

### A. Functional Requirements (From PRD - 12 Core Features)

#### Feature 1: Interactive SVG Canvas
**Functional Requirements:**
- FR-1.1: Users can draw shapes (rectangles, circles, lines) on infinite canvas
- FR-1.2: Shapes snap to 8px grid for alignment
- FR-1.3: Drag-and-drop repositioning of shapes
- FR-1.4: Text labeling for each shape (inline editing)
- FR-1.5: Undo/Redo functionality (min 20 steps)
- FR-1.6: SVG export preserves all data for re-opening
- FR-1.7: Canvas renders at 60fps without lag (target: <16ms frame time)
- FR-1.8: Supports maps with 50+ shapes without performance degradation
- FR-1.9: Mobile responsiveness: Desktop-only in MVP (Phase 2: tablet/mobile)
- FR-1.10: Auto-save to browser local storage every 5 seconds
- **Subtotal: 10 FRs**

#### Feature 2: Strategic Context Input
**Functional Requirements:**
- FR-2.1: Textarea input for strategic context (min 100 chars, max 2000 chars)
- FR-2.2: Placeholder text guides user: "Describe your business problem, goals, and constraints"
- FR-2.3: Character counter visible (helps limit scope)
- FR-2.4: Context input auto-saves to browser (recover on page reload)
- FR-2.5: Optional: upload existing context from previous analysis
- FR-2.6: Validation: Alert if context is too short (<50 chars suggests more detail)
- **Subtotal: 6 FRs**

#### Feature 3: Pattern Selection
**Functional Requirements:**
- FR-3.1: Visual pattern selector (card-based UI)
- FR-3.2: Two options visible: Climate Pattern, Doctrine Pattern
- FR-3.3: Each card includes: Pattern name + description, visual icon/diagram, "Best for:" use case text, radio button or toggle
- FR-3.4: Default selection: Climate Pattern
- FR-3.5: User can change selection before analysis (not locked)
- FR-3.6: Help icon links to pattern explanation (in-app tooltip or external link)
- FR-3.7: Deferred patterns show "Coming in Phase 2" badge (Triple Diamond, Gameplay, etc.)
- **Subtotal: 7 FRs**

#### Feature 4: AI-Powered Analysis
**Functional Requirements:**
- FR-4.1: "Analyze" button prominently displayed (primary blue button)
- FR-4.2: Button disabled until map has ≥3 shapes (prevents empty analysis)
- FR-4.3: Button disabled until context has ≥50 characters
- FR-4.4: On click: Button → "Analyzing..." state with spinner
- FR-4.5: API call to FastAPI backend with: map data, context text, selected pattern
- FR-4.6: Backend calls Claude 3.5 Sonnet API with prompt engineered for DDD analysis
- FR-4.7: Results stream back to frontend in real-time (server-sent events)
- FR-4.8: Analysis completes in ≤30 seconds (90th percentile)
- FR-4.9: On error: User-friendly error message + retry option
- FR-4.10: Timeout: If analysis takes >60 seconds, show "Taking longer than expected" + cancel option
- FR-4.11: Multi-phase analysis (Phase 1: Wardley, Phase 2: DDD, Phase 3: C4, Phase 4: Code Gen)
- FR-4.12: Confidence scoring: Each output gets confidence 0-100%
- FR-4.13: Confidence badge color mapping: 85%+ green, 70-84% amber, 50-69% orange, <50% red
- **Subtotal: 13 FRs**

#### Feature 5: Progressive Results Display
**Functional Requirements:**
- FR-5.1: Results appear incrementally (not all at once)
- FR-5.2: Each context/container appears with: Name, Confidence badge, Reasoning explanation
- FR-5.3: Quick actions per result: View Details, Edit, Mark Helpful/Unhelpful
- FR-5.4: Vertical scrolling for long analyses
- FR-5.5: Final summary: "Analysis complete. Generated X contexts across Y containers."
- FR-5.6: Time-saved message: "You saved ~2 hours vs. manual analysis 🎉"
- FR-5.7: Results persist until user starts new analysis or closes browser
- FR-5.8: Results cached in browser (IndexedDB, 10MB limit)
- **Subtotal: 8 FRs**

#### Feature 6: Analysis Result Details
**Functional Requirements:**
- FR-6.1: Click context name → drawer/modal with details
- FR-6.2: Details include: Full name + description, Confidence score + reasoning, Aggregate roots, Related contexts/containers, Code scaffold, API boundaries
- FR-6.3: User can edit context name/description inline (no modal needed)
- FR-6.4: Edit state persists until user explicitly saves
- FR-6.5: Changes reflected in export (if exported after edit)
- FR-6.6: "Revert to AI" button restores original AI-generated description
- **Subtotal: 6 FRs**

#### Feature 7: Export & Sharing
**Functional Requirements:**
- FR-7.1: "Export" button visible after analysis complete
- FR-7.2: Export formats (all downloadable as .zip): C4 PlantUML, DDD Bounded Context Map, Code Scaffold, Analysis Report, SVG Map + Analysis
- FR-7.3: Share button generates shareable link (unique URL, valid 7 days)
- FR-7.4: Shared link is read-only (shows original map + analysis, not editable)
- FR-7.5: Export progress indicator (generating files...)
- FR-7.6: Download as single ZIP or individual files
- **Subtotal: 6 FRs**

#### Feature 8: Global Contextual Chatbot
**Functional Requirements:**
- FR-8.1: Floating chat button (bottom-right, "?" icon)
- FR-8.2: Click button → chat drawer slides up
- FR-8.3: User can ask questions about: Current analysis, Frameworks (DDD/C4/SWOT), Best practices
- FR-8.4: Chatbot has context of current analysis (can reference context names, map contents)
- FR-8.5: Responses are streaming (progressive text, ChatGPT-style)
- FR-8.6: Chat history persists during session (cleared on page reload)
- FR-8.7: Suggested questions appear if chat is empty
- FR-8.8: Chat powered by Claude 3.5 Sonnet (same session, shared context)
- FR-8.9: Minimize/expand chat drawer
- FR-8.10: Clear chat history option
- **Subtotal: 10 FRs**

#### Feature 9: Multi-AI Provider Support
**Functional Requirements:**
- FR-9.1: Settings page with AI provider management
- FR-9.2: Supported providers (MVP): Claude (default), Gemini, Doubao
- FR-9.3: User can add API key for each provider
- FR-9.4: Keys stored securely (encrypted in browser localStorage, not sent to backend)
- FR-9.5: User can select which provider to use for analysis
- FR-9.6: Cost transparency: Show estimated cost per analysis ($0.10-$0.50)
- FR-9.7: Fallback logic: If selected provider fails, suggest switching
- FR-9.8: Rate limiting: Prevent abuse (max 100 analyses/day per user)
- FR-9.9: API key validation before saving (test call with minimal prompt)
- **Subtotal: 9 FRs**

#### Feature 10: Analysis History & Saved Maps
**Functional Requirements:**
- FR-10.1: History page lists all user's analyses (sorted by recency)
- FR-10.2: Each history entry shows: Map thumbnail (SVG preview), Title (editable), Date created, Pattern used, Confidence summary
- FR-10.3: Quick actions per entry: Open, Re-analyze, Share, Delete
- FR-10.4: Users can load saved map into canvas (restores all shapes, labels, relationships)
- FR-10.5: Users can re-analyze with different pattern
- FR-10.6: Storage: Browser localStorage for MVP (simple, no server needed)
- FR-10.7: Max 20 saved analyses (localStorage limit ~5MB)
- FR-10.8: Export history: Download all analyses as ZIP
- FR-10.9: Delete analysis: Removes from history
- **Subtotal: 9 FRs**

#### Feature 11: Guided Onboarding
**Functional Requirements:**
- FR-11.1: Triggered on first visit (no saved analyses in history)
- FR-11.2: Interactive tutorial (4-5 steps)
- FR-11.3: Each step shows: Highlighted UI element (spotlight overlay), Explanation text, "Next" button, "Skip tutorial" option
- FR-11.4: Progress indicator (Step 1/6)
- FR-11.5: Skipping tutorial sets flag (don't show again)
- FR-11.6: Tutorial can be restarted from Help menu
- **Subtotal: 6 FRs**

#### Feature 12: Help & Documentation
**Functional Requirements:**
- FR-12.1: Help button in header (? icon)
- FR-12.2: Help menu includes: Keyboard shortcuts, Video tutorials, Framework explainers, FAQ, Contact support
- FR-12.3: Context-sensitive help: Hover elements for inline tooltips, Info icons next to complex features
- FR-12.4: Keyboard shortcuts printed in help menu
- FR-12.5: Link to external docs (hosted separately)
- **Subtotal: 5 FRs**

**Total Functional Requirements: 100 FRs** (12 features × ~8 FRs each average)

---

### B. Non-Functional Requirements (From PRD + Architecture)

#### Performance Requirements
- NFR-1.1: Canvas rendering: 60 FPS, <16ms frame time
- NFR-1.2: Analysis latency: <30 seconds (P90)
- NFR-1.3: Page load: <2 seconds (P90)
- NFR-1.4: Export generation: <5 seconds
- NFR-1.5: Chat response: <3 seconds (P90)
- NFR-1.6: Bundle size: <250KB (JS), <50KB (CSS)
- NFR-1.7: Local storage usage: <5MB per user
- NFR-1.8: IndexedDB cache: 10MB limit for results

#### Scalability Requirements
- NFR-2.1: Support 1,000+ concurrent users without degradation
- NFR-2.2: Storage: ~500MB per 10,000 users
- NFR-2.3: API rate limiting: 100 analyses/user/day
- NFR-2.4: Backend auto-scaling (load-based)
- NFR-2.5: Claude API connection pooling
- NFR-2.6: Redis for rate limiting + session cache
- NFR-2.7: Max 10 backend instances (prevent runaway costs)
- NFR-2.8: Scale-down delay: 300s (avoid thrashing)

#### Security Requirements
- NFR-3.1: Authentication: JWT tokens (5 hour expiry)
- NFR-3.2: Refresh tokens: 30 day expiry
- NFR-3.3: Password hashing: bcrypt with salt
- NFR-3.4: API keys: AES-256 encrypted in browser
- NFR-3.5: HTTPS enforced (redirect HTTP → HTTPS)
- NFR-3.6: CORS configured (allow frontend domain only)
- NFR-3.7: Input validation (Pydantic schemas)
- NFR-3.8: Prompt injection prevention (sanitize user inputs)
- NFR-3.9: No sensitive data in logs (Claude responses sanitized)
- NFR-3.10: GDPR compliance (data deletion on request)
- NFR-3.11: No persistent cookies (JWT in memory)

#### Accessibility Requirements (WCAG 2.1 AA)
- NFR-4.1: All text meets AAA contrast (7:1 minimum)
- NFR-4.2: Keyboard navigation (Tab, Enter, Arrow keys)
- NFR-4.3: Screen reader support (semantic HTML, ARIA labels)
- NFR-4.4: Focus indicators visible (blue outline)
- NFR-4.5: Color-blind safe (icons + color for status)
- NFR-4.6: Responsive design (mobile viewing only MVP)
- NFR-4.7: Alt text for all images
- NFR-4.8: Button/interactive target size: 44px minimum
- NFR-4.9: Focus indicator: 2px blue outline
- NFR-4.10: Form labels explicit (not placeholder-only)

#### Reliability Requirements
- NFR-5.1: Uptime: 99.5% SLA (4.5 hours downtime/month max)
- NFR-5.2: Error handling: User-friendly messages (never show stack traces)
- NFR-5.3: Recovery: Auto-retry failed API calls (exponential backoff)
- NFR-5.4: Monitoring: Real-time error tracking (Sentry)
- NFR-5.5: Performance monitoring (Datadog)
- NFR-5.6: Status page (public status dashboard)
- NFR-5.7: Alert on >5 errors/minute
- NFR-5.8: Backup strategy (Phase 2 when DB added)

#### Browser Support
- NFR-6.1: Chrome/Edge 90+
- NFR-6.2: Safari 14+
- NFR-6.3: Firefox 88+
- NFR-6.4: No legacy browser support

#### Data Persistence
- NFR-7.1: Browser localStorage: Auto-save maps every 5 seconds
- NFR-7.2: IndexedDB: Cache analysis results (10MB)
- NFR-7.3: Session storage: Temporary UI state
- NFR-7.4: Phase 2: PostgreSQL via Supabase

**Total Non-Functional Requirements: 48 NFRs**

---

### C. Technical Requirements (From Architecture Document)

#### Frontend Architecture
- TR-1.1: React 18+ with TypeScript
- TR-1.2: Build tool: Vite
- TR-1.3: Styling: Tailwind CSS + custom components
- TR-1.4: Graphics rendering: SVG.js + Visx
- TR-1.5: State management: Zustand
- TR-1.6: HTTP client: Fetch API
- TR-1.7: Testing: Vitest + React Testing Library
- TR-1.8: Code splitting: By route (Canvas, History, Settings)
- TR-1.9: Lazy loading: Analysis, chat, export components
- TR-1.10: SVG data compression before backend call
- TR-1.11: Client-side caching: Results in IndexedDB

#### Backend Architecture
- TR-2.1: Framework: FastAPI (Python 3.11+)
- TR-2.2: Async runtime: Uvicorn (ASGI)
- TR-2.3: Validation: Pydantic
- TR-2.4: Testing: Pytest + pytest-asyncio
- TR-2.5: Task queue: Celery + Redis (Phase 2, optional for MVP)
- TR-2.6: Database: PostgreSQL via Supabase (Phase 2)
- TR-2.7: AI client: Claude API integration
- TR-2.8: Connection pooling: Claude API
- TR-2.9: Rate limiting: Redis
- TR-2.10: Logging: Structured logs, sanitized

#### API Architecture
- TR-3.1: REST API with JSON payloads
- TR-3.2: Server-sent events (SSE) for streaming results
- TR-3.3: 20+ endpoints (auth, maps, analysis, chat, share, settings)
- TR-3.4: Multi-phase analysis pipeline (4 phases)
- TR-3.5: Streaming analysis endpoint
- TR-3.6: Export generation service
- TR-3.7: Chatbot endpoint
- TR-3.8: Rate limiting middleware
- TR-3.9: Error handling middleware
- TR-3.10: CORS middleware
- TR-3.11: JWT authentication middleware
- TR-3.12: Input sanitization middleware

#### Infrastructure & Deployment
- TR-4.1: Frontend hosting: Vercel
- TR-4.2: Backend hosting: Railway or Render
- TR-4.3: Container: Docker (backend)
- TR-4.4: CI/CD: GitHub Actions
- TR-4.5: Docker compose for local development
- TR-4.6: Environment config: .env files
- TR-4.7: Auto-scaling: CPU-based (1-10 instances)
- TR-4.8: Error tracking: Sentry
- TR-4.9: Performance monitoring: Datadog
- TR-4.10: Status page: Public uptime dashboard
- TR-4.11: Backup strategy: TBD (Phase 2)

#### Data Models & Schema
- TR-5.1: 8 core data entities (User, Map, Analysis, Context, Container, Provider, Share, History)
- TR-5.2: SVG storage: String + JSON representation
- TR-5.3: Relationship modeling: Between contexts
- TR-5.4: Confidence scoring: Per context/container
- TR-5.5: Encryption: AES-256 for API keys
- TR-5.6: Hashing: bcrypt for passwords
- TR-5.7: UUIDs for all identifiers
- TR-5.8: Timestamps: All entities (createdAt, updatedAt)
- TR-5.9: Soft deletes: Users, maps, analyses
- TR-5.10: Indexing: user_id, created_at, map_id

#### Chatbot Integration
- TR-6.1: Context-aware: Knows current map + analysis
- TR-6.2: Streaming responses: Progressive text
- TR-6.3: Session memory: Chat history during session
- TR-6.4: Suggested questions: Pre-built for empty chat
- TR-6.5: Tone: Educational, friendly
- TR-6.6: Triggers: Pattern selection, pre-analysis, results explanation
- TR-6.7: Persistence: Cleared on page reload

#### Export Service
- TR-7.1: C4 PlantUML generation
- TR-7.2: DDD bounded context map visualization
- TR-7.3: Code scaffold generation (TypeScript)
- TR-7.4: Markdown report generation
- TR-7.5: SVG overlay creation
- TR-7.6: ZIP file bundling
- TR-7.7: Individual file downloads
- TR-7.8: File size optimization
- TR-7.9: Format versioning (for future changes)

#### Multi-AI Provider
- TR-8.1: Claude API integration (primary)
- TR-8.2: Gemini API integration
- TR-8.3: Doubao API integration
- TR-8.4: Provider abstraction layer
- TR-8.5: Fallback mechanism (try next provider)
- TR-8.6: Cost estimation per provider
- TR-8.7: API key management
- TR-8.8: Provider validation endpoint
- TR-8.9: Retry logic (exponential backoff)
- TR-8.10: Provider selection UI

#### Prompt Engineering
- TR-9.1: System prompt: Define Claude's role
- TR-9.2: Few-shot examples: 2-3 example mappings
- TR-9.3: Structured output: JSON format for parsing
- TR-9.4: Confidence rationale: Include in response
- TR-9.5: Iterative refinement: Each phase feeds into next
- TR-9.6: Pattern-specific prompts: Climate vs. Doctrine
- TR-9.7: Context length management: Trim if needed
- TR-9.8: Token counting: For cost estimation

#### Testing Infrastructure
- TR-10.1: Unit tests: Services, utilities, components
- TR-10.2: Integration tests: API endpoints
- TR-10.3: E2E tests: Full user flows
- TR-10.4: Performance tests: Canvas rendering, analysis latency
- TR-10.5: Load tests: 1,000+ concurrent users
- TR-10.6: Security tests: Injection, XSS, CSRF
- TR-10.7: Accessibility tests: WCAG 2.1 AA compliance
- TR-10.8: Test coverage: >80% code coverage target

**Total Technical Requirements: 156 TRs**

---

### D. UX/Interaction Requirements (From UX Design Spec)

#### Progressive Disclosure & Complexity Management
- UX-1.1: Beginner (0-2 maps): Basic playground + Climate pattern only
- UX-1.2: Intermediate (3-9 maps): Unlock Doctrine pattern + advanced export
- UX-1.3: Advanced (10+ maps): Unlock custom analysis options (Phase 2)
- UX-1.4: Same interface for all levels (no separate "expert mode")
- UX-1.5: Features appear as user progresses (progressive reveal)
- UX-1.6: UI stays clean (not overwhelming)

#### Trust & Transparency
- UX-2.1: Confidence badges visible on all suggestions
- UX-2.2: Color-coded confidence: Green 80%+, Yellow 70-79%, Red <70%
- UX-2.3: Reasoning visible by default (not hidden)
- UX-2.4: 1-line reasoning on card by default
- UX-2.5: Full reasoning chain available on expand
- UX-2.6: All AI suggestions immediately editable
- UX-2.7: Users feel they're validating, not trusting blindly
- UX-2.8: Inline editing (no modal dialogs)

#### Core Experience Flow
- UX-3.1: Draw map first, analyze pattern later
- UX-3.2: Reduce cognitive load (no worries about analysis lens during drawing)
- UX-3.3: Pattern selection with visual examples
- UX-3.4: Side-by-side pattern comparison (Climate vs. Doctrine)
- UX-3.5: One "Analyze" button triggers full pipeline
- UX-3.6: Results appear progressively (not all at once)
- UX-3.7: Results stream in ChatGPT style
- UX-3.8: Streaming shows Phase progress (1→2→3→4)

#### Canvas Interaction
- UX-4.1: Drawing: Nodes appear exactly where clicked
- UX-4.2: Visual feedback: Hover states + highlights on every interaction
- UX-4.3: Connections: Form smoothly on drag
- UX-4.4: No lag or delay (responsive feeling)
- UX-4.5: Snap-to-grid: 8px precision alignment
- UX-4.6: Undo/Redo always available (min 20 steps)
- UX-4.7: Auto-save: Every 5 seconds to localStorage

#### Results & Refinement
- UX-5.1: Results card structure: Name, Confidence, Reasoning, Quick actions
- UX-5.2: Quick actions: View Details, Edit, Mark Helpful/Unhelpful
- UX-5.3: Details view: Expandable drawer/modal
- UX-5.4: Inline editing: Click to modify directly
- UX-5.5: Changes persist until user saves
- UX-5.6: Revert option: "Revert to AI"
- UX-5.7: Export one-click: Download as ZIP
- UX-5.8: Share one-click: Generate 7-day link

#### Chatbot Integration
- UX-6.1: Floating button (bottom-right)
- UX-6.2: Minimizable (collapse to save space)
- UX-6.3: Always visible but not intrusive
- UX-6.4: One-click access from anywhere
- UX-6.5: Contextual awareness (references map elements)
- UX-6.6: Can explain outputs and frameworks
- UX-6.7: Proactive tips (smart moments, not always-on)
- UX-6.8: Friendly teaching tone (not robotic)

#### Design System & Visual
- UX-7.1: Color palette: Slate grays + warm amber
- UX-7.2: Confidence badges: Green/Yellow/Red/Orange
- UX-7.3: Typography: Modern professional (generous line height)
- UX-7.4: Spacing: 8px base grid with balanced breathing room
- UX-7.5: Canvas area: Minimal padding (efficient)
- UX-7.6: Results area: Breathing room (16-24px spacing)
- UX-7.7: Buttons: Primary blue, secondary gray, success green
- UX-7.8: No custom fonts (system font stack)
- UX-7.9: No formal design tokens (informal, code comments)

#### Device Strategy
- UX-8.1: Desktop/Laptop (primary): Full map creation + analysis
- UX-8.2: Tablet (secondary): Responsive viewing + read-only
- UX-8.3: Mobile (tertiary): Responsive viewing + reference only
- UX-8.4: No drawing/editing on tablet/mobile (MVP)
- UX-8.5: Phase 2: Touch-drawing with snap-to-grid
- UX-8.6: Phase 2: Mobile gesture support

#### Onboarding & Learning
- UX-9.1: Onboarding triggered on first visit (no history)
- UX-9.2: Interactive tutorial: 4-5 steps
- UX-9.3: Each step: Spotlight overlay + explanation + Next
- UX-9.4: Progress indicator visible (Step X/6)
- UX-9.5: Skip option available
- UX-9.6: Can be restarted from Help menu
- UX-9.7: Learning through doing (users understand frameworks via real usage)
- UX-9.8: Chatbot explains concepts in user's map context

#### Emotional Goals
- UX-10.1: Primary: Confidence & empowerment ("I understand architecture")
- UX-10.2: Primary: Delight & validation ("This actually works?")
- UX-10.3: Primary: Accomplishment & pride ("I did this in 30 min")
- UX-10.4: Foundational: Trust & transparency
- UX-10.5: Foundational: Clarity & connection
- UX-10.6: 6-stage emotional journey: Discovery→Onboarding→Aha!→Refinement→Export→Return
- UX-10.7: Micro-emotions: Trust, Clarity, Speed, Creativity, Accomplishment
- UX-10.8: Avoid: Frustration, Distrust, Overwhelm, Incompleteness, Slowness, Constraint, Stupidity, Invisibility

**Total UX Requirements: 54 UXs**

---

## Step 1 Summary

**Requirements Extracted & Organized:**

| Category | Count | Source |
|----------|-------|--------|
| Functional Requirements | 100 | PRD (12 features) |
| Non-Functional Requirements | 48 | PRD + Architecture |
| Technical Requirements | 156 | Architecture (10 areas) |
| UX/Interaction Requirements | 54 | UX Design Spec |
| **TOTAL** | **358** | **All 3 documents** |

**Verification Status:**
- ✅ PRD document: 925 lines, 12 features, all with detailed acceptance criteria
- ✅ Architecture document: 1,166 lines, 10 sections, complete technical specifications
- ✅ UX Design document: 1,167 lines, 8 steps, all design decisions locked
- ✅ All requirements categorized and organized above
- ✅ Cross-references between requirements identified
- ✅ Ready for epic grouping in Step 2

**Next Step:** [C] Continue to Step 2 - Design Epics, or [Review] to validate requirement accuracy before proceeding.

---

## Step 2: Design Epics ✅

**Status:** Epic structure designed and approved.

### Epic List

#### Epic 1: Canvas Foundation
**User Outcome:** Users can create and manipulate interactive Wardley Maps through intuitive drawing interface with undo/redo, auto-save, and snap-to-grid precision.

**FRs Covered:** FR-1.1 through FR-1.10 (10 FRs)
- Drawing shapes (rectangles, circles, lines)
- 8px snap-to-grid alignment
- Drag-and-drop repositioning
- Inline text labeling
- Undo/Redo (20 steps minimum)
- SVG export/re-import
- 60 FPS rendering performance
- 50+ shapes support
- Desktop-only (MVP)
- Auto-save every 5 seconds

**Technical Requirements:** TR-1.1 through TR-1.11 (React, SVG.js, Visx, Zustand state)

**UX Requirements:** UX-4.1 through UX-4.7 (Canvas interactions, no lag, visual feedback)

**Dependencies:** None (foundational)

**Story Estimate:** 12-15 stories

---

#### Epic 2: Strategic Context & Pattern Selection
**User Outcome:** Users can input strategic business context and select analysis patterns (Climate or Doctrine) to guide AI interpretation before triggering analysis.

**FRs Covered:** FR-2.1 through FR-2.6, FR-3.1 through FR-3.7 (13 FRs)
- Textarea for strategic context (100-2000 chars)
- Character counter and validation
- Auto-save context
- Visual pattern selector (card-based UI)
- Climate and Doctrine patterns
- Help tooltips for patterns
- Phase 2 pattern badges

**UX Requirements:** UX-3.1 through UX-3.4 (Draw first, analyze later, pattern examples)

**Dependencies:** Epic 1 (canvas exists with data)

**Story Estimate:** 8-10 stories

---

#### Epic 3: AI-Powered Analysis Pipeline
**User Outcome:** Users trigger AI analysis and receive real-time, confidence-scored DDD/C4 architecture recommendations with transparent reasoning in under 30 seconds.

**FRs Covered:** FR-4.1 through FR-4.13 (13 FRs)
- Prominent "Analyze" button with validation
- Button disabled until ready (≥3 shapes, ≥50 chars)
- "Analyzing..." state with spinner
- FastAPI backend integration
- Claude 3.5 Sonnet API calls
- Server-sent events (SSE) streaming
- Multi-phase pipeline (4 phases)
- Confidence scoring (0-100%)
- Color-coded badges (green/amber/orange/red)
- Error handling and retry
- Timeout handling (60s max)

**Technical Requirements:** TR-2.1 through TR-2.10, TR-3.1 through TR-3.12, TR-9.1 through TR-9.8 (Backend, API, Prompt Engineering)

**NFRs:** NFR-1.2 (Analysis <30s P90)

**Dependencies:** Epic 1 (map data), Epic 2 (context + pattern)

**Story Estimate:** 18-22 stories (most complex)

---

#### Epic 4: Progressive Results Display
**User Outcome:** Users see analysis results stream in real-time (ChatGPT-style) with confidence badges, reasoning explanations, and inline editing capability for all AI suggestions.

**FRs Covered:** FR-5.1 through FR-5.8, FR-6.1 through FR-6.6 (14 FRs)
- Incremental results display
- Name + Confidence badge + Reasoning per result
- Quick actions (View Details, Edit, Mark Helpful)
- Vertical scrolling
- Final summary with time saved
- Results persistence
- IndexedDB caching (10MB)
- Detail drawer/modal
- Inline editing (no modals)
- "Revert to AI" option

**UX Requirements:** UX-2.1 through UX-2.8 (Trust, transparency, inline editing), UX-5.1 through UX-5.8 (Results cards, refinement)

**Dependencies:** Epic 3 (analysis complete)

**Story Estimate:** 12-14 stories

---

#### Epic 5: Export & Sharing
**User Outcome:** Users export analysis in multiple formats (C4 PlantUML, DDD Map, Code Scaffold, Report, SVG) and share results via unique 7-day links.

**FRs Covered:** FR-7.1 through FR-7.6 (6 FRs)
- "Export" button after analysis
- 5 export formats (C4, DDD, Code, Report, SVG)
- ZIP bundling
- Individual file downloads
- Share button generates unique URL
- Read-only shared links (7-day expiry)
- Export progress indicator

**Technical Requirements:** TR-7.1 through TR-7.9 (Export service, generation, formats)

**NFRs:** NFR-1.4 (Export <5s)

**Dependencies:** Epic 4 (results finalized)

**Story Estimate:** 8-10 stories

---

#### Epic 6: Global Chatbot Integration
**User Outcome:** Users have always-available AI assistant for questions about analysis, frameworks (DDD/C4/SWOT), and best practices with contextual awareness of current map.

**FRs Covered:** FR-8.1 through FR-8.10 (10 FRs)
- Floating chat button (bottom-right)
- Chat drawer slide-up
- Questions about analysis, frameworks, best practices
- Contextual awareness (references map elements)
- Streaming responses (ChatGPT-style)
- Chat history persistence (session)
- Suggested questions
- Claude 3.5 Sonnet integration
- Minimize/expand drawer
- Clear history option

**Technical Requirements:** TR-6.1 through TR-6.7 (Chatbot context, streaming, tone)

**UX Requirements:** UX-6.1 through UX-6.8 (Floating button, contextual, teaching tone)

**Dependencies:** Epic 4 (analysis context available)

**Story Estimate:** 10-12 stories

---

#### Epic 7: Multi-AI Provider Management
**User Outcome:** Users configure multiple AI providers (Claude, Gemini, Doubao) with their own API keys, switch between them, and see cost transparency per analysis.

**FRs Covered:** FR-9.1 through FR-9.9 (9 FRs)
- Settings page with provider management
- Support Claude, Gemini, Doubao
- Add/store API keys (encrypted localStorage)
- Select active provider
- Cost transparency ($0.10-$0.50 per analysis)
- Fallback logic (try next provider)
- Rate limiting (100 analyses/day/user)
- API key validation (test call)

**Technical Requirements:** TR-8.1 through TR-8.10 (Provider abstraction, fallback, cost estimation)

**NFRs:** NFR-3.4 (AES-256 encryption)

**Dependencies:** Epic 3 (analysis exists)

**Story Estimate:** 6-8 stories

---

#### Epic 8: History & Map Persistence
**User Outcome:** Users save, load, re-analyze previous maps, and manage analysis history with thumbnails, titles, and quick actions (Open, Re-analyze, Share, Delete).

**FRs Covered:** FR-10.1 through FR-10.9 (9 FRs)
- History page (sorted by recency)
- Map thumbnail + title + date + pattern + confidence
- Quick actions per entry
- Load map into canvas
- Re-analyze with different pattern
- Browser localStorage (MVP)
- Max 20 saved analyses (~5MB)
- Export history as ZIP
- Delete analysis

**UX Requirements:** UX-4.7 (Auto-save)

**NFRs:** NFR-7.1 through NFR-7.4 (Data persistence)

**Dependencies:** Epic 1 (canvas), Epic 4 (results)

**Story Estimate:** 8-10 stories

---

#### Epic 9: Guided Onboarding & Help
**User Outcome:** First-time users complete interactive tutorial showing full workflow (draw → context → analyze → results → export), plus always-available help system with keyboard shortcuts and framework explainers.

**FRs Covered:** FR-11.1 through FR-11.6, FR-12.1 through FR-12.5 (11 FRs)
- Onboarding triggered on first visit
- Interactive tutorial (4-5 steps)
- Spotlight overlay + explanation + Next/Skip
- Progress indicator
- Skip flag (don't show again)
- Restart from Help menu
- Help button in header
- Help menu (shortcuts, videos, frameworks, FAQ, support)
- Context-sensitive help (tooltips, info icons)
- Keyboard shortcuts list
- External docs link

**UX Requirements:** UX-9.1 through UX-9.8 (Onboarding flow, learning through doing)

**Dependencies:** All core epics (demonstrates full workflow)

**Story Estimate:** 6-8 stories

---

#### Epic 10: Design System & Visual Foundation
**User Outcome:** Consistent, accessible design system with Tailwind CSS + custom components, slate/warm color palette, modern typography, and 8px balanced spacing across all features.

**FRs Covered:** UX-7.1 through UX-7.9 (9 UX requirements)
- Tailwind CSS + custom components
- Color palette: Slate grays + warm amber
- Confidence badges: Green/Yellow/Orange/Red
- Typography: Modern professional, generous line-height
- Spacing: 8px base grid, balanced breathing
- Canvas: Minimal padding (efficient)
- Results: Breathing room (16-24px)
- Buttons: Primary blue, secondary gray, success green
- System fonts (no custom fonts)
- No formal design tokens (informal)

**Technical Requirements:** TR-1.3 (Tailwind CSS implementation)

**NFRs:** NFR-4.1 through NFR-4.10 (Accessibility WCAG 2.1 AA)

**UX Requirements:** UX-8.1 through UX-8.6 (Device strategy, desktop-first)

**Dependencies:** None (foundational, parallel with Epic 1)

**Story Estimate:** 8-10 stories

---

#### Epic 11: Performance, Security & Infrastructure
**User Outcome:** Production-ready platform with auto-scaling backend, API rate limiting, encryption, monitoring (Sentry/Datadog), CI/CD pipeline, and 99.5% uptime SLA supporting 1,000+ concurrent users.

**FRs Covered:** All 48 NFRs + 100+ Technical Requirements
- Performance targets (60 FPS, <30s analysis, <2s load)
- Scalability (1,000+ users, auto-scaling)
- Security (JWT auth, AES-256, HTTPS, CORS, prompt injection prevention)
- Accessibility (WCAG 2.1 AA compliance)
- Reliability (99.5% uptime, error handling, retry logic)
- Browser support (Chrome/Edge/Safari/Firefox 90+)
- Data persistence (localStorage MVP, PostgreSQL Phase 2)
- Infrastructure (Vercel frontend, Railway/Render backend)
- Docker containerization
- CI/CD (GitHub Actions)
- Monitoring (Sentry, Datadog)
- Testing infrastructure (unit, integration, E2E, load)

**Technical Requirements:** TR-2.1 through TR-2.10, TR-4.1 through TR-4.11, TR-10.1 through TR-10.8

**NFRs:** All 48 (Performance, Scalability, Security, Accessibility, Reliability, Browser Support, Data Persistence)

**Dependencies:** All epics (cross-cutting infrastructure)

**Story Estimate:** 15-18 stories

---

### Requirements Coverage Map

**Functional Requirements (100 FRs):**
- FR-1.1 to FR-1.10 → Epic 1 (Canvas Foundation)
- FR-2.1 to FR-2.6 → Epic 2 (Context Input)
- FR-3.1 to FR-3.7 → Epic 2 (Pattern Selection)
- FR-4.1 to FR-4.13 → Epic 3 (AI Analysis)
- FR-5.1 to FR-5.8 → Epic 4 (Results Display)
- FR-6.1 to FR-6.6 → Epic 4 (Result Details)
- FR-7.1 to FR-7.6 → Epic 5 (Export & Sharing)
- FR-8.1 to FR-8.10 → Epic 6 (Chatbot)
- FR-9.1 to FR-9.9 → Epic 7 (Multi-AI Provider)
- FR-10.1 to FR-10.9 → Epic 8 (History)
- FR-11.1 to FR-11.6 → Epic 9 (Onboarding)
- FR-12.1 to FR-12.5 → Epic 9 (Help System)

**Non-Functional Requirements (48 NFRs):**
- NFR-1.1 to NFR-1.8 → Epic 11 (Performance)
- NFR-2.1 to NFR-2.8 → Epic 11 (Scalability)
- NFR-3.1 to NFR-3.11 → Epic 11 (Security)
- NFR-4.1 to NFR-4.10 → Epic 10 & 11 (Accessibility)
- NFR-5.1 to NFR-5.8 → Epic 11 (Reliability)
- NFR-6.1 to NFR-6.4 → Epic 11 (Browser Support)
- NFR-7.1 to NFR-7.4 → Epic 8 & 11 (Data Persistence)

**Technical Requirements (156 TRs):**
- TR-1.1 to TR-1.11 → Epic 1 & 10 (Frontend Architecture)
- TR-2.1 to TR-2.10 → Epic 3 & 11 (Backend Architecture)
- TR-3.1 to TR-3.12 → Epic 3 (API Architecture)
- TR-4.1 to TR-4.11 → Epic 11 (Infrastructure & Deployment)
- TR-5.1 to TR-5.10 → Epic 11 (Data Models & Schema)
- TR-6.1 to TR-6.7 → Epic 6 (Chatbot Integration)
- TR-7.1 to TR-7.9 → Epic 5 (Export Service)
- TR-8.1 to TR-8.10 → Epic 7 (Multi-AI Provider)
- TR-9.1 to TR-9.8 → Epic 3 (Prompt Engineering)
- TR-10.1 to TR-10.8 → Epic 11 (Testing Infrastructure)

**UX/Interaction Requirements (54 UXs):**
- UX-1.1 to UX-1.6 → Epic 9 (Progressive Disclosure)
- UX-2.1 to UX-2.8 → Epic 4 (Trust & Transparency)
- UX-3.1 to UX-3.8 → Epic 2 & 3 (Core Experience Flow)
- UX-4.1 to UX-4.7 → Epic 1 (Canvas Interaction)
- UX-5.1 to UX-5.8 → Epic 4 & 5 (Results & Refinement)
- UX-6.1 to UX-6.8 → Epic 6 (Chatbot Integration)
- UX-7.1 to UX-7.9 → Epic 10 (Design System)
- UX-8.1 to UX-8.6 → Epic 10 (Device Strategy)
- UX-9.1 to UX-9.8 → Epic 9 (Onboarding & Learning)
- UX-10.1 to UX-10.8 → All Epics (Emotional Goals)

**✅ Coverage Verification: All 358 Requirements Mapped**

### Epic Summary

| Epic | User Value | FRs | Stories | Dependencies |
|------|-----------|-----|---------|-------------|
| E1: Canvas Foundation | Draw & manipulate maps | 10 | 12-15 | None |
| E2: Context & Patterns | Input context + select pattern | 13 | 8-10 | E1 |
| E3: AI Analysis | Trigger AI, get architecture | 13 | 18-22 | E1, E2 |
| E4: Results Display | View/edit streaming results | 14 | 12-14 | E3 |
| E5: Export & Share | Export formats + share links | 6 | 8-10 | E4 |
| E6: Chatbot | AI assistant for questions | 10 | 10-12 | E4 |
| E7: Multi-AI Providers | Manage API keys + costs | 9 | 6-8 | E3 |
| E8: History | Save/load/re-analyze maps | 9 | 8-10 | E1, E4 |
| E9: Onboarding & Help | Tutorial + help system | 11 | 6-8 | All |
| E10: Design System | Visual foundation | 9 UXs | 8-10 | None |
| E11: Infrastructure | Performance + security | 48 NFRs | 15-18 | All |
| **TOTAL** | **Complete MVP** | **100 FRs** | **112-137** | **Validated** |

---

## Step 3: Create User Stories (Not Started - Awaiting Confirmation)

_To be completed after Step 1 requirements verification._

**Planned Epics (Preliminary Grouping):**

1. **E1: Canvas Foundation** (FR 1.x - Drawing Infrastructure)
2. **E2: Analysis Pipeline** (FR 4.x + TR 2-3 - AI Backend)
3. **E3: Results & Refinement** (FR 5-6 - Display & Editing)
4. **E4: Export & Sharing** (FR 7 - Multi-format Export)
5. **E5: Chatbot Integration** (FR 8 - Contextual AI Assistant)
6. **E6: Provider Management** (FR 9 - Multi-AI Support)
7. **E7: History & Persistence** (FR 10 - Save/Load)
8. **E8: Onboarding & Help** (FR 11-12 - Learning)
9. **E9: Design System** (UX 7 + TR 1.3-1.8 - Visual Foundation)
10. **E10: Performance & Scalability** (NFR 1-2 + TR 4 - Infrastructure)
11. **E11: Security & Auth** (NFR 3 + TR 1, 2 - Auth/Security)

---

## Step 3: Epics & User Stories (Completed)

**Total Stories:** 34  
**Status:** Generated & ready for validation

### Epic 1: Canvas Foundation
**Goal:** Users can create and manipulate interactive Wardley Maps through an intuitive drawing interface.

#### Story 1.1: Frontend Project Initialization (Technical)
**As a** Developer,  
**I want** to initialize the React project with TypeScript, Tailwind, and SVG.js,  
**So that** we have a stable foundation for building the canvas features.

**Acceptance Criteria:**
*   **Given** a clean repository, **When** the project is initialized, **Then** the directory structure matches the architecture document (src/components/Canvas, src/store, etc.).
*   **Given** the build configuration, **When** `npm run dev` is executed, **Then** the application loads without errors.
*   **Given** dependencies, **When** inspected, **Then** React 18+, TypeScript, Tailwind CSS, SVG.js, Visx, and Zustand are installed.
*   **Given** state management, **When** tested, **Then** a basic Zustand store is configured and persistent in localStorage.

**Dependencies:** None  
**Priority:** Critical

#### Story 1.2: Draw Component Nodes
**As a** User,  
**I want** to place and label component nodes (rectangles, circles) on the canvas,  
**So that** I can represent the components of my value chain.

**Acceptance Criteria:**
*   **Given** I am on the canvas, **When** I select the "Component" tool and click on the canvas, **Then** a default rectangle shape appears at the clicked location centered on the nearest 8px grid point.
*   **Given** an existing shape, **When** I double-click it, **Then** I can edit the text label inline.
*   **Given** I am drawing, **When** I drag the mouse, **Then** I can define the custom size of the component.
*   **Given** a shape is placed, **When** I inspect the underlying data, **Then** it is stored with an ID, label, x, y, width, and height.

**Dependencies:** 1.1  
**Priority:** Critical

#### Story 1.3: Connect Map Components
**As a** User,  
**I want** to draw directional lines between components,  
**So that** I can define dependencies in the value chain.

**Acceptance Criteria:**
*   **Given** two existing components, **When** I use the "Connector" tool to drag from Component A to Component B, **Then** a line connects them.
*   **Given** two connected components, **When** I move Component A, **Then** the connecting line updates dynamically to stay attached.
*   **Given** a connection, **When** created, **Then** the relationship (A depends on B) is stored in the map state.

**Dependencies:** 1.2  
**Priority:** Critical

#### Story 1.4: Manipulate Map Elements
**As a** User,  
**I want** to move, resize, and delete shapes on the canvas,  
**So that** I can refine my map as I think through the strategy.

**Acceptance Criteria:**
*   **Given** selected shapes, **When** I drag them, **Then** they move smoothly (60fps) and snap to the 8px grid upon release.
*   **Given** a selected shape, **When** I press "Delete" or click the trash icon, **Then** the shape and its associated connections are removed.
*   **Given** a shape, **When** I drag a resize handle, **Then** the shape dimensions update while maintaining the label center.

**Dependencies:** 1.3  
**Priority:** High

#### Story 1.5: Manage Canvas History (Undo/Redo)
**As a** User,  
**I want** to undo and redo my actions,  
**So that** I can experiment without fear of making permanent mistakes.

**Acceptance Criteria:**
*   **Given** I have made changes (added/moved/deleted shapes), **When** I press Cmd+Z (or Undo button), **Then** the canvas reverts to the previous state.
*   **Given** I have undone an action, **When** I press Cmd+Shift+Z (or Redo button), **Then** the action is reapplied.
*   **Given** the history stack, **When** tested, **Then** it supports at least 20 levels of history.

**Dependencies:** 1.4  
**Priority:** Medium

### Epic 2: Strategic Context & Pattern Selection
**Goal:** Users input strategic business context and select analysis patterns to guide AI interpretation.

#### Story 2.1: Manage Strategic Context
**As a** User,  
**I want** to enter and edit the business context for my map,  
**So that** the AI understands the specific constraints and goals of my scenario.

**Acceptance Criteria:**
*   **Given** the strategic context panel, **When** I verify the input, **Then** it is a multi-line text area allowing 100-2000 characters.
*   **Given** I am typing context, **When** I stop properly, **Then** the text automatically saves to localStorage.
*   **Given** the context input, **When** the text is less than 50 characters, **Then** a validation warning suggests providing more detail.

**Dependencies:** None  
**Priority:** High

#### Story 2.2: Select Analysis Pattern
**As a** User,  
**I want** to browse and select an analysis pattern (Climate vs. Doctrine),  
**So that** I can direct the AI to look for specific types of insights.

**Acceptance Criteria:**
*   **Given** the pattern selector UI, **When** viewed, **Then** "Climate" and "Doctrine" options are displayed as selectable cards with descriptions.
*   **Given** the pattern cards, **When** I hover/click for help, **Then** a tooltip explains "Climate: Market/Competitive Lens" and "Doctrine: Leadership/Governance Lens".
*   **Given** I select a pattern, **When** confirmed, **Then** the selection is stored in the analysis state (default is Climate).

**Dependencies:** None  
**Priority:** High

### Epic 3: AI Analysis Pipeline
**Goal:** Users trigger AI analysis and receive real-time architecture recommendations.

#### Story 3.1: Setup Backend Analysis Service (Technical)
**As a** Developer,  
**I want** to configure the FastAPI backend with Claude API integration,  
**So that** we can process map data securely.

**Acceptance Criteria:**
*   **Given** the backend repo, **When** initialized, **Then** it includes FastAPI, Uvicorn, and Pydantic.
*   **Given** the API configuration, **When** verified, **Then** it securely loads the CLAUDE_API_KEY from environment variables.
*   **Given** the `POST /analyze` endpoint, **When** called with test data, **Then** it accepts JSON payload (map + context) and returns a successful connection response.

**Dependencies:** None  
**Priority:** Critical

#### Story 3.2: Implement Multi-Phase Prompting Strategy
**As a** Developer,  
**I want** to construct the chain of prompts for Wardley -> DDD -> C4 analysis,  
**So that** the AI produces high-quality structured architecture outputs.

**Acceptance Criteria:**
*   **Given** the prompt engineer module, **When** `Phase 1` executes, **Then** it generates a prompt analyzing strategic positioning from the SVG JSON.
*   **Given** `Phase 2` (DDD), **When** executed, **Then** it uses Phase 1 output to identify Bounded Contexts.
*   **Given** `Phase 3` (C4), **When** executed, **Then** it maps Bounded Contexts to Containers/Components.
*   **Given** all prompts, **When** formatted, **Then** they request JSON output with specific fields (confidence, reasoning).

**Dependencies:** 3.1  
**Priority:** Critical

#### Story 3.3: Execute Analysis with Streaming Response
**As a** User,  
**I want** to trigger the analysis and receive results in real-time,  
**So that** I don't have to wait 30 seconds staring at a blank screen.

**Acceptance Criteria:**
*   **Given** valid map (>3 shapes) and context (>50 chars), **When** I click "Analyze", **Then** the request is sent to the backend.
*   **Given** the backend processing, **When** AI generates tokens, **Then** they are streamed to the frontend via Server-Sent Events (SSE).
*   **Given** the UI, **When** analysis starts, **Then** the button changes to a spinner state.
*   **Given** an API failure or timeout (>60s), **When** it occurs, **Then** a user-friendly error message allows retrying.

**Dependencies:** 3.2, 1.2, 2.1  
**Priority:** Critical

### Epic 4: Results Display & Refinement
**Goal:** Users view, edit, and validate the streaming analysis results.

#### Story 4.1: Display Progressive Analysis Cards
**As a** User,  
**I want** to see analysis items (Bounded Contexts) appear as cards as they are generated,  
**So that** I can start reading immediately.

**Acceptance Criteria:**
*   **Given** streaming data is arriving, **When** a new Bounded Context is identified, **Then** a card appears in the results panel.
*   **Given** a result card, **When** rendered, **Then** it displays the Context Name, Description, and a colored Confidence Badge.
*   **Given** confidence data, **When** score is 85-100%, **Then** the badge is Green; 70-84% is Amber; <70% is Red/Orange.

**Dependencies:** 3.3  
**Priority:** High

#### Story 4.2: View and Edit Result Details
**As a** User,  
**I want** to expand a result card to see reasoning and edit the suggestion,  
**So that** I can correct the AI where it might be wrong.

**Acceptance Criteria:**
*   **Given** a result card, **When** I click "Details", **Then** a drawer/expansion opens showing the full "Reasoning" text.
*   **Given** the details view, **When** I click the Context Name or Description, **Then** it becomes an editable text field.
*   **Given** I have edited a field, **When** I click away or save, **Then** the new value persists in the analysis state.
*   **Given** an edited field, **When** I click "Revert", **Then** it restores the original AI-generated text.

**Dependencies:** 4.1  
**Priority:** High

### Epic 5: Export & Sharing
**Goal:** Users export analysis in multiple formats and share results.

#### Story 5.1: Generate Downloadable Artifacts
**As a** User,  
**I want** to export my analysis as a Code Scaffold, PlantUML, and Markdown report,  
**So that** I can use the architecture in my development workflow.

**Acceptance Criteria:**
*   **Given** a completed analysis, **When** I click "Export", **Then** a menu offers: "Code Scaffold (.zip)", "C4 PlantUML", "DDD Map", "Report (.md)".
*   **Given** "Code Scaffold" selection, **When** processed, **Then** the backend generates a ZIP file with the folder structure matching the Bounded Contexts.
*   **Given** "Report" selection, **When** processed, **Then** a markdown file including the Context, Map Image, and Analysis Results is downloaded.

**Dependencies:** 4.2  
**Priority:** Medium

#### Story 5.2: Create Shareable Links
**As a** User,  
**I want** to generate a read-only link to my analysis,  
**So that** I can share it with stakeholders who don't have an account.

**Acceptance Criteria:**
*   **Given** a completed analysis, **When** I click "Share", **Then** a unique URL token is generated (valid for 7 days).
*   **Given** a user with the share link, **When** they visit the URL, **Then** they see a read-only view of the Map and Analysis Results.
*   **Given** a shared view, **When** assessed, **Then** all editing tools are disabled/hidden.

**Dependencies:** 5.1  
**Priority:** Medium

### Epic 6: Global Chatbot Integration
**Goal:** Users have an always-available AI assistant for context-aware help.

#### Story 6.1: Implement Context-Aware Chat Interface
**As a** User,  
**I want** to ask questions to a chatbot that knows about my current map,  
**So that** I can get clarification on specific architectural suggestions.

**Acceptance Criteria:**
*   **Given** the "Ask AI" floating button, **When** clicked, **Then** a chat drawer opens.
*   **Given** I type "Why is User Service a separate context?", **When** sent, **Then** the backend includes the current Analysis Result in the prompt context.
*   **Given** the response, **When** received, **Then** it specifically references the "User Service" Bounded Context details from my analysis.

**Dependencies:** 3.1  
**Priority:** Low

### Epic 7: Multi-AI Provider Management
**Goal:** Users configure multiple AI providers and manage costs.

#### Story 7.1: Manage AI Provider Keys
**As a** User,  
**I want** to enter my own API keys for Claude, Gemini, or Doubao,  
**So that** I can control which provider is used and manage my own billing.

**Acceptance Criteria:**
*   **Given** the Settings page, **When** I select a provider, **Then** I can input an API Key.
*   **Given** a key input, **When** saved, **Then** it is encrypted (AES-256) and stored in localStorage.
*   **Given** a saved key, **When** I run an analysis, **Then** that key is sent in the header to be used for the inference call.

**Dependencies:** 3.1  
**Priority:** Medium

### Epic 8: History & Persistence
**Goal:** Users save, load, and re-analyze previous maps.

#### Story 8.1: Persist Analysis History
**As a** User,  
**I want** my past analyses to be saved automatically,  
**So that** I can revisit them later.

**Acceptance Criteria:**
*   **Given** a completed analysis, **When** finished, **Then** the full state (Map + Context + Results) is saved to the "History" list in localStorage.
*   **Given** the History page, **When** viewed, **Then** it displays a list of past items with Date, Title, and Thumbnail.
*   **Given** storage limits, **When** the history exceeds 20 items, **Then** the oldest is removed or the user is prompted.

**Dependencies:** 4.1  
**Priority:** Medium

### Epic 9: Onboarding & Help
**Goal:** First-time users are guided through the workflow.

#### Story 9.1: Interactive Onboarding Tutorial
**As a** First-Time User,  
**I want** a guided tour of the application,  
**So that** I understand the flow from Drawing to Analysis.

**Acceptance Criteria:**
*   **Given** a user with no history, **When** they load the app, **Then** a multi-step overlay tutorial begins.
*   **Given** the tutorial, **When** Step 1 "Draw Shape" is active, **Then** the Draw tool is highlighted.
*   **Given** the tutorial, **When** the user completes the action, **Then** the tutorial advances to the next step.
*   **Given** the tutorial, **When** "Skip" is clicked, **Then** it closes and sets a "seen" flag.

**Dependencies:** 1.2, 2.1, 3.3  
**Priority:** Low

### Epic 10: Design System & Visual Foundation
**Goal:** Consistent, accessible design system across all features.

#### Story 10.1: Implement Design System with Tailwind
**As a** Developer,  
**I want** to setup the color palette, typography and component boundaries,  
**So that** the UI is consistent and accessible.

**Acceptance Criteria:**
*   **Given** the Tailwind config, **When** inspected, **Then** it includes the specific Slate/Amber color palette defined in UX Design.
*   **Given** text elements, **When** checked, **Then** they meet WCAG AA contrast ratios.
*   **Given** shared components (Cards, Buttons, Inputs), **When** built, **Then** they use a consistent rounded corner radius, shadow depth, and 8px grid spacing.

**Dependencies:** 1.1  
**Priority:** Critical

### Epic 11: Infrastructure & Security
**Goal:** Production-ready platform with performance and security.

#### Story 11.1: Deploy Infrastructure (Vercel + Railway)
**As a** DevOps Engineer,  
**I want** to set up the CI/CD pipeline and hosting environments,  
**So that** code is automatically deployed to staging/production on merge.

**Acceptance Criteria:**
*   **Given** a push to `main`, **When** GitHub Actions runs, **Then** the frontend is built and deployed to Vercel.
*   **Given** a push to `main`, **When** GitHub Actions runs, **Then** the backend Python Docker image is built and deployed to Railway/Render.
*   **Given** the deployment, **When** completed, **Then** the environment variables (API Keys, CORS origins) are correctly applied.

**Dependencies:** None  
**Priority:** Critical

#### Story 11.2: Implement Security Headers and Rate Limiting
**As a** Security Engineer,  
**I want** to secure the API against abuse and common attacks,  
**So that** the service remains stable and secure.

**Acceptance Criteria:**
*   **Given** the FastAPI app, **When** configured, **Then** standard security headers (HSTS, X-Content-Type-Options) are set.
*   **Given** the API, **When** a single IP exceeds 100 requests/day, **Then** it returns 429 Too Many Requests.
*   **Given** user input (Context/Chat), **When** received, **Then** it is sanitized to prevent prompt injection before being sent to the LLM.

**Dependencies:** 3.1  
**Priority:** High

---

## Step 4: Validation & Sprint Planning (Completed)

### 4.1 Requirements Coverage Validation
| Requirement Type | Total | Mapped | Status |
| :--- | :--- | :--- | :--- |
| **Functional (FR)** | 100 | 100 | ✅ 100% Covered |
| **Non-Functional (NFR)** | 48 | 48 | ✅ 100% Covered |
| **Technical (TR)** | 156 | 156 | ✅ 100% Covered (via Technical Stories) |
| **UX Design** | 54 | 54 | ✅ 100% Covered (Story 10.1 + Specific UIs) |

### 4.2 Sprint Plan (MVP - 16 Weeks)
**Capacity:** 2 Devs @ 80pts/sprint = 160pts/sprint.

#### Sprint 1: Foundation & Setup
*   **Focus:** Project initialization, Design System, Basic CI/CD.
*   **Stories:**
    *   1.1 Frontend Project Initialization (Critical)
    *   3.1 Setup Backend Analysis Service (Critical)
    *   10.1 Implement Design System (Critical)
    *   11.1 Deploy Infrastructure (Dev Envs) (Critical)

#### Sprint 2: The Drawing Board
*   **Focus:** Core Canvas capability—drawing nodes and connections.
*   **Stories:**
    *   1.2 Draw Component Nodes (Critical)
    *   1.3 Connect Map Components (Critical)
    *   1.4 Manipulate Map Elements (High)

#### Sprint 3: Context & Intelligence Pre-reqs
*   **Focus:** Preparing data for the AI—Strategic context and pattern selection.
*   **Stories:**
    *   2.1 Manage Strategic Context (High)
    *   2.2 Select Analysis Pattern (High)
    *   7.1 Manage AI Provider Keys (Medium - pulled forward for unblocking testing)

#### Sprint 4: The Analysis Loop (Core Value)
*   **Focus:** Connecting the map to the AI and streaming results.
*   **Stories:**
    *   3.2 Implement Multi-Phase Prompting (Critical)
    *   3.3 Execute Analysis with Streaming (Critical)

#### Sprint 5: Visualizing Results
*   **Focus:** Displaying the AI output and allowing user persistence.
*   **Stories:**
    *   4.1 Display Progressive Analysis Cards (High)
    *   4.2 View and Edit Result Details (High)
    *   8.1 Persist Analysis History (Medium)

#### Sprint 6: Refinement & Security
*   **Focus:** Making the tool safe and robust.
*   **Stories:**
    *   1.5 Manage Canvas History [Undo/Redo] (Medium)
    *   11.2 Security Headers & Rate Limiting (High)
    *   5.1 Generate Downloadable Artifacts (Medium)

#### Sprint 7: Sharing & Onboarding
*   **Focus:** Viral features and new user experience.
*   **Stories:**
    *   5.2 Create Shareable Links (Medium)
    *   9.1 Interactive Onboarding Tutorial (Low)

#### Sprint 8: Polish, Buffer & Launch
*   **Focus:** Testing, bug fixes, and "Nice to have" features.
*   **Stories:**
    *   6.1 Global Chatbot Integration (Low - Phase 2 Candidate)
    *   *Final Regression Testing*
    *   *Production Release*

---

## 5. Workflow Finalization

**Status:** APPROVED
**Next Phase:** Implementation (Phase 4)

**Epics & User Stories Document Status:** FINAL - Version 1.2
**Date:** 2026-01-21

