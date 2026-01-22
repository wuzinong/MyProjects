---
stepsCompleted: [1]
inputDocuments:
  - prd-WardleyMapMaster-2026-01-21.md
  - ux-design-specification.md
  - product-brief-WardleyMapMaster-2026-01-21.md
  - research/technical-wardleymap-research-2026-01-21.md
  - brainstorming-session-2026-01-21.md
workflowType: 'architecture'
project_name: 'WardleyMapMaster'
user_name: 'Bran'
date: '2026-01-21'
---

# Architecture Decision Document: WardleyMapMaster

**Project:** WardleyMapMaster - AI-powered Wardley Map to Architecture Translation Platform  
**Phase:** MVP (Weeks 1-16)  
**Date:** 2026-01-21  
**Author:** Bran (Product Lead)

_This document builds collaboratively through step-by-step architectural decision-making to ensure implementation consistency._

---

## Step 1: Project Context & Architectural Goals ✅

### Project Understanding

**WardleyMapMaster** translates strategic thinking (Wardley Maps) into actionable architecture (DDD bounded contexts, C4 diagrams, SWOT analysis) powered by AI.

**Core Value:** Reduce 2-4 hours of manual architecture work to 30 minutes via AI analysis + transparent confidence scoring.

**Key Constraint:** 12-16 week MVP timeline with 1 developer + 1 designer

### Architectural Goals

1. **Speed & Performance:** AI analysis completes in <30 seconds (90th percentile)
2. **Scalability:** Support 1,000+ concurrent users without degradation
3. **Transparency:** Confidence scores + reasoning visible throughout
4. **Extensibility:** Multi-AI provider support (Claude, Gemini, Doubao)
5. **Reliability:** 99.5% uptime, graceful error handling
6. **Security:** API keys encrypted, HTTPS enforced, no sensitive data logged

### Architectural Constraints

- **Timeline:** 12-16 weeks (no flexibility)
- **Team:** 1 backend dev, 1 frontend dev (sometimes overlapping with design)
- **Stack:** React + SVG.js frontend, FastAPI backend, Claude API
- **Storage:** MVP uses localStorage (Supabase in Phase 2)
- **Deployment:** Vercel (frontend), Railway/Render (backend)

### Success Criteria for Architecture

✅ Implementation can begin without architecture rework  
✅ No conflicts between frontend/backend team members  
✅ Performance targets achievable (30s analysis, 60 FPS canvas)  
✅ Extensible for Phase 2+ features (collaboration, mobile, integrations)

---

## Step 2: High-Level System Architecture

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    WardleyMapMaster                         │
│                  (SaaS Application)                         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌──────────┐      ┌────────────┐
    │ Browser │          │ FastAPI  │      │ Claude API │
    │(React)  │◄────────►│ Backend  │◄────►│(Anthropic) │
    └─────────┘          └──────────┘      └────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ PostgreSQL   │
                      │ (Supabase)   │
                      │ [Phase 2]    │
                      └──────────────┘
```

### Deployment Architecture

```
┌────────────────────────────────┐
│       User's Browser           │
│   (Desktop/Laptop Primary)     │
└────────────────┬───────────────┘
                 │ HTTPS
         ┌───────▼──────────┐
         │  Vercel CDN      │
         │  (Frontend Host) │
         └───────┬──────────┘
                 │ HTTPS
    ┌────────────▼────────────┐
    │   FastAPI Backend       │
    │  (Railway or Render)    │
    │ - Health checks         │
    │ - Auto-scaling (2-10x)  │
    │ - Rate limiting         │
    └────────────┬────────────┘
                 │ API
         ┌───────▼──────────┐
         │  Claude API      │
         │  (Anthropic)     │
         │  $0.10-1.00/call │
         └──────────────────┘
```

### MVP Architecture Layers

```
Presentation Layer (Frontend)
├── React Components (interactive UI)
├── SVG Canvas (Visx + SVG.js)
├── State Management (Zustand)
└── Local Storage (history, maps)

Business Logic Layer (Backend)
├── FastAPI Server
├── Analysis Pipeline (multi-phase Claude calls)
├── Pattern Matching (Climate/Doctrine)
└── Export Generation (C4, DDD, code)

Data Layer (Minimal MVP)
├── Browser LocalStorage (maps, history)
├── Session State (current analysis)
└── [Phase 2] PostgreSQL (persistent data)

