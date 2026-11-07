import { ROOM_KINDS, RoomKind } from './rooms';
import { Deck, kindForDoor, shuffle } from './wall';

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

describe('kindForDoor', () => {
  it('gives a door the same kind of room every time', () => {
    expect(kindForDoor('door-7', ROOM_KINDS)).toBe(kindForDoor('door-7', ROOM_KINDS));
  });

  it('makes rare rooms rare and common rooms common', () => {
    const counts = new Map<string, number>();
    for (let i = 1; i <= 10_000; i += 1) {
      const kind = kindForDoor(`door-${i}`, ROOM_KINDS).kind;
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }

    const rare = ROOM_KINDS.filter((k) => k.rarity === 'rare');
    const common = ROOM_KINDS.filter((k) => k.rarity === 'common');
    const fewestCommon = Math.min(...common.map((k) => counts.get(k.kind) ?? 0));
    const mostRare = Math.max(...rare.map((k) => counts.get(k.kind) ?? 0));

    expect(mostRare * 4).toBeLessThan(fewestCommon);
  });
});

describe('Deck', () => {
  it('deals the doors in a different order on different visits', () => {
    const order = (seed: number) =>
      new Deck(ROOM_KINDS, seeded(seed)).take(30).map((door) => door.id);

    expect(order(1)).not.toEqual(order(2));
  });

  it('keeps each door the same wherever it is dealt', () => {
    const doors = (seed: number) =>
      new Map(
        new Deck(ROOM_KINDS, seeded(seed))
          .take(30)
          .map((door) => [door.id, door.bricks ? 'bricks' : `${door.kind}#${door.ordinal}`])
      );

    const second = doors(2);
    doors(1).forEach((door, id) => {
      if (second.has(id)) expect(second.get(id)).toBe(door);
    });
  });

  it('never deals the same door twice', () => {
    const ids = new Deck(ROOM_KINDS, seeded(4)).take(300).map((door) => door.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the same kind of room from turning up in a clump', () => {
    // Enough kinds that it is always possible.
    const kinds: RoomKind[] = ROOM_KINDS.filter((k) => k.rarity === 'common');
    const dealt = new Deck(kinds, seeded(9)).take(200).map((door) => door.kind);

    let repeats = 0;
    for (let i = 1; i < dealt.length; i += 1) {
      if (dealt[i] === dealt[i - 1]) repeats += 1;
    }
    expect(repeats).toBe(0);
  });

  it('leaves about one cell in sixteen as bare wall, never two together', () => {
    const cells = new Deck(ROOM_KINDS, seeded(6)).take(1600);
    const bricks = cells.filter((cell) => cell.bricks).length;

    expect(bricks).toBeGreaterThan(60);
    expect(bricks).toBeLessThan(150);
    for (let i = 1; i < cells.length; i += 1) {
      expect(cells[i].bricks && cells[i - 1].bricks).toBeFalsy();
    }
  });
});
