import { test } from 'node:test';
import assert from 'node:assert';
import { OpponentAI, NPCBehavior, ProceduralGen, ReplayLearner } from '../index.ts';

test('OpponentAI learns', () => {
  const ai = new OpponentAI();
  for (let i = 0; i < 5; i++) ai.observe('attack');
  assert.strictEqual(ai.getConfidence() > 0.65, true);
});

test('OpponentAI predicts opposite of common move', () => {
  const ai = new OpponentAI();
  for (let i = 0; i < 10; i++) ai.observe('attack');
  // AI should counter with defend
  const p = ai.predict();
  assert.strictEqual(p, 'defend');
});

test('NPCBehavior acts based on traits', () => {
  const npc = new NPCBehavior({
    id: 'mentor',
    role: 'mentor',
    traits: { wisdom: 0.9, aggression: 0.1, trust: 0.7 },
    witnessLog: [],
  });
  const action = npc.act('a question is asked');
  assert.ok(['observe', 'answer', 'investigate'].includes(action));
});

test('ProceduralGen generates room', () => {
  const gen = new ProceduralGen(['witness','proof','bind']);
  const r = gen.generateRoom('test');
  assert.ok(r.name);
  assert.ok(r.desc);
  assert.ok(r.ops.length > 0);
});

test('ProceduralGen JEV curated', () => {
  const gen = new ProceduralGen(['witness','proof']);
  const r = gen.jevCuratedRoom('test');
  assert.ok(r.jev_conf >= 0.65);
});

test('ReplayLearner records and predicts', () => {
  const rl = new ReplayLearner();
  rl.record(['attack', 'defend'], 'win');
  rl.record(['attack', 'defend'], 'win');
  assert.strictEqual(rl.predict(['attack', 'defend']), 'win');
});
