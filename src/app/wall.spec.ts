import { DOOR_SPANS } from './components/doors/door/door-material';
import { ROOMS } from './rooms';
import { Deck, HungDoor, WallLayout, shuffle } from './wall';

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

/** Which door covers each cell, row by row. Throws if two doors overlap. */
function cellsOf(doors: HungDoor[], cols: number): (string | null)[][] {
  const grid: (string | null)[][] = [];
  for (const door of doors) {
    const span = DOOR_SPANS[door.size];
    expect(door.col + span.cols).toBeLessThanOrEqual(cols);

    for (let r = door.row; r < door.row + span.rows; r += 1) {
      while (grid.length <= r) grid.push(new Array(cols).fill(null));
      for (let c = door.col; c < door.col + span.cols; c += 1) {
        if (grid[r][c]) throw new Error(`${door.room.id} overlaps ${grid[r][c]}`);
        grid[r][c] = door.room.id;
      }
    }
  }
  return grid;
}

const WIDTHS = [4, 6, 8, 10];
const SEEDS = Array.from({ length: 25 }, (_unused, i) => i + 1);

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
      Array.from({ length: 30 }, (_unused, i) => new Deck(ROOMS, seeded(seed)).at(i).room.id);

    expect(order(1)).not.toEqual(order(2));
  });

  it('keeps each door the same wherever it is dealt', () => {
    const byId = (seed: number) => {
      const deck = new Deck(ROOMS, seeded(seed));
      const doors = new Map<string, unknown>();
      for (let i = 0; i < 120; i += 1) {
        const door = deck.at(i);
        doors.set(door.room.id, { ordinal: door.ordinal, size: door.size });
      }
      return doors;
    };

    // Later decks are cut from the run at different points, so compare
    // only the doors both visits dealt.
    const second = byId(2);
    byId(1).forEach((door, id) => {
      if (second.has(id)) expect(second.get(id)).toEqual(door);
    });
  });

  it('shuffles the rooms in with the first doors, so none is far down', () => {
    for (const seed of SEEDS) {
      const deck = new Deck(ROOMS, seeded(seed));
      const firstDeck = Array.from({ length: ROOMS.length + 24 }, (_unused, i) => deck.at(i).room.id);

      ROOMS.forEach((room) => expect(firstDeck).toContain(room.id));
    }
  });
});

describe('WallLayout', () => {
  for (const cols of WIDTHS) {
    it(`leaves no gaps and no overlaps ${cols} cells across`, () => {
      for (const seed of SEEDS) {
        const layout = new WallLayout(new Deck(ROOMS, seeded(seed)), cols);
        const doors = [...layout.hang(33), ...layout.hang(12), ...layout.hang(12)];
        const grid = cellsOf(doors, cols);

        // A gap is an empty cell with a door somewhere below it. The ragged
        // edge at the bottom is not a gap; it is where the next doors go.
        for (let c = 0; c < cols; c += 1) {
          const lowest = grid.map((row) => row[c]).lastIndexOf(
            grid.map((row) => row[c]).filter(Boolean).pop() ?? null
          );
          for (let r = 0; r < lowest; r += 1) {
            expect(grid[r][c]).withContext(`seed ${seed}, cell ${r},${c}`).not.toBeNull();
          }
        }
      }
    });
  }

  it('hangs every room within the first couple of screens', () => {
    for (const cols of WIDTHS) {
      for (const seed of SEEDS) {
        const layout = new WallLayout(new Deck(ROOMS, seeded(seed)), cols);
        const ids = layout.hang(ROOMS.length + 24 + 12).map((door) => door.room.id);

        ROOMS.forEach((room) =>
          expect(ids).withContext(`${cols} across, seed ${seed}`).toContain(room.id)
        );
      }
    }
  });

  it('does not move a door once it is hung', () => {
    const deck = new Deck(ROOMS, seeded(3));
    const inBatches = new WallLayout(deck, 6);
    const batched = [...inBatches.hang(33), ...inBatches.hang(12)];
    const atOnce = new WallLayout(deck, 6).hang(inBatches.dealt);

    // Laying the same doors out again gives the same wall, which is what a
    // change of screen width relies on. It may run a door or two further,
    // to close a gap the batches closed sooner.
    expect(atOnce.slice(0, batched.length)).toEqual(batched);
  });

  it('only puts up cupboards small enough to fill a gap', () => {
    const layout = new WallLayout(new Deck(ROOMS, seeded(5)), 4);
    const cupboards = layout.hang(200).filter((door) => door.room.id.startsWith('cupboard-'));

    cupboards.forEach((cupboard) => expect(['tiny', 'tall']).toContain(cupboard.size));
    expect(new Set(cupboards.map((c) => c.room.id)).size).toBe(cupboards.length);
  });

  it('tells each door which cells it covers, in CSS terms', () => {
    const [door] = new WallLayout(new Deck(ROOMS, seeded(1)), 10).hang(1);
    const span = DOOR_SPANS[door.size];

    expect(door.gridArea).toBe(`1 / 1 / span ${span.rows} / span ${span.cols}`);
  });
});
