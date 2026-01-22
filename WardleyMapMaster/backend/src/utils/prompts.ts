/**
 * Multi-phase prompt template system for Wardley Map analysis
 * Implements 4-phase prompting strategy: Wardley → DDD → C4 → Code Scaffold
 */

import { z } from 'zod';

export interface MapData {
  shapes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    evolution: number;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

export interface Phase1Output {
  positioning: string;
  valueFlow: string;
  strategicImplications: string;
  confidence: number;
  reasoning: string;
}

export interface Phase2Output {
  boundedContexts: Array<{
    name: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface Phase3Output {
  containers: Array<{
    name: string;
    components: string[];
    confidence: number;
  }>;
}

/**
 * Zod schema for validating Phase 1 AI responses
 * Ensures AI output matches expected structure with confidence and reasoning
 */
export const Phase1OutputSchema = z.object({
  positioning: z
    .string()
    .min(10, 'Positioning analysis must be at least 10 characters'),
  valueFlow: z
    .string()
    .min(10, 'Value flow description must be at least 10 characters'),
  strategicImplications: z
    .string()
    .min(10, 'Strategic implications must be at least 10 characters'),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(10, 'Reasoning must be at least 10 characters'),
});

/**
 * Zod schema for validating Phase 2 AI responses
 * Validates bounded context extraction with confidence scores
 */
export const Phase2OutputSchema = z.object({
  boundedContexts: z
    .array(
      z.object({
        name: z.string().min(1, 'Context name cannot be empty'),
        confidence: z.number().min(0).max(100),
        reasoning: z
          .string()
          .min(10, 'Reasoning must be at least 10 characters'),
      }),
    )
    .min(1, 'Must identify at least one bounded context'),
});

/**
 * Zod schema for validating Phase 3 AI responses
 * Validates C4 container and component structure
 */
export const Phase3OutputSchema = z.object({
  containers: z
    .array(
      z.object({
        name: z.string().min(1, 'Container name cannot be empty'),
        components: z
          .array(z.string())
          .min(1, 'Container must have at least one component'),
        confidence: z.number().min(0).max(100),
      }),
    )
    .min(1, 'Must define at least one container'),
});

/**
 * Phase 1: Generate Wardley Map strategic positioning analysis prompt
 *
 * Analyzes component positioning on the evolution axis and identifies strategic patterns.
 *
 * @param mapData - The Wardley Map data containing shapes and relationships
 * @param mapData.shapes - Array of map components with evolution values (0=genesis to 1=commodity)
 * @param mapData.relationships - Array of dependencies between components
 * @param strategicContext - Business context describing the strategic goal (min 10 chars)
 * @param pattern - Analysis pattern to apply: "climate" or "doctrine"
 * @returns Formatted prompt string for AI to generate Phase 1 analysis
 *
 * @example
 * const prompt = generatePhase1Prompt(
 *   { shapes: [...], relationships: [...] },
 *   "Building a SaaS platform for project management",
 *   "climate"
 * );
 */
export function generatePhase1Prompt(
  mapData: MapData,
  strategicContext: string,
  pattern: string,
): string {
  const shapesText = mapData.shapes
    .map(
      (shape) =>
        `- ${shape.label} (evolution: ${shape.evolution.toFixed(2)}, position: x=${shape.x}, y=${shape.y})`,
    )
    .join('\n');

  const relationshipsText = mapData.relationships
    .map((rel) => {
      const fromShape = mapData.shapes.find((s) => s.id === rel.from);
      const toShape = mapData.shapes.find((s) => s.id === rel.to);
      return `- ${fromShape?.label || `Unknown(${rel.from})`} → ${toShape?.label || `Unknown(${rel.to})`} (${rel.type})`;
    })
    .join('\n');

  return `You are a Wardley Mapping expert. Analyze the following Wardley Map and provide strategic insights.

Strategic Context: ${strategicContext}

Analysis Pattern: ${pattern}

Map Components:
${shapesText}

Component Relationships:
${relationshipsText}

Instructions:
1. Analyze the positioning of components on the evolution axis (0=genesis, 0.25=custom, 0.5-0.75=product, 0.9+=commodity)
2. Identify value flow from user-visible components to foundational components
3. Provide strategic implications based on the ${pattern} pattern
4. Return response in JSON format with the following structure:
   {
     "positioning": "Analysis of where components sit on evolution axis",
     "valueFlow": "Description of how value flows through the system",
     "strategicImplications": "Strategic recommendations based on positioning",
     "confidence": 0-100,
     "reasoning": "Explanation of analysis approach"
   }`;
}

/**
 * Phase 2: Generate DDD bounded context extraction prompt using Phase 1 output
 *
 * Uses Wardley positioning insights to identify natural domain boundaries and bounded contexts.
 *
 * @param mapData - The Wardley Map data containing shapes and relationships
 * @param strategicContext - Business context describing the strategic goal
 * @param pattern - Analysis pattern applied in Phase 1
 * @param phase1Output - Results from Phase 1 Wardley analysis containing positioning and value flow
 * @returns Formatted prompt string for AI to generate Phase 2 DDD analysis
 *
 * @example
 * const prompt = generatePhase2Prompt(
 *   mapData,
 *   "Building a SaaS platform",
 *   "climate",
 *   { positioning: "...", valueFlow: "...", strategicImplications: "...", confidence: 85, reasoning: "..." }
 * );
 */
export function generatePhase2Prompt(
  mapData: MapData,
  strategicContext: string,
  pattern: string,
  phase1Output: Phase1Output,
): string {
  return `You are a Domain-Driven Design expert. Based on the Wardley Map analysis, identify bounded contexts.

Strategic Context: ${strategicContext}

Pattern: ${pattern}

Previous Wardley Analysis:
- Positioning: ${phase1Output.positioning}
- Value Flow: ${phase1Output.valueFlow}
- Strategic Implications: ${phase1Output.strategicImplications}

Map Components:
${mapData.shapes.map((s) => `- ${s.label}`).join('\n')}

Instructions:
1. Using the Wardley positioning analysis, identify natural bounded contexts
2. 
 * Maps DDD bounded contexts to C4 architecture model (containers and components).
 * 
 * @param mapData - The Wardley Map data for reference
 * @param strategicContext - Business context describing the strategic goal
 * @param phase2Output - Results from Phase 2 DDD analysis containing bounded contexts
 * @returns Formatted prompt string for AI to generate Phase 3 C4 architecture
 * 
 * @example
 * const prompt = generatePhase3Prompt(
 *   mapData,
 *   "Building a SaaS platform",
 *   { boundedContexts: [{ name: "User Management", confidence: 90, reasoning: "..." }] }
 * );
 * Group components into cohesive domains with clear boundaries
3. Consider the evolution stage and strategic implications when defining contexts
4. Return response in JSON format with the following structure:
   {
     "boundedContexts": [
       {
         "name": "Context name",
         "confidence": 0-100,
         "reasoning": "Why this forms a coherent bounded context"
       }
     ]
   }`;
}

/**
 * Phase 3: Generate C4 architecture mapping prompt using Phase 2 output
 */
export function generatePhase3Prompt(
  mapData: MapData,
  strategicContext: string,
  phase2Output: Phase2Output,
): string {
  const contextsText = phase2Output.boundedContexts
    .map(
      (ctx) =>
        `- ${ctx.name} (confidence: ${ctx.confidence}%, reasoning: ${ctx.reasoning})`,
    )
    .join('\n');

  return `You are a C4 architecture modeling expert. Map the bounded contexts to C4 containers and components.

Strategic Context: ${strategicContext}

Identified Bounded Contexts:
${contextsText}

Original Map Components:
${mapData.shapes.map((s) => `- ${s.label}`).join('\n')}

Instructions:
1. For each bounded context, define C4 containers (deployable/executable units)
2. Within each container, identify key components (classes/modules)
3. Ensure the C4 model reflects the strategic insights from previous phases
4. 
 * Generates concrete directory structure and TypeScript code scaffolding from C4 architecture.
 * 
 * @param mapData - The Wardley Map data for reference
 * @param strategicContext - Business context describing the strategic goal
 * @param phase3Output - Results from Phase 3 C4 analysis containing containers and components
 * @returns Formatted prompt string for AI to generate Phase 4 code scaffold
 * 
 * @example
 * const prompt = generatePhase4Prompt(
 *   mapData,
 *   "Building a SaaS platform",
 *   { containers: [{ name: "API Gateway", components: ["AuthController"], confidence: 92 }] }
 * );
 * Return response in JSON format with the following structure:
   {
     "containers": [
       {
         "name": "Container name",
         "components": ["Component1", "Component2"],
         "confidence": 0-100
       }
     ]
   }`;
}

/**
 * Phase 4: Generate code scaffold prompt using Phase 3 output
 */
export function generatePhase4Prompt(
  mapData: MapData,
  strategicContext: string,
  phase3Output: Phase3Output,
): string {
  const containersText = phase3Output.containers
    .map(
      (container) =>
        `- ${container.name}:\n  Components: ${container.components.join(', ')}`,
    )
    .join('\n');

  return `You are a senior software architect. Generate a code scaffold structure based on the C4 architecture.

Strategic Context: ${strategicContext}

C4 Architecture:
${containersText}

Technology Stack: TypeScript, Node.js

Instructions:
1. Create a directory structure that reflects the containers and components
2. Define file/folder organization following best practices
3. Include placeholder code for key classes/modules
4. Return response in JSON format with the following structure:
   {
     "directoryStructure": {
       "src/": {
         "containers/": {
           "containerName/": ["file1.ts", "file2.ts"]
         }
       }
     },
     "scaffoldFiles": [
       {
         "path": "src/containers/example/Example.ts",
         "content": "// Placeholder code"
       }
     ]
   }`;
}
