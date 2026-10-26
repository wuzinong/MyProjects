import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command } from '../src/core/engine.js';
import { choose } from '../src/ai/strategy.js';
import { serialize, deserialize } from '../src/core/save.js';

test('AI completes 60 seeded games: classic/enhanced with 2, 3 and 4 players', { timeout: 240000 }, () => {
  const results = [];
  for (const enhanced of [false, true]) {
    for (const count of [2, 3, 4]) {
      for (let seed = 1; seed <= 10; seed++) {
        let s = createGame(
          Array.from({ length: count }, (_, id) => ({ lord: (id + seed) % 7, ai: true })),
          enhanced,
          seed,
        );
        let steps = 0;
        try {
          while (s.phase !== 'over' && steps < 18000) {
            const c = choose(s);
            assert.ok(c, `no decision in ${s.phase}`);
            s = command(s, c);
            steps++;
            if (steps % 500 === 0) s = deserialize(serialize(s));
          }
          assert.equal(
            s.phase,
            'over',
            `seed ${seed}, players ${count}, enhanced ${enhanced}, round ${s.round}, phase ${s.phase}`,
          );
        } catch (error) {
          error.message += `\nseed=${seed} count=${count} enhanced=${enhanced} steps=${steps} round=${s.round} phase=${s.phase}\n${JSON.stringify(s.decision)}\n${s.log.slice(-5).join('\n')}`;
          throw error;
        }
        results.push({ enhanced, count, seed, steps, round: s.round });
      }
    }
  }
  console.log(
    `Simulation: ${results.length} games completed; max ${Math.max(...results.map((x) => x.steps))} actions, ${Math.max(...results.map((x) => x.round))} rounds.`,
  );
});
