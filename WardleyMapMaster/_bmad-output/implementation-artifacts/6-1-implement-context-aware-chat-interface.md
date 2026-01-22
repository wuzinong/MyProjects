# Story 6.1: Implement Context-Aware Chat Interface

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to ask questions to a chatbot that knows about my current map,
so that I can get clarification on specific architectural suggestions.

## Acceptance Criteria

1. **Given** the "Ask AI" floating button, **When** clicked, **Then** a chat drawer opens.
2. **Given** I type "Why is User Service a separate context?", **When** sent, **Then** the backend includes the current Analysis Result in the prompt context.
3. **Given** the response, **When** received, **Then** it specifically references the "User Service" Bounded Context details from my analysis.

## Tasks / Subtasks

- [ ] Implement Chat UI
  - [ ] Create `ChatWidget` component (Floating Button + Drawer)
  - [ ] Create `MessageList` and `MessageInput` components
  - [ ] Implement open/close state logic
- [ ] Implement Backend Chat Logic
  - [ ] Create `chat_service.py`
  - [ ] Define prompt template that injects:
    - [ ] System instructions (be helpful, educational)
    - [ ] Current Map Data (JSON)
    - [ ] Current Analysis Results (JSON)
    - [ ] User Question
  - [ ] Expose `POST /api/chat` endpoint (streaming response)
- [ ] Connect UI to Backend
  - [ ] Implement `useChat` hook to handle sending messages and receiving streams
  - [ ] Display streaming Thinking/Typing state

## Dev Notes

- **Context Window**: Be mindful of token limits. If the map/analysis is huge, we might need to summarize it or only send relevant parts (RAG). For MVP, likely fine to send full context.
- **Persistence**: Chat history is session-only per requirements (cleared on reload).

### Project Structure Notes

- `src/components/Chatbot/ChatWidget.tsx`
- `src/components/Chatbot/ChatWindow.tsx`
- `backend/app/routers/chat.py`

### References

- [Epics](_bmad-output/planning-artifacts/epics-WardleyMapMaster-2026-01-21.md)
- [Architecture](_bmad-output/planning-artifacts/architecture-WardleyMapMaster-2026-01-21.md)

## Dev Agent Record

### Agent Model Used

Gemini 3 Pro (Preview)

### Debug Log References

### Completion Notes List

### File List

```,filePath: