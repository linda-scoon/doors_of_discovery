import { Component, OnInit } from '@angular/core';
import { GifsService } from './gifs.service';

@Component({
  selector: 'app-gif-room',
  templateUrl: './gif-room.component.html',
  styleUrls: ['./gif-room.component.css'],
})
export class GifRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  gif: any = {};

  constructor(private gifStream: GifsService) {}

  ngOnInit(): void {
    this.gifStream.loadData().subscribe((data) => {
      this.gif = data.data.images.downsized_medium;
    });
  }
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
