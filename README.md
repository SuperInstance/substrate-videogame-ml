# substrate-videogame-ml

ML for video games using substrate.

- **OpponentAI**: learns player tendency, plays opposite. JEV confidence grows with observations.
- **NPCBehavior**: trait-driven actions, witness-log per NPC
- **ProceduralGen**: JEV-curated dice rolls for room generation
- **ReplayLearner**: learns from replay data, predicts wins/losses

```typescript
import { OpponentAI, ProceduralGen } from 'substrate-videogame-ml';

const ai = new OpponentAI();
for (let i = 0; i < 10; i++) ai.observe('attack');
const counter = ai.predict();  // 'defend'

const gen = new ProceduralGen();
const room = gen.jevCuratedRoom('seed');
```
