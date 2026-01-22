---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - product-brief-WardleyMapMaster-2026-01-21.md
  - research/technical-wardleymap-research-2026-01-21.md
  - brainstorming-session-2026-01-21.md
---

# UX Design Specification: WardleyMapMaster

**Author:** Bran  
**Date:** 2026-01-21  
**Project:** WardleyMapMaster - AI-powered Wardley Map platform

---

## Project Understanding ✅

### Executive Summary

**WardleyMapMaster** is an AI-powered platform that translates strategic thinking (Wardley Maps) into actionable architecture (DDD/C4/SWOT). The core magic: user draws a map → AI generates bounded contexts and architecture automatically. Time savings: 2-4 hours → 30 minutes.

### Target Users (6 Personas)

**Primary:**
- **Architect (Alex):** Speed + documentation + pattern-driven analysis
- **Founder (Priya):** Investor pitch preparation + market positioning + cost-conscious

**Secondary:**
- **Beginner Learner (Jordan):** Framework understanding + guided learning path
- **Educator (Sarah):** Curriculum delivery + template reusability + student tracking
- **Enterprise Decision-Maker (Michael):** Governance + consistency + audit trails
- **AI System:** Transparent reasoning + confidence scoring + context-awareness

### Key Design Challenges

1. **Complexity Compression:** Users learn 4 frameworks while building a map
2. **Magic Button Trust:** AI output must be transparent, not black-box
3. **Pattern Selection Clarity:** Climate vs. Doctrine distinction must be obvious
4. **Chatbot Integration:** Always available without breaking drawing flow
5. **Multi-AI Provider:** API key management without overwhelming users
6. **Device Strategy:** Desktop-first approach, scaled strategy for later phases

---

## UX Design Decisions (Locked)

### 1. User Progression & Complexity Management

**Beginner → Intermediate → Advanced Journey:**

- **Onboarding:** "First Map" guided tutorial (10 minutes)
  - Interactive walkthrough creating real e-commerce example
  - Explains core concepts as user builds
  - Ends with first AI analysis (builds confidence)
  
- **Progressive Disclosure:** Features unlock based on experience
  - Beginner (0-2 maps): Basic playground + Climate pattern
  - Intermediate (3-9 maps): Unlock Doctrine pattern + advanced export
  - Advanced (10+ maps): Unlock custom analysis options (Phase 2)
  
- **Same Interface for All Levels:** No separate "expert mode" toggle
  - Progressive reveal keeps interface clean
  - All users see same playground, features appear as they progress

### 2. Trust in AI Output Strategy

**Confidence-Driven Interface:**

- **Color-Coded Confidence Scoring:**
  - 🟢 Green (80%+ confident): "I'm confident about this"
  - 🟡 Yellow (70-79% confident): "This might need review"
  - 🔴 Red (<70% confident): "Please validate this suggestion"
  
- **Reasoning Transparency:**
  - Every suggestion includes 1-line reasoning visible by default
  - "I positioned this as 'custom' because you mentioned it's proprietary"
  - Users can expand for full reasoning chain if they want
  
- **Easy Refinement:**
  - All AI-generated suggestions are immediately editable
  - Users feel they're validating, not trusting blindly
  - Inline editing (click to modify directly)
  
- **Progressive Validation:**
  - Small maps (5-10 elements): Show all suggestions at once
  - Large maps (15+ elements): Show suggestions progressively
  - User validates each section before moving to next

### 3. Pattern Selection & Analysis Flow

**Post-Drawing Pattern Application:**

- **Draw First, Analyze Later:**
  - Users focus on positioning without worrying about analysis lens
  - After map complete: "Choose analysis pattern"
  - Reduces cognitive load
  
- **Pattern Selection with Visual Examples:**
  - **Climate Pattern (Market/Competitive Lens):**
    - Example output shows market positioning insights
    - Visual: Red zones = threats, Green zones = opportunities
    - Use case: Competitive strategy, market positioning
    
  - **Doctrine Pattern (Leadership/Governance Lens):**
    - Example output shows principle alignment analysis
    - Visual: Checkmarks/warnings for alignment with stated principles
    - Use case: Team alignment, organizational coherence
  
  - MVP: 2 patterns (Climate + Doctrine)
  - Phase 2: Add Gameplay Pattern (user engagement modeling)
  
- **Side-by-Side Pattern Comparison:**
  - Optional: "Show me analysis from both patterns"
  - See how different lenses reveal different insights
  - Helps users understand framework connections

### 4. Global Context-Aware Chatbot

**Always-Available Intelligent Assistant:**

- **Access Pattern:** Floating button (bottom-right corner)
  - Minimizable (collapse to save space)
  - Always visible but not intrusive
  - One-click access from anywhere in app
  
- **Contextual Awareness:**
  - **On Playground Page:** Can reference map elements by name
    - "What's this 'Pivot' position mean?"
    - "How does this C4 container align with my 'Product' positioning?"
  - **On Analysis Results:** Can explain outputs
    - "Why did AI suggest this DDD context?"
    - "What does this SWOT mean?"
  - **During Onboarding:** Proactive tips (smart moments)
    - "I see you're choosing a pattern — want help?"
    - "Your map is looking good! Ready to analyze?"
  
- **Tone & Personality:** Friendly/Teaching
  - Not robotic corporate
  - Encourages learning, not just answers
  - Uses concrete examples from user's map
  
