## 1. Project Foundation

- [x] 1.1 Scaffold a Vite TypeScript application with PixiJS, Zod, Vitest, ESLint, formatting, production build, and browser-safe environment configuration
- [x] 1.2 Define source boundaries for app flow, simulation, rendering, content configuration, persistence, UI, assets, and test fixtures
- [x] 1.3 Add CI commands for type checking, unit tests, production build, asset-license validation, and OpenSpec validation
- [x] 1.4 Implement seeded random number generation and a fixed-60-Hz simulation clock with pause and deterministic test helpers

## 2. Asset Inventory and Runtime Pipeline

- [x] 2.1 Build an inventory command that records every PNG and HTML asset with path, SHA-256, type, dimensions, duplicate hash, and generated review fields
- [x] 2.2 Generate contact sheets or local review pages and classify the current assets into character, enemy, environment, item, skill, UI, effect, reference, duplicate, and unknown groups
- [x] 2.3 Add source, license, approval status, candidate use, semantic target name, and stable logical ID fields; mark all unverified existing assets as non-release by default
- [x] 2.4 Implement semantic promotion into `public/assets/<category>/`, including transparent-bound trimming, size variants, WebP/atlas outputs, and source-to-target traceability
- [x] 2.5 Generate and validate the runtime asset manifest, rejecting raw `screen_*`/`code_*` references, duplicate logical IDs, missing files, and non-approved release assets
- [x] 2.6 Port only selected approved GLSL/SVG effects into local typed effect modules with no iframe, CDN, or third-party runtime requests
- [x] 2.7 Add pipeline tests and a release-build fixture proving unknown-license and invalid-manifest assets fail closed

## 3. Game Shell and Rendering

- [x] 3.1 Implement startup capability checks, PixiJS initialization, DPR cap, responsive resize, scene loading progress, and actionable Chinese failure states
- [x] 3.2 Implement the app state machine for boot, cave, trial loading, combat, pause, level-up choice, result, and unrecoverable error states
- [x] 3.3 Implement keyboard and pointer-safe virtual joystick adapters that emit the same normalized movement intent
- [x] 3.4 Implement camera follow, world layers, sprite/particle pooling, culling, texture lifecycle, and low/medium/high visual budgets
- [x] 3.5 Build responsive battle HUD components for resources, experience, timer, poison phase, skills, boss health, touch safe areas, and accessible DOM status text
- [x] 3.6 Implement persisted audio, quality, screen-shake, and floating-text settings, including user-gesture audio initialization
- [x] 3.7 Handle WebGL context loss by pausing simulation, rebuilding GPU resources on restore, and providing a safe cave fallback on failure
- [x] 3.8 Add shell tests for state transitions, pause-time freezing, input normalization, settings persistence, visual-only quality changes, and context restoration

## 4. Combat Simulation Core

- [x] 4.1 Implement numeric entity IDs, pooled component storage, lifecycle queues, and a uniform-grid spatial index without per-frame hot-path allocations
- [x] 4.2 Implement player movement, bounds, health, mana regeneration/consumption, spiritual-sense capacity/occupation, death, and invulnerability timing
- [x] 4.3 Implement the unified physical/magical/spiritual damage pipeline with defenses, configurable five-element matrix, critical hits, tags, and damage breakdown events
- [x] 4.4 Implement projectiles, area effects, contact damage, knockback, shield, slow, paralysis, armor break, immunity, and timed-status systems
- [x] 4.5 Implement automatic target selection and cast scheduling with range, cooldown, resource, target-tag, and simultaneous-effect limits
- [x] 4.6 Implement experience drops, collection radius, level thresholds, resource pickups, treasure boxes, and idempotent collection
- [x] 4.7 Add deterministic unit tests for movement, resource limits, targeting, elemental matchups, every status type, loot idempotency, and death

## 5. Blood Trial Content

