import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css'],
})
export class GameRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
