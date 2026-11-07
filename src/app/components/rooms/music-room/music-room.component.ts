import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MusicService } from './music.service';

@Component({
  selector: 'app-music-room',
  templateUrl: './music-room.component.html',
  styleUrls: ['./music-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MusicRoomComponent implements OnInit {
  /**
   * Whether this room's door is open. The audio element is only created once
   * it is, so nothing plays from behind a closed door. Supplied by
   * RoomSlotComponent because the registry marks this room needsDoorState.
   */
  @Input() open: boolean = false;

  track: any = {};
  trackNum: number = 0;

  constructor(private musicStream: MusicService) {}

  ngOnInit(): void {
    this.musicStream.loadData().subscribe((data) => {
      // picking a random number by retrieving track count and subtracting 1 for 0 index
      this.trackNum = Math.round(Math.random() * (data.nb_tracks - 1));
      this.track = data.tracks.data[this.trackNum];
    });
  }
}
