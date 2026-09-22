# substrate-videogame-ml

**ML for video games using the substrate.** Opponent AI that learns from observations, procedural generation that respects canon, replay learners that predict wins/losses.

## What this is

A library of ML primitives for substrate games:

- **OpponentAI**: learns player tendency, plays opposite. JEV confidence grows with observations.
- **NPCBehavior**: trait-driven actions, witness-log per NPC
- **ProceduralGen**: JEV-curated dice rolls for room generation
- **ReplayLearner**: learns from replay data, predicts wins/losses

## Usage

```typescript
import { OpponentAI, ProceduralGen } from 'substrate-videogame-ml';

const ai = new OpponentAI();
for (let i = 0; i < 10; i++) ai.observe('attack');
const counter = ai.predict();  // 'defend'

const gen = new ProceduralGen();
const room = gen.jevCuratedRoom('seed');
```

## The Opponent AI

The OpponentAI is the substrate's defense against predictable opponents. It works by:

1. **Observer phase**: the AI observes the player's actions and stores them in its witness-log
2. **Pattern detection**: after N observations, the AI looks for the player's tendency
3. **Anticipation**: the AI plays the OPPOSITE of the player's tendency

The opponent's confidence (JEV score) grows with each observation, so early-game the AI is predictable but late-game it's near-uncanny.

## Procedural Generation

ProceduralGen uses the JEV cosine scorer to **filter** procedurally generated rooms. The generator proposes candidate rooms (cells with exits, ops, items), and the JEV judge scores each one against the existing canon. Only rooms with score > 0.85 are kept.

This means generated rooms are canon-aligned by construction: they fit the established style and structure of the existing game.

## Replay Learner

ReplayLearner takes a saved game replay (a sequence of witness-log entries) and learns:

- **Win/loss prediction**: given the first N moves, what's the probability of winning?
- **Style clustering**: which players play similarly?
- **Critical moments**: which witness entries were decisive?

The predictions are made by a JEPA-style ridge regression on the embedding of each move.

## Architecture

```
   ┌─────────────────────────────────────────────┐
   │         substrate-videogame-ml               │
   │                                              │
   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  │
   │   │ Opponent │  │   NPC    │  │ Procedural│  │
   │   │   AI     │  │ Behavior │  │    Gen    │  │
   │   └────┬─────┘  └────┬─────┘  └─────┬────┘  │
   │        │             │              │        │
   │        └─────────────┴──────────────┘        │
   │                      │                      │
   │                      ▼                      │
   │            ┌──────────────────┐             │
   │            │   Substrate      │             │
   │            │   Witness Log    │             │
   │            └──────────────────┘             │
   │                      │                      │
   │                      ▼                      │
   │            ┌──────────────────┐             │
   │            │   JEV cosine     │             │
   │            │   scorer         │             │
   │            └──────────────────┘             │
   └─────────────────────────────────────────────┘
```

## Why this matters

Most game AI is either:
1. **Hand-crafted** (rules-based, predictable, exploitable)
2. **Learned from humans** (deep RL, hard to debug, no canon)

The substrate-videogame-ml approach is **observation-driven**: the AI learns from its own witness-log, scored against canon. This gives:

- **Debuggability**: every prediction is explainable as a cosine score
- **Canon-alignment**: the AI plays canon-style, not random
- **Adaptability**: the AI learns from every player's moves

## In the substrate

Part of the SuperInstance substrate-* family. Powers:
- Opponent AI in cargo-line-tycoon
- Procedurally generated ports and routes
- Win/loss prediction in replays

## License

MIT
