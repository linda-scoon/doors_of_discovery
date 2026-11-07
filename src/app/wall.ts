import { RoomDefinition } from './rooms';
import {
  DOOR_SPANS,
  DoorSize,
  sizeForDoor,
} from './components/doors/door/door-material';
import { EmptyRoomComponent } from './components/rooms/empty-room/empty-room.component';

/** One door, and how much of the wall it takes up. */
export interface WallDoor {
  room: RoomDefinition;

  /**
   * The door's place in the unshuffled run of doors. It decides the door's
   * house number, and whether it is a 13, so it belongs to the door rather
   * than to wherever the door lands -- otherwise moving a door would change
   * its number, and a 13 would give a door a different face.
   */
  ordinal: number;

  size: DoorSize;
}

/** A door once it is on the wall: which cell its top-left corner is in. */
export interface HungDoor extends WallDoor {
  /** Counted from zero. */
  row: number;
  /** Counted from zero. */
  col: number;
  /** The same, as a CSS grid-area: where the door starts and how far it reaches. */
  gridArea: string;
}

/** How many empty doors are shuffled in with the rooms on the first deck. */
const FIRST_DECK_EMPTY_DOORS = 24;

/** How many doors are shuffled together each time the deck runs out. */
const LATER_DECK_SIZE = 36;

/**
 * How far down the deck to look for a door that fits the next gap. Far
 * enough that a narrow door usually turns up, short enough that the
 * shuffled order is only nudged, not undone.
 */
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
 * Every door there is, in a different order on every visit.
 *
 * A door looks the same each time -- that comes from its id -- but where it
 * hangs does not. The rooms with something behind them are shuffled in with
 * the first doors, so they move about but are never far down. After that the
 * deck is dealt a batch at a time, each shuffled, for as long as anyone
 * keeps scrolling. Once dealt the order is fixed, so laying the wall out
 * again for a different screen width uses the same doors in the same order.
 */
export class Deck {
  private readonly doors: WallDoor[];
  private nextDoorNumber = 1;

  constructor(
    private readonly rooms: readonly RoomDefinition[],
    private readonly random: () => number = Math.random
  ) {
    const registry = rooms.map((room, index) => ({
      room,
      ordinal: index,
      size: room.size ?? sizeForDoor(room.id, !room.isEmpty),
    }));

    this.doors = shuffle(
      [...registry, ...this.emptyDoors(FIRST_DECK_EMPTY_DOORS)],
      random
    );
  }

  /** The door at this place in the deck. */
  at(index: number): WallDoor {
    while (this.doors.length <= index) {
      this.doors.push(...shuffle(this.emptyDoors(LATER_DECK_SIZE), this.random));
    }
    return this.doors[index];
  }

  /**
   * Doors with no API behind them yet, which open onto an empty room. Their
   * ids are stable, which is what lets each one keep the same colour,
   * material, face and size every time the page is loaded.
   */
  private emptyDoors(count: number): WallDoor[] {
    const doors: WallDoor[] = [];

    for (let i = 0; i < count; i += 1) {
      const number = this.nextDoorNumber++;
      const id = `door-${number}`;
      doors.push({
        room: {
          id,
          name: `Door ${number}`,
          component: EmptyRoomComponent,
          isEmpty: true,
        },
        // Where it would have hung before the wall was shuffled, so every
        // door kept the number it had then.
        ordinal: this.rooms.length + number - 1,
        size: sizeForDoor(id, false),
      });
    }
    return doors;
  }
}

/** Cupboards are numbered well clear of the doors, so they never share an ordinal. */
const CUPBOARD_ORDINALS = 1_000_000;

/**
 * How many doors may go up ahead of the longest-waiting one before it is
 * hung anyway, in the first place it fits.
 */
const PATIENCE = 3;

/** The widest a door gets, in cells. A wall narrower than this could not hang it. */
const WIDEST_DOOR = Math.max(...Object.values(DOOR_SPANS).map((span) => span.cols));

/**
 * Hangs doors on a wall of a given width, with no gaps.
 *
 * It fills the first empty cell -- reading the wall like a page, left to
 * right and down -- with the first door in the next few that fits there.
 * When none does, it puts up a cupboard just big enough for the gap.
 *
 * A big door can be passed over for a long time that way, since it only
 * fits where a wide stretch of wall is clear, and the rooms are mostly big
 * doors. So a door that has waited too long is hung in the first place it
 * does fit, and the cells it skipped are filled in behind it.
 *
 * Nothing placed ever moves, so new doors can be hung below as the visitor
 * scrolls without the ones already on screen jumping about.
 *
 * Positions are worked out here rather than left to CSS Grid's dense
 * packing. Dense packing fills a gap only if a door that fits happens to
 * come along, so it left holes wherever the shuffle dealt a run of wide
 * doors.
 */
export class WallLayout {
  /** One row per array, true where a cell is taken. */
  private readonly taken: boolean[][] = [];