External Services
├── Claude API (AI analysis)
├── Vercel (frontend hosting)
└── Railway/Render (backend hosting)
```

---

## Step 3: Frontend Architecture

### Technology Stack

```
Framework:       React 18+ with TypeScript
Build Tool:      Vite (fast dev server, optimized builds)
Styling:         Tailwind CSS + custom components
Graphics:        SVG.js + Visx (React wrapper)
State Management: Zustand (lightweight, simple)
HTTP Client:     Fetch API (native, sufficient for MVP)
Testing:         Vitest + React Testing Library
```

### Project Structure

```
src/
├── components/
│   ├── Canvas/
│   │   ├── CanvasContainer.tsx      (SVG wrapper + controls)
│   │   ├── DrawingTools.tsx         (toolbar: draw, undo, redo)
│   │   ├── ShapeRenderer.tsx        (render shapes on SVG)
│   │   └── useCanvasState.ts        (Zustand store)
│   ├── Analysis/
│   │   ├── AnalysisResults.tsx      (progressive results display)
│   │   ├── ResultCard.tsx           (single context/container card)
│   │   ├── ConfidenceBadge.tsx      (colored confidence indicator)
│   │   └── DetailPanel.tsx          (drill-down view, editable)
│   ├── PatternSelector/
│   │   ├── PatternCard.tsx
│   │   └── PatternSelector.tsx
│   ├── Chatbot/
│   │   ├── ChatWidget.tsx           (floating button + drawer)
│   │   ├── ChatMessage.tsx
│   │   └── useChatState.ts
│   ├── Common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Icon.tsx
│   └── Layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
├── pages/
│   ├── Canvas.tsx                   (main interactive page)
│   ├── History.tsx                  (saved analyses)
│   ├── Settings.tsx                 (AI provider config)
│   └── OnboardingTutorial.tsx
├── api/
│   ├── analysisApi.ts              (analyze endpoint)
│   ├── mapApi.ts                   (save/load maps)
│   ├── chatApi.ts                  (chatbot endpoint)
│   └── shareApi.ts                 (sharing endpoint)
├── types/
│   ├── analysis.ts
│   ├── map.ts
│   └── api.ts
├── utils/
│   ├── svgExport.ts                (SVG to formats)
│   ├── localStorageManager.ts
│   └── errorHandling.ts
├── hooks/
│   ├── useAnalysis.ts
│   ├── useMap.ts
│   └── useChat.ts
├── store/
│   ├── canvasStore.ts              (Zustand store)
│   ├── analysisStore.ts
│   └── uiStore.ts
└── App.tsx
```

### Key Frontend Components

#### Canvas Container (Core Drawing Surface)

```typescript
// High-level pseudo-code
function CanvasContainer() {
  const [shapes, setShapes] = useCanvasState();
  const svgRef = useRef<SVGSVGElement>();

  return (
    <div className="canvas-wrapper">
      <svg ref={svgRef} className="canvas" onMouseDown={handleDraw}>
        {shapes.map(shape => (
          <ShapeRenderer key={shape.id} shape={shape} />
        ))}
      </svg>
      <CanvasToolbar shapes={shapes} onUndo={undo} onRedo={redo} />
    </div>
  );
}
```

**Responsibilities:**
- Render SVG canvas with infinite pan/zoom
- Handle user drawing interactions (mouse events)
- Maintain shape state (Zustand store)
- Trigger save to localStorage every 5 seconds

#### Analysis Results Display (Streaming)

```typescript
function AnalysisResults({ analysisId }) {
  const [results, setResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    // Server-sent events for progressive results
    const eventSource = new EventSource(`/api/analysis/${analysisId}/stream`);
    
    eventSource.onmessage = (event) => {
      const resultChunk = JSON.parse(event.data);
      setResults(prev => [...prev, resultChunk]);
    };

    eventSource.onclose = () => setIsStreaming(false);
  }, [analysisId]);

  return (
    <div className="results-container">
      {results.map(result => (
        <ResultCard key={result.id} result={result} />
      ))}
      {isStreaming && <Spinner />}
    </div>
  );
}
```

**Responsibilities:**
- Connect to SSE endpoint for streaming results
- Render results progressively (as they arrive)
- Display confidence badges with reasoning
- Allow inline editing and drill-down

### State Management (Zustand)

```typescript
// store/canvasStore.ts
export const useCanvasStore = create((set) => ({
  shapes: [],
  relationships: [],
  history: [],
  historyIndex: 0,
  
  addShape: (shape) => set(state => ({
    shapes: [...state.shapes, shape],
    history: [...state.history, state.shapes],
    historyIndex: state.historyIndex + 1
  })),
  
  undo: () => set(state => ({
    historyIndex: Math.max(0, state.historyIndex - 1),
    shapes: state.history[state.historyIndex - 1] || []
  })),
  
  // ... other actions
}));
```

**Why Zustand:**
- Lightweight (no boilerplate Redux)
- Supports localStorage persistence
- Scales to MVP needs (12 core features)
- Easy to reason about (simple function updates)

### Performance Optimizations

1. **Code Splitting:** Lazy-load analysis + history pages
2. **Component Memoization:** React.memo on expensive components (ShapeRenderer)
3. **Canvas Rendering:** Use requestAnimationFrame for smooth animations
4. **Bundle Size:** Tree-shaking, remove unused Tailwind utilities
5. **Local Caching:** SSE results cached in IndexedDB (10MB limit)

---

## Step 4: Backend Architecture

### Technology Stack

```
Framework:       Express.js (Node.js 18+) with TypeScript
Async Runtime:   Node.js native async/await
Task Queue:      Bull + Redis [Phase 2, optional for MVP]
Database:        PostgreSQL via Supabase [Phase 2, localStorage MVP]
Validation:      Zod
Testing:         Jest + Supertest
```

### Project Structure

```
backend/
├── src/
│   ├── index.ts                (Express app initialization)
│   ├── config.ts               (environment config)
│   ├── routes/
│   │   ├── auth.ts             (login, signup)
│   │   ├── maps.ts             (save/load maps)
│   │   ├── analysis.ts         (analyze endpoint, SSE streaming)
│   │   ├── chat.ts             (chatbot endpoint)
│   │   ├── share.ts            (sharing endpoint)
│   │   ├── settings.ts         (AI provider config)
│   │   └── admin.ts            (admin endpoints)
│   ├── services/
│   │   ├── analysisService.ts  (multi-phase Claude analysis)
│   │   ├── patternService.ts   (Climate/Doctrine logic)
│   │   ├── exportService.ts    (C4, DDD, code generation)
│   │   ├── chatService.ts      (contextual chatbot)
│   │   └── claudeService.ts    (Claude API client)
│   ├── models/
│   │   ├── map.ts              (TypeScript interfaces/types)
│   │   ├── analysis.ts
│   │   ├── user.ts
│   │   └── schemas.ts
│   ├── middleware/
│   │   ├── auth.ts             (JWT validation)
│   │   ├── rateLimit.ts        (rate limiting)
│   │   └── errorHandler.ts     (global error handling)
│   ├── utils/
│   │   ├── prompts.ts          (prompt engineering)
│   │   ├── confidenceScorer.ts
│   │   ├── logger.ts
│   │   └── security.ts
│   └── __tests__/
│       ├── analysis.test.ts
│       ├── export.test.ts
│       └── api.test.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Key Endpoints & Data Flows

