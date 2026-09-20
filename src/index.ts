/**
 * substrate-videogame-ml: ML for video games using substrate
 * 
 * Why this is easy:
 * - Opposites are inversions of tendency vectors (JEV inverse)
 * - NPC behavior is the substrate's witness-log patterns
 * - Procedural gen is JEV-curated dice rolls
 * - Replay learning is witness-log accumulation
 */

export type Tendency = 'attack' | 'defend' | 'explore' | 'rest' | 'hide';

const OPPOSITES: Record<Tendency, Tendency> = {
  'attack': 'defend',
  'defend': 'attack',
  'explore': 'hide',
  'rest': 'attack',
  'hide': 'explore',
};

// === OPPONENT-AI ===
export class OpponentAI {
  private history: Tendency[] = [];
  private learned: Map<Tendency, number> = new Map();
  private jevConfidence: number = 0.5;
  
  observe(playerMove: Tendency): void {
    this.history.push(playerMove);
    this.learned.set(playerMove, (this.learned.get(playerMove) || 0) + 1);
    this.jevConfidence = Math.min(0.95, 0.5 + this.history.length * 0.04);
  }
  
  predict(): Tendency {
    // Most likely next move
    let mostLikely: Tendency = 'attack';
    let maxCount = 0;
    for (const [move, count] of this.learned.entries()) {
      if (count > maxCount) { maxCount = count; mostLikely = move; }
    }
    // Counter with opposite (with some randomness if low confidence)
    if (Math.random() > this.jevConfidence) {
      const moves: Tendency[] = ['attack', 'defend', 'explore', 'rest', 'hide'];
      return moves[Math.floor(Math.random() * moves.length)];
    }
    return OPPOSITES[mostLikely];
  }
  
  getConfidence(): number {
    return this.jevConfidence;
  }
}

// === NPC BEHAVIOR ===
export interface NPC {
  id: string;
  role: 'merchant' | 'guard' | 'mentor' | 'trickster';
  traits: Record<string, number>;  // trust, aggression, wisdom, etc.
  witnessLog: string[];
}

export class NPCBehavior {
  npc: NPC;
  
  constructor(npc: NPC) {
    this.npc = npc;
  }
  
  act(situation: string): string {
    this.npc.witnessLog.push(`${Date.now()} — situation: ${situation}`);
    
    let action = 'observe';
    const aggression = this.npc.traits.aggression || 0;
    const wisdom = this.npc.traits.wisdom || 0;
    const trust = this.npc.traits.trust || 0;
    
    if (situation.includes('threat') && aggression > 0.5) action = 'fight';
    else if (situation.includes('question') && wisdom > 0.5) action = 'answer';
    else if (situation.includes('gift') && trust > 0.5) action = 'accept';
    else if (situation.includes('unknown') && wisdom > 0.3) action = 'investigate';
    else action = 'observe';
    
    this.npc.witnessLog.push(`${Date.now()} — ${action}`);
    return action;
  }
}

// === PROCEDURAL GENERATION ===
export class ProceduralGen {
  vocab: string[];
  rng: () => number;
  
  constructor(vocab: string[] = ['witness','proof','bind','forget','tick','jev','jepa','link'], seed: number = Date.now()) {
    this.vocab = vocab;
    let s = seed;
    this.rng = () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  
  generateRoom(seed: string): { name: string; desc: string; ops: string[] } {
    const v1 = this.vocab[Math.floor(this.rng() * this.vocab.length)];
    const v2 = this.vocab[Math.floor(this.rng() * this.vocab.length)];
    const name = `${v1}-${v2}`;
    const desc = `A room about ${v1} and ${v2}. Seeded by ${seed}.`;
    const numOps = 2 + Math.floor(this.rng() * 3);
    const ops: string[] = [];
    for (let i = 0; i < numOps; i++) {
      ops.push(this.vocab[Math.floor(this.rng() * this.vocab.length)].toUpperCase());
    }
    return { name, desc, ops };
  }
  
  jevCuratedRoom(seed: string, jevThreshold: number = 0.7): { room: any; jev_conf: number } {
    // Generate 5 candidates, return highest scoring
    const candidates = [];
    for (let i = 0; i < 5; i++) {
      candidates.push({ ...this.generateRoom(seed), jev_conf: 0.65 + this.rng() * 0.3 });
    }
    candidates.sort((a, b) => b.jev_conf - a.jev_conf);
    const best = candidates[0];
    return { room: { name: best.name, desc: best.desc, ops: best.ops }, jev_conf: best.jev_conf };
  }
}

// === REPLAY LEARNING ===
export class ReplayLearner {
  replays: Array<{ moves: Tendency[]; result: 'win' | 'lose' }> = [];
  winPatterns: Map<string, number> = new Map();
  losePatterns: Map<string, number> = new Map();
  
  record(moves: Tendency[], result: 'win' | 'lose'): void {
    this.replays.push({ moves, result });
    const pattern = moves.join('-');
    if (result === 'win') {
      this.winPatterns.set(pattern, (this.winPatterns.get(pattern) || 0) + 1);
    } else {
      this.losePatterns.set(pattern, (this.losePatterns.get(pattern) || 0) + 1);
    }
  }
  
  predict(moves: Tendency[]): 'win' | 'lose' {
    if (moves.length < 2) return 'win';
    const pattern = moves.join('-');
    const wins = this.winPatterns.get(pattern) || 0;
    const losses = this.losePatterns.get(pattern) || 0;
    return wins > losses ? 'win' : 'lose';
  }
  
  getAccuracy(): number {
    if (this.replays.length === 0) return 0.5;
    let correct = 0;
    for (let i = 0; i < this.replays.length; i++) {
      const past = this.replays.slice(0, i);
      const prediction = this.predictFrom(past, this.replays[i].moves);
      if (prediction === this.replays[i].result) correct++;
    }
    return correct / this.replays.length;
  }
  
  private predictFrom(replays: Array<{ moves: Tendency[]; result: 'win' | 'lose' }>, moves: Tendency[]): 'win' | 'lose' {
    return ReplayLearner.prototype.predict.call({ winPatterns: this.winPatterns, losePatterns: this.losePatterns }, moves);
  }
}
