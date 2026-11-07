import { RARITY_WEIGHTS, RoomDefinition, RoomKind } from './rooms';
import { pickWeighted } from './components/doors/door/door-material';

/** One door on the wall. */
export interface WallDoor {
  room: RoomDefinition;

  /**
   * The door's place in the unshuffled run of doors. It decides the door's
   * house number, and whether it is a 13, so it belongs to the door rather
   * than to wherever the door lands -- otherwise moving a door would change
   * its number, and a 13 would give a door a different face.
   */
  ordinal: number;

  /** Which kind of room it opens onto. */
  kind: string;
}

/** How many doors are shuffled together each time the deck runs out. */
const DECK_SIZE = 36;

/**
 * How many of the doors just hung a new one should differ from, so the same
 * kind of room does not turn up in a clump. Kept small: with only a handful
 * of kinds, a longer memory leaves so few to choose from that the wall falls
 * into a visible rota -- the jokes room every sixth door.
 */
const NO_REPEAT_WITHIN = 2;

/** How far ahead to look for a door that breaks up a clump. */
const LOOK_AHEAD = 12;

/**
 * Shuffles in place and returns the same array. Fisher-Yates: every order
 * is equally likely, which the obvious sort-by-random is not.
 */
export function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * The kind of room behind a door. Picked by rarity, and the same for a
 * given door every time, so a door always opens onto the same kind of
 * room -- though what is in it is fetched fresh each time it is opened.
 */
export function kindForDoor(id: string, kinds: readonly RoomKind[]): RoomKind {
  return pickWeighted(
    kinds.map((kind): [RoomKind, number] => [kind, RARITY_WEIGHTS[kind.rarity]]),
    `${id}:room`
  );
}

/**
 * Every door there is, in a different order on every visit.
 *
 * A door looks the same each time -- that comes from its id -- and opens
 * onto the same kind of room, but where it hangs does not stay put. The
 * deck is dealt a batch at a time, each shuffled, for as long as anyone
 * keeps scrolling, and kept from putting the same kind of room in a clump.
 */
export class Deck {
  private readonly waiting: WallDoor[] = [];
  private readonly recent: string[] = [];
  private nextDoorNumber = 1;

  constructor(
    private readonly kinds: readonly RoomKind[],
    private readonly random: () => number = Math.random
  ) {}

  /** The next doors to hang. */
  take(count: number): WallDoor[] {
    const dealt: WallDoor[] = [];
    while (dealt.length < count) dealt.push(this.next());
    return dealt;
  }

  private next(): WallDoor {
    while (this.waiting.length < LOOK_AHEAD) {
      this.waiting.push(...shuffle(this.doors(DECK_SIZE), this.random));
    }

    // The first door whose kind of room has not been seen lately -- or, if
    // every door in sight repeats one, the one whose kind was seen longest
    // ago, so at least it is not the same as the door just hung.
    let index = 0;
    let longestAgo = -1;
    this.waiting.slice(0, LOOK_AHEAD).forEach((door, i) => {
      const seen = this.recent.lastIndexOf(door.kind);
      const ago = seen === -1 ? Infinity : this.recent.length - seen;
      if (ago > longestAgo) {
        index = i;
        longestAgo = ago;
      }
    });
    const [door] = this.waiting.splice(index, 1);

    this.recent.push(door.kind);
    if (this.recent.length > NO_REPEAT_WITHIN) this.recent.shift();

    return door;
  }

  /**
   * The next run of doors, numbered in order. Their ids are stable, which is
   * what lets each one keep the same colour, material, face and room every
   * time the page is loaded.
   */
  private doors(count: number): WallDoor[] {
    const doors: WallDoor[] = [];

    for (let i = 0; i < count; i += 1) {
      const number = this.nextDoorNumber++;
      const id = `door-${number}`;
      const kind = kindForDoor(id, this.kinds);

      doors.push({
        room: {
          id,
          name: kind.name,
          component: kind.component,
          isEmpty: kind.isEmpty,
          needsDoorState: kind.needsDoorState,
        },
        // Where it would have hung before the wall was shuffled, so a door
        // keeps its number wherever it ends up.
        ordinal: number - 1,
        kind: kind.kind,
      });
    }
    return doors;
  }
}