#### 1. Analysis Endpoint (POST /api/analysis/analyze)

**Request:**
```json
{
  "mapId": "map-123",
  "svgData": "<svg>...</svg>",
  "jsonData": { "shapes": [...], "relationships": [...] },
  "strategicContext": "We're building an e-commerce platform...",
  "pattern": "climate"
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"phase": 1, "message": "Analyzing Wardley Map positioning..."}
data: {"phase": 2, "contextName": "User Service", "confidence": 85, "reasoning": "..."}
data: {"phase": 2, "contextName": "Product Catalog", "confidence": 78, "reasoning": "..."}
data: {"phase": 3, "containerName": "API Gateway", "confidence": 92, "reasoning": "..."}
data: {"complete": true, "resultId": "result-456"}
```

**Backend Flow:**
```
1. Validate input (map data, context, pattern)
2. Generate Phase 1 prompt (Wardley analysis)
3. Call Claude with streaming (for SSE)
4. Parse Phase 1 response, extract entities
5. Generate Phase 2 prompt (DDD analysis with Phase 1 context)
6. Stream Phase 2 results to frontend via SSE
7. Generate Phase 3 prompt (C4 mapping)
8. Stream Phase 3 results
9. Generate Phase 4 prompt (code generation)
10. Save results to localStorage/DB
11. Return resultId
```