- **Smart Triggers (Not Always-On):**
  - Pattern selection moment → offer help
  - Before analysis → confirm they're ready
  - After analysis → explain confidence scores
  - But doesn't interrupt drawing flow

### 5. Multi-AI Provider Management

**Flexible AI Backend:**

- **Onboarding Configuration:**
  - First-time question: "Which AI provider? Bring your API key"
  - Options: Claude (recommended), Gemini (cost-conscious), Doubao, or other
  - Save choice for all future analyses
  - Button to reconfigure anytime in settings
  
- **Cost Transparency:**
  - Before every analysis: "This analysis will cost ~$0.25"
  - Help users understand cost implications
  - Especially important for Founders (budget-conscious)
  - Display estimated tokens + cost per provider
  
- **Graceful Error Handling:**
  - If API key fails: Queue analysis for auto-retry
  - Notify user: "Your analysis is queued, I'll try again in 2 minutes"
  - Show progress: "Attempt 2 of 3..."
  - After 3 failures: Clear error message + troubleshooting options

### 6. Device Strategy (Desktop-First)

**MVP Device Support:**

- **Desktop/Laptop (Primary):**
  - ✅ Full map creation (draw, edit, refine)
  - ✅ Full analysis workflow
  - ✅ All tools accessible (toolbar, sidebar, etc.)
  - ✅ Chatbot fully functional
  - ✅ All exports (SVG, JSON, JPEG, PNG)
  - ✅ History + version control
  
- **Tablet/iPad (Secondary - Responsive Viewing):**
  - ✅ Responsive layout (scales to tablet size)
  - ✅ View maps (read-only, no drawing)
  - ✅ View analysis results (tabbed interface)
  - ✅ Export/share (JPEG/PNG for quick sharing)
  - ❌ No drawing or editing mode (Phase 2 feature)
  
- **Mobile Phone (Tertiary - Responsive Viewing):**
  - ✅ Responsive layout (scales to phone size)
  - ✅ View maps (read-only)
  - ✅ Quick reference
  - ✅ Export to JPEG for sharing in meetings
  - ❌ No creation (review/reference only)
  
- **Phase 2 Enhancements:**
  - Tablet touch-drawing with snap-to-grid
  - Mobile creation with gesture support
  - Full responsive editing on all devices

---

## UX Principles (Guiding All Design Decisions)

1. **Progressive Disclosure:** Show only what users need at each step
2. **Confidence-First:** Make AI reasoning transparent, never black-box
3. **Learn by Doing:** Users understand frameworks through real usage
4. **Friction Reduction:** Minimize steps to first analysis
5. **Trust Through Transparency:** Explain every suggestion and confidence level
6. **Context-Aware Help:** Chatbot knows what page user is on
7. **Desktop Optimized:** Full experience on desktop, viewing on mobile (for now)

---

## Core User Experience ✅

### Defining Experience

**Core Action Loop:**
User draws Wardley Map → Provides domain context → Clicks "Analyze" → Gets instant architecture insights (DDD/C4/SWOT)

The entire experience should feel inevitable, not magical-but-uncertain. The translation from strategy to architecture is the differentiator; the drawing is table-stakes.

**The Magic Moment:** User sees AI-generated DDD/C4 that matches their mental model → realizes "this actually works" → trusts the system

### Platform Strategy

**Web Application Architecture:**
- Modern web app (no installation, works in browser)
- Responsive design (desktop/laptop primary, tablet viewing, mobile viewing)
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- Always-online model (offline support deferred to Phase 2)

**Technology Foundation:**
- SVG.js for interactive canvas rendering
- React frontend with Tailwind CSS
- FastAPI backend with Claude API integration
- Supabase for database + real-time sync

### Effortless Interactions

**1. Drawing (Instant Feedback)**
- Nodes appear exactly where user clicks
- Visual feedback on every interaction (hover states, highlights)
- Connections form smoothly on drag
- No lag or delay (must feel responsive)

**2. Pattern Selection (Visual Clarity)**
- After drawing completes, user sees visual examples
- Side-by-side comparison: "Here's what Climate Pattern reveals" vs. "Here's what Doctrine Pattern reveals"
- Choice becomes obvious (not mysterious)
- User selects based on clear visual difference

**3. Analysis (One-Button Magic)**
- Single "Analyze" button triggers full pipeline
- Results appear progressively (Strategic Insights → DDD → C4 → SWOT)
- Each result includes confidence scoring (visual + numeric)
- Reasoning visible by default (no "expand for details" needed)

**4. Refinement (Inline Editing)**
- Every suggestion is clickable/editable
- No modal dialogs (direct inline editing)
- Changes instantly reflected in downstream outputs
- User feels they're validating, not being told what to do

**5. Export (One-Click Sharing)**
- Export button → dropdown menu: (JPEG | PNG | SVG | JSON)
- Select format → instant download
- No extra steps, no confirmation dialogs
- Exported files are immediately shareable

### Critical Success Moments

**Moment 1: First Analysis (Confidence Builder)**
- User draws their first real map
- Clicks "Analyze"
- Sees DDD bounded contexts that make sense
- Thinks: "Wait, this is actually right?"
- Confidence in system established

**Moment 2: Time Savings Realization (ROI Moment)**
- Architect completes analysis in 30 minutes
- Realizes this would've taken 3-4 hours manually
- Calculates time saved
- Becomes committed user

**Moment 3: Framework Understanding (Learning Click)**
- Beginner confused about DDD/C4 relationship
- Opens chatbot
- Chatbot explains: "See how this C4 container aligns with this DDD context? That's the connection!"
- User has "aha!" moment
- Continues creating maps to deepen understanding