  /** Doors drawn from the deck that did not fit yet, in deck order. */
  private readonly waiting: WallDoor[] = [];

  private nextDeckIndex = 0;
  private nextCupboardNumber = 1;

  /** How many doors have gone up since the longest-waiting one was first passed over. */
  private passedOver = 0;

  /** The first cell that might be empty; everything before it is full. */
  private cursor = 0;

  /** How many doors from the deck are up, cupboards aside. */
  dealt = 0;

  constructor(
    private readonly deck: Deck,
    readonly cols: number
  ) {
    if (cols < WIDEST_DOOR) {
      throw new Error(`A wall ${cols} cells across is too narrow for a ${WIDEST_DOOR}-cell door`);
    }
  }

  /**
   * Hangs at least the next `count` doors from the deck, plus any cupboards
   * needed, and carries on until there are no gaps above the bottom edge.
   */
  hang(count: number): HungDoor[] {
    const hung: HungDoor[] = [];
    const target = this.dealt + count;

    while (this.dealt < target || this.hasGap()) {
      this.drawUpTo(LOOK_AHEAD);

      // Only while dealing. Once the count is reached the job is closing
      // gaps, and a door hung further down would open new ones.
      if (this.dealt < target && this.passedOver >= PATIENCE) {
        const door = this.waiting.shift()!;
        const { row, col } = this.firstPlaceFor(door);
        hung.push(this.place(door, row, col));
        this.dealt += 1;
        this.passedOver = 0;
        continue;
      }

      const { row, col } = this.firstEmptyCell();
      const index = this.waiting.findIndex((door) => this.fits(door.size, row, col));

      if (index >= 0) {
        const [door] = this.waiting.splice(index, 1);
        hung.push(this.place(door, row, col));
        this.dealt += 1;
        this.passedOver = index === 0 ? 0 : this.passedOver + 1;
      } else {
        hung.push(this.place(this.cupboard(row, col), row, col));
        this.passedOver += 1;
      }
    }
    return hung;
  }

  /** The first cell, from the first empty one on, where this door fits. */
  private firstPlaceFor(door: WallDoor): { row: number; col: number } {
    for (let cell = this.cursor; ; cell += 1) {
      const row = Math.floor(cell / this.cols);
      const col = cell % this.cols;
      if (this.fits(door.size, row, col)) return { row, col };
    }
  }

  /**
   * Whether an empty cell has a door somewhere below it. The ragged edge at
   * the bottom is not a gap -- it is where the next doors go -- but a cell
   * a door was hung past is, and has to be filled before anyone sees it.
   */
  private hasGap(): boolean {
    const top = this.firstEmptyCell().row;

    for (let col = 0; col < this.cols; col += 1) {
      let empty = false;
      for (let row = top; row < this.taken.length; row += 1) {
        if (!this.taken[row][col]) empty = true;
        else if (empty) return true;
      }
    }
    return false;
  }

  private drawUpTo(count: number): void {
    while (this.waiting.length < count) {
      this.waiting.push(this.deck.at(this.nextDeckIndex++));
    }
  }

  /**
   * A cupboard for a gap no door would fit. A broom cupboard when there is
   * height for one, since a column of tiny ones looks like a filing cabinet.
   */
  private cupboard(row: number, col: number): WallDoor {
    const number = this.nextCupboardNumber++;
    return {
      room: {
        id: `cupboard-${number}`,
        name: `Cupboard ${number}`,
        component: EmptyRoomComponent,
        isEmpty: true,
      },
      ordinal: CUPBOARD_ORDINALS + number,
      size: this.fits('tall', row, col) ? 'tall' : 'tiny',
    };
  }

  private place(door: WallDoor, row: number, col: number): HungDoor {
    const span = DOOR_SPANS[door.size];
    for (let r = row; r < row + span.rows; r += 1) {
      for (let c = col; c < col + span.cols; c += 1) {
        this.row(r)[c] = true;
      }
    }
    return {
      ...door,
      row,
      col,
      gridArea: `${row + 1} / ${col + 1} / span ${span.rows} / span ${span.cols}`,
    };
  }

  private fits(size: DoorSize, row: number, col: number): boolean {
    const span = DOOR_SPANS[size];
    if (col + span.cols > this.cols) return false;

    for (let r = row; r < row + span.rows; r += 1) {
      for (let c = col; c < col + span.cols; c += 1) {
        if (this.row(r)[c]) return false;
      }
    }
    return true;
  }

  private firstEmptyCell(): { row: number; col: number } {
    for (;;) {
      const row = Math.floor(this.cursor / this.cols);
      const col = this.cursor % this.cols;
      if (!this.row(row)[col]) return { row, col };
      this.cursor += 1;
    }
  }

  private row(index: number): boolean[] {
    while (this.taken.length <= index) {
      this.taken.push(new Array<boolean>(this.cols).fill(false));
    }
    return this.taken[index];
  }
}
