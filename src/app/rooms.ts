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

import { HandleSide } from './components/doors/door/door.component';

/** One door, and what is behind it. */
export interface RoomDefinition {
  /** Matches the room's route in server/apis.js, where its API key lives. */
  id: string;

  /** Shown to people, and used to build the door's accessible name. */
  name: string;

  /** The colour of this room's door. */
  colour: string;

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
  { id: 'gifs', name: 'Gif Room', colour: '#A67B5B', component: GifRoomComponent },
  { id: 'game', name: 'Game Room', colour: '#3D2B1F', component: GameRoomComponent },
  { id: 'quotes', name: 'Quotes Room', colour: '#DEB887', component: QoutesRoomComponent },
  { id: 'images', name: 'Image Room', colour: '#6F4E37', component: ImageRoomComponent },
  { id: 'story', name: 'Story Room', colour: '#AF6F09', component: StoryRoomComponent },
  { id: 'jokes', name: 'Jokes Room', colour: '#654321', component: JokesRoomComponent },
  { id: 'videos', name: 'Video Room', colour: '#BA9238', component: VideoRoomComponent },
  {
    id: 'music',
    name: 'Music Room',
    colour: '#C3B091',
    component: MusicRoomComponent,
    needsDoorState: true,
  },
  { id: 'facts', name: 'Fact Room', colour: '#9F8170', component: FactRoomComponent },
];
