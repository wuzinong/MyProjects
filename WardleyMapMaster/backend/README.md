# WardleyMapMaster Backend

Backend service for WardleyMapMaster - AI-powered Wardley Map to Architecture translation platform.

## Features

- **Multi-Phase Prompting Strategy**: Wardley → DDD → C4 → Code Scaffold
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Well-Tested**: 100% code coverage with comprehensive test suite

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

### Core Modules

- **`src/utils/prompts.ts`**: Prompt template generation for each analysis phase
- **`src/services/promptService.ts`**: Orchestration service for multi-phase prompting

### Prompt Phases

1. **Phase 1**: Wardley Map strategic positioning analysis
2. **Phase 2**: DDD Bounded Context extraction (uses Phase 1 output)
3. **Phase 3**: C4 Architecture mapping (uses Phase 2 output)
4. **Phase 4**: Code Scaffold generation (uses Phase 3 output)

## Usage Example

```typescript
import { PromptService } from './services/promptService';

const promptService = new PromptService();

const mapData = {
  shapes: [
    { id: '1', label: 'Web App', x: 100, y: 50, evolution: 0.8 },
    { id: '2', label: 'API', x: 100, y: 150, evolution: 0.6 },
  ],
  relationships: [
    { from: '1', to: '2', type: 'depends-on' },
  ],
};

const prompt = promptService.buildPhase1Prompt(
  mapData,
  'Building a SaaS platform',
  'climate'
);

// Send prompt to AI service...
```

## Type Safety

All phase outputs are validated with Zod schemas:

```typescript
import { Phase1OutputSchema } from './utils/prompts';

// Validate AI response
const validated = Phase1OutputSchema.parse(aiResponse);
```

## Contributing

1. Write tests first (TDD approach)
2. Ensure 100% coverage
3. Run `npm test` before committing
4. Follow TypeScript best practices

## License

MIT