**Moment 4: Pitch Deck Success (Business Impact)**
- Founder exports map + analysis to JPEG
- Includes in investor presentation
- Investors impressed by thoughtful architecture
- Founder credits WardleyMapMaster
- Becomes advocate/recruiter

**Moment 5: Team Alignment (Collaboration Win)**
- Architect shares map with team
- Team reviews AI-generated architecture
- Debate happens around specifics (not basics)
- Everyone leaves meeting aligned
- WardleyMapMaster becomes governance tool

### Experience Principles

These principles guide every UX decision:

**1. Progressive Clarity**
- Simple starting point for beginners
- Complexity reveals as users gain skill
- No overwhelming interfaces on first visit
- Features unlock through progressive use

**2. Trust Through Transparency**
- Every AI suggestion shows confidence score + reasoning
- Users understand "why" before validating
- Low-confidence suggestions flagged for review
- Reasoning visible by default (not hidden)

**3. Instant Feedback**
- Every user action has immediate visual response
- No invisible processing (show progress bars if needed)
- Interactions feel snappy and responsive
- Latency kills trust

**4. Effortless Refinement**
- Editing AI suggestions feels as natural as creating
- No friction between validation and rejection
- Changes cascade through outputs naturally
- User feels in control, not constrained

**5. Learning Through Doing**
- Understanding frameworks comes from real usage
- Chatbot explains concepts in context of user's own map
- No generic tutorials (everything is contextualized)
- Mastery emerges gradually through repeated use

---

## Desired Emotional Response ✅

### Primary Emotional Goals

**Core Emotional Intent:** Build confidence and trust while delivering delight through AI-powered clarity

**Primary Emotions:**
1. **Confidence & Empowerment** - "I understand architecture now" (primary for Beginners + Founders)
2. **Delight & Validation** - "Wait, this actually works?" (primary for everyone at first analysis)
3. **Accomplishment & Pride** - "I did this in 30 minutes" (primary for Architects + Founders)
4. **Trust & Transparency** - "This AI actually understands my domain" (foundational)
5. **Clarity & Connection** - "Finally, the frameworks make sense together" (primary for Learners + Educators)

### Emotional Journey Mapping

**Stage 1: Discovery**
- Feeling: Curiosity + skepticism
- Goal: Intrigue + possibility
- Design: Clear value prop, visual demo, social proof, no signup friction

**Stage 2: Onboarding**
- Feeling: Mild anxiety
- Goal: Confidence building
- Design: Guided walkthrough, real-time feedback, celebration on completion

**Stage 3: First Analysis (Aha! Moment)**
- Feeling: Anticipation + skepticism
- Goal: Delight + validation
- Design: Show reasoning, confidence scores, highlight impressive results, celebrate time saved

**Stage 4: Refinement**
- Feeling: Agency + control
- Goal: Mastery + ownership
- Design: Inline editing, chatbot explanations, natural cascading changes

**Stage 5: Export/Share**
- Feeling: Pride + accomplishment
- Goal: Advocacy & impact
- Design: Beautiful exports, share momentum, visible metrics, easy link sharing

**Stage 6: Return Usage**
- Feeling: Comfortable + efficient
- Goal: Flow state + progression
- Design: Feature progression, skill recognition, power-user shortcuts

### Micro-Emotions (Critical for Satisfaction)

**Trust vs. Skepticism:**
- Design: Full reasoning visible, clarifying questions, user refinement, confidence levels

**Clarity vs. Confusion:**
- Design: Visual connections, contextual chatbot, tooltips, color coding

**Speed vs. Friction:**
- Design: One analyze button, progressive loading, no dialogs, visible progress

**Creativity vs. Constraint:**
- Design: Every suggestion editable, changes don't erase analysis, always feel agency

**Accomplishment vs. Incompleteness:**
- Design: Complete analysis, export quality, satisfaction signals, next steps clear

### Emotional Design Principles

**1. Confidence Through Transparency**
- Every AI suggestion shows confidence level and reasoning
- Low-confidence items flagged for review
- User always understands "why"
- Result: Users feel empowered and in control

**2. Clarity Through Connection**
- Visual links between frameworks
- Chatbot explains using user's domain
- Every concept grounded in context
- Result: Users understand not just what, but why

**3. Delight Through Polish**
- Smooth animations and instant feedback
- Beautiful exports and progress celebration
- Result: Users enjoy using the product

**4. Agency Through Ease**
- Every suggestion editable
- Changes don't erase anything
- User always feels in control
- Result: Users feel empowered, not constrained

**5. Progress Through Recognition**
- Skill progression visible
- Achievements celebrated
- Learning visible
- Result: Users see themselves improving

### Emotions to Prevent

❌ Frustration | ❌ Distrust | ❌ Overwhelm | ❌ Incompleteness | ❌ Slowness | ❌ Constraint | ❌ Stupidity | ❌ Invisibility

---

**Step 4 Complete ✅**

---

## UX Pattern Analysis & Inspiration ✅

### Inspiring Products

**For Interactive Canvas/Drawing:**
- **Excalidraw** (hand-drawn simplicity, accessibility, approachable)
- **Figma** (powerful component system, professional, deep feature set)
- **Miro** (intuitive whiteboarding, snapping/guides, fun)