#### 2. AI Analysis Pipeline (Multi-Phase)

```typescript
// services/analysisService.ts
export async function analyzeMap(
    mapData: MapData,
    strategicContext: string,
    pattern: string,
    res: Response  // SSE response
): Promise<AnalysisResult> {
    /**
     * Multi-phase Claude analysis:
     * Phase 1: Wardley Map positioning analysis
     * Phase 2: DDD bounded context extraction
     * Phase 3: C4 architecture mapping
     * Phase 4: Code scaffold generation
     */
    
    // Phase 1: Analyze Wardley Map positioning
    const phase1Prompt = `
    Analyze this Wardley Map for strategic positioning:
    
    Components: ${JSON.stringify(mapData.shapes)}
    Dependencies: ${JSON.stringify(mapData.relationships)}
    Strategic Context: ${strategicContext}
    
    Identify:
    1. Positioning (genesis → custom → commodity)
    2. Value flow
    3. Strategic implications
    `;
    
    phase1_response = await stream_claude(
        prompt=phase1_prompt,
        response=response,
        phase=1
    )
    
    # Phase 2: Extract DDD bounded contexts
    phase2_prompt = f"""
    Based on this Wardley Map analysis:
    {phase1_response}
    
    Extract Domain-Driven Design bounded contexts:
    1. Identify natural domain boundaries
    2. Extract aggregate roots per context
    3. Map strategic elements to contexts
    4. Provide confidence score (0-100) for each
    
    Use {pattern} pattern to guide context extraction.
    """
    
    phase2_results = await stream_claude(
        prompt=phase2_prompt,
        response=response,
        phase=2
    )
    
    # Phase 3: Map to C4 architecture
    phase3_prompt = f"""
    Based on these DDD bounded contexts:
    {phase2_results}
    
    Create C4 architecture:
    1. System container for each major context
    2. Components within containers
    3. External systems/integrations
    4. Container interactions
    5. Technology recommendations
    """
    
    phase3_results = await stream_claude(
        prompt=phase3_prompt,
        response=response,
        phase=3
    )
    
    # Phase 4: Generate code scaffolds
    phase4_prompt = f"""
    Based on this C4 architecture:
    {phase3_results}
    
    Generate directory structure for TypeScript implementation:
    - Suggested folder hierarchy
    - File structure per context
    - Key files to create
    - Module boundaries
    """
    
    phase4_results = await stream_claude(
        prompt=phase4_prompt,
        response=response,
        phase=4
    )
    
    # Compile results
    return AnalysisResult(
        bounded_contexts=parse_contexts(phase2_results),
        c4_containers=parse_containers(phase3_results),
        code_scaffold=phase4_results,
        confidence=calculate_confidence(phase2_results),
        reasoning=compile_reasoning(phases)
    )
```

#### 3. Export Service (Generate Multiple Formats)

```python
# services/export_service.py
async def generate_exports(analysis_result: AnalysisResult) -> Dict[str, str]:
    """
    Generate exportable formats from analysis:
    - C4 PlantUML diagram
    - DDD bounded context map
    - Code scaffold (TypeScript)
    - Analysis report (Markdown)
    - Original SVG + analysis overlay
    """
    
    exports = {}
    
    # 1. C4 PlantUML
    exports['c4_plantuml'] = generate_c4_diagram(analysis_result.c4_containers)
    
    # 2. DDD Map
    exports['ddd_map'] = generate_ddd_diagram(analysis_result.bounded_contexts)
    
    # 3. Code Scaffold
    exports['code_scaffold'] = generate_code_structure(
        analysis_result.bounded_contexts,
        language='typescript'
    )
    
    # 4. Markdown Report
    exports['report'] = generate_markdown_report(analysis_result)
    
    # 5. SVG with overlay
    exports['svg_overlay'] = create_svg_overlay(
        original_svg=analysis_result.original_map,
        annotations=analysis_result.bounded_contexts
    )
    
    return exports
```

### Claude API Integration

**Prompt Engineering Strategy:**

