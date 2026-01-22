/**
 * Tests for prompt template system
 * Following TDD: RED phase - tests written first
 */

import {
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  generatePhase4Prompt,
  Phase1OutputSchema,
  Phase2OutputSchema,
  Phase3OutputSchema,
} from '../utils/prompts';

describe('Prompt Templates', () => {
  const mockMapData = {
    shapes: [
      { id: '1', label: 'User Interface', x: 100, y: 50, evolution: 0.8 },
      { id: '2', label: 'API Gateway', x: 100, y: 150, evolution: 0.6 },
      { id: '3', label: 'Database', x: 100, y: 250, evolution: 0.9 },
    ],
    relationships: [
      { from: '1', to: '2', type: 'depends-on' },
      { from: '2', to: '3', type: 'depends-on' },
    ],
  };

  const mockStrategicContext =
    'Building an e-commerce platform to disrupt traditional retail';
  const mockPattern = 'climate';

  describe('Phase 1: Wardley Strategy Analysis', () => {
    it('should generate prompt with map data and strategic context', () => {
      const prompt = generatePhase1Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
      );

      expect(prompt).toContain('Wardley Map');
      expect(prompt).toContain('User Interface');
      expect(prompt).toContain('API Gateway');
      expect(prompt).toContain('Database');
      expect(prompt).toContain('e-commerce platform');
      expect(prompt).toContain('climate');
    });

    it('should request JSON output with confidence and reasoning', () => {
      const prompt = generatePhase1Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
      );

      expect(prompt).toContain('JSON');
      expect(prompt).toContain('confidence');
      expect(prompt).toContain('reasoning');
    });

    it('should include positioning analysis instructions', () => {
      const prompt = generatePhase1Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
      );

      expect(prompt).toContain('genesis');
      expect(prompt).toContain('custom');
      expect(prompt).toContain('commodity');
      expect(prompt).toContain('evolution');
    });
  });

  describe('Phase 2: DDD Bounded Context Extraction', () => {
    const mockPhase1Output = {
      positioning: 'API Gateway is in the product phase',
      valueFlow: 'User Interface → API Gateway → Database',
      strategicImplications: 'Focus on differentiating the API layer',
      confidence: 85,
      reasoning:
        'Analysis based on evolution positioning and strategic context',
    };

    it('should include Phase 1 output in prompt', () => {
      const prompt = generatePhase2Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
        mockPhase1Output,
      );

      expect(prompt).toContain('API Gateway is in the product phase');
      expect(prompt).toContain('API layer');
    });

    it('should request DDD bounded contexts with confidence', () => {
      const prompt = generatePhase2Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
        mockPhase1Output,
      );

      expect(prompt).toContain('bounded context');
      expect(prompt).toContain('Domain-Driven Design');
      expect(prompt).toContain('confidence');
      expect(prompt).toContain('reasoning');
    });

    it('should request JSON format for contexts', () => {
      const prompt = generatePhase2Prompt(
        mockMapData,
        mockStrategicContext,
        mockPattern,
        mockPhase1Output,
      );

      expect(prompt).toContain('JSON');
    });

    it('should include pattern-specific guidance', () => {
      const prompt = generatePhase2Prompt(
        mockMapData,
        mockStrategicContext,
        'climate',
        mockPhase1Output,
      );

      expect(prompt).toContain('climate');
    });
  });

  describe('Phase 3: C4 Architecture Mapping', () => {
    const mockPhase2Output = {
      boundedContexts: [
        {
          name: 'User Management',
          confidence: 85,
          reasoning: 'Clear user-related responsibilities',
        },
        {
          name: 'Product Catalog',
          confidence: 78,
          reasoning: 'Product data management domain',
        },
      ],
    };

    it('should include Phase 2 output (bounded contexts) in prompt', () => {
      const prompt = generatePhase3Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase2Output,
      );

      expect(prompt).toContain('User Management');
      expect(prompt).toContain('Product Catalog');
      expect(prompt).toContain('Clear user-related responsibilities');
    });

    it('should request C4 containers and components', () => {
      const prompt = generatePhase3Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase2Output,
      );

      expect(prompt).toContain('C4');
      expect(prompt).toContain('container');
      expect(prompt).toContain('component');
    });

    it('should request JSON format with confidence', () => {
      const prompt = generatePhase3Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase2Output,
      );

      expect(prompt).toContain('JSON');
      expect(prompt).toContain('confidence');
      expect(prompt).toContain('reasoning');
    });
  });

  describe('Phase 4: Code Scaffold Generation', () => {
    const mockPhase3Output = {
      containers: [
        {
          name: 'API Gateway',
          components: ['AuthController', 'ProductController'],
          confidence: 92,
        },
        {
          name: 'User Service',
          components: ['UserRepository', 'UserService'],
          confidence: 88,
        },
      ],
    };

    it('should include Phase 3 output (C4 architecture) in prompt', () => {
      const prompt = generatePhase4Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase3Output,
      );

      expect(prompt).toContain('API Gateway');
      expect(prompt).toContain('User Service');
      expect(prompt).toContain('AuthController');
    });

    it('should request code structure with directory layout', () => {
      const prompt = generatePhase4Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase3Output,
      );

      expect(prompt).toContain('directory');
      expect(prompt).toContain('structure');
      expect(prompt).toContain('TypeScript');
    });

    it('should request JSON format', () => {
      const prompt = generatePhase4Prompt(
        mockMapData,
        mockStrategicContext,
        mockPhase3Output,
      );

      expect(prompt).toContain('JSON');
    });
  });

  describe('Edge Cases', () => {
    it('should handle relationships with non-existent shape IDs gracefully', () => {
      const badRelMap = {
        shapes: [
          { id: '1', label: 'Component A', x: 100, y: 50, evolution: 0.5 },
        ],
        relationships: [
          { from: '1', to: '999', type: 'depends-on' },
          { from: '888', to: '1', type: 'depends-on' },
        ],
      };

      const prompt = generatePhase1Prompt(badRelMap, 'Test context', 'climate');

      expect(prompt).toContain('Component A');
      expect(prompt).toContain('Unknown(999)');
      expect(prompt).toContain('Unknown(888)');
      expect(prompt).not.toContain('undefined');
    });

    it('should handle empty relationships array', () => {
      const noRelsMap = {
        shapes: [
          { id: '1', label: 'Solo Component', x: 100, y: 50, evolution: 0.6 },
        ],
        relationships: [],
      };

      const prompt = generatePhase1Prompt(noRelsMap, 'Test context', 'climate');

      expect(prompt).toContain('Solo Component');
      expect(prompt).toBeTruthy();
    });

    it('should handle special characters in labels', () => {
      const specialCharsMap = {
        shapes: [
          { id: '1', label: 'API "Gateway"', x: 100, y: 50, evolution: 0.7 },
          { id: '2', label: "User's Service", x: 100, y: 150, evolution: 0.6 },
        ],
        relationships: [{ from: '1', to: '2', type: 'depends-on' }],
      };

      const prompt = generatePhase1Prompt(
        specialCharsMap,
        'Test context with "quotes"',
        'climate',
      );

      expect(prompt).toContain('API "Gateway"');
      expect(prompt).toContain("User's Service");
    });
  });

  describe('Zod Schema Validation', () => {
    describe('Phase1OutputSchema', () => {
      it('should validate correct Phase 1 output', () => {
        const validOutput = {
          positioning: 'Components are well distributed across evolution',
          valueFlow: 'User → API → Database flow identified',
          strategicImplications: 'Focus on API differentiation strategy',
          confidence: 85,
          reasoning: 'Analysis based on evolution positioning and dependencies',
        };

        expect(() => Phase1OutputSchema.parse(validOutput)).not.toThrow();
      });

      it('should reject Phase 1 output with confidence out of range', () => {
        const invalidOutput = {
          positioning: 'Valid positioning',
          valueFlow: 'Valid flow',
          strategicImplications: 'Valid implications',
          confidence: 150,
          reasoning: 'Valid reasoning',
        };

        expect(() => Phase1OutputSchema.parse(invalidOutput)).toThrow();
      });

      it('should reject Phase 1 output with short strings', () => {
        const invalidOutput = {
          positioning: 'short',
          valueFlow: 'Valid flow description here',
          strategicImplications: 'Valid implications here',
          confidence: 85,
          reasoning: 'Valid reasoning here',
        };

        expect(() => Phase1OutputSchema.parse(invalidOutput)).toThrow();
      });
    });

    describe('Phase2OutputSchema', () => {
      it('should validate correct Phase 2 output', () => {
        const validOutput = {
          boundedContexts: [
            {
              name: 'User Management',
              confidence: 90,
              reasoning: 'Clear user-related responsibilities and boundaries',
            },
            {
              name: 'Product Catalog',
              confidence: 85,
              reasoning: 'Product domain with clear boundaries',
            },
          ],
        };

        expect(() => Phase2OutputSchema.parse(validOutput)).not.toThrow();
      });

      it('should reject Phase 2 output with empty contexts array', () => {
        const invalidOutput = {
          boundedContexts: [],
        };

        expect(() => Phase2OutputSchema.parse(invalidOutput)).toThrow();
      });

      it('should reject context with empty name', () => {
        const invalidOutput = {
          boundedContexts: [
            {
              name: '',
              confidence: 85,
              reasoning: 'Valid reasoning here',
            },
          ],
        };

        expect(() => Phase2OutputSchema.parse(invalidOutput)).toThrow();
      });
    });

    describe('Phase3OutputSchema', () => {
      it('should validate correct Phase 3 output', () => {
        const validOutput = {
          containers: [
            {
              name: 'API Gateway',
              components: ['AuthController', 'RateLimiter'],
              confidence: 92,
            },
            {
              name: 'User Service',
              components: ['UserRepository'],
              confidence: 88,
            },
          ],
        };

        expect(() => Phase3OutputSchema.parse(validOutput)).not.toThrow();
      });

      it('should reject Phase 3 output with empty containers', () => {
        const invalidOutput = {
          containers: [],
        };

        expect(() => Phase3OutputSchema.parse(invalidOutput)).toThrow();
      });

      it('should reject container with empty components array', () => {
        const invalidOutput = {
          containers: [
            {
              name: 'API Gateway',
              components: [],
              confidence: 85,
            },
          ],
        };

        expect(() => Phase3OutputSchema.parse(invalidOutput)).toThrow();
      });
    });
  });
});