**For Analysis/Results Display:**
- **ChatGPT** (progressive results, clear reasoning, easy refinement)
- **Notion** (card-based flexibility, rich content, information hierarchy)
- **Linear** (minimalist focus, progressive loading, confidence through simplicity)

**For Learning & Onboarding:**
- **Figma's Tutorials** (embedded, contextual, progressive disclosure)
- **Khan Academy** (micro-lessons, clear progression, immediate value)
- **Duolingo** (habit building, gentle progression, celebration)

**For Collaboration & Community:**
- **Google Docs** (suggestion mode, comment threads, clear change tracking)
- **Slack** (contextual help, progressive features, accessible)

### Transferable UX Patterns

**Pattern 1: Canvas-First Design (From Excalidraw)**
- Canvas dominates the interface (80% of space)
- Toolbar is secondary, contextual (reveals when needed)
- Keeps users focused on their work
- **Adaptation:** Apply to Wardley playground - drawing is primary

**Pattern 2: Progressive Results (From ChatGPT)**
- Analysis doesn't appear all at once
- Insights arrive first, then DDD contexts, then C4, then SWOT
- Each section shows confidence + reasoning
- **Adaptation:** Apply to analysis display - builds anticipation + confidence

**Pattern 3: Embedded Contextual Help (From Figma)**
- Help appears where users need it
- Never interrupts flow (available, not forced)
- Uses user's own work as examples
- **Adaptation:** Apply to chatbot - contextual to map elements

**Pattern 4: Snapping/Guides (From Miro)**
- When placing nodes, subtle visual guides appear
- Nodes snap to grid or other nodes
- Makes precise positioning easy on desktop
- **Adaptation:** Apply to Wardley positioning - make placement feel natural

**Pattern 5: One-Click Action (From Linear)**
- Primary action prominent (one button to analyze)
- Secondary actions available but not distracting
- Confidence through focus
- **Adaptation:** Apply to analysis trigger - single "Analyze" button

**Pattern 6: Card-Based Information (From Notion)**
- Each insight/context/component is a card
- Cards are flexible (expand/collapse)
- Visual hierarchy through size/color
- **Adaptation:** Apply to analysis results - each DDD context is a card

**Pattern 7: Confidence Through Minimalism (From Linear)**
- Reduce visual noise
- Professional but approachable (not corporate cold)
- Icons carry visual weight
- **Adaptation:** Apply to overall design - don't over-decorate

### Anti-Patterns to Avoid

**❌ Figma's Complexity**
- Deep feature sets at onboarding
- Too many tools visible simultaneously
- High learning curve
- **Why avoid:** WardleyMapMaster users are learners + strategists, not designers

**❌ Modal Dialogs**
- Figma uses modals heavily
- Interrupts flow and context
- Forces decision-making
- **Why avoid:** Prefer inline editing, contextual interactions

**❌ Confirmation Dialogs**
- "Are you sure?" on every action
- Creates friction and distrust
- Shows lack of confidence in user intent
- **Why avoid:** Trust user decisions, enable undo/redo

**❌ Hidden Features**
- Advanced features buried in settings
- Users don't discover capabilities
- Feels like second-class experience
- **Why avoid:** Progressive disclosure, but discoverable

**❌ Real-Time Collaboration Chaos (Miro Anti-Pattern)**
- Multiple users creating visual conflicts
- Sync issues visible to users
- Overwhelming presence indicators
- **Why avoid:** MVP is single-user, no multiplayer stress

**❌ Addictive Gamification (Duolingo Anti-Pattern)**
- Manipulative streaks and notifications
- Learning secondary to engagement metrics
- Anxiety-inducing
- **Why avoid:** WardleyMapMaster is about real mastery, not addiction

**❌ Information Overload**
- Too many metrics, options, data at once
- Cognitive overwhelm
- Analysis paralysis
- **Why avoid:** Progressive disclosure, one thing at a time

### Design Inspiration Strategy

**What We Will Adopt:**

1. **Excalidraw's Canvas Simplicity**
   - Minimal toolbar (only essential tools visible)
   - Canvas takes 80% of screen
   - Context menus for advanced options
   - Feels approachable, not intimidating

2. **ChatGPT's Progressive Results**
   - Analysis appears incrementally (Insights → DDD → C4 → SWOT)
   - Each section includes confidence + reasoning
   - Users see "magic happening"
   - Confidence builds as analysis completes

3. **Figma's Embedded Help**
   - Contextual tutorials integrated into flow
   - Help available on hover/click (not forced)
   - Examples use user's own map
   - Learning happens naturally through usage

4. **Linear's Focus & Minimalism**
   - Primary action obvious (Analyze button)
   - Secondary actions available but not dominant
   - Visual hierarchy through size/weight/color
   - Professional but approachable aesthetic

5. **Notion's Card-Based Layout**
   - Each AI-generated component is a card
   - Cards can expand for details or collapse for overview
   - Visual hierarchy through spacing and size
   - Flexible information display

**What We Will Adapt:**

1. **Excalidraw's Hand-Drawn Aesthetic**
   - Adapt: Polish it more (not as sketchy)
   - Keep: Friendly, approachable feeling
   - Goal: Professional-casual blend

2. **ChatGPT's Conversational Tone**
   - Adapt: Make it more educational
   - Keep: Friendly, non-corporate
   - Goal: Teaching tone, not just answering

3. **Figma's Component System**
   - Adapt: Only for Wardley/DDD/C4 components (not all components)
   - Keep: Reusability and consistency
   - Goal: Lightweight component library

**What We Will NOT Adopt:**

