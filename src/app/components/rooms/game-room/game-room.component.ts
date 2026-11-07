import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameRoomComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

}
