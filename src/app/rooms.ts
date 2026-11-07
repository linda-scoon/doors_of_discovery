import { Type } from '@angular/core';

import { FactRoomComponent } from './components/rooms/fact-room/fact-room.component';
import { GameRoomComponent } from './components/rooms/game-room/game-room.component';
import { GifRoomComponent } from './components/rooms/gif-room/gif-room.component';
import { ImageRoomComponent } from './components/rooms/image-room/image-room.component';
import { JokesRoomComponent } from './components/rooms/jokes-room/jokes-room.component';
import { MusicRoomComponent } from './components/rooms/music-room/music-room.component';
import { QoutesRoomComponent } from './components/rooms/qoutes-room/qoutes-room.component';
import { StoryRoomComponent } from './components/rooms/story-room/story-room.component';
import { VideoRoomComponent } from './components/rooms/video-room/video-room.component';

import { HandleSide, OpenStyle } from './components/doors/door/door.component';
import { DoorMaterial } from './components/doors/door/door-material';

/** One door, and what is behind it. */
export interface RoomDefinition {
  /** Matches the room's route in server/apis.js, where its API key lives. */
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
 * Every door on the site, in the order they appear.
 *
 * This is the list the home page is built from — add an entry and a door
 * appears, complete with its own open/close behaviour, with no changes to
 * the page itself. Removing an entry removes the door.
 *
 * A new room needs three things: an entry in server/apis.js so the server
 * can reach its API with a key, a component to present the result, and a
 * line here.
 */
export const ROOMS: RoomDefinition[] = [
  { id: 'gifs', name: 'Gif Room', component: GifRoomComponent },
  { id: 'game', name: 'Game Room', component: GameRoomComponent, openStyle: 'stuck' },
  { id: 'quotes', name: 'Quotes Room', component: QoutesRoomComponent },
  { id: 'images', name: 'Image Room', component: ImageRoomComponent },
  { id: 'story', name: 'Story Room', component: StoryRoomComponent, openStyle: 'creak' },
  { id: 'jokes', name: 'Jokes Room', component: JokesRoomComponent },
  { id: 'videos', name: 'Video Room', component: VideoRoomComponent },
  {
    id: 'music',
    name: 'Music Room',
    component: MusicRoomComponent,
    needsDoorState: true,
  },
  { id: 'facts', name: 'Fact Room', component: FactRoomComponent },
];