1. **❌ Figma's Deep Complexity** - Stay simple
2. **❌ Modal Dialogs** - Use inline interactions
3. **❌ Confirmation Dialogs** - Trust user intent
4. **❌ Real-Time Collaboration** - Solo MVP
5. **❌ Addictive Gamification** - Learning > Engagement
6. **❌ Information Overload** - Progressive disclosure always
7. **❌ Hidden Features** - Everything discoverable

### Design System Foundation

**Visual Language (From Inspiration Analysis):**
- **Aesthetic:** Excalidraw's approachability + Linear's minimalism
- **Color Palette:** Professional but warm (not cold corporate)
- **Typography:** Clear hierarchy, readable
- **Icons:** Linear's icon system (clean, professional, consistent)
- **Components:** Notion's cards, Figma's component thinking

**Interaction Patterns:**
- **Primary Action:** One-click (ChatGPT style)
- **Secondary Actions:** Context menus or sidebars (not dominant)
- **Help:** Embedded and contextual (Figma style)
- **Feedback:** Instant + progressive (ChatGPT results style)
- **Undo/Redo:** Always available (trust user)

**User Progression:**
- **Beginner:** Simplified interface, guided tutorial, contextual help
- **Intermediate:** Additional tools appear, patterns unlocked
- **Advanced:** All features visible, power-user shortcuts available

---

**Step 5 Complete ✅**

---

## Design System Foundation ✅

### 6.1 Design System Choice: Tailwind CSS + Custom Components

**Framework Decision:** Tailwind CSS utility-first approach with custom component layer

WardleyMapMaster will use Tailwind CSS as the design system foundation, with a minimal custom component library built on top. This approach balances speed (critical for 12-16 week MVP timeline) with the flexibility needed for brand customization and complex interactive components.

### Rationale for Selection

**Why Tailwind CSS + Custom Components:**

1. **Timeline Alignment:** Tailwind's utility-first approach accelerates development significantly. With a 12-16 week MVP deadline and a 1-person development team, this approach saves 2-3 weeks compared to building a custom design system from scratch.

2. **Brand Flexibility:** Unlike Material Design or other established systems, Tailwind allows complete visual customization through configuration without fighting against a locked design language. The Excalidraw simplicity + Linear minimalism we want is achievable by tuning Tailwind config.

3. **Team Fit:** 1 developer + 1 designer is ideal for Tailwind. The designer works with visual rules and tokens, the developer implements with utilities. No complex abstractions needed.

4. **SVG Drawing Integration:** Tailwind plays well with SVG.js and canvas-based interactions. The utility approach doesn't interfere with custom SVG rendering logic.

5. **Minimal Customization Approach:** You specified minimal visual customization beyond Tailwind defaults. This means we leverage Tailwind's professional color palette, typography, and spacing out-of-the-box with only minor tweaks.

### Implementation Approach

**Design System Architecture:**

```
WardleyMapMaster Design System
├── Tailwind CSS Foundation
│   ├── Color Palette (Tailwind slate + custom warmth layer)
│   ├── Typography (Professional sans-serif, Tailwind defaults)
│   ├── Spacing (8px base grid)
│   └── Components (buttons, cards, inputs via utilities)
│
├── Custom Component Layer (20-30 components max)
│   ├── Canvas Container (SVG wrapper + controls)
│   ├── Analysis Card (result display with code)
│   ├── Pattern Selector (visual pattern grid)
│   ├── Context Input (textarea + formatting)
│   ├── Chatbot Widget (floating button + messages)
│   ├── Icon System (Linear icons)
│   └── Status Indicators (confidence badges)
│
└── Informal Tokens (documented in code comments)
    ├── Color usage patterns (primary/secondary/danger)
    ├── Spacing conventions (s, m, l, xl)
    └── Typography scale (h1-h6, body, small)
```

**Component Strategy:**

- **Tailwind Utilities:** Use for layout, spacing, typography, basic states (hover, focus, disabled)
- **Custom Components:** Build custom React components only where Tailwind utilities aren't enough (Canvas wrapper, Analysis card with code display, Pattern visual selector)
- **Icon System:** Linear icon set (400+ icons, professional style matches Linear minimalism inspiration)
- **No Component Library:** Skip Shadcn/UI or Headless UI. The overhead isn't justified for 20-30 components needed in MVP.

### Customization Strategy

**Minimal Approach (Your Choice):**

- **Color Tweaks:** Adjust Tailwind's built-in slate palette slightly (add warmth, adjust contrast for readability with white background)
- **Typography:** Use Tailwind defaults (Inter or system font stack), no custom fonts
- **Spacing:** Use Tailwind's 8px base grid unmodified
- **Icons:** Linear icon set, no custom icon work
- **No Design Tokens File:** Skip formal design tokens (Figma Tokens, CSS variables, etc.). Keep it simple—inline styles use Tailwind utility classes, custom components reference inline hex codes with comments.

**What This Means:**

