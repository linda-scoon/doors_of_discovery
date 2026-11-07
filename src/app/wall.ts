import { RoomDefinition } from './rooms';
import { EmptyRoomComponent } from './components/rooms/empty-room/empty-room.component';

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
}

/** How many empty doors are shuffled in with the rooms on the first deck. */
const FIRST_DECK_EMPTY_DOORS = 24;

/** How many doors are shuffled together each time the deck runs out. */
const LATER_DECK_SIZE = 36;

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
 * Every door there is, in a different order on every visit.
 *
 * A door looks the same each time -- that comes from its id -- but where it
 * hangs does not. The rooms with something behind them are shuffled in with
 * the first doors, so they move about but are never far down. After that the
 * deck is dealt a batch at a time, each shuffled, for as long as anyone
 * keeps scrolling.
 */
export class Deck {
  private readonly waiting: WallDoor[];
  private nextDoorNumber = 1;

  constructor(
    private readonly rooms: readonly RoomDefinition[],
    private readonly random: () => number = Math.random
  ) {
    const registry = rooms.map((room, index) => ({ room, ordinal: index }));

    this.waiting = shuffle(
      [...registry, ...this.emptyDoors(FIRST_DECK_EMPTY_DOORS)],
      random
    );
  }

  /** The next doors to hang. */
  take(count: number): WallDoor[] {
    while (this.waiting.length < count) {
      this.waiting.push(...shuffle(this.emptyDoors(LATER_DECK_SIZE), this.random));
    }
    return this.waiting.splice(0, count);
  }

  /**
   * Doors with no API behind them yet, which open onto an empty room. Their
   * ids are stable, which is what lets each one keep the same colour,
   * material and face every time the page is loaded.
   */
  private emptyDoors(count: number): WallDoor[] {
    const doors: WallDoor[] = [];

    for (let i = 0; i < count; i += 1) {
      const number = this.nextDoorNumber++;
      doors.push({
        room: {
          id: `door-${number}`,
          name: `Door ${number}`,
          component: EmptyRoomComponent,
          isEmpty: true,
        },
        // Where it would have hung before the wall was shuffled, so every
        // door kept the number it had then.
        ordinal: this.rooms.length + number - 1,
      });
    }
    return doors;
  }
}