1. **System Prompt:** Define Claude's role (architecture assistant, DDD expert)
2. **Few-Shot Examples:** Show 2-3 example Wardley → DDD mappings
3. **Structured Output:** Request JSON format for easier parsing
4. **Confidence Scoring:** Ask Claude to include confidence rationale in response
5. **Iterative Refinement:** Each phase feeds output into next phase's prompt

**Example System Prompt:**
```
You are an expert software architect specializing in Domain-Driven Design (DDD) 
and C4 architecture modeling. Your job is to analyze strategic Wardley Maps and 
translate them into DDD bounded contexts and C4 architecture diagrams.

For each decision, provide:
1. The recommended entity (context, container, component)
2. Confidence level (0-100%) based on training data similarity
3. Reasoning for this recommendation
4. Potential risks or areas needing human review

Output format: JSON with fields: name, type, confidence, reasoning, dependencies
```

### Rate Limiting & Cost Control

```python
# middleware/rate_limit.py
MAX_ANALYSES_PER_DAY = 100
MAX_ANALYSES_PER_HOUR = 20

@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    user_id = extract_user_id(request)
    
    # Check daily limit
    daily_count = redis.get(f"daily:{user_id}")
    if daily_count > MAX_ANALYSES_PER_DAY:
        return JSONResponse(
            status_code=429,
            content={"error": "Daily limit exceeded"}
        )
    
    # Check hourly limit
    hourly_count = redis.get(f"hourly:{user_id}")
    if hourly_count > MAX_ANALYSES_PER_HOUR:
        return JSONResponse(
            status_code=429,
            content={"error": "Hourly limit exceeded"}
        )
    
    response = await call_next(request)
    
    # Increment counters
    redis.incr(f"daily:{user_id}")
    redis.incr(f"hourly:{user_id}")
    redis.expire(f"daily:{user_id}", 86400)  # 24 hours
    redis.expire(f"hourly:{user_id}", 3600)  # 1 hour
    
    return response
```

---

## Step 5: Data Models & Database Schema

### Core Data Entities

```typescript
// User
interface User {
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date (soft delete)
}

// WardleyMap
interface WardleyMap {
  id: string (UUID)
  userId: string (FK User)
  title: string
  description?: string
  shapes: Shape[]
  relationships: Relationship[]
  svgData: string (SVG export)
  jsonData: object (shapes + relationships in JSON)
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
}

// Shape (within map)
interface Shape {
  id: string
  mapId: string
  label: string
  type: 'rectangle' | 'circle' | 'line'
  x: number, y: number
  width: number, height: number
  fill: string (hex color)
  order: number (z-index)
}

// AnalysisResult
interface AnalysisResult {
  id: string (UUID)
  mapId: string (FK WardleyMap)
  userId: string (FK User)
  pattern: 'climate' | 'doctrine'
  strategicContext: string (user input)
  boundedContexts: BoundedContext[]
  c4Containers: C4Container[]
  confidence: number (0-100 average)
  reasoning: string
  createdAt: Date
  sharingToken?: string
  shareExpiresAt?: Date
  exportedFormats: ExportFormat[]
}

// BoundedContext (DDD entity)
interface BoundedContext {
  id: string
  analysisId: string
  name: string
  description: string
  confidence: number (0-100)
  reasoning: string (why Claude chose this)
  aggregateRoots: string[] (AR names)
  relatedContextIds: string[]
  status: 'ai-generated' | 'user-edited'
  userEdits?: object (track changes)
}

// C4Container
interface C4Container {
  id: string
  analysisId: string
  name: string
  description: string
  technology?: string
  confidence: number
  reasoning: string
  containedAggregates: string[]
  dependencies: string[]
}

// AIProviderKey
interface AIProviderKey {
  id: string
  userId: string
  provider: 'claude' | 'gemini' | 'doubao'
  encryptedKey: string (AES-256 encrypted)
  isActive: boolean
  createdAt: Date
}
```

### MVP Database Schema (PostgreSQL - Phase 2)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Wardley Maps table
CREATE TABLE wardley_maps (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  svg_data TEXT,
  json_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Analysis Results table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY,
  map_id UUID REFERENCES wardley_maps(id),
  user_id UUID REFERENCES users(id),
  pattern VARCHAR(50),
  strategic_context TEXT,
  bounded_contexts JSONB,
  c4_containers JSONB,
  confidence_avg DECIMAL(3,2),
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sharing_token VARCHAR(50) UNIQUE,
  share_expires_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_map_id (map_id),
  INDEX idx_created_at (created_at)
);

