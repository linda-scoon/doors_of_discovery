import { Component, OnInit } from '@angular/core';
import { QoutesService } from './qoutes.service';

@Component({
    selector: 'app-qoutes-room',
    templateUrl: './qoutes-room.component.html',
    styleUrls: ['./qoutes-room.component.css'],
    standalone: false
})
export class QoutesRoomComponent implements OnInit {
  // input from app component
  openedDoor: boolean = false;
  quote: any = {};

  constructor(private qoutesStream: QoutesService) {}

  ngOnInit(): void {
    this.qoutesStream.loadData().subscribe((data) => {
      this.quote = data[0];
    });
  }
  enterRoom(): void {
    this.openedDoor = true;
  }

  exitRoom(): void {
    this.openedDoor = false;
  }
}
