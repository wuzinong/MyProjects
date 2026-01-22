/**
 * Tests for PromptService - orchestrates multi-phase prompting
 * Following TDD: RED phase - tests written first
 */

import { PromptService, ValidationError } from '../services/promptService';
import type { MapData } from '../utils/prompts';

describe('PromptService', () => {
  let promptService: PromptService;
  const mockMapData: MapData = {
    shapes: [
      { id: '1', label: 'Web App', x: 100, y: 50, evolution: 0.75 },
      { id: '2', label: 'API', x: 100, y: 150, evolution: 0.65 },
      { id: '3', label: 'Database', x: 100, y: 250, evolution: 0.9 },
    ],
    relationships: [
      { from: '1', to: '2', type: 'depends-on' },
      { from: '2', to: '3', type: 'depends-on' },
    ],
  };

  const strategicContext = 'Building a SaaS platform for project management';
  const pattern = 'climate';

  beforeEach(() => {
    promptService = new PromptService();
  });

  describe('buildPhase1Prompt', () => {
    it('should return a complete Phase 1 prompt', () => {
      const prompt = promptService.buildPhase1Prompt(
        mockMapData,
        strategicContext,
        pattern,
      );

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should include map data in Phase 1 prompt', () => {
      const prompt = promptService.buildPhase1Prompt(
        mockMapData,
        strategicContext,
        pattern,
      );

      expect(prompt).toContain('Web App');
      expect(prompt).toContain('API');
      expect(prompt).toContain('Database');
    });

    it('should include strategic context', () => {
      const prompt = promptService.buildPhase1Prompt(
        mockMapData,
        strategicContext,
        pattern,
      );

      expect(prompt).toContain('SaaS platform');
      expect(prompt).toContain('project management');
    });
  });

  describe('buildPhase2Prompt', () => {
    const mockPhase1Result = {
      positioning: 'API is in product phase, Database is commodity',
      valueFlow: 'Web App → API → Database',
      strategicImplications: 'Focus on API differentiation',
      confidence: 85,
      reasoning: 'Analysis based on evolution values',
    };

    it('should inject Phase 1 output into Phase 2 prompt', () => {
      const prompt = promptService.buildPhase2Prompt(
        mockMapData,
        strategicContext,
        pattern,
        mockPhase1Result,
      );

      expect(prompt).toContain('API is in product phase');
      expect(prompt).toContain('Database is commodity');
      expect(prompt).toContain('API differentiation');
    });

    it('should request DDD bounded contexts', () => {
      const prompt = promptService.buildPhase2Prompt(
        mockMapData,
        strategicContext,
        pattern,
        mockPhase1Result,
      );

      expect(prompt).toContain('bounded context');
      expect(prompt).toContain('Domain-Driven Design');
    });
  });

  describe('buildPhase3Prompt', () => {
    const mockPhase2Result = {
      boundedContexts: [
        {
          name: 'Project Management',
          confidence: 90,
          reasoning: 'Core business domain',
        },
        {
          name: 'User Authentication',
          confidence: 85,
          reasoning: 'Standard security context',
        },
      ],
    };

    it('should inject Phase 2 output (bounded contexts) into Phase 3 prompt', () => {
      const prompt = promptService.buildPhase3Prompt(
        mockMapData,
        strategicContext,
        mockPhase2Result,
      );

      expect(prompt).toContain('Project Management');
      expect(prompt).toContain('User Authentication');
      expect(prompt).toContain('Core business domain');
    });

    it('should request C4 architecture', () => {
      const prompt = promptService.buildPhase3Prompt(
        mockMapData,
        strategicContext,
        mockPhase2Result,
      );

      expect(prompt).toContain('C4');
      expect(prompt).toContain('container');
      expect(prompt).toContain('component');
    });
  });

  describe('buildPhase4Prompt', () => {
    const mockPhase3Result = {
      containers: [
        {
          name: 'Web Application',
          components: ['ProjectController', 'TaskService'],
          confidence: 88,
        },
        {
          name: 'API Gateway',
          components: ['AuthMiddleware', 'RateLimiter'],
          confidence: 92,
        },
      ],
    };

    it('should inject Phase 3 output (C4 architecture) into Phase 4 prompt', () => {
      const prompt = promptService.buildPhase4Prompt(
        mockMapData,
        strategicContext,
        mockPhase3Result,
      );

      expect(prompt).toContain('Web Application');
      expect(prompt).toContain('API Gateway');
      expect(prompt).toContain('ProjectController');
      expect(prompt).toContain('AuthMiddleware');
    });

    it('should request code scaffold', () => {
      const prompt = promptService.buildPhase4Prompt(
        mockMapData,
        strategicContext,
        mockPhase3Result,
      );

      expect(prompt).toContain('directory');
      expect(prompt).toContain('TypeScript');
      expect(prompt).toContain('structure');
    });
  });

  describe('buildAllPrompts - sequential chaining', () => {
    it('should build all 4 phases with proper chaining', () => {
      const mockPhase1Result = {
        positioning: 'Analysis complete',
        valueFlow: 'Flow identified',
        strategicImplications: 'Recommendations provided',
        confidence: 85,
        reasoning: 'Based on component analysis and patterns',
      };

      const mockPhase2Result = {
        boundedContexts: [
          { name: 'Context1', confidence: 85, reasoning: 'Clear boundary' },
        ],
      };

      const mockPhase3Result = {
        containers: [
          { name: 'Container1', components: ['Component1'], confidence: 90 },
        ],
      };

      const allPrompts = promptService.buildAllPrompts(
        mockMapData,
        strategicContext,
        pattern,
        mockPhase1Result,
        mockPhase2Result,
        mockPhase3Result,
      );

      expect(allPrompts).toHaveProperty('phase1');
      expect(allPrompts).toHaveProperty('phase2');
      expect(allPrompts).toHaveProperty('phase3');
      expect(allPrompts).toHaveProperty('phase4');

      expect(allPrompts.phase2).toContain('Analysis complete');
      expect(allPrompts.phase3).toContain('Context1');
      expect(allPrompts.phase4).toContain('Container1');
    });
  });

  describe('Input Validation', () => {
    describe('MapData validation', () => {
      it('should throw ValidationError for empty shapes array', () => {
        const emptyMap = { shapes: [], relationships: [] };

        expect(() =>
          promptService.buildPhase1Prompt(emptyMap, strategicContext, pattern),
        ).toThrow(ValidationError);

        expect(() =>
          promptService.buildPhase1Prompt(emptyMap, strategicContext, pattern),
        ).toThrow('at least one shape');
      });

      it('should throw ValidationError for shape missing required fields', () => {
        const invalidMap = {
          shapes: [{ id: '1', x: 100, y: 50, evolution: 0.5 } as any],
          relationships: [],
        };

        expect(() =>
          promptService.buildPhase1Prompt(
            invalidMap,
            strategicContext,
            pattern,
          ),
        ).toThrow(ValidationError);
      });

      it('should throw ValidationError for invalid evolution value', () => {
        const invalidEvolution = {
          shapes: [{ id: '1', label: 'Test', x: 100, y: 50, evolution: 1.5 }],
          relationships: [],
        };

        expect(() =>
          promptService.buildPhase1Prompt(
            invalidEvolution,
            strategicContext,
            pattern,
          ),
        ).toThrow(ValidationError);
        expect(() =>
          promptService.buildPhase1Prompt(
            invalidEvolution,
            strategicContext,
            pattern,
          ),
        ).toThrow('invalid evolution value');
      });
    });

    describe('Strategic Context validation', () => {
      it('should throw ValidationError for empty strategic context', () => {
        expect(() =>
          promptService.buildPhase1Prompt(mockMapData, '', pattern),
        ).toThrow(ValidationError);
        expect(() =>
          promptService.buildPhase1Prompt(mockMapData, '', pattern),
        ).toThrow('cannot be empty');
      });

      it('should throw ValidationError for too short strategic context', () => {
        expect(() =>
          promptService.buildPhase1Prompt(mockMapData, 'Short', pattern),
        ).toThrow(ValidationError);
        expect(() =>
          promptService.buildPhase1Prompt(mockMapData, 'Short', pattern),
        ).toThrow('at least 10 characters');
      });

      it('should accept valid strategic context', () => {
        const validContext = 'Building a comprehensive SaaS platform';
        expect(() =>
          promptService.buildPhase1Prompt(mockMapData, validContext, pattern),
        ).not.toThrow();
      });
    });

    describe('Pattern validation', () => {
      it('should throw ValidationError for invalid pattern', () => {
        expect(() =>
          promptService.buildPhase1Prompt(
            mockMapData,
            strategicContext,
            'invalid',
          ),
        ).toThrow(ValidationError);
        expect(() =>
          promptService.buildPhase1Prompt(
            mockMapData,
            strategicContext,
            'invalid',
          ),
        ).toThrow('climate, doctrine');
      });

      it('should accept "climate" pattern', () => {
        expect(() =>
          promptService.buildPhase1Prompt(
            mockMapData,
            strategicContext,
            'climate',
          ),
        ).not.toThrow();
      });

      it('should accept "doctrine" pattern', () => {
        expect(() =>
          promptService.buildPhase1Prompt(
            mockMapData,
            strategicContext,
            'doctrine',
          ),
        ).not.toThrow();
      });

      it('should be case-insensitive for patterns', () => {
        expect(() =>
          promptService.buildPhase1Prompt(
            mockMapData,
            strategicContext,
            'CLIMATE',
          ),
        ).not.toThrow();
      });
    });
  });
});
