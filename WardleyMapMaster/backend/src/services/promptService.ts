/**
 * PromptService orchestrates multi-phase prompting with validation
 * Chains Phase 1 → Phase 2 → Phase 3 → Phase 4
 *
 * Provides validated prompt building for the 4-phase AI analysis workflow:
 * 1. Wardley Map strategic positioning
 * 2. DDD bounded context extraction
 * 3. C4 architecture mapping
 * 4. Code scaffold generation
 *
 * @example
 * const service = new PromptService();
 * const phase1Prompt = service.buildPhase1Prompt(mapData, "Building SaaS platform", "climate");
 */

import {
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  generatePhase4Prompt,
  Phase1OutputSchema,
  Phase2OutputSchema,
  Phase3OutputSchema,
  type MapData,
  type Phase1Output,
  type Phase2Output,
  type Phase3Output,
} from '../utils/prompts';

/**
 * Custom error class for validation failures
 * Thrown when input data doesn't meet requirements
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PromptService {
  /**
   * Validate MapData structure
   *
   * @param mapData - Map data to validate
   * @throws {ValidationError} If shapes array is empty, missing required fields, or has invalid evolution values
   * @private
   */
  private validateMapData(mapData: MapData): void {
    if (!mapData.shapes || mapData.shapes.length === 0) {
      throw new ValidationError('MapData must contain at least one shape');
    }

    for (const shape of mapData.shapes) {
      if (!shape.id || !shape.label) {
        throw new ValidationError(
          'Each shape must have id and label properties',
        );
      }

      if (
        typeof shape.evolution !== 'number' ||
        shape.evolution < 0 ||
        shape.evolution > 1
      ) {
        throw new ValidationError(
          `Shape "${shape.label}" has invalid evolution value: ${shape.evolution}. Must be between 0 and 1.`,
        );
      }
    }
  }

  /**
   * Validate strategic context string
   *
   * @param strategicContext - Business context to validate
   * @throws {ValidationError} If context is empty or shorter than 10 characters
   * @private
   */
  private validateStrategicContext(strategicContext: string): void {
    if (!strategicContext || strategicContext.trim().length === 0) {
      throw new ValidationError('Strategic context cannot be empty');
    }

    if (strategicContext.trim().length < 10) {
      throw new ValidationError(
        'Strategic context must be at least 10 characters long',
      );
    }
  }

  /**
   * Validate analysis pattern
   *
   * @param pattern - Pattern name to validate (case-insensitive)
   * @throws {ValidationError} If pattern is not "climate" or "doctrine"
   * @private
   */
  private validatePattern(pattern: string): void {
    const validPatterns = ['climate', 'doctrine'];
    const normalizedPattern = pattern.toLowerCase().trim();

    if (!validPatterns.includes(normalizedPattern)) {
      throw new ValidationError(
        `Invalid pattern "${pattern}". Must be one of: ${validPatterns.join(', ')}`,
      );
    }
  }

  /**
   * Build Phase 1 prompt with validation
   *
   * Generates a Wardley Map strategic analysis prompt after validating all inputs.
   *
   * @param mapData - Wardley Map with shapes and relationships
   * @param strategicContext - Business goal description (min 10 characters)
   * @param pattern - Analysis pattern: "climate" or "doctrine" (case-insensitive)
   * @returns Formatted prompt string ready for AI consumption
   * @throws {ValidationError} If any input validation fails
   *
   * @example
   * const prompt = service.buildPhase1Prompt(
   *   { shapes: [...], relationships: [...] },
   *   "Building an e-commerce platform",
   *   "climate"
   * );
   */
  buildPhase1Prompt(
    mapData: MapData,
    strategicContext: string,
    pattern: string,
  ): string {
    this.validateMapData(mapData);
    this.validateStrategicContext(strategicContext);
    this.validatePattern(pattern);

    return generatePhase1Prompt(mapData, strategicContext, pattern);
  }

  /**
   * Build Phase 2 prompt with Phase 1 output
   *
   * Generates a DDD bounded context extraction prompt using Wardley analysis results.
   *
   * @param mapData - Original Wardley Map data
   * @param strategicContext - Business goal description
   * @param pattern - Analysis pattern used in Phase 1
   * @param phase1Output - Results from Phase 1 analysis (positioning, value flow, implications)
   * @returns Formatted prompt string for DDD analysis
   * @throws {ValidationError} If any input validation fails
   *
   * @example
   * const prompt = service.buildPhase2Prompt(
   *   mapData,
   *   context,
   *   "climate",
   *   { positioning: "...", valueFlow: "...", strategicImplications: "...", confidence: 85, reasoning: "..." }
   * );
   */
  buildPhase2Prompt(
    mapData: MapData,
    strategicContext: string,
    pattern: string,
    phase1Output: Phase1Output,
  ): string {
    this.validateMapData(mapData);
    this.validateStrategicContext(strategicContext);
    this.validatePattern(pattern);

    return generatePhase2Prompt(
      mapData,
      strategicContext,
      pattern,
      phase1Output,
    );
  }

  /**
   * Build Phase 3 prompt with Phase 2 output
   *
   * Generates a C4 architecture mapping prompt using DDD bounded contexts.
   *
   * @param mapData - Original Wardley Map data
   * @param strategicContext - Business goal description
   * @param phase2Output - Results from Phase 2 DDD analysis (bounded contexts)
   * @returns Formatted prompt string for C4 modeling
   * @throws {ValidationError} If any input validation fails
   *
   * @example
   * const prompt = service.buildPhase3Prompt(
   *   mapData,
   *   context,
   *   { boundedContexts: [{ name: "User Management", confidence: 90, reasoning: "..." }] }
   * );
   */
  buildPhase3Prompt(
    mapData: MapData,
    strategicContext: string,
    phase2Output: Phase2Output,
  ): string {
    this.validateMapData(mapData);
    this.validateStrategicContext(strategicContext);

    return generatePhase3Prompt(mapData, strategicContext, phase2Output);
  }

  /**
   * Build Phase 4 prompt with Phase 3 output
   *
   * Generates a code scaffold prompt using C4 architecture components.
   *
   * @param mapData - Original Wardley Map data
   * @param strategicContext - Business goal description
   * @param phase3Output - Results from Phase 3 C4 analysis (containers and components)
   * @returns Formatted prompt string for code generation
   * @throws {ValidationError} If any input validation fails
   *
   * @example
   * const prompt = service.buildPhase4Prompt(
   *   mapData,
   *   context,
   *   { containers: [{ name: "API Gateway", components: ["AuthController"], confidence: 92 }] }
   * );
   */
  buildPhase4Prompt(
    mapData: MapData,
    strategicContext: string,
    phase3Output: Phase3Output,
  ): string {
    this.validateMapData(mapData);
    this.validateStrategicContext(strategicContext);

    return generatePhase4Prompt(mapData, strategicContext, phase3Output);
  }

  /**
   * Build all prompts with proper chaining
   *
   * Generates all 4 phase prompts in sequence, demonstrating the complete analysis workflow.
   * Useful for understanding the full prompt chain or generating all prompts upfront.
   *
   * @param mapData - Wardley Map with shapes and relationships
   * @param strategicContext - Business goal description
   * @param pattern - Analysis pattern: "climate" or "doctrine"
   * @param phase1Output - Results from Phase 1 Wardley analysis
   * @param phase2Output - Results from Phase 2 DDD analysis
   * @param phase3Output - Results from Phase 3 C4 analysis
   * @returns Object containing all 4 phase prompts
   * @throws {ValidationError} If any input validation fails
   *
   * @example
   * const allPrompts = service.buildAllPrompts(
   *   mapData,
   *   "Building a SaaS platform",
   *   "climate",
   *   phase1Result,
   *   phase2Result,
   *   phase3Result
   * );
   * console.log(allPrompts.phase1);
   * console.log(allPrompts.phase2);
   */
  buildAllPrompts(
    mapData: MapData,
    strategicContext: string,
    pattern: string,
    phase1Output: Phase1Output,
    phase2Output: Phase2Output,
    phase3Output: Phase3Output,
  ): {
    phase1: string;
    phase2: string;
    phase3: string;
    phase4: string;
  } {
    return {
      phase1: this.buildPhase1Prompt(mapData, strategicContext, pattern),
      phase2: this.buildPhase2Prompt(
        mapData,
        strategicContext,
        pattern,
        phase1Output,
      ),
      phase3: this.buildPhase3Prompt(mapData, strategicContext, phase2Output),
      phase4: this.buildPhase4Prompt(mapData, strategicContext, phase3Output),
    };
  }
}
