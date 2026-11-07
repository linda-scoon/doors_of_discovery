import { Type } from '@angular/core';


import { HandleSide, OpenStyle } from './components/doors/door/door.component';
import { DoorMaterial } from './components/doors/door/door-material';

/** One door, and what is behind it. */
export interface RoomDefinition {
  /** The door's identity. Everything about how it looks comes from this. */
  id: string;

  /** Shown to people, and used to build the door's accessible name. */
  name: string;

  /**
   * What the door is made of. Decides how it looks, and later how it sounds.
   * Derived from the id when left out, so a new room needs nothing here.
   */
  material?: DoorMaterial;

  /**
   * The colour of this room's door. Derived from the id and material when
   * left out, which is the usual case — there is no need to pick a hex code
   * for a new room.
   */
  colour?: string;

  /** How the door behaves when opened. Some doors are stuck and never do. */
  openStyle?: OpenStyle;

  /** Which side the handle is on. Defaults to the right. */
  handleSide?: HandleSide;

  /**
   * Fetches the component that presents whatever is behind the door. Each
   * room's code is its own small file, loaded the first time one of its
   * doors is opened, so the page does not download two dozen rooms up front.
   */
  load: () => Promise<Type<unknown>>;

  /**
   * Set when the room's component needs to know whether its door is open —
   * the music room only mounts its autoplaying <audio> once it is, so sound
   * does not come from behind a closed door. Such a component must declare
   * an `open` input.
   */
  needsDoorState?: boolean;
}

/**
 * How often a kind of room turns up.
 *
 * By how different it is each time. A room that fetches something new on
 * every visit -- a fact, a painting, a joke -- can be behind any number of
 * doors. One that is much the same every time is only worth meeting now and
 * then, or the wall starts to repeat itself.
 */
export type Rarity = 'common' | 'uncommon' | 'rare';

export const RARITY_WEIGHTS: Readonly<Record<Rarity, number>> = {
  common: 10,
  uncommon: 4,
  rare: 1,
};

/** A kind of room. Any number of doors can open onto the same kind. */
export interface RoomKind {
  /** Names the kind. Where it has an API, matches its route in server/apis.js. */
  kind: string;

  /** Shown to people, and used to build the door's accessible name. */
  name: string;

  /** See RoomDefinition. */
  load: () => Promise<Type<unknown>>;

  rarity: Rarity;

  /** See RoomDefinition. */
  needsDoorState?: boolean;
}

/**
 * Every kind of room there is.
 *
 * The wall is built from this: each door is given one of these, picked by
 * rarity and the same for that door on every visit. Add an entry and doors
 * start opening onto it; remove one and they stop.
 *
 * A new room needs a component to present what it shows, a line here that
 * loads it, and, if it calls an API, an entry in server/apis.js.
 */
export const ROOM_KINDS: readonly RoomKind[] = [
  {
    kind: 'jokes',
    name: 'Jokes Room',
    load: () =>
      import('./components/rooms/jokes-room/jokes-room.component').then((m) => m.JokesRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'facts',
    name: 'Fact Room',
    load: () =>
      import('./components/rooms/fact-room/fact-room.component').then((m) => m.FactRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'quotes',
    name: 'Quotes Room',
    load: () =>
      import('./components/rooms/qoutes-room/qoutes-room.component').then((m) => m.QoutesRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'paintings',
    name: 'Gallery',
    load: () =>
      import('./components/rooms/painting-room/painting-room.component').then((m) => m.PaintingRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'photos',
    name: 'Photo Room',
    load: () =>
      import('./components/rooms/photo-room/photo-room.component').then((m) => m.PhotoRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'books',
    name: 'Bookshop',
    load: () =>
      import('./components/rooms/book-room/book-room.component').then((m) => m.BookRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'gifs',
    name: 'Gif Room',
    load: () =>
      import('./components/rooms/gif-room/gif-room.component').then((m) => m.GifRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'videos',
    name: 'Video Room',
    load: () =>
      import('./components/rooms/video-room/video-room.component').then((m) => m.VideoRoomComponent),
    rarity: 'common',
    needsDoorState: true,
  },
  {
    kind: 'music',
    name: 'Music Room',
    load: () =>
      import('./components/rooms/music-room/music-room.component').then((m) => m.MusicRoomComponent),
    rarity: 'common',
    needsDoorState: true,
  },
  {
    kind: 'trivia',
    name: 'Quiz Room',
    load: () =>
      import('./components/rooms/trivia-room/trivia-room.component').then((m) => m.TriviaRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'wikipedia',
    name: 'Library',
    load: () =>
      import('./components/rooms/wikipedia-room/wikipedia-room.component').then((m) => m.WikipediaRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'onthisday',
    name: 'History Room',
    load: () =>
      import('./components/rooms/on-this-day-room/on-this-day-room.component').then((m) => m.OnThisDayRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'animals',
    name: 'Pet Room',
    load: () =>
      import('./components/rooms/animal-room/animal-room.component').then((m) => m.AnimalRoomComponent),
    rarity: 'common',
  },
  {
    kind: 'radio',
    name: 'Radio Room',
    load: () =>
      import('./components/rooms/radio-room/radio-room.component').then((m) => m.RadioRoomComponent),
    rarity: 'common',
    needsDoorState: true,
  },
  {
    kind: 'recipe',
    name: 'Kitchen',
    load: () =>
      import('./components/rooms/recipe-room/recipe-room.component').then((m) => m.RecipeRoomComponent),
    rarity: 'common',
  },

  // A set that comes round again: 78 cards, fifty stories, fifty-odd cities.
  {
    kind: 'story',
    name: 'Story Room',
    load: () =>
      import('./components/rooms/story-room/story-room.component').then((m) => m.StoryRoomComponent),
    rarity: 'uncommon',
  },
  {
    kind: 'tarot',
    name: 'Fortune Teller',
    load: () =>
      import('./components/rooms/tarot-room/tarot-room.component').then((m) => m.TarotRoomComponent),
    rarity: 'uncommon',
  },
  {
    kind: 'weather',
    name: 'Window Room',
    load: () =>
      import('./components/rooms/weather-room/weather-room.component').then((m) => m.WeatherRoomComponent),
    rarity: 'uncommon',
  },

  {
    kind: 'moon',
    name: 'Moon Room',
    load: () => import('./components/rooms/moon-room/moon-room.component').then((m) => m.MoonRoomComponent),
    rarity: 'uncommon',
  },

  // Much the same every time, so only now and then.
  {
    kind: 'iss',
    name: 'Observatory',
    load: () =>
      import('./components/rooms/iss-room/iss-room.component').then((m) => m.IssRoomComponent),
    rarity: 'rare',
  },
  {
    kind: 'wheel',
    name: 'Wheel Room',
    load: () =>
      import('./components/rooms/wheel-room/wheel-room.component').then((m) => m.WheelRoomComponent),
    rarity: 'rare',
  },
  {
    kind: 'tictactoe',
    name: 'Games Room',
    load: () =>
      import('./components/rooms/tic-tac-toe-room/tic-tac-toe-room.component').then((m) => m.TicTacToeRoomComponent),
    rarity: 'rare',
  },
];
