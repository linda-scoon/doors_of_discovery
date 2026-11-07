import { ROOMS } from './rooms';
import { Deck, shuffle } from './wall';

/** A random number generator that can be replayed, so a failure can be too. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('shuffle', () => {
  it('keeps every item, and only changes the order', () => {
    const items = Array.from({ length: 50 }, (_unused, i) => i);
    const shuffled = shuffle([...items], seeded(1));

    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
    expect(shuffled).not.toEqual(items);
  });
});

describe('Deck', () => {
  it('deals the doors in a different order on different visits', () => {
    const order = (seed: number) =>
      new Deck(ROOMS, seeded(seed)).take(30).map((door) => door.room.id);

    expect(order(1)).not.toEqual(order(2));
  });

  it('keeps each door the same wherever it is dealt', () => {
    const ordinals = (seed: number) =>
      new Map(
        new Deck(ROOMS, seeded(seed)).take(ROOMS.length + 24).map((door) => [door.room.id, door.ordinal])
      );

    // The first deck is the same doors every visit, so they can be compared
    // one for one.
    expect(ordinals(2)).toEqual(ordinals(1));
  });

  it('shuffles every room in with the first doors, so none is far down', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const ids = new Deck(ROOMS, seeded(seed)).take(ROOMS.length + 24).map((door) => door.room.id);
      ROOMS.forEach((room) => expect(ids).toContain(room.id));
    }
  });

  it('never deals the same door twice', () => {
    const ids = new Deck(ROOMS, seeded(4)).take(300).map((door) => door.room.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
