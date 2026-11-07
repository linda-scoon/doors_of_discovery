import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne } from '../room-frame/room-load';
import { TAROT_DECK } from './tarot-deck';

/**
 * Somebody has laid out a card for you. It turns over once the door is out
 * of the way. Nothing is fetched but the picture, so the room is always
 * ready.
 */
@Component({
  selector: 'app-tarot-room',
  imports: [RoomFrameComponent],
  templateUrl: './tarot-room.component.html',
  styleUrls: ['./tarot-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarotRoomComponent {
  readonly card = pickOne(TAROT_DECK);

  /**
   * 330 pixels wide is one of the sizes Commons keeps ready, so it is quick
   * and does not ask the servers to make a new one.
   */
  readonly image = `https://commons.wikimedia.org/wiki/Special:FilePath/${this.card.file}?width=330`;

  readonly source = `https://commons.wikimedia.org/wiki/File:${this.card.file}`;
}