- Fast implementation (Tailwind utilities everywhere)
- Consistency via utilities (not rigid rules)
- Easy for designer to iterate (Tailwind config changes immediately visible)
- Reduced cognitive load (one designer doesn't need tokens documentation)
- Informal documentation (code comments explain color usage, spacing conventions, etc.)

### Design System Rollout

**Phase 1 (MVP - Weeks 1-4):**
- Set up Tailwind config with minimal color/typography tweaks
- Build 5 core custom components (Canvas, Analysis Card, Pattern Selector, Context Input, Chatbot Widget)
- Document component usage in code comments

**Phase 2+ (Enhancements):**
- If brand consistency becomes an issue, convert informal tokens → Figma Tokens + CSS variables
- Build additional components as features expand

---

**Step 6 Complete ✅**

---

## Defining Core Experience ✅

### 7.1 The Defining Interaction

**Core Experience:** Context → Analyze → Stream Results (Hybrid ChatGPT Pattern)

The defining moment in WardleyMapMaster is when users paste their strategic context, click "Analyze," and watch the AI instantly generate DDD bounded contexts and C4 architecture in real-time, with confidence scoring and reasoning visible throughout.

**Why This Pattern:**

The interaction borrows ChatGPT's **instant gratification + transparency + progressive results** but adds WardleyMapMaster's unique layer: **confidence-scored reasoning visible in real-time**. Users don't wonder "is the AI making this up?" because they see how and why each decision was made.

**The Hybrid Element (Novel + Familiar):**
- **Familiar Base:** ChatGPT-style (paste → click analyze → results stream in)
- **Novel Layer:** Confidence badges + reasoning explanations appear **alongside** results as they generate, not after
- **Differentiation:** Users learn the architecture reasoning in real-time, not as a black box

### 7.2 User Mental Model

**How Users Think About the Task:**

Users arrive with a Wardley Map sketch and strategic context. Their mental model:
1. "I have a map. I want someone/something to tell me what architecture this implies."
2. "How do I know the AI understood my strategy correctly?" (trust concern)
3. "Can I quickly export this to show my team?" (value delivery concern)

**Existing Solution Pain Points (Manual Process):**
- 2-4 hours of manual work (DDD modeling, C4 design, code structure)
- High expertise required (not everyone can do DDD/C4)
- Isolated work (no real-time collaboration)
- No confidence or reasoning transparency

**What WardleyMapMaster Solves:**
- 30 minutes to complete analysis (vs. 2-4 hours)
- AI makes DDD/C4 decisions automatically
- Confidence scores answer "is this trustworthy?"
- Instant export for team sharing

### 7.3 Success Criteria for Core Experience

**The interaction succeeds when:**

1. **Instant Clarity:** Results start appearing within 2 seconds of clicking "Analyze" (progressive results stream in, ChatGPT style)
2. **Transparency:** Confidence badges + reasoning explanations visible throughout (users see WHY each decision was made)
3. **Time Savings Visible:** Users see "This would normally take 2-4 hours. You just saved 1.5 hours." (motivation confirmation)
4. **Effortless Export:** One click to generate shareable output (code scaffolds, C4 diagrams, DDD docs)
5. **Trust Built:** 70%+ of users find analysis "accurate" or "very useful" in first session (from MVP success metrics)

**Emotional Indicators:**
- Delight: "Wow, it understood my strategy immediately"
- Accomplishment: "I built architecture in 30 minutes"
- Trust: "The reasoning makes sense, I'm confident in this"

### 7.4 Novel vs. Established Pattern Analysis

**Pattern Choice: Hybrid (Established Base + Novel Twist)**

**Established Pattern (ChatGPT Flow):**
```
User Input (context) → Click Analyze → Results Stream In
```

Users already understand this from ChatGPT. Low learning curve, instant comprehension.

**Novel Twist (Confidence + Reasoning Layer):**
```
Results Stream In + Confidence Badge + Explanation Appear Side-by-Side
```

Example real-time display:
```
[50% confidence] User Service (RFC 1)
  Reasoning: "Wardley map shows 'user management' at top. 
  That's a bounded context. 70% similar to 'User' contexts 
  in training data."

[85% confidence] Product Catalog (RFC 2)
  Reasoning: "Map shows 'products' coordinating other elements.
  Typical Product/Catalog context. Match confidence high."
```

**Why This Hybrid Works:**

1. **Users Don't Need to Learn:** ChatGPT-like pattern is familiar
2. **Differentiation:** Reasoning transparency is unique to WardleyMapMaster
3. **Trust Building:** Confidence badges answer the question "can I rely on this?"
4. **Learning Opportunity:** Users see the reasoning and understand DDD/C4 better
5. **Speed:** Both familiar base + novel layer streamline to same interaction (no extra steps)

### 7.5 Experience Mechanics: Step-by-Step

**Phase 1: Setup (User provides context)**
```
1. User draws Wardley Map in canvas
2. User provides strategic context (textarea: business problem, goals, constraints)
3. User selects one pattern (Climate or Doctrine for MVP)
4. System validates: "Got it. Map + Climate pattern + context. Ready to analyze."
```

**Phase 2: Analysis (AI generates architecture)**
```
1. User clicks "Analyze" button
2. Button changes to "Analyzing..." with spinner
3. System makes API call to Claude 3.5 Sonnet with:
   - Wardley Map structure (SVG data)
   - Strategic context (text)
   - Selected pattern (Climate or Doctrine)
   - Request: "Generate DDD bounded contexts and C4 containers"
```

**Phase 3: Results Stream (Progressive display)**
```
1. First result arrives: Display contextual framework analysis (title, count, confidence)
2. As each bounded context/container is generated:
   - Display name + description (ChatGPT-style progressive text)
   - Confidence badge (green/yellow/red based on score)
   - Reasoning explanation (indented, slightly dimmed)
   - Link to related code scaffold
3. Final result: Full analysis with all contexts/containers, exportable output
```

**Phase 4: Refinement (User acts on results)**
```
1. User reviews analysis, can:
   - Click context to see details
   - Edit context name/description inline
   - View code scaffold
   - Mark as "helpful" or "needs work"
2. User exports: One-click export to:
   - C4 PlantUML diagram
   - DDD bounded context map (visual)
   - Code scaffold (directory structure)
3. User shares or iterates (if not satisfied)
```

**Phase 5: Completion (Value delivered)**
```
1. User exports output
2. System shows: "Great work! You saved ~2 hours vs. manual design"
3. User can:
   - Save this analysis to history
   - Start new analysis
   - Share with team via link
```

### 7.6 Interaction Principles

**Design this core experience to embody:**

1. **Progressive Clarity:** One step follows naturally from the last. No cognitive jumps.
2. **Transparency First:** Confidence badges + reasoning visible immediately, not hidden in tooltips.
3. **Instant Feedback:** Results stream in real-time (ChatGPT-style), not batch after 10 seconds.
4. **Effortless Refinement:** Users can edit inline, re-analyze, or export with one click.
5. **Visible Value:** Time-saved message + export confirmation reinforce "this worked!"

---

**Step 7 Complete ✅**

---

## Visual Design Foundation ✅

### 8.1 Color System: Hybrid Slate + Warm Accent

**Color Strategy:** Professional slate palette with warm accent for confidence scoring and delight moments

The visual language uses Tailwind's built-in slate grays (cool, professional, trustworthy) paired with a warm amber accent that signals success, confidence, and the "magic" moments of AI analysis completion.

**Primary Color Palette:**

```
Background & Neutral Surfaces:
  - Slate-50:  #f8fafc  (light background)
  - Slate-100: #f1f5f9  (subtle surface)
  - Slate-200: #e2e8f0  (borders, subtle dividers)
  - Slate-400: #94a3b8  (secondary text, hints)
  - Slate-600: #475569  (primary text)
  - Slate-900: #0f172a  (high contrast text)

Accent & Confidence:
  - Blue-600:  #2563eb  (primary action, "Analyze" button)
  - Amber-500: #f59e0b  (confidence badges, success moments)
  - Emerald-600: #16a34a (high confidence, "trust me" signals)
  - Amber-100: #fef3c7  (warm background for good-news alerts)
  - Red-600:  #dc2626  (error, low confidence, destructive)
```

**Confidence Badge Mapping (Real-time Visual Feedback):**

- **85-100% Confidence:** Emerald-600 badge + green checkmark (high trust, use immediately)
- **70-84% Confidence:** Amber-500 badge + star (good confidence, slight caution suggested)
- **50-69% Confidence:** Amber-100 background, slate-600 text (medium confidence, review recommended)
- **Below 50% Confidence:** Red-600 badge + warning icon (low confidence, needs human review)

**Why This Palette:**

1. **Trustworthiness:** Slate grays are professional and calm (architectural feeling)
2. **Confidence Signaling:** Amber accent creates visual distinction for "good things happened" moments
3. **Accessibility:** High contrast ratios (WCAG AAA compliant)
4. **Excalidraw + Linear Blend:** Slate is Linear's core (minimalism), amber adds Excalidraw warmth
5. **Emotional Alignment:** Confidence badges reinforce emotional goal of "Trust + Clarity"

**Component Color Application:**

- **Canvas Area:** Slate-50 background, slate-200 grid lines (light, clean, non-intrusive)
- **Analysis Results Card:** White background, slate-900 text, amber badge for confidence
- **Buttons:**
  - Primary (Analyze): Blue-600 background, white text
  - Secondary (Export): Slate-200 background, slate-900 text
  - Success: Emerald-600 for "saved" / "exported" states
- **Hover States:** Slight shadow lift + color shift (darker slate or brighter accent)
- **Disabled States:** Slate-300 background, slate-400 text (grayed out, clearly disabled)

**Accessibility Compliance:**

- All text on slate-50 background: Contrast ratio 12.5:1 (AAA compliant)
- All text on blue-600: Contrast ratio 7.2:1 (AAA compliant)
- Confidence badges use color + icon (not color alone) for color-blind accessibility

---

### 8.2 Typography System: Modern Professional

**System Font Stack (No Custom Fonts):**

```
Primary (UI & headings):
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif
  
Body text:
  font-family: same stack (consistency)

Monospace (code examples, API details):
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace
```

**Type Scale & Hierarchy:**

```
Display/Hero (rare):
  - Font size: 32px
  - Line height: 1.25 (40px)
  - Font weight: 700 (bold)
  - Use: Page title "WardleyMapMaster" on first visit

Heading 1 (section titles):
  - Font size: 24px
  - Line height: 1.3 (31px)
  - Font weight: 700 (bold)
  - Use: "Your Analysis Results", "Architecture Overview"

Heading 2 (subsection):
  - Font size: 18px
  - Line height: 1.4 (25px)
  - Font weight: 600 (semibold)
  - Use: "Bounded Contexts", "Containers"

Heading 3 (component title):
  - Font size: 16px
  - Line height: 1.4 (22px)
  - Font weight: 600 (semibold)
  - Use: Context names, card titles

Body/Regular:
  - Font size: 14px
  - Line height: 1.6 (22px)
  - Font weight: 400 (normal)
  - Use: Description text, analysis explanations

Small/Caption:
  - Font size: 12px
  - Line height: 1.5 (18px)
  - Font weight: 400 (normal)
  - Use: Hints, timestamps, secondary info

Confidence Badge Label:
  - Font size: 11px
  - Font weight: 600 (semibold)
  - Line height: 1.0
  - Use: "85% confidence", "High Trust"

Code/Monospace:
  - Font size: 12px
  - Font weight: 400
  - Line height: 1.5
  - Letter-spacing: 0.02em (slightly wider for readability)
  - Use: Code scaffolds, function signatures
```

**Modern Professional Character:**

- **Font Weight Variation:** Use 600 semibold for emphasis (not all-caps or italics)
- **Generous Line Height:** 1.4-1.6 for reading comfort (not tight 1.2)
- **Letter Spacing:** Tight in headings, slightly loose in body for rhythm
- **Contrast Through Scale:** Rely on size differences, not excessive color variation
- **Monospace for Code:** Creates visual distinction between explanation and implementation

**Why This Approach:**

1. **System Fonts:** No custom font loading (faster, cleaner)
2. **Modern Feel:** Generous spacing, strategic boldness (not corporate rigid)
3. **Professional Tone:** Clear hierarchy without being stuffy
4. **Accessibility:** Larger line heights improve readability for dyslexic users
5. **Code Distinction:** Monospace signals "technical content" instantly

---

### 8.3 Spacing & Layout Foundation: Balanced Breathing

**Spacing Base Unit: 8px Grid**

```
Base increments (use multiples of 8):
  xs:  4px   (rare, very tight)
  sm:  8px   (standard minimum)
  md:  16px  (standard padding)
  lg:  24px  (section spacing)
  xl:  32px  (major section break)
  2xl: 48px  (page-level spacing)
```

**Smart Breathing Room Strategy (Balanced Approach):**

```
Canvas-First Areas (Efficient, minimal spacing):
  - Canvas itself: Full available area, no padding
  - Canvas toolbar: 8px between buttons, 8px padding within toolbar
  - Quick controls: 8px spacing, compact layout

Analysis Results (Breathing Room):
  - Card padding: 16px (generous inside-card spacing)
  - Between contexts/containers: 24px vertical (breathing room)
  - Confidence badge to description: 8px (tight, grouped)
  - Result card to next result: 24px (visual separation)

Sidebar/Navigation (Breathing):
  - Section padding: 16px left/right
  - Between sections: 24px vertical (spacious)
  - Icon to label: 8px (grouped)

Micro-Interactions (Breathing):
  - Button padding: 10px vertical × 16px horizontal (comfortable tap target)
  - Input field padding: 12px (readable, comfortable)
  - Tooltip/popover padding: 12px (not cramped)
```

**Layout Structure:**

```
Page Layout:
┌─────────────────────────────────────────┐
│ Header/Logo (fixed or sticky)           │  48px height
├─────────────────┬───────────────────────┤
│   Sidebar       │   Canvas Area         │
│   (280px)       │   (flex, remaining)   │
│   16px padding  │   (no padding)        │
│                 │                       │
│   Results Panel │   SVG Canvas          │
│   (scrollable)  │   (full height)       │
│   24px spacing  │   Toolbar below       │
│                 │   (controls)          │
│                 │                       │
└─────────────────┴───────────────────────┘

Canvas Toolbar:
  - Below SVG canvas
  - 8px padding, 8px button spacing
  - Quick actions: Undo, Redo, Save, Export, Help
```

**Responsive Considerations (Desktop MVP):**

```
Desktop (1024px+):
  - Sidebar: 280px (visible)
  - Canvas: Remaining space (flexible)
  - Results: Side panel with scrolling

Tablet/Mobile (Phase 2+):
  - Sidebar: Drawer (collapsed to hamburger)
  - Canvas: Full width
  - Results: Bottom drawer or stacked view
```

**Why This Balanced Approach:**

1. **Canvas-First Efficiency:** Drawing gets maximum space without padding noise
2. **Results Breathing:** Analysis output gets generous spacing for readability
3. **Micro-Interactions:** Touch-friendly sizes (44px minimum) for accessibility
4. **Visual Hierarchy:** Spacing differences signal content grouping
5. **Emotional Impact:** Breathing room in results creates sense of accomplishment ("I made something!")

---

### 8.4 Accessibility Considerations

**Color Accessibility:**

- ✅ All text meets WCAG AAA contrast (7:1 minimum)
- ✅ Confidence badges use icon + color (accessible to color-blind users)
- ✅ Error states use red + X icon (not red alone)
- ✅ Success states use green + checkmark (not green alone)

**Typography Accessibility:**

- ✅ Minimum font size 12px (readable for users with low vision)
- ✅ Line height 1.4+ (comfortable for dyslexic readers)
- ✅ Font weight variations for emphasis (not italics alone)
- ✅ Sufficient color contrast on all text (ratio 4.5:1+)

**Spacing & Layout Accessibility:**

- ✅ Button/interactive target size: 44px minimum (comfortable for motor control issues)
- ✅ Proper heading hierarchy (H1 → H2 → H3, no skips for screen readers)
- ✅ Input fields with visible labels (not placeholder-only)
- ✅ Focus indicators visible and high-contrast (blue outline, 2px)

**Interactive Component Accessibility:**

- ✅ All buttons keyboard-navigable (Tab key)
- ✅ Canvas SVG interactions have keyboard shortcuts listed
- ✅ Tooltips/help triggered by keyboard and mouse
- ✅ Results readable by screen readers (semantic HTML, ARIA labels where needed)

---

**Step 8 Complete ✅ — UX Design Specification Workflow Complete!**

---