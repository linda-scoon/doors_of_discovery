import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MusicService } from './music.service';

@Component({
    selector: 'app-music-room',
    templateUrl: './music-room.component.html',
    styleUrls: ['./music-room.component.css'],
    standalone: false
})
export class MusicRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
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
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
