import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RoomComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