- [x] 5.1 Define validated enemy, wave, poison-fog, loot, elite, boss, and reward configuration schemas and initial Blood Trial data
- [x] 5.2 Implement slow early enemies, charging flyers, dense swarms, Blood Jade Spider web attacks, and elite treasure-box drops
- [x] 5.3 Implement the 0–2, 2–5, 5–8, 8–9:50, and 9:50–10:00 deterministic timeline with stage transitions and spawn budgets
- [x] 5.4 Implement the visible shrinking safe area, unavoidable periodic fog damage outside it, and HUD phase warnings
- [x] 5.5 Implement Ink Flood dragon spawning, health presentation, poison breath, telegraphed armor-breaking tail sweep, death, and boss-phase spawn suppression
- [x] 5.6 Implement Golden Brick talisman acquisition, one-use activation, area shockwave, and duplicate-trigger protection
- [x] 5.7 Implement defeat and victory result generation, one-time reward claiming, return-to-cave flow, and reload-safe run IDs
- [x] 5.8 Add accelerated timeline integration tests covering every phase, fog boundaries, elite loot, boss telegraphs, victory, defeat, and duplicate settlement

## 6. Cultivation Builds

- [x] 6.1 Define and validate build option schemas, effect registry, level continuity, unlocks, exclusions, weights, caps, and fallback resource rewards
- [x] 6.2 Implement deterministic three-choice generation and the paused selection UI with keyboard, pointer, and touch interaction
- [x] 6.3 Implement Fireball, Ice Spike, Wind Blade, and Earth Spike with distinct validated targeting and elemental effects
- [x] 6.4 Implement Spring Arts, Misty Steps, and Great Development Technique passive modifiers and display their live values in the build summary
- [x] 6.5 Implement Azure Bamboo Cloudswarm Swords and the 12/36/72-equivalent milestones for lightning ward, chain lightning, and the 8-second/30-second Grand Aureate Sword Formation
- [x] 6.6 Implement Gold-devouring Insect attachment, elite/boss targeting, shield/projectile consumption tags, probability, and capped mana conversion
- [x] 6.7 Add build tests for seeded offers, insufficient candidates, max levels, passive stacking, sword milestones, evil/ghost bonus damage, insect consumption, and invalid configuration

## 7. Cave and Save Progression

- [x] 7.1 Define version-1 save schema, default save, validation, sequential migrations, temporary-key atomic writes, corrupt-save recovery, and newer-version write protection
- [x] 7.2 Implement the cave overview and inventory with persisted realm, resources, unlocked content, settings, and last trustworthy timestamp
- [x] 7.3 Implement Heaven Vial accumulation at one drop per hour, 12-drop capacity, 12-hour settlement cap, and clock-rollback warning with zero anomalous reward
- [x] 7.4 Implement herb definitions, garden selection, atomic green-liquid maturation, inventory updates, and insufficient-resource feedback
- [x] 7.5 Implement validated pill recipes, atomic material consumption, configured success/waste outcomes, and Foundation Establishment pill content
- [x] 7.6 Implement ordered Qi Refining through Deity Transformation realms, breakthrough requirements, pill consumption, permanent run-stat bonuses, starting-skill slots, and trial unlocks
- [x] 7.7 Connect unique run settlements to cave inventory and prove refresh, repeated clicks, and restored sessions cannot claim a reward twice
- [x] 7.8 Add persistence and progression tests for migrations, partial-write recovery, newer saves, offline caps, clock rollback, maturation, alchemy, breakthroughs, and idempotent rewards

## 8. Integration, Performance, and Release Readiness

- [x] 8.1 Integrate the complete cave-to-Blood-Trial-to-result-to-cave loop using approved assets or clearly identified original placeholders
- [x] 8.2 Add a 500-enemy/1,500-visual-entity desktop stress fixture, frame-time and allocation sampling, and document the reproducible benchmark device/profile
- [x] 8.3 Profile and remove sustained hot-path allocations, excessive draw calls, overlarge textures, and unbounded pools until desktop and mobile performance budgets are met
- [x] 8.4 Add browser interaction tests for desktop keyboard, mobile touch, pause/upgrade overlays, orientation and safe areas, audio unlock, reload recovery, and WebGL context loss
- [x] 8.5 Verify all user-facing failure paths and core HUD information are readable in Chinese and keyboard/pointer/touch controls expose accessible alternatives where applicable
- [x] 8.6 Run the full type-check, lint, unit, integration, browser, production-build, asset-license, package-budget, and OpenSpec validation gates
- [x] 8.7 Complete the IP, font, audio, and visual-asset approval checklist and ensure the release bundle contains no unapproved or third-party runtime dependency