-- AI Provider Keys table
CREATE TABLE ai_provider_keys (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider VARCHAR(50),
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

**MVP Note:** Phase 1 uses browser localStorage for maps and analysis history. Phase 2 migrates to PostgreSQL via Supabase.

---

## Step 6: API Specifications

### Authentication

```
POST /api/auth/signup
  Request: { email, password }
  Response: { userId, token }
  
POST /api/auth/login
  Request: { email, password }
  Response: { userId, token }
  
POST /api/auth/logout
  Response: { success: true }
```

### Maps Management

```
GET /api/maps
  Response: [ { id, title, createdAt, preview } ]
  
POST /api/maps
  Request: { title, description }
  Response: { mapId, shapes: [], relationships: [] }
  
GET /api/maps/:mapId
  Response: { mapId, title, shapes, relationships, svgData }
  
PUT /api/maps/:mapId
  Request: { title?, description?, shapes, relationships, svgData }
  Response: { success: true }
  
DELETE /api/maps/:mapId
  Response: { success: true }
```

### Analysis

```
POST /api/analysis/analyze
  Request: { mapId, strategicContext, pattern }
  Response: SSE stream (progressive results)
    data: { phase, message, ... }
    data: { phase, contextName, confidence, reasoning }
    
GET /api/analysis/:analysisId
  Response: { id, results, confidence, reasoning }
  
PUT /api/analysis/:analysisId
  Request: { boundedContexts: [...edited...] }
  Response: { updated: true }
  
GET /api/analysis/:analysisId/export
  Query: { format: 'c4' | 'ddd' | 'code' | 'report' | 'all' }
  Response: { url: "https://..." } (downloads ZIP)
```

### Chatbot

```
POST /api/chat
  Request: { analysisId?, message }
  Response: SSE stream (streaming text response)
  
GET /api/chat/history
  Response: [ { id, role, message, timestamp } ]
```

### Sharing

```
POST /api/share/:analysisId
  Response: { token, expiresAt, url: "https://..." }
  
GET /api/share/:token
  Response: { analysis (read-only), originalMap }
  
DELETE /api/share/:token
  Response: { success: true }
```

### Settings

```
GET /api/settings/providers
  Response: { configured: ['claude', 'gemini'], limits: { daily: 42/100 } }
  
POST /api/settings/providers/:provider
  Request: { apiKey }
  Response: { validated: true, estimatedCost: "$0.15/analysis" }
  
DELETE /api/settings/providers/:provider
  Response: { success: true }
```

---

## Step 7: Performance & Scalability Architecture

### Performance Targets

| Component | Target | Strategy |
|-----------|--------|----------|
| **Canvas Rendering** | 60 FPS | requestAnimationFrame, memoization, virtual scrolling |
| **Analysis Latency** | <30s P90 | Streaming SSE, progressive display, parallel phases |
| **Page Load** | <2s P90 | Code splitting, lazy loading, asset optimization |
| **Export Generation** | <5s | Pre-generation during analysis, cached formats |
| **Chat Response** | <3s P90 | Streaming SSE, pre-loaded context |

### Scalability Strategy

**Frontend:**
- Code splitting by route (Canvas, History, Settings pages)
- Lazy-load analysis, chat, export components
- Compress SVG data before sending to backend
- Client-side caching (IndexedDB for results)

**Backend:**
- FastAPI with async/await (handle 1,000+ concurrent users)
- Connection pooling to Claude API
- Redis for rate limiting + session cache
- Horizontal scaling (add more instances behind load balancer)

**Example Auto-Scaling (Railway/Render):**
```
CPU-based scaling:
- 1 instance at <50% CPU
- 2 instances at 50-70% CPU
- 3 instances at 70-85% CPU
- 4+ instances at >85% CPU

Max instances: 10 (prevent runaway costs)
Scale-down delay: 300s (avoid thrashing)
```

### Cost Optimization

**Claude API Costs:**
- Analysis cost: ~$0.15-0.30 per analysis (3-5 Claude calls)
- Monthly budget: $5,000 covers ~20,000 analyses
- Daily budget: ~$167 covers ~1,100 analyses/day

**Cost Reduction:**
- Rate limiting (100/user/day) prevents abuse
- Caching duplicate analyses (same map + context)
- Use cheaper models for chatbot (Claude 3.5 Haiku for Phase 2)

---

## Step 8: Security & Error Handling

### Security Architecture

**Authentication:**
- JWT tokens (5 hour expiry)
- Refresh tokens (30 day expiry)
- Password hashing (bcrypt with salt)
- Email verification (Phase 2)

**API Security:**
- HTTPS enforced (redirect HTTP → HTTPS)
- CORS configured (allow frontend domain only)
- Rate limiting per user (100 analyses/day)
- Input validation (Pydantic schemas)

**Data Protection:**
- API keys encrypted (AES-256, stored in backend only)
- No sensitive data in logs (Claude responses sanitized)
- GDPR compliance (data deletion on request)
- No persistent cookies (JWT in memory)

**Prompt Injection Prevention:**
```python
def sanitize_user_input(text: str) -> str:
    """Remove prompt injection attempts"""
    dangerous_patterns = [
        r'forget.*previous.*instruction',
        r'ignore.*above.*and',
        r'system.*prompt',
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError("Suspicious input detected")
    
    return text.strip()[:2000]  # Max 2000 chars
```

### Error Handling Strategy

**Frontend Error Handling:**
```typescript
try {
  const response = await fetch('/api/analysis/analyze', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    if (response.status === 429) {
      showError("You've exceeded your daily analysis limit");
    } else if (response.status === 500) {
      showError("Analysis failed. Retrying...");
      // Exponential backoff retry
    }
  }
} catch (error) {
  showError("Network error. Please check your connection");
  logErrorToSentry(error);  // Send to monitoring
}
```

**Backend Error Handling:**
```python
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Log error
    logger.error(f"Unhandled exception: {exc}", extra={
        "user_id": request.state.user_id,
        "endpoint": request.url.path
    })
    
    # Send to error tracking (Sentry)
    sentry_sdk.capture_exception(exc)
    
    # Return user-friendly error
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Our team has been notified."}
    )
```

**Monitoring & Alerting:**
- Error Tracking: Sentry (real-time alerts for >5 errors/min)
- Performance Monitoring: Datadog (latency, throughput, error rate)
- Uptime Monitoring: StatusPage (public status dashboard)

---

## Step 9: Deployment & DevOps

### Deployment Architecture

```
Development Flow:
├── Developer commits to GitHub
├── GitHub Actions runs tests
├── If tests pass:
│   ├── Build Docker image
│   ├── Push to container registry
│   └── Deploy to staging environment
└── Manual approval → deploy to production

Staging Environment:
├── Same infrastructure as production
├── Test with real Claude API (low rate limit)
├── QA team verifies features
└── Performance testing

Production Environment:
├── Frontend: Vercel (auto-deploy on merge)
├── Backend: Railway or Render (auto-scaling)
├── Database: Supabase PostgreSQL (Phase 2)
└── Monitoring: Sentry + Datadog
```

### Docker Setup (Backend)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml (local development)
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./app:/app/app

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest
      - run: npm test  # frontend tests

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: docker build -t wardleymap:latest .
        # Push to registry
      - name: Deploy to Railway
        run: railway up

  frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
```

---

## Step 10: MVP Launch Checklist

### Week 15-16: Final Validation

- [ ] All 12 features implemented and tested
- [ ] Performance benchmarks met (30s analysis, 60 FPS canvas)
- [ ] Security review completed (API keys, SQL injection, CSRF)
- [ ] Error handling verified (all error paths tested)
- [ ] Monitoring configured (Sentry, Datadog alerts working)
- [ ] Backup strategy in place (Phase 2 when DB added)
- [ ] Load testing completed (1,000+ concurrent users simulated)
- [ ] Beta testing with 100 users (collect feedback)
- [ ] Onboarding tutorial reviewed (UX designer approval)
- [ ] Documentation complete (API docs, user guide)

### Launch Criteria

✅ Zero critical bugs  
✅ Performance targets met (P90 latencies)  
✅ 99.5% uptime confirmed in staging  
✅ All team members trained and confident  
✅ Support process defined (email support)  
✅ Monitoring alerts configured  
✅ Rollback plan ready (if needed)

---

**Architecture Document Status:** DRAFT - Ready for review  
**Next Step:** [C] Continue to detailed implementation specs, or [Review] for feedback

