import { Type } from '@angular/core';

import { FactRoomComponent } from './components/rooms/fact-room/fact-room.component';
import { GifRoomComponent } from './components/rooms/gif-room/gif-room.component';
import { PaintingRoomComponent } from './components/rooms/painting-room/painting-room.component';
import { PhotoRoomComponent } from './components/rooms/photo-room/photo-room.component';
import { JokesRoomComponent } from './components/rooms/jokes-room/jokes-room.component';
import { MusicRoomComponent } from './components/rooms/music-room/music-room.component';
import { QoutesRoomComponent } from './components/rooms/qoutes-room/qoutes-room.component';
import { VideoRoomComponent } from './components/rooms/video-room/video-room.component';
import { EmptyRoomComponent } from './components/rooms/empty-room/empty-room.component';
import { TriviaRoomComponent } from './components/rooms/trivia-room/trivia-room.component';
import { WikipediaRoomComponent } from './components/rooms/wikipedia-room/wikipedia-room.component';
import { OnThisDayRoomComponent } from './components/rooms/on-this-day-room/on-this-day-room.component';
import { IssRoomComponent } from './components/rooms/iss-room/iss-room.component';
import { WeatherRoomComponent } from './components/rooms/weather-room/weather-room.component';
import { AnimalRoomComponent } from './components/rooms/animal-room/animal-room.component';
import { RadioRoomComponent } from './components/rooms/radio-room/radio-room.component';
import { RecipeRoomComponent } from './components/rooms/recipe-room/recipe-room.component';
import { FilmRoomComponent } from './components/rooms/film-room/film-room.component';
import { TarotRoomComponent } from './components/rooms/tarot-room/tarot-room.component';
import { StoryRoomComponent } from './components/rooms/story-room/story-room.component';
import { WheelRoomComponent } from './components/rooms/wheel-room/wheel-room.component';
import { TicTacToeRoomComponent } from './components/rooms/tic-tac-toe-room/tic-tac-toe-room.component';

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

  /**
   * There is nothing behind this door yet.
   *
   * Such a door is never stuck. A door that will not open onto a room with
   * nothing in it is two disappointments rather than one, and the stuck
   * ones are only worth meeting when there is something to find.
   */
  isEmpty?: boolean;

  /** Which side the handle is on. Defaults to the right. */
  handleSide?: HandleSide;

  /** The component that presents whatever is behind the door. */
  component: Type<unknown>;

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

  component: Type<unknown>;

  rarity: Rarity;

  /** See RoomDefinition. */
  isEmpty?: boolean;

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
 * A new room needs a component to present what it shows, a line here, and,
 * if it calls an API, an entry in server/apis.js.
 */
export const ROOM_KINDS: readonly RoomKind[] = [
  { kind: 'jokes', name: 'Jokes Room', component: JokesRoomComponent, rarity: 'common' },
  { kind: 'facts', name: 'Fact Room', component: FactRoomComponent, rarity: 'common' },
  { kind: 'quotes', name: 'Quotes Room', component: QoutesRoomComponent, rarity: 'common' },
  { kind: 'paintings', name: 'Gallery', component: PaintingRoomComponent, rarity: 'common' },
  { kind: 'photos', name: 'Photo Room', component: PhotoRoomComponent, rarity: 'common' },
  { kind: 'gifs', name: 'Gif Room', component: GifRoomComponent, rarity: 'common' },
  { kind: 'videos', name: 'Video Room', component: VideoRoomComponent, rarity: 'common' },
  {
    kind: 'music',
    name: 'Music Room',
    component: MusicRoomComponent,
    rarity: 'common',
    needsDoorState: true,
  },
  { kind: 'trivia', name: 'Quiz Room', component: TriviaRoomComponent, rarity: 'common' },
  { kind: 'wikipedia', name: 'Library', component: WikipediaRoomComponent, rarity: 'common' },
  { kind: 'onthisday', name: 'History Room', component: OnThisDayRoomComponent, rarity: 'common' },
  { kind: 'animals', name: 'Pet Room', component: AnimalRoomComponent, rarity: 'common' },
  {
    kind: 'radio',
    name: 'Radio Room',
    component: RadioRoomComponent,
    rarity: 'common',
    needsDoorState: true,
  },
  { kind: 'recipe', name: 'Kitchen', component: RecipeRoomComponent, rarity: 'common' },

  // A set that comes round again: 78 cards, fifty stories, fifty-odd cities,
  // and films that are heavy enough to load that they should not be
  // everywhere.
  { kind: 'story', name: 'Story Room', component: StoryRoomComponent, rarity: 'uncommon' },
  { kind: 'tarot', name: 'Fortune Teller', component: TarotRoomComponent, rarity: 'uncommon' },
  { kind: 'weather', name: 'Window Room', component: WeatherRoomComponent, rarity: 'uncommon' },
  { kind: 'films', name: 'Cinema', component: FilmRoomComponent, rarity: 'uncommon' },

  // Much the same every time, so only now and then.
  { kind: 'iss', name: 'Observatory', component: IssRoomComponent, rarity: 'rare' },
  { kind: 'wheel', name: 'Wheel Room', component: WheelRoomComponent, rarity: 'rare' },
  { kind: 'tictactoe', name: 'Games Room', component: TicTacToeRoomComponent, rarity: 'rare' },

  // Kept, rarely: an empty room is a pause in the wall, and it is where the
  // next room goes.
  {
    kind: 'empty',
    name: 'Empty Room',
    component: EmptyRoomComponent,
    rarity: 'rare',
    isEmpty: true,
  },
];
